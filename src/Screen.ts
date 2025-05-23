/* eslint no-useless-escape: 0 */
import Mat from './Mat.js';
import Node from './Node.js';
import Element, { Border_t, Border, BorderArc, BorderDash, BorderDouble, BorderHeavy, BorderHeavyDash } from './Element.js';
import Color from './Color.js';
import Keys from './Keys.js';
import Joints, { _classifyJoint, boxRe } from './Joints.js';
import tc from 'tinycolor2';
import { minimatch } from 'minimatch';
import isIntr from 'is-interactive';
import strip from 'strip-ansi';
import assert from 'node:assert';

import type { Key } from './Keys.js';
//import type { Border_t } from './Element.js';

export const Ansi = {
    cur: {
        show: '\x1b[?25h',
        hide: '\x1b[?25l',
    },
    scrn: {
        alt: {
            enter: '\x1b[?1049h',
            exit: '\x1b[?1049l'
        }
    },
    attr: {
        bold: '\x1b[1m',
        ul: '\x1b[4m'
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
     * Disable all terminal checks (eg. interactive, colors) (not recommended)
     * @default false
     */
    disableChecks: boolean;
    /**
     * Override interactive check (not recommended)
     * @default false
     */
    interactive: boolean;
    /**
     * Manually set terminal color depth (not recommended).
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
    stdout: NodeJS.WriteStream;
    /**
     * Manually set stdin
     * @default process.stdin
     */
    stdin: NodeJS.ReadStream;
    /**
     * Alias of stdin
     */
    output?: NodeJS.WriteStream;
    /**
     * Alias of stdout
     */
    input?: NodeJS.ReadStream;
    /**
     * Whether or not to enter the alternative screen
     * @default true
     */
    fullScreen: boolean;
    /**
     * Whether or not to dock borders
     * @remarks This may have an impact on performance, especially on slower devices.
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
     * The width of tabs in an element's content
     * @default 4
     */
    tabSize: number;
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
    elem?: Element;
    hover?: boolean;
    once?: boolean;
    origKey: (string | RegExp)[] | string | RegExp;
    cb: (ch: string, key: Key | undefined) => void;
    err?: (err: unknown) => void;
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
     * @default true
     */
    glob?: boolean;
    /**
     * Use shorthand
     * @default true
     */
    shorthand?: boolean;
    /**
     * Register element-specific keys
     * @remarks Equivalent to Element.key
     */
    elem?: Element;
    /**
     * Whether or not to send key if element is being hovered (by default it will only work if focused)
     * @remarks Only relavent to Element.key, not Screen.key
     * @default false
     */
    hover?: boolean;
    /**
     * Execute once, then remove listener
     * @default false
     */
    once?: boolean;
    /**
     * A function to call if an error is thrown
     * @param err The error thrown
     */
    err?: (err: unknown) => void;
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
 * Coordinate object
 */
export interface Coords {
    /**
     * Relative X coordinate
     */
    x?: number;
    /**
     * Relative Y coordinate
     */
    y?: number;
    elem?: Element;
    /**
     * Absolute X coordinate
     */
    xAbs: number;
    /**
     * Absolute Y coordinate
     */
    yAbs: number;
}
/**
 * Border registry, easy way to look up border weight
 * TODO: find more efficent way to do this (low priority)
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
    hovered?: Node;
    children: Element[];
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
        this._color = new Color(this.opts.bitDepth);
    }
    get mouseCoords(): number[] {
        return this.#mouseCoords
    }
    set mouseCoords(n: number[]) {
        const x = typeof n[0] === 'number' && !isNaN(n[0]) ? n[0] : -1;
        const y = typeof n[1] === 'number' && !isNaN(n[1]) ? n[1] : -1;
        this.#mouseCoords = [x, y];
        this.emit('move', ...this.#mouseCoords);
        this._reloadHover();
    }
    #title: string;
    #resizeTimer?: ReturnType<typeof setTimeout>;
    #clearCoords: number[][];
    #fillCoords: (number | tc.ColorInput | string)[][];
    #bReg: BorderRegistry;
    #initRender: boolean;
    /**
     * Ready for keyboard input
     */
    keyReady: boolean;
    _color: Color;
    _keys: KeyMatch[];
    #mouseCoords: number[];
    constructor(opts: Partial<ScreenOptions> = {}) {
        super();

        this.type = 'screen';
        this.#title = '';
        this.#initRender = false;
        this.#clearCoords = this.#fillCoords = [];
        this.#mouseCoords = [-1, -1];
        this.keyReady = false;
        this.children = [];
        const bds = [Border, BorderArc, BorderDash, BorderDouble, BorderHeavy, BorderHeavyDash];
        function constructBorderWants(bd: Border_t, k: keyof Border_t) {
            if (!bd.type || bd.type.search(/s|h|d/g) < 0) throw new Error('constructBorderWants: Only provided borders, or borders with a specified type can be used');
            const t = bd.type, b = t, l = t, r = t;
            const bs = { ch: bd[k]! }
            switch (k) {
                case 'row': return { l, r, ...bs };
                case 'col': return { t, b, ...bs };
                case 'tl': return { b, r, ...bs };
                case 'tr': return { b, l, ...bs };
                case 'bl': return { t, r, ...bs };
                case 'br': return { t, l, ...bs };
                default: throw new Error('constructBorderWants: Only border character keys can be used')
            }
        }
        const br: BorderRegistry = {
            row: [],
            col: [],
            tl: [], tr: [],
            bl: [], br: []
        }
        for (const bd of bds) {
            for (const k in bd) {
                if (!Element.isBorderKey(k) || k === 'type') continue;
                br[k].push(constructBorderWants(bd, k));
            }
        }
        this.#bReg = br;

        this.opts = {
            resizeTimeout: opts.resizeTimeout!,
            disableChecks: !!(opts.disableChecks ?? false),
            interactive: !!(opts.interactive ?? opts.disableChecks ? true : isIntr()),
            hideCursor: !!(opts.hideCursor ?? true),
            stdout: opts.stdout ?? opts.output ?? process.stdout,
            bitDepth: opts.bitDepth!,
            stdin: opts.stdin ?? opts.input ?? process.stdin,
            fullScreen: opts.fullScreen ?? true,
            dockBorders: opts.dockBorders ?? true,
            ignoreDockContrast: opts.ignoreDockContrast ?? false,
            tabSize: opts.tabSize ?? 4
        }

        // option checks
        if (typeof this.opts.resizeTimeout !== 'number' || this.opts.resizeTimeout < 0) this.opts.resizeTimeout = 300;
        if (![1, 4, 8, 24].includes(this.opts.bitDepth)) this.opts.bitDepth = opts.disableChecks ? 24 : (opts.stdout ?? process.stdout).getColorDepth();
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
            if ((n instanceof Element) && n.screen !== this) n.setScreen(this, true);
        });
        this._color = new Color(this.opts.bitDepth);

        // keys
        this.enableInput();
        this._keys = [];
        this.opts.stdin.on('keypress', (ch: string, key?: Key) => {
            // if ch is undef, use name, if neither then return :(
            const c = key?.name || ch;
            if (!c) return;
            for (const _m of this._keys) {
                if (_m.elem) {
                    if (_m.hover) {
                        if (this.hovered !== _m.elem) continue;
                    } else {
                        if (this.focused !== _m.elem) continue
                    }
                }
                k: for (const m of _m.val) {
                    // m: Shorthand
                    try {
                        // cant check mods if key is undefined
                        if ((m.mod.ctrl || m.mod.meta || m.mod.shift) && !key) continue k;
                        // required mods are on else skip
                        if ((m.mod.ctrl && !key!.ctrl) || (!m.mod.ctrl && key?.ctrl)) continue k;
                        if ((m.mod.meta && !key!.meta) || (!m.mod.meta && key?.meta)) continue k;
                        if ((m.mod.shift && !key!.shift) || (!m.mod.shift && key?.shift)) continue k;

                        let mtch = false;
                        // match glob
                        if (m.glob && typeof m.ch === 'string') mtch = minimatch(c, m.ch);
                        // match regex
                        else if (Screen.isRegex(m.ch)) mtch = c.search(m.ch) >= 0;
                        else if (typeof m.ch === 'string') mtch = m.ch === c;
                        if (mtch) {
                            if (_m.once) this.removeKey(_m.origKey, _m.cb, true)
                            _m.cb(ch, key);
                            break k;
                        }
                    } catch (err) {
                        try {
                            _m.err?.(err);
                        } catch {
                            // not much else to do if cb and error handler fail
                        }
                    }
                }
            }
        });

        // mouse
        this.opts.stdin.on('click', (x: number, y: number) => {
            this.mouseCoords = [x, y];
            const elem = this.pixelOwnership(x, y);
            if (!elem) return;
            if (elem.opts.clickable) elem.focus();
            elem.emit('click', x, y);
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
            this.pixelOwnership(x, y)?.emit('scrollup');
        });
        this.opts.stdin.on('scrolldown', (x: number, y: number) => {
            this.mouseCoords = [x, y];
            const owner = this.pixelOwnership(x, y);
            if (owner) {
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
    /**
     * Construct Coords object
     * @param x Absolute x coordinate
     * @param y Absolute y coordinate
     * @param elem Element (if applicable)
     */
    _constructCoords(x: number, y: number, elem?: Element): Coords {
        
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
        }, {
            row: [],
            col: [],
            tl: [], tr: [],
            bl: [], br: []
        });
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
    _reloadHover() {
        const oldHover = this.hovered;
        this.hovered = this.pixelOwnership(this.mouseCoords[0], this.mouseCoords[1]);
        if (
            (
                this.hovered && (this.hovered instanceof Element) &&
                Object.keys(this.hovered.style.hover ?? {}).length > 0 && this.#initRender
            ) || (
                oldHover && oldHover !== this.hovered && oldHover instanceof Element &&
                Object.keys(oldHover.style.hover ?? {}).length > 0 && this.#initRender
            )
        ) this.render();
    }
    /**
     * Test if a value is a RegExp
     * @param r The value to test
     */
    static isRegex(r: any): r is RegExp {
        return Object.prototype.toString.call(r) === '[object RegExp]';
    }
    /**
     * Exit the screen
     */
    exit(): void {
        if (this.opts.hideCursor) this.write(Ansi.cur.show);
        if (this.opts.fullScreen) this.write(Ansi.scrn.alt.exit);
        if (this.keyReady) {
            Keys.disableMouse();
            this.opts.stdin.pause();
        }
    }
    /**
     * Get an index
     * @returns The index to use TODO: add index registry
     */
    _getIndex(): number {
        return this.children.length;
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
    static _parseShorthand(k: string, glob = true): Shorthand {
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
    _parseShorthand(k: string, glob = true): Shorthand {
        return Screen._parseShorthand(k, glob);
    }
    /**
     * Perform assert.deep(Strict)Equal
     * @param act Actual
     * @param exp Expected
     * @returns Result
     */
    static deepEq(act: unknown, exp: unknown, strict = true): boolean {
        try {
            type KeyType = 'deepStrictEqual' | 'deepEqual'
            const key: KeyType = `deep${strict ? 'Strict' : ''}Equal`;
            assert[key](act, exp);
            return true;
        } catch {
            return false;
        }
    }
    /**
     * Check if a string, RegEx, or Shorthand is compatible with a Shorthand object
     * @internal
     * @param k1 The input
     * @param k2 The Shorthand to check
     * @param opts The KeyOptions used
     * @returns 
     */
    static _eqShorthand(k1: string | RegExp | Shorthand, k2: Shorthand, opts?: KeyOptions): boolean {
        if (typeof k1 !== 'string' && !Screen.isRegex(k1)) k1 = k1.raw; // elim shorthand
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
                Object.assign(p, Screen._parseShorthand(k));
            }
            return p;
        }
        return (k1 === k2.raw) ||
            (Screen.isRegex(k1) && Screen.isRegex(k2.ch) && (k1.toString() === k2.ch.toString())) ||
            Screen.deepEq(genSh(k1), k2);
    }
    /**
     * Turn a value or array into an array
     * @internal
     * @param v The value/array
     * @param noDup No duplicates (default true)
     */
    static _toArr<V extends any | any[]>(v: V, noDup = true): toArrOutput<V> {
        if (Array.isArray(v)) {
            return <toArrOutput<V>>(noDup ? [...new Set(v)] : [...v]);
        }
        return <toArrOutput<V>>[v];
    }
    /**
     * Begin listening for a key(s)
     * @param keys The key(s) to listen for, in raw, shorthand, or regex format
     * @param cb The callback
     * @param opts The options for the key
     */
    key(key: (string | RegExp)[] | string | RegExp, cb: ((ch: string, key: Key | undefined) => void) | ((ch: string, key: Key | undefined) => void)[], opts?: KeyOptions): void {
        if (!this.keyReady) this.enableInput();
        const _k = Screen._toArr(key);
        if (Array.isArray(cb)) {
            const _cb = cb;
            cb = (...args: [string, Key | undefined]) => {
                for (const callback of _cb) {
                    callback(...args);
                }
            }
        }
        this._keys.push({
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
                    Object.assign(res, this._parseShorthand(k));
                }
                return res;
            }),
            origKey: key,
            err: opts?.err,
            elem: opts?.elem,
            hover: opts?.hover,
            once: opts?.once,
            cb
        });
    }
    static _compArr<T>(a: T[], b: T[], cmp: (a: T, b: T) => boolean): boolean {
        if (a.length !== b.length) return false;
        // every element in a is equivalent to an element in b
        const aOverlap = a.every(ac => b.some(bc => cmp(ac, bc)));
        // every element in b is equivalent to an element in a
        const bOverlap = b.every(bc => a.some(ac => cmp(ac, bc)));
        return aOverlap && bOverlap;
    }
    /**
     * Remove a key by callback or key input
     * @param key The key(s) or callback to remove
     * @param cb The callback associated with the keys (not required if the first argument is a callback)
     * @param matchAllKeys Must match all keys. For example, if `Screen.key` is called with an array of keys, the given array here must have the same items as that array (ignoring order).
     * @remarks This function only removes the specified key(s) for the given callback. If there were multiple keys in the call to `Screen.key` that weren't specified here, they won't be removed.
     * @remarks The matchAllKeys argument has the side effect of removing the instance, as there will be no more keys associated with it.
     */
    removeKey(cb: (ch: string, key: Key | undefined) => void): void
    removeKey(key: (string | RegExp)[] | string | RegExp, cb: (ch: string, key: Key | undefined) => void, matchAllKeys?: boolean): void
    removeKey(key: (string | RegExp)[] | string | RegExp | ((ch: string, key: Key | undefined) => void), cb?: (ch: string, key: Key | undefined) => void, matchAllKeys = false): void {
        if (typeof key === 'function') cb = key;
        if (!cb) return;
        for (let i = 0; i < this._keys.length; i++) {
            const k = this._keys[i];
            if (k.cb !== cb) continue;
            if (typeof key === 'function') {
                this._keys.splice(i--, 1);
                continue;
            }
            if (matchAllKeys) {
                if (!Array.isArray(key) && k.val.length === 1) {
                    if (Screen._eqShorthand(key, k.val[0])) {
                        this._keys.splice(i--, 1);
                    }
                    continue;
                }
                const keyArr = Screen._toArr(key);
                // @ts-ignore
                if (Screen._compArr(keyArr, k.val, Screen._eqShorthand)) {
                    this._keys.splice(i--, 1);
                }
                continue;
            }
            k.val = k.val.filter(v => Array.isArray(key) ? key.some(_k => Screen._eqShorthand(_k, v)) : Screen._eqShorthand(<string | RegExp>key, v));
            if (k.val.length > 1) {
                this._keys.splice(i--, 1);
                continue;
            }
            this._keys[i] = k;
        }
    }
    /**
     * Remove all keys from any of their listeners
     * @param key The key(s) to remove
     * @param matchAllKeys Must match all keys. For example, if `Screen.key` is called with an array of keys, the given array here must have the same items as that array (ignoring order).
     * @remarks This function only removes the specified key(s) for the given callback. If there were multiple keys in the call to `Screen.key` that weren't specified here, they won't be removed.
     * @remarks The matchAllKeys argument has the side effect of removing the instance, as there will be no more keys associated with it.
     */
    removeAllKeys(key: (string | RegExp)[] | string | RegExp, matchAllKeys = false) {
        for (let i = 0; i < this._keys.length; i++) {
            const k = this._keys[i];
            if (matchAllKeys) {
                if (!Array.isArray(key) && k.val.length === 1) {
                    if (Screen._eqShorthand(key, k.val[0])) {
                        this._keys.splice(i--, 1);
                    }
                    continue;
                }
                key = Screen._toArr(key);
                // @ts-ignore
                if (Screen._compArr(key, k.val, Screen._eqShorthand)) {
                    this._keys.splice(i--, 1);
                }
                continue;
            }
            for (let v = 0; v < k.val.length; v++) {
                if (Array.isArray(key)) {
                    if (key.some(tkey => Screen._eqShorthand(tkey, k.val[v]))) {
                        k.val.splice(v--, 1);
                    }
                } else {
                    if (Screen._eqShorthand(key, k.val[v])) {
                        k.val.splice(v--, 1);
                    }
                }
            }
            if (k.val.length < 1) {
                this._keys.splice(i--, 1);
                continue;
            }
            this._keys[i] = k;
        }
    }
    /**
     * Clear all keys
     */
    clearKeys() {
        this._keys = [];
    }
    /**
     * Wait for a key to be pressed
     * @param keys The key(s) to wait for (if any are pressed it will be triggered, not all)
     * @param timeout If the key is not triggered by then, an error will be thrown. -1 specifies no timeout, default 6e5 (10 minutes)
     * @param opts The options for `Screen.key`
     * @returns A promise that resolves when the key is pressed and rejects with an Error if the timeout is reached
     */
    waitForKey(keys: (string | RegExp)[] | string | RegExp, timeout = 6e5, opts?: KeyOptions): Promise<WaitForKey> {
        return new Promise<WaitForKey>((r, j) => {
            const listen = (ch: string, key: Key | undefined) => {
                this.removeKey(listen);
                r({ ch, key });
            }
            this.key(keys, listen, opts);
            if (timeout > 0) setTimeout(() => {
                // eslint-disable-next-line no-empty
                try { this.removeKey(listen); } catch { };
                j(new Error('Timeout exceeded waiting for key'));
            }, timeout);
        });
    }

    // rendering
    /**
     * Clear out duplicate Element indexes
     * @internal
     *
    _clearDuplicates(recur = 0): Element[] {
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
        // FIXME: find a better way to do this
        if (recur > 10) throw new Error('Too much recursion, could not sort indexes')
        return i.length !== [...new Set(i)].length ? this._clearDuplicates(recur) : this.pruneNodes();
    }
    /**
     * Completely sort Elements, clearing duplicate indexes
     * @internal
     * @param chs An array of elements to sort, assuming that duplicates have been cleared (will not be done automatically if this is supplied)
     * @returns A sorted array of elements
     *
    _completeSort(chs?: Element[]): Element[] {
        return (chs ?? this._clearDuplicates()).toSorted((a, b) => {
            if (a.index === b.index) throw new Error('Indexes must not be equal');
            return a.index > b.index ? -1 : 1;
        });
    }*/
    /**
     * Clear a region of screen
     * @param x1 Start x
     * @param x2 End x
     * @param y1 Start y
     * @param y2 End y
     */
    clearRegion(x1: number, x2: number, y1: number, y2: number) {
        const w = x2 - x1;
        const h = y2 - y1;
        if (w < 1 || h < 1) throw new RangeError(`Cannot clear negative region or a region with no width or height (Calculated width: ${w}, height: ${h})`);
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
    pixelOwnership(x: number, y: number, chs = this.children): Element | undefined {
        return chs.findLast(e => e._withinBounds(x, y))
    }
    /**
     * Render the screen
     */
    render() {
        this.emitDescendants('prerender');
        const m = new Mat(this.width, this.height);
        const chs = this.children;
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
                m.xy(c[0], c[1], `${this._color.parse(c[2])}${c[3]}\x1b[0m`)
            }
        }
        //console.error(this.opts)
        if (this.opts.dockBorders) m.preProcess((m: Mat) => {
            const classifyBorder = (ch: string) => {
                ch = strip(ch);
                // remove line below if borderregistry/docking is extended to support user-defined borders
                // this line limits allowed characters to box drawing ones only
                if (ch.search(boxRe) < 0) return;
                for (const k in this.#bReg) {
                    const b = this.#bReg[<keyof BorderRegistry>k];
                    if (!b) continue;
                    const f = b.find((v) => v.ch === ch);
                    if (f) return f;
                }
                const joint = _classifyJoint(ch);
                if (joint) return joint;
            }
            const chs = this.children.filter(e => !!e.style.border);
            const isOnEdge = (x: number, y: number, err = false) => {
                if (x < 0 || y < 0 || x >= m.x || y >= m.y) {
                    if (err) throw new RangeError(`isOnEdge: Coordinates (${x},${y}) out of range`);
                    return false;
                }
                return !!this.pixelOwnership(x, y)?._isOnEdge(x, y);
            }
            for (let y = 0; y < m.y; y++) {
                for (let x = 0; x < m.x; x++) {
                    const c = m.m[y][x];
                    // continue if invalid for docking
                    const owner = this.pixelOwnership(x, y, chs);
                    if (c.search(boxRe) < 0 || !owner?._isOnEdge(x, y) || !owner?.opts.dock) continue;
                    // gets characters to the left or right, undefined if out of range (eg. (-1, -1))
                    // variable name: t: top, b: bottom, etc
                    // tR, bR is topRaw, bottomRaw, etc. raw is the raw characters in the rendered mat that are to the top, bottom, etc of the current char
                    const tR: string | undefined = isOnEdge(x, y - 1) ? m.m[y - 1]?.at(x) : undefined;
                    const bR: string | undefined = isOnEdge(x, y + 1) ? m.m[y + 1]?.at(x) : undefined;
                    const lR: string | undefined = isOnEdge(x - 1, y) ? m.m[y][x - 1] : undefined;
                    const rR: string | undefined = isOnEdge(x + 1, y) ? m.m[y][x + 1] : undefined;
                    // the processed BorderWants (see BorderWants definition at top of file)
                    // generated by querying the borderRegistry
                    const t: BorderWants | undefined = tR ? classifyBorder(tR) : undefined;
                    const b: BorderWants | undefined = bR ? classifyBorder(bR) : undefined;
                    const l: BorderWants | undefined = lR ? classifyBorder(lR) : undefined;
                    const r: BorderWants | undefined = rR ? classifyBorder(rR) : undefined;
                    const wants = classifyBorder(c);
                    const has: BorderWants = {
                        t: t?.b,
                        b: b?.t,
                        l: l?.r,
                        r: r?.l,
                        ch: wants?.ch || 's'
                    }
                    // if all connections are satisfied, continue
                    if (Screen.deepEq(has, wants)) continue;
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
        }, chs);
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
