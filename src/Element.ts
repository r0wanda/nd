import Node from './Node.js';
import Mat from './Mat.js';
import Screen from './Screen.js';
import tc from 'tinycolor2';
import length from 'string-length';

export type Keyword = number | string | 'center' | 'left' | 'right' | 'top' | 'bottom' | 'shrink' | 'calc';
export type Color = tc.ColorInput | 'default';
export type Tblr = 'top' | 'bottom' | 'left' | 'right';

export interface Padding {
    /**
     * Left padding
     */
    left: number;
    /**
     * Same as left
     */
    l: number;
    /**
     * Right padding
     */
    right: number;
    /**
     * Same as right
     */
    r: number;
    /**
     * Top padding
     */
    top: number;
    /**
     * Same as top
     */
    t: number;
    /**
     * Bottom padding
     */
    bottom: number;
    /**
     * Same as bottom
     */
    b: number;
}
export interface Border {
    /**
     * Type of border. Default line
     */
    type: 'line' | 'bg';
    /**
     * Character to use for bg type
     */
    ch: string;
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
     * Text content. Default ""
     */
    content?: string;
    /**
     * Element will focus on click. Default true
     */
    clickable?: boolean;
    /**
     * Element is focused. Default false
     */
    focused?: boolean;
    /**
     * Element is hidden. Default false
     */
    hidden?: boolean;
    /**
     * A text label (for borders). Defalt none
     */
    label?: string;
    //TODO: hovertext

    /**
     * Text alignment. Default center.
     */
    align?: 'left' | 'center' | 'middle' | 'right';
    /**
     * Text alignment, but vertical. Default center
     */
    valign?: 'top' | 'center' | 'middle' | 'bottom';
    /**
     * Shrink to text content (overrides width and height). Default false
     */
    shrink?: boolean;
    /**
     * Element padding (distance from edge of element to content). Default 0
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
     * Text alignment. Default center.
     */
        align?: 'left' | 'center' | 'right';
        /**
         * Text alignment, but vertical. Default center
         */
        valign?: 'top' | 'center' | 'bottom';
        /**
         * Shrink to text content (overrides width and height). Default false
         */
        shrink?: boolean;
        /**
         * Element padding (distance from edge of element to content). Default 0
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
     * Element can scroll (if overflow happens). Default true
     */
    scrollable?: boolean;
    /**
     * Same as scrollable
     */
    scroll?: boolean;
    /**
     * Background character. Default whitespace (" ")
     */
    ch?: string;
    /**
     * Element can be dragged by mouse.
     */
    draggable?: boolean;
    /**
     * Same as draggable
     */
    drag?: boolean;
    /**
     * Element has a offset shadow.
     */
    shadow?: boolean;
    /**
     * Element style.
     */
    style?: Style;
    /**
     * When calculating positioning/size, whether to round down (floor). Default true (round down), change to false to round up
     */
    floor?: boolean;
    /**
     * Whether or not to resize the element if it overflowsoff screen. Default true, if false, cropping will still be done on render to prevent icky stuff
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

const _Node: new () => Omit<Node, 'parent' | 'children'> = Node;

/**
 * The base Element class, which all other rendered objects descend from.
 * @abstract
 */
export default class Element extends _Node {
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
    _left: number;
    _right: number;
    _top: number;
    _bottom: number;
    _width: number;
    _height: number;
    _content: string;
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
        this.style = {
            fg: opts.style?.fg || opts.fg || 'default',
            bg: opts.style?.bg || opts.bg || 'default',
            border: opts.style?.border || opts.border,
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
    parseTags(s: string) {
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
                } else if (/open|close/i.test(raw)) {
                    val += raw === 'open' ? '{' : '}';
                } else {
                    tags.push({
                        type: raw,
                        close: false
                    });
                }
                tag = '';
            } else if (/\n/.test(c)) {
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
     * Generate a Mat from the content
     * @internal
     */
    genContent(color = this.screen?.color) {
        const mat = new Mat(this.width, this.height, '');
        console.error(color);
        // calculate the valign
        let t = 0;
        switch (this.opts.valign) {
            case 'center':
            case 'middle':
                t = this.round(this.height / 2 - this.contentHeight / 2);
                break;
            case 'bottom':
                t = this.height - this.contentHeight;
                break;
            default: t = 0;
        }

        // render
        const tags = this.parseTags(this.content);
        console.error(tags);
        const c = new Mat(this.width, this.height, '');
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

        let x = 0;
        let y = 0;
        //let fg: tc.Instance;
        //let bg: tc.Instance;
        let al = this.opts.align;
        let finalized = false;

        /*function close(type: string) {
            switch (type) {
                case 'fg':
                    return color ? '\x1b[0m' : '';
            }
        }
        function lastNewline(idx: number) {
            for (let i = --idx; i > 0; i--) {
                if (tags[i].type === 'newline') return i;
            }
            return -1;
        }
        /*function contentInLine(idx: number) {
            return contentUntil(lastNewline(idx) + 1);
        }*/
        function contentUntil(idx: number) {
            let l = 0;
            for (let i = idx; i < tags.length; i++) {
                const t = tags[i];
                if (t.type === 'newline') break;
                else if (t.type === 'content') l += t.val?.length || 0;
            }
            return l;
        }
        function upcomingSep(idx: number) {
            for (let i = ++idx; i < tags.length; i++) {
                const t = tags[i];
                if (t.type === 'newline') break;
                else if (t.type === '|') return true;
            }
            return false;
        }
        function firstContentOrAlign(idx: number) {
            if (idx < 1) return true;
            for (let i = idx - 1; i > 0; i--) {
                const t = tags[i];
                if (t.type === 'content' || alignRe.test(t.type)) return true;
            }
            return false;
        }
        function finalizeAlign(idx: number) {
            x = align(contentUntil(idx), upcomingSep(idx) ? 'left' : al);
            finalized = true;
        }

        for (let i = 0; i < tags.length; i++) {
            const t = tags[i];
            if (alignRe.test(t.type) && firstContentOrAlign(i)) {
                al = <typeof this.opts.align>t.type;
            } else if (t.type === 'content') {
                if (!t.val) continue;
                if (!finalized) finalizeAlign(i);
                for (const ch of t.val.split('')) {
                    c.xy(x, y, ch);
                    x++;
                }
            } else if (t.type === 'newline') {
                al = this.opts.align;
                x = 0;
                finalized = false;
                y++;
            }
        }
        c.yShrink();
        mat.overlay(0, t, c);
        this.contentMat = mat;
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
