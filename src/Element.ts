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
    children?: Array<Node>;
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

/**
 * The base Element class, which all other rendered objects descend from.
 * @abstract
 */
export default class Element extends Node {
    left: number;
    right: number;
    top: number;
    bottom: number;
    aleft: number;
    aright: number;
    atop: number;
    abottom: number;
    get content(): string {
        return this.#content;
    }
    set content(val: string) {
        this.#content = val;
        this.contentLen = length(val);
        this.contentHeight = (val.match(/\n/g) || []).length + 1;
        this.genContent();
    }
    #content: string;
    contentLen: number;
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
        this.parent = opts.parent instanceof Node ? opts.parent : undefined;
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
            align: opts.align || opts.position?.align || 'center',
            valign: opts.valign || opts.position?.valign || 'center',
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
        this.width = this.height =
        this.left = this.right = this.top = this.bottom =
        this.aleft = this.aright = this.atop = this.abottom = 0;
        // actually set position
        if ((this.opts.left === 'calc' && this.opts.right === 'calc') || (this.opts.top === 'calc' && this.opts.bottom === 'calc'))
            throw new Error('No 2 opposite position arguments (left/right, top/bottom) can both be calculated.');
        this.calcPos();
        // content (and ts defaults)
        this.#content = '';
        this.contentLen = this.contentHeight = 0;
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
    calcPos(): void {
        // width/height must be defined first
        this.width = this.parseKeywordWH(this.opts.width, 'w');
        this.height = this.parseKeywordWH(this.opts.height, 'h');
        console.error(this.width, this.height);
        if (this.screen && this.opts.resize && this.width + this.aleft > this.screen.width) this.width = this.screen.width - this.aleft;
        if (this.screen && this.opts.resize && this.height + this.atop > this.screen.height) this.height = this.screen.height - this.atop;
        console.error(this.width, this.height);
        // then margins
        this.left = this.parseKeywordMargin(this.opts.left, 'left');
        this.right = this.parseKeywordMargin(this.opts.right, 'right');
        this.top = this.parseKeywordMargin(this.opts.top, 'top');
        this.bottom = this.parseKeywordMargin(this.opts.bottom, 'bottom');
        this.aleft = this.parseKeywordMargin(this.opts.left, 'left', this.screen);
        this.aright = this.parseKeywordMargin(this.opts.right, 'right', this.screen);
        this.atop = this.parseKeywordMargin(this.opts.top, 'top', this.screen);
        this.abottom = this.parseKeywordMargin(this.opts.bottom, 'bottom', this.screen);
    }
    /**
     * Is keyword a percentage (50%, 25%+1, 70%-1, etc...)
     */
    isPercentage(k: Keyword): k is string { //
        return k ? typeof k === 'number' ? false : !isNaN(Number(k.replace('%', '').replace(/[+-]/, ''))) : false;
    }
    /**
     * Is percentage nPer (iNvalid Percentage)
     * @param p The percentage to check
     */
    isNPer(p: Percentage): boolean {
        return p.percent < 0;
    }
    /**
     * Check if string is 'w' or 'h'
     * @param wh The string to check
     */
    isWh(wh: string): wh is 'w' | 'h' {
        return ['w', 'h'].includes(wh);
    }
    /**
     * Check if string is 'top', 'bottom', 'left, or 'right'
     * @param tblr The string to check
     */
    isTblr(tblr: string): tblr is Tblr {
        return ['top', 'bottom', 'left', 'right'].includes(tblr);
    }
    /**
     * Convert a string from w or h to width or height
     * @param wh The string to convert
     * @returns 
     */
    wh(wh: 'w' | 'h' = 'w'): 'width' | 'height' {
        return wh === 'w' ? 'width' : 'height'
    }
    /**
     * Round a number according to options. Will consistently either round up or down.
     */
    round(n: number): number {
        return Math[this.opts.floor ? 'floor' : 'ceil'](n);
    }
    /**
     * Generate a Mat from the content
     */
    genContent() {
        const mat =  new Mat(this.width, this.height, '');
        // calculate the valign
        let t = 0;
        switch (this.opts.valign) {
            case 'top':
                t = 0;
                break;
            case 'bottom':
                t = this.height - this.contentHeight;
                break;
            default: t = this.round(this.height / 2 - this.contentHeight / 2);
        }
        // calc align
        let l = 0;
        switch (this.opts.align) {
            case 'left':
                l = 0;
                break;
            case 'right':
                l = this.width - this.contentLen;
                break;
            default: l = this.round(this.width / 2 - this.contentLen / 2);
        }
        console.error(l, this.width - l - this.contentLen)
        // render
        const c = new Mat(this.width, this.contentHeight, '');
        const rows = this.content.split('\n');
        for (let y = 0; y < rows.length; y++) {
            for (let x = 0; x < rows[y].length; x++) {
                c.xy(l + x, y, rows[y].charAt(x));
            }
        }
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
    calcPercentage(p: Percentage, type: 'w' | 'h' | Tblr, parent?: Node): number {
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
    parseKeywordWH(k: Keyword, wh: 'w' | 'h' = 'w', parent?: Node): number {
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
    parseKeywordMargin(k: Keyword, tblr: Tblr, parent?: Node): number {
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
