import Node from './Node.js';
import Mat from './Mat.js';
import Screen from './Screen.js';
import tc from 'tinycolor2';
import length from 'string-length';

import type Color_t from './Color.js';
import type { Shd } from './Screen.js';

export type Keyword = number | string | 'center' | 'left' | 'right' | 'top' | 'bottom' | 'shrink' | 'calc';
export type Color = tc.ColorInput | 'default';
export type Tblr = 'top' | 'bottom' | 'left' | 'right';

export interface Border_t {
    row: string;
    col: string;
    tl: string;
    tr: string;
    bl: string;
    br: string;
    type?: Shd;
}

export const Border: Border_t = {
    row: '─',
    col: '│',
    tl: '┌', tr: '┐',
    bl: '└', br: '┘',
    type: 's'
}
export const BorderArc: Border_t = {
    row: '─',
    col: '│',
    tl: '╭', tr: '╮',
    bl: '╰', br: '╯',
    type: 's'
}
export const BorderDash: Border_t = {
    row: '┄',
    col: '┆',
    tl: '┌', tr: '┐',
    bl: '└', br: '┘',
    type: 's'
}
export const BorderHeavy: Border_t = {
    row: '━',
    col: '┃',
    tl: '┏', tr: '┓',
    bl: '┗', br: '┛',
    type: 'h'
}
export const BorderHeavyDash: Border_t = {
    row: '┅',
    col: '┇',
    tl: '┏', tr: '┓',
    bl: '┗', br: '┛',
    type: 'h'
}
export const BorderDouble: Border_t = {
    row: '═',
    col: '║',
    tl: '╔', tr: '╗',
    bl: '╚', br: '╝',
    type: 'd'
}
export const BorderBg: Border_t = {
    row: ' ',
    col: ' ',
    tl: ' ', tr: ' ',
    bl: ' ', br: ' '
}

export interface Padding {
    /**
     * Left padding
     */
    left?: number;
    /**
     * Same as left
     */
    l?: number;
    /**
     * Right padding
     */
    right?: number;
    /**
     * Same as right
     */
    r?: number;
    /**
     * Top padding
     */
    top?: number;
    /**
     * Same as top
     */
    t?: number;
    /**
     * Bottom padding
     */
    bottom?: number;
    /**
     * Same as bottom
     */
    b?: number;
}
export interface Border {
    /**
     * Type of border
     * @default 'line'
     */
    type?: 'line' | 'bg';
    /**
     * Type of border, if line is specified.
     * @default 'single'
     */
    lineType?: Border_t | 'single' | 'arc' | 'dash' | 'double' | 'heavy' | 'heavydash';
    /**
     * Character to use for bg type
     */
    ch?: string;
    /**
     * Element foreground color.
     */
    fg?: Color;
    /**
     * Element background color.
     */
    bg?: Color;
    /**
     * Element is bold
     */
    bold?: boolean;
    /**
     * Element is underlined
     */
    underline?: boolean;
    /**
     * Extra padding used to accomodate padding. Will not go below 1, change to a different number if needed for custom border
     * Don't mess with it unless necessary
     * @experimental
     * @default 1
     */
    padding?: number;
}
export interface Scrollbar {
    /**
     * Element foreground color.
     */
    fg?: Color;
    /**
     * Element background color.
     */
    bg?: Color;
    /**
     * Element is bold
     */
    bold: boolean;
    /**
     * Element is underlined
     */
    underline: boolean;
}
export interface Style {
    /**
     * Element foreground color.
     */
    fg?: Color;
    /**
     * Element background color.
     */
    bg?: Color;
    /**
     * Border options
     */
    border?: Border;
    /**
     * Scrollbar options
     */
    scrollbar?: Scrollbar;
    /**
     * Alternate style on focus
     */
    focus?: Omit<Style, 'focus'>;
    /**
     * Alternnate style on hover
     */
    hover?: Omit<Style, 'hover'>;
}
export interface StyleReq extends Style {
    /**
     * Element background color.
     */
    fg: Color;
    /**
     * Element foreground color.
     */
    bg: Color;
}

export interface ElementOptions {
    /**
     * Parent Node
     */
    parent?: Node;
    /**
     * Screen Node
     */
    screen?: Node
    /**
     * Children of element
     */
    children?: Element[];
    /**
     * Element foreground color. Try to put this under "style", for sake of organization
     */
    fg?: Color;
    /**
     * Element background color. Try to put this under "style", for sake of organization
     */
    bg?: Color;
    /**
     * Element is bold
     */
    bold?: boolean;
    /**
     * Element is underlined
     */
    underline?: boolean;
    /**
     * The border options. Try to put this under "style", for sake of organization
     */
    border?: Border;
    /**
     * Text content.
     * @default ''
     */
    content?: string;
    /**
     * Element will focus on click.
     * @default true
     */
    clickable?: boolean;
    /**
     * Element is focused.
     * @default false
     */
    focused?: boolean;
    /**
     * Element is hidden.
     * @default false
     */
    hidden?: boolean;
    /**
     * A text label (for borders)
     */
    label?: string;
    //TODO: hovertext

    /**
     * Text alignment
     * @default left
     */
    align?: 'left' | 'center' | 'middle' | 'right';
    /**
     * Text alignment, but vertical
     */
    valign?: 'top' | 'center' | 'middle' | 'bottom';
    /**
     * Shrink to text content (overrides width and height)
     * @default false
     */
    shrink?: boolean;
    /**
     * Element padding (distance from edge of element to content).
     * @default 0
     */
    padding?: number | Padding;
    /**
     * Element width. See type Keyword for more.
     * The "shrink" and "half" keywords are the only ones allowed
     */
    width: Keyword;
    /**
     * Element height. See type Keyword for more
     * The "shrink" and "half" keywords are the only ones allowed
     */
    height: Keyword;
    /**
     * Parent-relative left offset.
     * "center", "left", and "right" are the only allowed keywords.
     */
    left?: Keyword;
    /**
     * Parent-relative right offset.
     * "center", "left", and "right" are the only allowed keywords.
     */
    right?: Keyword;
    /**
     * Parent-relative top offset.
     * "center", "top", and "bottom" are the only allowed keywords.
     */
    top?: Keyword;
    /**
     * Parent-relative bottom offset.
     * "center", "top", and "bottom" are the only allowed keywords.
     */
    bottom?: Keyword;
    /**
     * Position. Includes all above terms
     */
    position?: {
        /**
         * Text alignment
         * @default 'left'
         */
        align?: 'left' | 'center' | 'right';
        /**
         * Text alignment, but vertical
         * @default 'top'
         */
        valign?: 'top' | 'center' | 'bottom';
        /**
         * Shrink to text content (overrides width and height)
         * @default false
         */
        shrink?: boolean;
        /**
         * Element padding (distance from edge of element to content)
         * @default 0
         */
        padding?: number | Padding;
        /**
         * Element width. See type Keyword for more.
         * The "shrink" and "half" keywords are the only ones allowed
         */
        width: Keyword;
        /**
         * Element height. See type Keyword for more
         * The "shrink" and "half" keywords are the only ones allowed
         */
        height: Keyword;
        /**
         * Parent-relative left offset.
         * "center", "left", and "right" are the only allowed keywords.
         */
        left?: Keyword;
        /**
         * Parent-relative right offset.
         * "center", "left", and "right" are the only allowed keywords.
         */
        right?: Keyword;
        /**
         * Parent-relative top offset.
         * "center", "top", and "bottom" are the only allowed keywords.
         */
        top?: Keyword;
        /**
         * Parent-relative bottom offset.
         * "center", "top", and "bottom" are the only allowed keywords.
         */
        bottom?: Keyword;
    }
    /**
     * Element can scroll (if overflow happens)
     * @default true
     */
    scrollable?: boolean;
    /**
     * Same as scrollable
     */
    scroll?: boolean;
    /**
     * Background character.
     * @default ' '
     */
    ch?: string;
    /**
     * Element can be dragged by mouse.
     * @default false
     */
    draggable?: boolean;
    /**
     * Same as draggable
     */
    drag?: boolean;
    /**
     * Element has a shadow.
     * @default false
     */
    shadow?: boolean;
    /**
     * Element style.
     */
    style?: Style;
    /**
     * When calculating positioning/size, whether to round down (floor). Default true (round down), change to false to round up
     * @default true
     */
    floor?: boolean;
    /**
     * Whether or not to resize the element if it overflows off screen. Default true, if false, cropping will still be done on render to prevent icky stuff
     * @default false
     */
    resize?: boolean;
}
export type OptionsNoStyle = Omit<ElementOptions, 'fg' | 'bg' | 'style' | 'border' | 'position' | 'scroll' | 'drag' | 'parent' | 'screen' | 'children'>
export interface Percentage {
    percent: number;
    offset: number;
}

export interface Tag {
    type: string;
    close: boolean;
    val?: string;
}

//const _Node: new <E extends ListenerSignature<E> = ListenerSignature<unknown>>() => Omit<Node, 'parent' | 'children'> = Node;

export default interface Element {
    genContent(ret: true, color?: Color_t): Mat;
    genContent(ret: false, color?: Color_t): undefined;
}

/**
 * The base Element class, which all other rendered objects descend from.
 * @abstract
 */
export default class Element extends Node {
    /**
     * Absolute left. READ ONLY! It WILL mess up rendering if modified.
     * @readonly
     */
    aleft: number;
    /**
     * Absolute right. READ ONLY! It WILL mess up rendering if modified.
     * @readonly
     */
    aright: number;
    /**
     * Absolute top. READ ONLY! It WILL mess up rendering if modified.
     * @readonly
     */
    atop: number;
    /**
     * Absolute bottom. READ ONLY! It WILL mess up rendering if modified.
     * @readonly
     */
    abottom: number;
    // element parents/children can only be elements. node is only there for child support (support for append, prepend, insert children etc)
    // the only class that is a node and not an element is screen, bc width/height &stuff work differently
    parent?: Element;
    children: Element[];
    // yippee a bunch of (nearly, excluding content) identical getters/setters
    get content(): string {
        return this._content;
    }
    set content(val: string) {
        this._content = val;
        this.contentLen = length(val);
        this.contentWidth = val.split('\n').reduce((p, c) => length(c) > p ? length(c) : p, 0);
        this.contentHeight = (val.match(/\n/g) || []).length + 1;
        this.genContent();
    }
    get left(): number {
        return this._left;
    }
    set left(left: Keyword) {
        this.calcPos({ left });
    }
    get right(): number {
        return this._right;
    }
    set right(right: Keyword) {
        this.calcPos({ right });
    }
    get top(): number {
        return this._top;
    }
    set top(top: Keyword) {
        this.calcPos({ top });
    }
    get bottom(): number {
        return this._bottom;
    }
    set bottom(bottom: Keyword) {
        this.calcPos({ bottom });
    }
    get width(): number {
        return this._width;
    }
    set width(width: Keyword) {
        this.calcPos({ width });
    }
    get height(): number {
        return this._height;
    }
    set height(height: Keyword) {
        this.calcPos({ height });
    }
    get padding(): Required<Padding> {
        return this._padding;
    }
    set padding(p: Padding) {
        this._padding = this.constructPadding(p);
    }
    _left: number;
    _right: number;
    _top: number;
    _bottom: number;
    _width: number;
    _height: number;
    _content: string;
    _padding: Required<Padding>;
    contentLen: number;
    contentWidth: number;
    contentHeight: number;
    opts: Required<OptionsNoStyle>;
    style: StyleReq;
    index: number;
    contentMat: Mat;
    renderMat?: Mat;
    readonly nPer: Percentage;
    constructor(opts: ElementOptions) {
        super();
        this.type = 'element';
        this.parent = opts.parent instanceof Element ? opts.parent : undefined;
        this.on('resize', () => {
            this.calcPos();
        });
        if (opts.screen instanceof Screen) this.index = this.setScreen(opts.screen);
        else if (this.parent?.screen instanceof Screen) this.index = this.setScreen(this.parent.screen);
        else throw new Error('No screen');
        this.children = opts.children && Array.isArray(opts.children) && opts.children.length > 0 ? opts.children : [];
        this.nPer = {
            percent: -1,
            offset: 0
        }
        this.opts = {
            bold: opts.bold || false,
            underline: opts.underline || false,
            content: opts.content || '',
            clickable: opts.clickable || false,
            focused: opts.focused || false,
            hidden: opts.hidden || false,
            label: opts.label || '',
            align: opts.align || opts.position?.align || 'left',
            valign: opts.valign || opts.position?.valign || 'top',
            shrink: opts.shrink || opts.position?.shrink || false,
            padding: opts.padding || opts.position?.padding || 0,
            width: opts.width || opts.position?.width || 'shrink',
            height: opts.height || opts.position?.height || 'shrink',
            left: opts.left || opts.position?.left || 'calc',
            right: opts.right || opts.position?.right || 'calc',
            top: opts.top || opts.position?.top || 'calc',
            bottom: opts.bottom || opts.position?.bottom || 'calc',
            scrollable: opts.scrollable || opts.scroll || true,
            ch: opts.ch || ' ',
            draggable: opts.draggable || opts.drag || false,
            shadow: opts.shadow || false,
            floor: opts.floor || true,
            resize: opts.resize || true
        }
        const fg = tc(opts.style?.fg || opts.fg);
        const bg = tc(opts.style?.bg || opts.bg);
        this.style = {
            fg: (fg.isValid() ? fg : false) || 'default',
            bg: (bg.isValid() ? bg : false) || 'default',
            border: opts.style?.border && opts.border ? {
                ...opts.style.border,
                ...opts.border
            } : (opts.style?.border || opts.border),
            scrollbar: opts.style?.scrollbar,
            focus: opts.style?.focus,
            hover: opts.style?.hover
        }
        // defaults to make typescript happy
        this._width = this._height =
            this._left = this._right = this._top = this._bottom =
            this.aleft = this.aright = this.atop = this.abottom = 0;
        // actually set position
        this.calcPos({
            regenContent: false
        });
        // padding
        this._padding = this.constructPadding(opts.padding);
        // content (and ts defaults)
        this._content = '';
        this.contentLen = this.contentHeight = this.contentWidth = 0;
        this.contentMat = new Mat(0, 0);
        this.content = this.opts.content;
    }
    /**
     * Set content (reccomended to just set the "content" property)
     * @param val The content value
     */
    setContent(val: string) {
        this.content = val;
    }
    /**
     * Calculate position
     * @internal
     */
    calcPos(opts?: {
        width?: Keyword;
        height?: Keyword;
        left?: Keyword;
        right?: Keyword;
        top?: Keyword;
        bottom?: Keyword;
        regenContent?: boolean;
    }): void {
        if (opts?.width) this.opts.width = opts.width;
        if (opts?.height) this.opts.height = opts.height;
        if (opts?.left) this.opts.left = opts.left;
        if (opts?.right) this.opts.right = opts.right;
        if (opts?.top) this.opts.top = opts.top;
        if (opts?.bottom) this.opts.bottom = opts.bottom;
        // ensure that args are correct
        if ((this.opts.left === 'calc' && this.opts.right === 'calc') || (this.opts.top === 'calc' && this.opts.bottom === 'calc'))
            throw new Error('No 2 opposite position arguments (left/right, top/bottom) can both be calculated.');
        // width/height must be defined first
        this._width = this.parseKeywordWH(this.opts.width, 'w');
        this._height = this.parseKeywordWH(this.opts.height, 'h');
        if (this.screen && this.opts.resize && this.width + this.aleft > this.screen.width) this.width = this.screen.width - this.aleft;
        if (this.screen && this.opts.resize && this.height + this.atop > this.screen.height) this.height = this.screen.height - this.atop;
        // then margins
        this._left = this.parseKeywordMargin(this.opts.left, 'left');
        this._right = this.parseKeywordMargin(this.opts.right, 'right');
        this._top = this.parseKeywordMargin(this.opts.top, 'top');
        this._bottom = this.parseKeywordMargin(this.opts.bottom, 'bottom');
        this.aleft = this.parseKeywordMargin(this.opts.left, 'left', this.screen);
        this.aright = this.parseKeywordMargin(this.opts.right, 'right', this.screen);
        this.atop = this.parseKeywordMargin(this.opts.top, 'top', this.screen);
        this.abottom = this.parseKeywordMargin(this.opts.bottom, 'bottom', this.screen);
        // regen contentmat by calling setter
        if (opts?.regenContent ?? true) this.setContent(this.content);
    }
    /**
     * Construct Padding
     * @param p A partial Padding object
     * @returns A complete Padding object
     */
    constructPadding(p: ElementOptions['padding']): Required<Padding> {
        let l, r, t, b;
        l = r = t = b = 0;
        if (typeof p === 'object') {
            l = p.left || p.l || 0;
            r = p.right || p.r || 0;
            t = p.top || p.t || 0;
            b = p.bottom || p.b || 0;
        } else if (!isNaN(Number(p))) {
            l = r = t = b = Number(p);
        }
        const o = <Required<Padding>>{};
        // create aliases
        const pairs = [
            ['l', 'left'],
            ['r', 'right'],
            ['t', 'top'],
            ['b', 'bottom']
        ]
        for (const [act, ali] of pairs) { // ACTual/ALIas
            Object.defineProperty(o, ali, {
                get() {
                    return this[act];
                },
                set(v: number) {
                    this[act] = v;
                }
            });
        }
        o.l = l;
        o.r = r;
        o.t = t;
        o.b = b;
        return o;
    }
    /**
     * Check if a xy position is within the absolute bounds of this Element
     * @param x 
     * @param y 
     * @returns The result
     */
    withinBounds(x: number, y: number): boolean {
        return x >= this.aleft && x < this.aleft + this.width && y >= this.atop && y < this.atop + this.height;
    }
    /**
     * Check if a xy position is on the edge of this Element
     * @param x 
     * @param y 
     * @returns The result
     */
    isOnEdge(x: number, y: number): boolean {
        return ((x === this.aleft || x === this.aleft + this.width - 1) && y >= this.atop && y <= this.aleft + this.width) ||
               ((y === this.atop || y === this.atop + this.height - 1) && x >= this.aleft && x <= this.aleft + this.width);
    }
    /**
     * Is keyword a percentage (50%, 25%+1, 70%-1, etc...)
     * @internal
     */
    isPercentage(k: Keyword): k is string { //
        return k ? typeof k === 'number' ? false : !isNaN(Number(k.replace('%', '').replace(/[+-]/, ''))) : false;
    }
    /**
     * Is percentage nPer (iNvalid Percentage)
     * @internal
     * @param p The percentage to check
     */
    isNPer(p: Percentage): boolean {
        return p.percent < 0;
    }
    /**
     * Check if string is 'w' or 'h'
     * @internal
     * @param wh The string to check
     */
    isWh(wh: string): wh is 'w' | 'h' {
        return ['w', 'h'].includes(wh);
    }
    /**
     * Check if string is 'top', 'bottom', 'left, or 'right'
     * @internal
     * @param tblr The string to check
     */
    isTblr(tblr: string): tblr is Tblr {
        return ['top', 'bottom', 'left', 'right'].includes(tblr);
    }
    /**
     * Convert a string from w or h to width or height
     * @internal
     * @param wh The string to convert
     * @returns 
     */
    wh(wh: 'w' | 'h' = 'w'): 'width' | 'height' {
        return wh === 'w' ? 'width' : 'height'
    }
    /**
     * Round a number according to options. Will consistently either round up or down.
     * @internal
     */
    round(n: number): number {
        return Math[this.opts.floor ? 'floor' : 'ceil'](n);
    }
    /**
     * Parse tags from a string
     * @param s The string
     * @returns An array of tag objects
     */
    parseTags(s: string): Tag[] {
        const a = s.split('');
        let tag = '';
        let val = '';
        const tags: Tag[] = [];
        let open = false;
        function pushVal() {
            if (val.length < 1) return;
            tags.push({
                type: 'content',
                close: false,
                val
            });
            val = '';
        }
        for (const c of a) {
            if (open && c !== '}') tag += c;
            else if (c === '{') {
                open = true;
                pushVal();
            } else if (c === '}') {
                open = false;
                tag = tag.trim();
                const raw = tag.replace('/', '').toLowerCase();
                if (tag === '/') {
                    tags.push({
                        type: 'closeAll',
                        close: true
                    });
                } else if (tag.startsWith('/')) {
                    tags.push({
                        type: raw,
                        close: true
                    });
                } else if (raw.search(/open|close/i) >= 0) {
                    val += raw === 'open' ? '{' : '}';
                } else {
                    tags.push({
                        type: raw,
                        close: false
                    });
                }
                tag = '';
            } else if (c.search(/\n/) >= 0) {
                pushVal();
                tags.push({
                    type: 'newline',
                    close: false
                });
            } else if (!open) {
                val += c;
            }
        }
        pushVal();
        return tags;
    }
    /**
     * Static (and base) version of isBorderT
     * @remarks Only exists so that screen can test border types without an element instance
     * @param b The variable to test
     * @returns 
     */
    static isBorderT(b: Border_t | string | undefined): b is Border_t {
        if (typeof b !== 'object') return false;
        const keys = Object.keys(b);
        return ['row', 'col', 'tl', 'tr', 'bl', 'br'].every(k => keys.includes(k));
    }
    /**
     * For Screen type-checking
     * @internal
     * @param k Key
     */
    static isBorderKey(k: string): k is keyof Border_t {
        return ['row', 'col', 'tl', 'tr', 'bl', 'br'].includes(k);
    }
    genBorder(m: Mat, color = this.screen?.color) {
        if (!this.style.border || !color) return m;
        const lType = this.style.border.lineType;
        let bd: Border_t;
        if (this.style.border.type === 'bg') {
            bd = BorderBg;
        } else if (Element.isBorderT(lType)) {
            bd = lType;
        } else {
            switch (typeof lType === 'string' ? lType : 'single') {
                case 'arc': bd = BorderArc; break;
                case 'double': bd = BorderDouble; break;
                case 'dash': bd = BorderDash; break;
                case 'heavy': bd = BorderHeavy; break;
                case 'heavydash': bd = BorderHeavyDash; break;
                default: bd = Border;
            }
        }
        const bg = color.parse(this.style.border.bg || 'default');
        const fg = color.parse(this.style.border.fg || 'default');
        const f = (c: string) => `${bg}${fg}${c}\x1b[0m`;
        m.blk(0, 0, m.x, 1, f(bd.row));
        m.blk(0, 0, 1, m.y, f(bd.col));
        m.blk(0, m.y - 1, m.x, 1, f(bd.row));
        m.blk(m.x - 1, 0, 1, m.y, f(bd.col));
        m.xy(0, 0, f(bd.tl)); m.xy(m.x - 1, 0, f(bd.tr));
        m.xy(0, m.y - 1, f(bd.bl)); m.xy(m.x - 1, m.y - 1, f(bd.br));
        return m;
    }
    /**
     * Generate a Mat from the content
     * @internal
     */
    genContent(ret = false, color = this.screen?.color) {
        // main mat
        const mat = new Mat(this.width, this.height, '');
        if (!color) return;

        // render
        const tags = this.parseTags(this.content);
        console.error(tags);
        // set padding (nice for implementing border and later scrollbar)
        // math.max will choose specified padding if it is both defined and bigger than 1, else it will default to 1
        // if no border exists, border padding will be 0 (hence it not existing)
        // final note: border padding is applied equally to all sides
        const bdpad = this.style.border ? Math.max(this.style.border.padding || 1, 1) : 0;
        // *2 bc border is on all sides
        const wpad = this.padding.l + this.padding.r + (bdpad * 2);
        const hpad = this.padding.t + this.padding.b + (bdpad * 2);
        const lpad = this.padding.l + bdpad;
        const tpad = this.padding.t + bdpad;
        // usable content mat
        const c = new Mat(this.width - wpad, this.height - hpad, '');
        // calculate the valign (cmat hasnt been shrunk yet so values are usable to avoid more math and icky parenthissies)
        let t = 0;
        switch (this.opts.valign) {
            case 'center':
            case 'middle':
                t = this.round(c.y / 2 - this.contentHeight / 2);
                break;
            case 'bottom':
                t = c.y - this.contentHeight;
                break;
            default: t = 0;
        }

        const align = (w: number, a = this.opts.align) => {
            let l = 0;
            switch (a) {
                case 'center':
                case 'middle':
                    l = this.round(c.x / 2 - w / 2);
                    break;
                case 'right':
                    l = c.x - w;
                    break;
                default: l = 0;
            }
            return l;
        }

        const alignRe = /left|right|center|\|/i;
        const colorRe = /-fg$|-bg$/i;

        let x = 0;
        let y = 0;
        let fg = this.style.fg;
        let bg = this.style.bg;
        let al = this.opts.align;
        let regen = false;
        //let finalized = false;

        /**
         * Content between idx and end, only accounting for content with specified alignment
         * @param idx index
         * @param a alignment
         * @param all any alignment
         * @returns 
         */
        function contentUntil(idx: number, a: typeof al, all = false) {
            let l = 0;
            let nope = false;
            for (let i = idx; i < tags.length; i++) {
                const t = tags[i];
                if (t.type === 'newline') break;
                else if (!all && t.type.search(alignRe) >= 0 && t.type !== a) { // will not include anything not aligned the same way
                    nope = !t.close; // if it is closing then set nope to true
                }
                else if (t.type === 'content' && !nope) l += t.val?.length || 0;
            }
            return l;
        }
        /**
         * is seperator coming up in line
         * @param idx index
         * @returns 
         */
        function upcomingSep(idx: number) {
            for (let i = ++idx; i < tags.length; i++) {
                const t = tags[i];
                if (t.type === 'newline') break;
                else if (t.type === '|') return true;
            }
            return false;
        }
        /**
         * have we passed a seperator
         * @param idx you get the idea
         * @returns 
         */
        function prevSep(idx: number) {
            if (idx < 1) return false;
            for (let i = --idx; i > 0; i--) {
                const t = tags[i];
                if (t.type === 'newline') break;
                else if (t.type === '|') return true;
            }
            return false;
        }
        /**
         * move x to the alignment position
         * @param idx 
         */
        function finalizeAlign(idx: number) {
            const a = upcomingSep(idx) ? 'left' : (prevSep(idx) ? 'right' : al);
            console.error(upcomingSep(idx), prevSep(idx))
            x = align(contentUntil(idx, a), a);
            //finalized = true;
        }

        for (let i = 0; i < tags.length; i++) {
            const t = tags[i];
            if (t.type.search(alignRe) >= 0) {
                if (t.type === '|') {
                    regen = true;
                } else {
                    al = <typeof this.opts.align>t.type;
                    finalizeAlign(i);
                }
            } else if (t.type === 'content') {
                if (!t.val) continue;
                if (regen) {
                    finalizeAlign(i);
                    regen = false;
                }
                const _fg = color.parse(fg);
                const _bg = color.parse(bg, true);
                //console.error({fg: tc(fg), bg, _fg, _bg})
                // correctly place characters on mat
                let val = '';
                for (let i = 0; i < t.val.length; i++) {
                    val += t.val.at(i);
                    if (length(val) >= 1) {
                        c.xy(x, y, `${_bg}${_fg}${val}\x1b[0m`);
                        x += length(val);
                        val = '';
                    }
                }
            } else if (t.type === 'newline') {
                // reset align, x then increment
                al = this.opts.align;
                x = 0;
                y++;
            } else if (t.type === 'closeAll') {
                // reset all, no increment
                al = this.opts.align;
                fg = this.style.fg;
                bg = this.style.bg;
            } else if (t.type.search(colorRe) >= 0) {
                const col = t.type.replace(colorRe, '');
                if (t.type.endsWith('-fg')) {
                    fg = t.close ? this.style.fg : col;
                } else if (t.type.endsWith('-bg')) {
                    bg = t.close ? this.style.bg : col;
                }
            }
        }
        c.yShrink(); // x alignment has already been applied, y is done at overlay
        mat.overlay(lpad, t + tpad, c);
        // apply border
        mat.preProcess(this.genBorder.bind(this), color);
        if (ret) return mat;
        else this.contentMat = mat;
    }
    render() {
        if (!this.screen?.color) throw new Error('Render cannot be run if no screen is available');
        const color = this.screen.color;
        let width = this.width;
        let height = this.height;
        //console.error(width + this.aleft, height + this.atop);
        const fg = color.parse(this.style.fg, false);
        const bg = color.parse(this.style.bg, true);
        let contentMat = this.contentMat;
        if (width + this.aleft > this.screen.width) {
            width = this.screen.width - this.aleft;
            if (this.opts.resize) contentMat = this.genContent.bind({
                ...this,
                width,
                height
            })(true);
        }
        if (height + this.atop > this.screen.height) height = this.screen.height - this.atop;
        const cm = new Mat(width, height);
        //console.error(width, height)
        //console.error(this.screen.width, this.screen.height);
        cm.blk(0, 0, width, height, `${fg}${bg}${this.opts.ch}\x1b[0m`);
        cm.overlay(0, 0, contentMat);
        return cm;
    }
    /**
     * Parse a percentage string to the percent and offset
     * @param k The keyword to grab percentage from
     * @returns The percentage and offset as a Percentage object, or nPer
     */
    parsePercentage(k: Keyword): Percentage {
        if (!k || !this.isPercentage(k)) return this.nPer;
        const spl = k.replace('%', '').split(/[+-]/);
        if (spl.length === 1 && !isNaN(Number(spl[0]))) {
            return {
                percent: Number(spl[0]),
                offset: 0
            }
        } else if (spl.length !== 2) return this.nPer;
        else if (!k.match(/[+-]/)) return this.nPer;
        const r: Percentage = {
            percent: Number(spl[0]),
            offset: k.includes('+') ? Number(spl[1]) : -Number(spl[1])
        }
        if (r.percent < 0 || r.percent > 100) return this.nPer;
        return r;
    }
    /**
     * Calculate a percentage releative to a Node
     * @param p The percentage
     * @param type The percentage direction
     * @param parent The reference Node
     * @returns The number of characters
     */
    calcPercentage(p: Percentage, type: 'w' | 'h' | Tblr, parent?: Element | Screen): number {
        if (!parent) parent = this.parent || this.screen;
        if (!parent) return 0;
        if (this.isNPer(p)) return 0;
        return this.isWh(type) ? Math.round(parent[this.wh(type)] / 100 * p.percent + p.offset) : (() => {
            switch (type) {
                case 'top':
                case 'bottom':
                    return this.round(parent.height / 100 * p.percent + p.offset);
                case 'left':
                case 'right':
                    return this.round(parent.width / 100 * p.percent + p.offset);
            }
        })();
    }
    /**
     * Parse a width or height keyword to number of characters
     * @param k The keyword to parse
     * @param wh The keyword direction
     * @param parent The reference Node
     * @returns The number of characters
     */
    parseKeywordWH(k: Keyword, wh: 'w' | 'h' = 'w', parent?: Element | Screen): number {
        if (!parent) parent = this.parent || this.screen;
        if (!parent) return 0;
        if (wh !== 'w' && wh !== 'h') return 0;
        switch (k) {
            case 'shrink': return this.contentLen;
            case 'half': return this.round(parent[this.wh(wh)] / 2);
            default: {
                const num = Number(k);
                if (!isNaN(num)) return num;
                const p = this.parsePercentage(k);
                return this.calcPercentage(p, wh, parent);
            }
        }
    }
    /**
     * Parse a margin to number of characters
     * @param k The keyword to parse
     * @param tblr The keyword direction
     * @param parent The reference Node
     * @returns The number of characters
     */
    parseKeywordMargin(k: Keyword, tblr: Tblr, parent?: Element | Screen): number {
        if (!parent) parent = this.parent || this.screen;
        if (!parent) return 0;
        if (!this.isTblr(tblr)) return 0;
        switch (tblr) {
            case 'left': {
                switch (k) {
                    case 'left': return 0;
                    case 'right': return parent.width - this.width;
                    case 'center': return this.round(parent.width / 2 - this.width / 2);
                    case 'calc': return parent.width - (this.width + this.right);
                    default: {
                        const num = Number(k);
                        if (!isNaN(num)) return num;
                        const p = this.parsePercentage(k);
                        return this.calcPercentage(p, tblr, parent);
                    }
                }
            }
            case 'right': {
                switch (k) {
                    case 'left': return parent.width + this.width;
                    case 'right': return 0;
                    case 'center': return this.round(parent.width / 2 + this.width / 2);
                    case 'calc': return parent.width - (this.left + this.width);
                    default: {
                        const num = Number(k);
                        if (!isNaN(num)) return num;
                        const p = this.parsePercentage(k);
                        return this.calcPercentage(p, tblr, parent);
                    }
                }
            }
            case 'top': {
                switch (k) {
                    case 'top': return 0;
                    case 'bottom': return parent.height - this.height;
                    case 'center': return this.round(parent.height / 2 - this.height / 2);
                    case 'calc': return parent.height - (this.bottom + this.height);
                    default: {
                        const num = Number(k);
                        if (!isNaN(num)) return num;
                        const p = this.parsePercentage(k);
                        return this.calcPercentage(p, tblr, parent);
                    }
                }
            }
            case 'bottom': {
                switch (k) {
                    case 'top': return parent.height - this.height;
                    case 'bottom': return 0;
                    case 'center': return this.round(parent.height / 2 + this.height / 2);
                    case 'calc': return parent.height - (this.top + this.height);
                    default: {
                        const num = Number(k);
                        if (!isNaN(num)) return num;
                        const p = this.parsePercentage(k);
                        return this.calcPercentage(p, tblr, parent);
                    }
                }
            }
        }
    }
}
