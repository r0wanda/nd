import Node from './Node.js';
import tc from 'tinycolor2';

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
    parent?: Node;
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
    constructor(opts: Partial<ElementOptions>) {
        super();
        this.type = 'element';
        this.parent = opts.parent instanceof Node ? opts.parent : undefined;
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
        this.left = this.right = this.top = this.bottom = 0;
        this.aleft = this.aright = this.atop = this.abottom = 0;
    }
    isPercentage(k: Keyword): boolean {
        // checks if percentage is 
        return typeof k === 'number' ? false : !isNaN(Number(k.replace('%', '').replace(/\+\-/, '')));
    }
    parsePercentage(k: Keyword): Percentage {
        if ()
    }
    parseKeywordW(k: Keyword, parent: Node): number {
        switch (k) {
            case 'shrink': return this.content.length;
            case 'half': return Math.round(parent.width / 2);
            default:
                if (this.isPercentage(k))
        }
    }
    parseKeywordWH(k: Keyword, wh: 'w' | 'h' = 'w', parent?: Node): number {
        if (!parent) parent = this.parent || this.screen;
        if (!parent) return 0;
        if (wh === 'w') return this.parseKeywordW(k, parent);
    }
}
