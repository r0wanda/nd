import Mat from './Mat.js';
import Node from './Node.js';
import Element from './Element.js';
import Color from './Color.js';
import { Ansi } from './Constants.js';
import Keys from './Keys.js';
import tc from 'tinycolor2';
import { minimatch } from 'minimatch';
import isIntr from 'is-interactive';
import assert from 'node:assert';

import { type Key } from './Keys.js';

/**
 * Options for the Screen constructor
 */
export interface ScreenOptions {
    /**
     * Time (in milliseconds) to wait before updating screen contents after resize
     * @default 300
     */
    resizeTimeout: number;
    /**
     * Disable terminal checks (eg. interactive, colors) (not reccomended)
     * @default false
     */
    disableChecks: boolean;
    /**
     * Override inteactive-ness check (not reccomended)
     * @default false
     */
    interactive: boolean;
    /**
     * Manually set terminal color depth (not reccomended).
     * @default The terminal color depth
     */
    bitDepth: number;
    /**
     * Whether or not to hide the cursor
     * @default true
     */
    hideCursor: boolean;
    /**
     * Manually set stdout
     * @default process.stdout
     */
    stdout: typeof process.stdout;
    /**
     * Manually set stdin
     */
    stdin: typeof process.stdin;
    /**
     * Whether or not to enter the alternative screen
     * @default true
     */
    fullScreen: boolean;
    /**
     * Whether or not to dock borders
     * @default true
     * @example
     * For example, these overlapping borders
     * ```
     * ┌─────────┌─────────┐
     * │ box1    │ box2    │
     * └─────────└─────────┘
     * ```
     * Will become these docked borders
     * ```
     * ┌─────────┬─────────┐
     * │ box1    │ box2    │
     * └─────────┴─────────┘
     * ```
     */
    dockBorders: boolean;
    /**
     * Docked borders will be ignored when the colors are different. This forces them to dock anyways, possibly resulting in some weird multi-colored borders.
     * @default false
     */
    ignoreDockContrast: boolean;
}

/**
 * Dimensions interface
 */
export interface Dims {
    /**
     * Terminal width
     */
    width: number;
    /**
     * Terminal height
     */
    height: number;
    /**
     * Terminal width (same as width)
     */
    cols: number;
    /**
     * Terminal height (same as height)
     */
    rows: number;
    /**
     * Terminal width (same as cols and width)
     */
    columns: number;
}

/**
 * A key match
 * @internal
 */
export interface KeyMatch {
    val: Array<{
        mod: {
            ctrl: boolean;
            shift: boolean;
            meta: boolean;
        }
        ch: string | RegExp;
        glob: boolean;
    }>;
    cb: (ch: string, key: Key | undefined) => void;
}
/**
 * Options for Key
 */
export interface KeyOptions {
    /**
     * Use glob matching
     * @see {@link https://github.com/isaacs/minimatch#minimatch}
     */
    glob?: boolean;
    /**
     * Use shorthand
     */
    shorthand?: boolean;
}
export interface Shorthand {
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
    ch: string;
}

export default class Screen extends Node {
    opts: ScreenOptions;
    focused?: Node;
    width: number;
    height: number;
    get cols() {
        return this.width;
    }
    set cols(v: number) {
        this.width = v;
    }
    get columns() {
        return this.width;
    }
    set columns(v: number) {
        this.width = v;
    }
    get rows() {
        return this.height;
    }
    set rows(v: number) {
        this.height = v;
    }
    #resizeTimer?: ReturnType<typeof setTimeout>;
    #clearCoords: Array<Array<number>>;
    #fillCoords: Array<Array<number | tc.ColorInput | string>>;
    keyReady: boolean;
    color: Color;
    keys: Array<KeyMatch>;
    constructor(opts: Partial<ScreenOptions> = {}) {
        super();

        this.type = 'screen';
        this.#clearCoords = this.#fillCoords = [];
        this.keyReady = false;

        this.opts = {
            resizeTimeout: opts.resizeTimeout || 300,
            disableChecks: opts.disableChecks || false,
            interactive: opts.interactive || opts.disableChecks ? true : isIntr(),
            bitDepth: opts.bitDepth || opts.disableChecks ? 16 : process.stdout.getColorDepth(),
            hideCursor: opts.hideCursor || false, //change when done
            stdout: opts.stdout || process.stdout,
            stdin: opts.stdin || process.stdin,
            fullScreen: opts.fullScreen || false, // this too
            dockBorders: opts.dockBorders || true,
            ignoreDockContrast: opts.ignoreDockContrast || false
        }

        // option checks
        if (!this.opts.interactive) throw new Error('Terminal is not interactive');
        this.opts.hideCursor && this.write(Ansi.cur.hide);
        this.opts.fullScreen && this.write(Ansi.scrn.alt.enter);
        process.on('exit', this.exit.bind(this));

        // stdout stuff
        this.width = this.opts.stdout.columns;
        this.height = this.opts.stdout.rows;
        this.on('resize', (d: Dims) => {
            this.width = d.cols;
            this.height = d.rows;
            this.emitDescendantsExSelf('resize');
        });
        this.opts.stdout.on('resize', () => {
            clearTimeout(this.#resizeTimer); // does nothing if undefined
            this.#resizeTimer = setTimeout(() => {
                const d = this.constructDims(this.opts.stdout.rows, this.opts.stdout.columns);
                this.emit('resize', d);
            }, this.opts.resizeTimeout);
        });
        this.on('_node', (n: Node) => {
            n.setScreen(this, true);
        });
        this.color = new Color(this.opts.bitDepth);
        this.keys = [];
        this.opts.stdin.on('keypress', (ch: string, key: Key | undefined) => {
            // if ch is undef, use name, if neither then return :(
            const c = key?.name || ch;
            if (!c) return;
            for (const _m of this.keys) {
                k: for (const m of _m.val) {
                    // cant check mods if key is undefined
                    if ((m.mod.ctrl || m.mod.meta || m.mod.shift) && !key) continue k;
                    // required mods are on else continue
                    if ((m.mod.ctrl && !key!.ctrl) || (!m.mod.ctrl && key?.ctrl)) continue k;
                    if ((m.mod.meta && !key!.meta) || (!m.mod.meta && key?.meta)) continue k;
                    if ((m.mod.shift && !key!.shift) || (!m.mod.shift && key?.shift)) continue k;
                    let mtch = false;
                    if (m.glob && typeof m.ch === 'string') mtch = minimatch(c, m.ch);
                    else if (this.isRegex(m.ch)) mtch = m.ch.test(c);
                    else if (typeof m.ch === 'string') mtch = m.ch === c;
                    if (mtch) {
                        _m.cb(ch, key);
                        break k;
                    }
                }
            }
        });
    }
    /**
     * Construct a Dims object with aliases from rows and cols
     * @param rows Rows
     * @param cols Columns
     * @returns The generated Dims object
     */
    constructDims(rows: number, cols: number) {
        const d: Dims = <Dims>{};
        d.width = d.cols = d.columns = cols;
        d.height = d.rows = rows;
        return d;
    }
    /**
     * Test if a value is a RegExp
     * @param r The value to test
     */
    isRegex(r: any): r is RegExp {
        return Object.prototype.toString.call(r) === '[object RegExp]';
    }
    /**
     * Exit the screen
     * @param proc Whether or not to call process.exit. Default false
     */
    exit(proc = false): void {
        this.opts.hideCursor && this.write(Ansi.cur.show);
        this.opts.fullScreen && this.write(Ansi.scrn.alt.exit);
        this.keyReady && this.opts.stdin.pause();
        proc && process.exit(0);
    }

    // key stuff
    enableInput() {
        if (this.keyReady) return;
        Keys.emitKeypressEvents(this.opts.stdin);
        this.opts.stdin.setRawMode(true);
        this.opts.stdin.resume();
        this.keyReady = true;
    }
    parseShorthand(k: string): Shorthand {
        const p = k.split('-').filter(i => i.length > 0);
        let ch = '';
        let ctrl = false;
        let meta = false;
        let shift = false;
        if (p.length < 1) return { ctrl, meta, shift, ch };
        for (let i = 0; i < p.length - 1; i++) {
            if (/^ctrl$|^control$|^c$/i.test(p[i] ?? '')) ctrl = true;
            if (/^meta$|^windows$|^win$|^m$/i.test(p[i] ?? '')) meta = true;
            if (/^shift$|^s$/i.test(p[i] ?? '')) shift = true;
        }
        ch = p[p.length - 1] ?? '';
        return { ctrl, meta, shift, ch };
    }
    key(keys: Array<string | RegExp> | string | RegExp, cb: (ch: string, key: Key | undefined) => void, opts?: KeyOptions): void {
        if (!this.keyReady) this.enableInput();
        const _k = Array.isArray(keys) ? keys : [keys];
        this.keys.push({
            val: _k.map(k => {
                let ch = k;
                let ctrl = false;
                let meta = false;
                let shift = false;
                if ((opts?.shorthand ?? true) && typeof k === 'string') {
                    ({ ctrl, meta, shift, ch } = this.parseShorthand(k)); // parens for deconstruct
                }
                return {
                    mod: {
                        ctrl,
                        meta,
                        shift
                    },
                    ch,
                    glob: opts?.glob ?? true
                }
            }),
            cb
        });
    }

    // rendering
    pruneNodes(arr: Array<Node> = this.children): Array<Element> {
        const a = <Array<Element>>arr;
        return a.filter(ch => ch instanceof Element);
    }
    sortDuplicates() {
        const i: Array<number> = [];
        for (const ch of this.pruneNodes()) {
            if (i.includes(ch.index)) {
                let nI = 0;
                let c = ch.index;
                while (i.includes(ch.index)) nI = ++c;
                ch.index = nI;
            }
            i.push(ch.index);
        }
    }
    clearRegion(x1: number, x2: number, y1: number, y2: number) {
        const w = x2 - x1;
        const h = y2 - y1;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                this.#clearCoords.push([x1 + x, y1 + y]);
            }
        }
    }
    fillRegion(color: tc.ColorInput, ch: string, x1: number, x2: number, y1: number, y2: number) {
        const w = x2 - x1;
        const h = y2 - y1;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                this.#fillCoords.push([x1 + x, y1 + y, color, ch]);
            }
        }
    }
    render() {
        this.emitDescendants('prerender');
        const m = new Mat(this.width, this.height);
        const chs = this.pruneNodes().sort((a, b) => {
            if (a.index === b.index) throw new Error('Indexes must not be equal');
            return a.index > b.index ? -1 : 1;
        });
        for (const ch of chs) {
            if (!(ch instanceof Element)) continue;
            let width = ch.width;
            let height = ch.height;
            const fg = this.color.parse(ch.style.fg, false);
            const bg = this.color.parse(ch.style.bg, true);
            if (width + ch.aleft > this.width) width = this.width - ch.aleft;
            if (height + ch.atop > this.height) height = this.height - ch.atop;
            const cm = new Mat(width, height);
            cm.blk(0, 0, width, height, `${fg}${bg}${ch.opts.ch}\x1b[0m`);
            cm.overlay(0, 0, ch.contentMat.preProcess(m => {
                for (let y = 0; y < m.y; y++) {
                    for (let x = 0; x < m.x; x++) {
                        if (m.m[y][x] !== m.blnk) m.xy(x, y, `${fg + bg + m.m[y][x]}\x1b[0m`)
                    }
                }
                return m;
            }));
            m.overlay(ch.aleft, ch.atop, cm);
        }
        for (const c of this.#clearCoords) {
            if (c.length !== 2) continue;
            m.xy(c[0], c[1]);
        }
        for (const c of this.#fillCoords) {
            if (c.length !== 4) continue;
            if (typeof c[0] === 'number' && typeof c[1] === 'number' && (typeof c[2] === 'string' || c[2] instanceof tc) && typeof c[3] === 'string') {
                m.xy(c[0], c[1], `${this.color.parse(c[2])}${c[3]}\x1b[0m`)
            }
        }
        const rend = m.render();
        this.write(rend);
        this.emitDescendants('render');
    }
    write(data: string | Uint8Array): void {
        this.opts.stdout.write(data);
    }
}
