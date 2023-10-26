import Node from './Node.js';
import Screen from './Screen.js';
import tc from 'tinycolor2';
import length from 'string-length';

export type Keyword = number | string | 'center' | 'left' | 'right' | 'shrink';
export type Color = tc.ColorInput | 'default';

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
    border?: Border;
    scrollbar?: Scrollbar;
    focus?: Omit<Style, 'focus'>;
    hover?: Omit<Style, 'hover'>;
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
    bold: boolean;
    /**
     * Element is underlined
     */
    underline: boolean;
    /**
     * The border options. Try to put this under "style", for sake of organization
     */
    border?: Border;
    /**
     * Text content. Default ""
     */
    content: string;
    /**
     * Element will focus on click. Default true
     */
    clickable: boolean;
    /**
     * Element is focused. Default false
     */
    focused: boolean;
    /**
     * Element is hidden. Default false
     */
    hidden: boolean;
    /**
     * A text label (for borders). Defalt none
     */
    label?: string;
    //TODO: hovertext

    /**
     * Text alignment
     */
    align: 'left' | 'center' | 'right';
    /**
     * Text alignment, but vertical
     */
    valign: 'top' | 'center' | 'bottom';
    /**
     * Shrink to text content.
     */
    shrink: boolean;
    /**
     * 
     */
    padding: number | Padding;
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
    left: Keyword;
    /**
     * Parent-relative right offset.
     * Keywords are not allowed
     */
    right?: number;
    /**
     * Parent-relative top offset.
     * "center", "left", and "right" are the only allowed keywords.
     */
    top: Keyword;
    /**
     * Parent-relative bottom offset.
     * Keywords are not allowed
     */
    bottom?: number;
    /**
     * Position. Includes all above terms
     */
    position?: {
        /**
         * Text alignment
         */
        align: 'left' | 'center' | 'right';
        /**
         * Text alignment, but vertical
         */
        valign: 'top' | 'center' | 'bottom';
        /**
         * Shrink to text content.
         */
        shrink: boolean;
        /**
         * 
         */
        padding: number | Padding;
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
        left: Keyword;
        /**
         * Parent-relative right offset.
         * Keywords are not allowed
         */
        right?: number;
        /**
         * Parent-relative top offset.
         * "center", "left", and "right" are the only allowed keywords.
         */
        top: Keyword;
        /**
         * Parent-relative bottom offset.
         * Keywords are not allowed
         */
        bottom?: number;
    }
    /**
     * Element can scroll (if overflow happens). Default true
     */
    scrollable: boolean;
    /**
     * Same as scrollable
     */
    scroll: boolean;
    /**
     * Background character. Default whitespace (" ")
     */
    ch: string;
    /**
     * Element can be dragged by mouse.
     */
    draggable: boolean;
    /**
     * Same as draggable
     */
    drag: boolean;
    /**
     * Element has a offset shadow.
     */
    shadow: boolean;
    /**
     * Element style.
     */
    style: Style;
}
export type OptionsNoStyle = Omit<ElementOptions, 'fg' | 'bg' | 'style' | 'border' | 'position' | 'scroll' | 'drag'>
export interface Percentage {
    percent: number;
    offset: number;
}

export default class Element extends Node {
    left: number;
    right: number;
    top: number;
    bottom: number;
    aleft: number;
    aright: number;
    atop: number;
    abottom: number;
    content: string;
    opts: OptionsNoStyle;
    style: Style;
    readonly nPer: Percentage;
    constructor(opts: Partial<ElementOptions>) {
        super();
        this.type = 'element';
        this.parent = opts.parent instanceof Node ? opts.parent : undefined;
        if (opts.screen instanceof Screen) this.setScreen(opts.screen);
        else if (this.parent?.screen instanceof Screen) this.setScreen(this.parent.screen);
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
            label: opts.label,
            align: opts.align || opts.position?.align || 'center',
            valign: opts.valign || opts.position?.valign || 'center',
            shrink: opts.shrink || opts.position?.shrink || false,
            padding: opts.padding || opts.position?.padding || 0,
            width: opts.width || opts.position?.width || 'shrink',
            height: opts.height || opts.position?.height || 'shrink',
            left: opts.left || opts.position?.left || 0,
            right: opts.right || opts.position?.right,
            top: opts.top || opts.position?.top || 0,
            bottom: opts.bottom || opts.position?.bottom,
            scrollable: opts.scrollable || opts.scroll || true,
            ch: opts.ch || ' ',
            draggable: opts.draggable || opts.drag || false,
            shadow: opts.shadow || false
        }
        this.style = {
            fg: opts.style?.fg || opts.fg || 'default',
            bg: opts.style?.bg || opts.bg || 'default',
            border: opts.style?.border || opts.border,
            scrollbar: opts.style?.scrollbar,
            focus: opts.style?.focus,
            hover: opts.style?.hover
        }
        this.content = this.opts.content;
        this.width = this.parseKeywordWH(this.opts.width, 'w');
        this.height = this.parseKeywordWH(this.opts.height, 'h');
        this.left = this.right = this.top = this.bottom = 0;
        this.aleft = this.aright = this.atop = this.abottom = 0;
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
    wh(wh: 'w' | 'h' = 'w'): 'width' | 'height' {
        return wh === 'w' ? 'width' : 'height'
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
     * @param wh The percentage direction
     * @param parent The reference Node
     * @returns The number of characters
     */
    calcPercentage(p: Percentage, wh: 'w' | 'h', parent?: Node): number {
        if (!parent) parent = this.parent || this.screen;
        if (!parent) return 0;
        if (this.isNPer(p)) return 0;
        return Math.round(parent[this.wh(wh)] / 100 * p.percent + p.offset)
    }
    /**
     * Parse Partially Processed Keyword
     * Parse a keyword once all cases other than number and percentage
     * @param k The keyword to parse
     * @param parent The reference Node
     * @param wh The percentage direction
     */
    pPPK(k: Keyword, parent: Node, wh: 'w' | 'h'): number {
        const num = Number(k);
        if (!isNaN(num)) return num;
        const p = this.parsePercentage(k);
        return this.calcPercentage(p, wh, parent);
    }
    /**
     * Parse a width or height keyword to number of characters
     * @param k The keyword to parse
     * @param parent The reference Node
     * @returns The number of characters
     */
    parseKeywordWH(k: Keyword, wh: 'w' | 'h' = 'w', parent?: Node): number {
        if (!parent) parent = this.parent || this.screen;
        if (!parent) return 0;
        if (wh !== 'w' && wh !== 'h') return 0;
        switch (k) {
            case 'shrink': return length(this.content);
            case 'half': return Math.round(parent[this.wh(wh)] / 2);
            default: {
                const num = Number(k);
                if (!isNaN(num)) return num;
                const p = this.parsePercentage(k);
                return this.calcPercentage(p, wh, parent);
            }
        }
    }
}
