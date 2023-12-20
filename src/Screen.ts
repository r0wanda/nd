/* eslint no-useless-escape: 0 */
import Mat from './Mat.js';
import Node from './Node.js';
import Element, { Border, BorderArc, BorderDash, BorderDouble, BorderHeavy, BorderHeavyDash } from './Element.js';
import Color from './Color.js';
import Keys from './Keys.js';
import tc from 'tinycolor2';
import { minimatch } from 'minimatch';
import isIntr from 'is-interactive';
import assert from 'node:assert';

import type { Key } from './Keys.js';
import type { Border_t } from './Element.js';

export const Ansi = {
    cur: {
        show: '\e[?25h',
        hide: '\e[?25l',
    },
    scrn: {
        alt: {
            enter: '\e[?1049h',
            exit: '\e[?1049l'
        }
    }
}

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
 * @remarks This system along with others in this program work on the idea of turning user input into a list of objects of parsed data
 * @internal
 */
export interface KeyMatch {
    val: Shorthand[];
    cb: (ch: string, key: Key | undefined) => void;
}

/**
 * Return type of waitForKey
 */
export interface WaitForKey {
    ch: string,
    key: Key | undefined
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
    mod: {
        ctrl: boolean;
        meta: boolean;
        shift: boolean;
    }
    ch: string | RegExp;
    raw: string | RegExp;
    glob: boolean;
}
export type toArrOutput<T> = T extends any[] ? T : T[];
export interface BorderReg {
    row: string[],
    col: string[],
    tl: string[], tr: string[],
    bl: string[], br: string[]
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
    get title() {
        return this.#title;
    }
    set title(t: string) {
        this.write(`\x1b]0;${t}\x07`);
    }
    #title: string;
    #resizeTimer?: ReturnType<typeof setTimeout>;
    #clearCoords: number[][];
    #fillCoords: (number | tc.ColorInput | string)[][];
    #borderReg: BorderReg;
    keyReady: boolean;
    color: Color;
    keys: KeyMatch[];
    constructor(opts: Partial<ScreenOptions> = {}) {
        super();

        this.type = 'screen';
        this.#title = '';
        this.#clearCoords = this.#fillCoords = [];
        this.keyReady = false;

        this.#borderReg = {
            row: [],
            col: [],
            tl: [], tr: [],
            bl: [], br: []
        }
        this.constructBorderReg();

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
                    try {
                        // cant check mods if key is undefined
                        if ((m.mod.ctrl || m.mod.meta || m.mod.shift) && !key) continue k;
                        // required mods are on else continue
                        if ((m.mod.ctrl && !key!.ctrl) || (!m.mod.ctrl && key?.ctrl)) continue k;
                        if ((m.mod.meta && !key!.meta) || (!m.mod.meta && key?.meta)) continue k;
                        if ((m.mod.shift && !key!.shift) || (!m.mod.shift && key?.shift)) continue k;
                        let mtch = false;
                        if (m.glob && typeof m.ch === 'string') mtch = minimatch(c, m.ch);
                        else if (this.isRegex(m.ch)) mtch = c.search(m.ch) >= 0;
                        else if (typeof m.ch === 'string') mtch = m.ch === c;
                        if (mtch) {
                            _m.cb(ch, key);
                            break k;
                        }
                    } catch (err) {
                        // TODO: handle error
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
     * Append to Border Registry
     * @param bds Borders
     */
    constructBorderReg(bds: Border_t[] | Border_t = [Border, BorderArc, BorderDash, BorderDouble, BorderHeavy, BorderHeavyDash]) {
        const _bds = this.toArr(bds);
        for (const bd of _bds) {
            if (Element._isBorderT(bd)) {
                for (const [key, value] of Object.entries(bd)) {
                    if (!Element._isBorderKey(key)) continue;
                    this.#borderReg[key].push(value);
                }
            }
        }
    }
    constructBorderRegex(key?: keyof BorderReg) {
        let val: string[];
        if (key && this.#borderReg[key]) val = this.#borderReg[key];
        else val = Object.values(this.#borderReg).flat();
        return new RegExp(val.join('|'));
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
    exit(): void {
        this.opts.hideCursor && this.write(Ansi.cur.show);
        this.opts.fullScreen && this.write(Ansi.scrn.alt.exit);
        this.keyReady && this.opts.stdin.pause();
    }

    // key stuff
    /**
     * Enable key input
     * @internal
     */
    enableInput() {
        if (this.keyReady) return;
        Keys.emitKeypressEvents(this.opts.stdin);
        this.opts.stdin.setRawMode(true);
        this.opts.stdin.resume();
        this.keyReady = true;
    }
    /**
     * Parse shorthand for keys
     * @internal
     * @param k The key to parse
     */
    parseShorthand(k: string, glob = true): Shorthand {
        const p = k.split('-').filter(i => i.length > 0);
        let ch = '';
        let ctrl = false;
        let meta = false;
        let shift = false;
        if (p.length < 1) return {
            mod: {
                ctrl, meta, shift
            },
            ch,
            raw: k,
            glob
        }
        for (let i = 0; i < p.length - 1; i++) {
            if (/^ctrl$|^control$|^c$/i.test(p[i] ?? '')) ctrl = true;
            if (/^meta$|^windows$|^win$|^m$/i.test(p[i] ?? '')) meta = true;
            if (/^shift$|^s$/i.test(p[i] ?? '')) shift = true;
        }
        ch = p[p.length - 1] ?? '';
        return {
            mod: {
                ctrl, meta, shift
            },
            ch,
            raw: k,
            glob
        }
    }
    /**
     * Perform assert.deep(Strict)Equal
     * @param act Actual
     * @param exp Expected
     * @returns Result
     */
    deepEq(act: unknown, exp: unknown, strict = true): boolean {
        try {
            assert[`deep${strict ? 'Strict' : ''}Equal`](act, exp);
            return true;
        } catch {
            return false;
        }
    }
    eqShorthand(k1: string | RegExp, k2: Shorthand, opts?: KeyOptions): boolean {
        const genSh = (k: string | RegExp) => {
            const p: Shorthand = {
                mod: {
                    ctrl: false,
                    meta: false,
                    shift: false
                },
                ch: k,
                raw: k,
                glob: opts?.glob ?? true
            }
            if (opts?.shorthand && typeof k === 'string') {
                Object.assign(p, this.parseShorthand(k));
            }
            return p;
        }
        return (k1 === k2.raw) ||
        (this.isRegex(k1) && this.isRegex(k2.ch) && (k1.toString() === k2.ch.toString())) ||
        this.deepEq(genSh(k1), k2);
    }
    /**
     * Turn a value or array into an array
     * @param v The value/array
     * @param noDup No duplicates (default true)
     */
    toArr(v: any | any[], noDup = true): toArrOutput<typeof v> {
        return noDup ? [...new Set(v)] : [...v];
    }
    /**
     * Begin listening for a key(s)
     * @param keys The key(s) to listen for, in raw, shorthand, or regex format
     * @param cb The callback
     * @param opts 
     */
    key(key: (string | RegExp)[] | string | RegExp, cb: (ch: string, key: Key | undefined) => void, opts?: KeyOptions): void {
        if (!this.keyReady) this.enableInput();
        const _k: toArrOutput<typeof key> = this.toArr(key);
        this.keys.push({
            val: _k.map(k => {
                const res: Shorthand = {
                    mod: {
                        ctrl: false,
                        meta: false,
                        shift: false
                    },
                    ch: k,
                    raw: k,
                    glob: opts?.glob ?? true
                }
                if ((opts?.shorthand ?? true) && typeof k === 'string') {
                    Object.assign(res, this.parseShorthand(k));
                }
                return res;
            }),
            cb
        });
    }
    /**
     * Remove a key by callback or key input
     * @param key The key(s) or callback to remove
     */
    removeKey(key: (string | RegExp)[] | string | RegExp | ((ch: string, key: Key | undefined) => void)) {
        this.keys = <KeyMatch[]>this.keys.map(k => {
            if (typeof key === 'function') {
                if (k.cb === key) return null;
            } else {
                k.val = k.val.filter(v => (<toArrOutput<typeof key>>this.toArr(key)).some(_k => this.eqShorthand(_k, v, )));
                return k;
            }
        }).filter(k => !!k);
    }
    /**
     * Same as removeKey, except if a key is found in an instance, the entire instance is removed
     * @param key The key(s) or callback to remove
     */
    removeAllKeyInstances(key: (string | RegExp)[] | string | RegExp | ((ch: string, key: Key | undefined) => void)) {
        this.keys = <KeyMatch[]>this.keys.map(k => {
            if (typeof key === 'function') {
                if (k.cb === key) return null;
            } else if (k.val.some(v => (<toArrOutput<typeof key>>this.toArr(key)).some(_k => this.eqShorthand(_k, v, )))) {
                return null;
            } else {
                return k;
            }
        }).filter(k => !!k);
    }
    /**
     * Clear all keys
     */
    clearKeys() {
        this.keys = [];
    }
    /**
     * Wait for a key
     * @param keys 
     * @param timeout 
     * @param opts 
     * @returns 
     */
    waitForKey(keys: (string | RegExp)[] | string | RegExp, timeout = (1000 * 60 * 10), opts?: KeyOptions): Promise<WaitForKey> {
        return new Promise<WaitForKey>((r, j) => {
            const listen = (ch: string, key: Key | undefined) => {
                this.removeKey(listen);
                r({ ch, key });
            }
            this.key(keys, listen, opts);
            if (timeout > 0) setTimeout(() => {
                // eslint-disable-next-line no-empty
                try { this.removeKey(listen); } catch {}
                j(new Error('Timeout exceeded waiting for key'));
            }, timeout);
        })
    }

    // rendering
    /**
     * 
     */
    sortDuplicates() {
        const i: number[] = [];
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
    /**
     * 
     * @param x1 
     * @param x2 
     * @param y1 
     * @param y2 
     */
    clearRegion(x1: number, x2: number, y1: number, y2: number) {
        const w = x2 - x1;
        const h = y2 - y1;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                this.#clearCoords.push([x1 + x, y1 + y]);
            }
        }
    }
    /**
     * Fill a region with a color
     * @param color Color
     * @param ch Character
     * @param x1 Start x
     * @param x2 End x
     * @param y1 Start y
     * @param y2 End y
     */
    fillRegion(color: tc.ColorInput, ch: string, x1: number, x2: number, y1: number, y2: number) {
        const w = x2 - x1;
        const h = y2 - y1;
        if (w < 0 || h < 0) throw new RangeError(`Fill region (${x1},${y1}), (${x2}, ${y2}) width (${w}) or height (${h}) invalid`);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                this.#fillCoords.push([x1 + x, y1 + y, color, ch]);
            }
        }
    }

    dock(m: Mat, chs: Element[]) {
        //const boxRe = /[\u2500-\u257F]/gi;
        chs = chs.filter(e => !!e.style.border);
        for (let y = 0; y < m.y; y++) {
            for (let x = 0; x < m.x; x++) {
                if (chs.some(e =>
                    ((x === e.aleft || x === e.aleft + e.width - 1) && y >= e.atop && y <= e.aleft + e.width) ||
                    ((y === e.atop || y === e.atop + e.height - 1) && x >= e.aleft && x <= e.aleft + e.width)
                )) {
                    const c = m.m[y][x];
                    if (c.search(this.constructBorderRegex()) >= 0) {
                        m.xy(x, y, 'h')
                    }
                }
            }
        }
        return m;
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
            m.overlay(ch.aleft, ch.atop, ch.render());
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
        //if (this.opts.dockBorders)
        m.preProcess(this.dock.bind(this), chs);
        const rend = m.render();
        this.write(rend);
        this.emitDescendants('render');
    }
    write(data: string | Uint8Array): void {
        this.opts.stdout.write(data);
    }
}
