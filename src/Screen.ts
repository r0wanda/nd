/* eslint no-useless-escape: 0 */
import Mat from './Mat.js';
import Node from './Node.js';
import Element, { Border_t, Border, BorderArc, BorderDash, BorderDouble, BorderHeavy, BorderHeavyDash } from './Element.js';
import Color from './Color.js';
import Keys from './Keys.js';
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Joints, { boxRe, heavyB } from './Joints.js';
import tc from 'tinycolor2';
import { minimatch } from 'minimatch';
import isIntr from 'is-interactive';
import strip from 'strip-ansi';
import assert from 'node:assert';

import type { Key } from './Keys.js';
//import type { Border_t } from './Element.js';

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
    /**
     * Maximum times a sort will be ran to ensure no overlapping indexes
     * @default 10
     */
    maxSortRecursion: number;
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
/**
 * Object representation of a parsed key
 */
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
/**
 * Output type of the toArr function
 */
export type toArrOutput<T> = T extends any[] ? T : T[];
/**
 * Shd: single, heavy, or double
 */
export type Shd = 's' | 'h' | 'd';
/**
 * Object of the wanted connections of a border connections
 * Undefined for no connection, otherwise Shd to specify type of connection
 */
export interface BorderWants {
    l?: Shd;
    r?: Shd;
    t?: Shd;
    b?: Shd;
    ch: string;
}
/**
 * Border registry, easy way to look up border weight, and also extensible to new/user-defined borders
 */
export interface BorderRegistry {
    row: BorderWants[];
    col: BorderWants[];
    tl: BorderWants[]; tr: BorderWants[];
    bl: BorderWants[]; br: BorderWants[];
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
        this.#title = t;
        this.write(`\x1b]0;${t}\x07`);
    }
    get bitDepth() {
        return this.opts.bitDepth;
    }
    set bitDepth(d: number) {
        this.opts.bitDepth = d;
        this.color = new Color(this.opts.bitDepth);
    }
    #title: string;
    #resizeTimer?: ReturnType<typeof setTimeout>;
    #clearCoords: number[][];
    #fillCoords: (number | tc.ColorInput | string)[][];
    #bReg: BorderRegistry;
    #initRender: boolean;
    readonly emptyBReg: BorderRegistry;
    keyReady: boolean;
    color: Color;
    keys: KeyMatch[];
    mouseCoords: number[];
    constructor(opts: Partial<ScreenOptions>) {
        super();

        this.type = 'screen';
        this.#title = '';
        this.#initRender = false;
        this.#clearCoords = this.#fillCoords = [];
        this.mouseCoords = [0, 0];
        this.keyReady = false;
        this.emptyBReg = {
            row: [],
            col: [],
            tl: [], tr: [],
            bl: [], br: []
        }
        this.#bReg = this.constructBorderRegistry(Border, BorderArc, BorderDash, BorderDouble, BorderHeavy, BorderHeavyDash);

        this.opts = {
            resizeTimeout: opts.resizeTimeout ?? 300,
            disableChecks: opts.disableChecks ?? false,
            interactive: opts.interactive ?? opts.disableChecks ? true : isIntr(),
            hideCursor: opts.hideCursor ?? false, //change when done
            stdout: opts.stdout ?? process.stdout,
            bitDepth: opts.bitDepth ?? opts.disableChecks ? 24 : (opts.stdout ?? process.stdout).getColorDepth(),
            stdin: opts.stdin ?? process.stdin,
            fullScreen: opts.fullScreen ?? false, // this too
            dockBorders: opts.dockBorders ?? true,
            ignoreDockContrast: opts.ignoreDockContrast ?? false,
            maxSortRecursion: opts.maxSortRecursion ?? 10
        }

        // option checks
        if (!this.opts.interactive) throw new Error('Terminal is not interactive');
        if (this.opts.hideCursor) this.write(Ansi.cur.hide);
        if (this.opts.fullScreen) this.write(Ansi.scrn.alt.enter);
        process.on('exit', this.exit.bind(this));

        // stdout stuff
        this.width = this.opts.stdout.columns;
        this.height = this.opts.stdout.rows;
        this.on('resize', (d: Dims) => {
            this.width = d.cols;
            this.height = d.rows;
            this.emitDescendantsExSelf('resize');
            if (this.#initRender) this.render();
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
        this.enableInput();
        this.keys = [];
        this.opts.stdin.on('keypress', this.keyListener.bind(this));
        this.opts.stdin.on('click', (x: number, y: number) => {
            this.mouseCoords = [x, y];
        });
        this.opts.stdin.on('middleclick', (x: number, y: number) => {
            this.mouseCoords = [x, y];
        });
        this.opts.stdin.on('rightclick', (x: number, y: number) => {
            this.mouseCoords = [x, y];
        });
        this.opts.stdin.on('ctrlclick', (x: number, y: number) => {
            this.mouseCoords = [x, y];
        });
        this.opts.stdin.on('drag', (x: number, y: number) => {
            this.mouseCoords = [x, y];
        });
        this.opts.stdin.on('middledrag', (x: number, y: number) => {
            this.mouseCoords = [x, y];
        });
        this.opts.stdin.on('rightdrag', (x: number, y: number) => {
            this.mouseCoords = [x, y];
        });
        this.opts.stdin.on('move', (x: number, y: number) => {
            this.mouseCoords = [x, y];
        });
        this.opts.stdin.on('ctrldrag', (x: number, y: number) => {
            this.mouseCoords = [x, y];
        });
        this.opts.stdin.on('scrollup', (x: number, y: number) => {
            this.mouseCoords = [x, y];
            this.pixelOwnership(x, y, this.completeSort(), true)?.emit('scrollup');
        });
        this.opts.stdin.on('scrolldown', (x: number, y: number) => {
            this.mouseCoords = [x, y];
            const owner = this.pixelOwnership(x, y, this.completeSort(), true);
            if (owner) {
                console.error('owner');
                owner.emit('scrolldown');
            }
        });
        this.opts.stdin.on('bottomside', (x: number, y: number) => {
            this.mouseCoords = [x, y];
            this.emit('back');
        });
        this.opts.stdin.on('topside', (x: number, y: number) => {
            this.mouseCoords = [x, y];
            this.emit('forward');
        });
    }
    keyListener(ch: string, key: Key | undefined) {
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
    }
    /**
     * Generate BorderWants from a Border_t, and the corresponding key
     * @internal
     * @param bd The Border_t
     * @param key The key
     * @returns The constructed BorderWants
     */
    constructBorderWants(bd: Border_t, key: keyof Border_t): BorderWants {
        if (!bd.type || bd.type.search(/s|h|d/g) < 0) throw new Error('constructBorderWants: Only provided borders, or borders with a specified type can be used');
        const t = bd.type, b = t, l = t, r = t;
        const bs = { ch: bd[key]! }
        switch (key) {
            case 'row': return { l, r, ...bs };
            case 'col': return { t, b, ...bs };
            case 'tl': return { b, r, ...bs };
            case 'tr': return { b, l, ...bs };
            case 'bl': return { t, r, ...bs };
            case 'br': return { t, l, ...bs };
            default: throw new Error('constructBorderWants: Only border character keys can be used')
        }
    }
    /**
     * Generate BorderRegistry from Border_t(s)
     * @internal
     * @param bds The Border_t(s)
     * @returns The BorderRegistry
     */
    constructBorderRegistry(...bds: Border_t[]): BorderRegistry {
        // clone to avoid editing emptyBReg
        const br: BorderRegistry = structuredClone(this.emptyBReg);
        for (const bd of bds) {
            for (const k in bd) {
                if (!Element.isBorderKey(k) || k === 'type') continue;
                br[k].push(this.constructBorderWants(bd, k));
            }
        }
        return br;
    }
    /**
     * Append Border_t(s) to the BorderRegistry
     * @param bds The Border_t(s)
     */
    appendBorderRegistry(...bds: BorderRegistry[]) {
        // combine supplied borders
        const bd = bds.reduce((p, c) => {
            for (const k in c) {
                if (!Element.isBorderKey(k) || k === 'type') continue;
                p[k].push(...c[k]);
            }
            return p;
        }, structuredClone(this.emptyBReg));
        for (const k in this.#bReg) {
            if (!Element.isBorderKey(k) || k === 'type') continue;
            this.#bReg[k].push(...bd[k]);
        }
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
    exit(): void {
        if (this.opts.hideCursor) this.write(Ansi.cur.show);
        if (this.opts.fullScreen) this.write(Ansi.scrn.alt.exit);
        if (this.keyReady) {
            Keys.disableMouse();
            this.opts.stdin.pause();
        }
    }

    // key stuff
    /**
     * Enable key input
     * @internal
     */
    enableInput() {
        if (this.keyReady) return;
        Keys.emitKeypressEvents(this.opts.stdin);
        Keys.enableMouse(this.opts.stdout);
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
    /**
     * Check if a string, RegEx, or Shorthand is compatible with a Shorthand object
     * @param k1 The input
     * @param k2 The Shorthand to check
     * @param opts 
     * @returns 
     */
    eqShorthand(k1: string | RegExp | Shorthand, k2: Shorthand, opts?: KeyOptions): boolean {
        if (typeof k1 !== 'string' && !this.isRegex(k1)) k1 = k1.raw; // elim shorthand
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
     * @internal
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
     * Clear out duplicate Element indexes
     * @internal
     */
    clearDuplicates(recur = 0): Element[] {
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
        if (recur > this.opts.maxSortRecursion) throw new Error('Too much recursion, could not sort indexes')
        return i.length !== [...new Set(i)].length ? this.clearDuplicates(recur) : this.pruneNodes();
    }
    /**
     * Completely sort Elements, clearing duplicate indexes
     * @internal
     * @param chs An array of elements to sort, assuming that duplicates have been cleared (will not be done automatically if this is supplied)
     * @returns A sorted array of elements
     */
    completeSort(chs?: Element[]): Element[] {
        return (chs ?? this.clearDuplicates()).toSorted((a, b) => {
            if (a.index === b.index) throw new Error('Indexes must not be equal');
            return a.index > b.index ? -1 : 1;
        });
    }
    /**
     * Clear a region of screen
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
    fillRegion(color: tc.ColorInput, ch: string, x1: number, x2: number, y1: number, y2: number): void {
        const w = x2 - x1;
        const h = y2 - y1;
        if (w < 0 || h < 0) throw new RangeError(`Fill region (${x1},${y1}), (${x2}, ${y2}) width (${w}) or height (${h}) invalid`);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                this.#fillCoords.push([x1 + x, y1 + y, color, ch]);
            }
        }
    }
    /**
     * Find the element with ownership over a certain pixel
     * @internal
     * @param x 
     * @param y 
     * @param chs List of children to check
     * @returns The element with ownership, or undefined if pixel is unclaimed
     */
    pixelOwnership(x: number, y: number, chs: Element[], sorted = false): Element | undefined {
        if (!sorted) chs = this.completeSort(chs);
        return chs.find(e => e.withinBounds(x, y))
    }
    /**
     * Lookup the BorderRegistry for the BorderWants of a border character
     * @param ch The char
     * @returns 
     */
    classifyBorder(ch: string): BorderWants | undefined {
        ch = strip(ch);
        for (const k in this.#bReg) {
            // ts being stupid and not making k keyof
            const f = this.#bReg[<keyof BorderRegistry>k].find((v) => v.ch === ch);
            if (f) return f;
        }
    }
    /**
     * A preprocessing function to dock borders
     * @internal
     * @param m The mat
     * @param chs This Screen's children
     * @returns 
     */
    dock(m: Mat, chs: Element[]): Mat {
        chs = chs.toReversed().filter(e => !!e.style.border);
        const isOnEdge = (x: number, y: number, err = false) => {
            if (x < 0 || y < 0 || x >= m.x || y >= m.y) {
                if (err) throw new RangeError(`isOnEdge: Coordinates (${x},${y}) out of range`);
                return false;
            }
            return !!this.pixelOwnership(x, y, chs, true)?.isOnEdge(x, y);
        }
        for (let y = 0; y < m.y; y++) {
            for (let x = 0; x < m.x; x++) {
                const c = m.m[y][x];
                // continue if invalid for docking
                if (c.search(boxRe) < 0 && !this.pixelOwnership(x, y, chs)?.isOnEdge(x, y)) continue;
                // ~~yikes part starts~~
                // gets characters to the left or right, undefined if out of range (eg. (-1, -1))
                // variable name: t: top, b: bottom, etc
                // tR, bR is topRaw, bottomRaw, etc. raw is the raw characters in the rendered mat that are to the top, bottom, etc of the current char
                const tR: string | undefined = isOnEdge(x, y - 1) ? m.m[y - 1]?.at(x) : undefined;
                const bR: string | undefined = isOnEdge(x, y + 1) ? m.m[y + 1]?.at(x) : undefined;
                const lR: string | undefined = isOnEdge(x - 1, y) ? m.m[y][x - 1] : undefined;
                const rR: string | undefined = isOnEdge(x + 1, y) ? m.m[y][x + 1] : undefined;
                // the processed BorderWants (see BorderWants definition at top of file)
                // generated by querying the borderRegistry
                const t: BorderWants | undefined = tR ? this.classifyBorder(tR) : undefined;
                const b: BorderWants | undefined = bR ? this.classifyBorder(bR) : undefined;
                const l: BorderWants | undefined = lR ? this.classifyBorder(lR) : undefined;
                const r: BorderWants | undefined = rR ? this.classifyBorder(rR) : undefined;
                const wants = this.classifyBorder(c);
                const has: BorderWants = {
                    t: t?.b,
                    b: b?.t,
                    l: l?.r,
                    r: r?.l,
                    ch: wants?.ch || 's'
                }
                // if all connections are satisfied, continue
                if (this.deepEq(has, wants)) continue;
                // generate key of Joints (formatting is Shd clockwise (eg. ssss, shss, sdsd, etc...))
                // not all joint combinations are possible, see top of Joints.ts
                const key = `${has?.t ?? ''}${has?.r ?? ''}${has.b ?? ''}${has.l ?? ''}`;
                if (key.length === 3) {
                    const cat = Joints.triple[<keyof typeof Joints['triple']>`${t ? 't' : ''}${r ? 'r' : ''}${b ? 'b' : ''}${l ? 'l' : ''}`];
                    const ch: string | undefined = cat[<keyof typeof cat>key];
                    if (ch) m.xy(x, y, ch);
                } else if (key.length === 4) {
                    const ch: string | undefined = Joints.quad[<keyof typeof Joints['quad']>key];
                    if (ch) m.xy(x, y, ch);
                }
                // ~~yikes part ends~~
            }
        }
        return m;
    }
    /**
     * Render the screen
     */
    render() {
        this.emitDescendants('prerender');
        const m = new Mat(this.width, this.height);
        const chs = this.completeSort().toReversed();
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
        //console.error(this.opts)
        if (this.opts.dockBorders) m.preProcess(this.dock.bind(this), chs);
        const rend = m.render();
        this.write(rend);
        if (!this.#initRender) this.#initRender = true;
        this.emitDescendants('render');
    }
    /**
     * Write data to stdout
     * @internal
     * @param data The data to write to stdout
     */
    write(data: string): void {
        this.opts.stdout.write(data);
    }
}
