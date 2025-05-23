import Node from './Node.js';
import Mat from './Mat.js';
import Screen, { Ansi } from './Screen.js';
import Color from './Color.js'
import tc from 'tinycolor2';
import length from 'string-width';
import merge from 'deepmerge';
import { isPlainObject } from './is-plain-object.js';
import stripAnsi from 'strip-ansi';
//import assert from 'node:assert/strict'

import type { Shd, KeyOptions } from './Screen.js';
import type { Key } from './Keys.js';

export type Keyword = number | string | 'center' | 'left' | 'right' | 'top' | 'bottom' | 'shrink' | 'calc';
export type Color_t = tc.ColorInput | 'default';
export type Tblr = 'top' | 'bottom' | 'left' | 'right';
export type Orientation = 'vertical' | 'horizontal' | 'vert' | 'horiz' | 'v' | 'h';

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
// not sure why but the right corners on heavy and double borders look slightly different sometimes
// only on nerd fonts for me
// please tell me why this happens
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
export interface BorderOpts {
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
    fg?: Color_t;
    /**
     * Element background color.
     */
    bg?: Color_t;
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
    /**
     * For a 1x1 border, which direction to orient line
     * @default 'v'
     */
    orientation?: Orientation;
}
export interface Scrollbar {
    /**
     * Element foreground color.
     */
    fg?: Color_t;
    /**
     * Element background color.
     */
    bg?: Color_t;
    /**
     * Element is bold
     */
    bold: boolean;
    /**
     * Element is underlined
     */
    underline: boolean;
}
export interface Label {
    /**
     * The label text
     */
    text?: string;
    /**
     * The position of the label
     */
    side?: 'left' | 'center' | 'middle' | 'right';
    /**
     * Alias of side
     */
    align?: Label['side'];
    /**
     * The color of the label text
     */
    color?: Color_t;
    /**
     * The background for the label
     */
    bg?: Color_t;
    /**
     * The padding on either side of the label
     * Minimum value: 2
     * @default 2
     * @example
     * padding = 1
     * ┌label───
     * 
     * padding = 2
     * ┌─label──
     * 
     * padding = 3
     * ┌──label─
     */
    padding?: number;
}
export interface Style {
    /**
     * Element foreground color.
     */
    fg?: Color_t;
    /**
     * Element background color.
     */
    bg?: Color_t;
    /**
     * Border options
     */
    border?: BorderOpts;
    /**
     * Scrollbar options
     */
    scrollbar?: Scrollbar;
    /**
     * Alternate style on focus
     */
    focus?: Omit<Style, 'focus'>;
    /**
     * Alternate style on hover
     */
    hover?: Omit<Style, 'hover'>;
    /**
     * Default label settings
     */
    label?: Omit<Label, 'text'>;
}
export interface StyleReq extends Style {
    /**
     * Element background color.
     */
    fg: Color_t;
    /**
     * Element foreground color.
     */
    bg: Color_t;
}

export interface ElementOptions {
    /**
     * Parent Element
     */
    parent?: Element;
    /**
     * Screen Node
     */
    screen?: Screen
    /**
     * Children of element
     */
    children?: Element[];
    /**
     * Element foreground color. Try to put this under "style", for sake of organization
     */
    fg?: Color_t;
    /**
     * Element background color. Try to put this under "style", for sake of organization
     */
    bg?: Color_t;
    /**
     * Element is bold
     * Setting bold is the eqivalent of adding a {bold} tag to the beginning of content, so add a {/bold} tag to cancel
     */
    bold?: boolean;
    /**
     * Element is underlined
     * Setting bold is the eqivalent of adding a {underline} tag to the beginning of content, so add a {/underline} tag to cancel
     */
    underline?: boolean;
    /**
     * The border options. Try to put this under "style", for sake of organization
     */
    border?: BorderOpts;
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
  *
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
     * @default 'shrink'
     */
    width?: Keyword;
    /**
     * Element height. See type Keyword for more
     * The "shrink" and "half" keywords are the only ones allowed
     * @default 'shrink'
     */
    height?: Keyword;
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
     * Enable or disable tag parsing
     * @default true
     */
    tags?: boolean;
    /**
     * Whether or not to resize the element if it overflows off screen. Default true, if false, cropping will still be done on render to prevent icky stuff
     * @default true
     */
    resize?: boolean;
    /**
     * Whether or not to dock border (if there is one)
     */
    dock?: boolean;
    /**
     * Whether or not to strip ansi escape codes when setting content
     */
    stripAnsi?: boolean;
    /**
     * The width in this element (overrides screen)
     * @default screen.opts.tabSize
     */
    tabSize?: number;
}
export type OptionsNoStyle = Omit<ElementOptions, 'fg' | 'bg' | 'style' | 'border' | 'position' | 'scroll' | 'drag' | 'parent' | 'screen' | 'children'>
export interface Percentage {
    percent: number;
    offset: number;
}
export interface ElementKeyOptions extends KeyOptions {
    /**
     * Pick up keys globally
     * @remarks Equivalent to Element.screen.key
     */
    global?: boolean;
}

/**
 * Object representation of a tag
 * types:
 *  content: Text content type
 *  newline: Self-explanatory
 *  left/right/center: Alignment
 *  open/close: '{' and '}' characters
 *  *-fg/*-bg: Colors
 *  closeAll {/}: Close all tags
 * close: Whether tag is opening or closing
 * val: Text content, ignored unless type is content
 */
export interface Tag {
    type: string;
    close: boolean;
    val?: string;
}

//const _Node: new <E extends ListenerSignature<E> = ListenerSignature<unknown>>() => Omit<Node, 'parent' | 'children'> = Node;

export type ArrayEditAdd = 'prepend' | 'prep' | 'unshift' |
    'append' | 'push' |
    'insert' |
    'insertBefore' | 'insertBef' |
    'insertAfter' | 'insertAft';
export type ArrayEditDel = 'remove' | 'delete';
export type ArrayEdit = ArrayEditDel | ArrayEditAdd;

export interface Position {
    top: number;
    bottom: number;
    left: number;
    right: number;
    t: number;
    b: number;
    l: number;
    r: number;
}
export type UserPosition = {
    [K in keyof Position]: Keyword
}
export interface Size {
    width: number;
    height: number;
}
export type UserSize = {
    [K in keyof Size]: Keyword;
}

/**
 * The base Element class, which all other rendered objects descend from.
 * @abstract
 */
export default class Element extends Node {
    name?: string;
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
    // the only class that is a node and not an element is screen
    declare _parent?: Element;
    declare children: Element[];
    scrollPos: number;
    screen?: Screen;
    // yippee a bunch of (nearly) identical getters/setters
    get content(): string {
        return this._content;
    }
    set content(val: string) {
        this._content = this.opts.stripAnsi ? stripAnsi(val) : val;
        this._genContent();
    }

    get contentLen(): number {
        return length(this.content);
    }

    get contentWidth(): number {
        return this.content.split('\n').reduce((p, c) => length(c) > p ? length(c) : p, 0);
    }

    get contentHeight(): number {
        return (this.content.match(/\n/g)?.length ?? -1) + 1;
    }

    get focused(): boolean {
        return this.screen?.focused === this;
    }

    get hovered(): boolean {
        return this.screen?.hovered === this;
    }

    get left(): number {
        return this._left;
    }
    set left(left: Keyword) {
        this._calcPos({ left });
    }

    get right(): number {
        return this._right;
    }
    set right(right: Keyword) {
        this._calcPos({ right });
    }

    get top(): number {
        return this._top;
    }
    set top(top: Keyword) {
        this._calcPos({ top });
    }

    get bottom(): number {
        return this._bottom;
    }
    set bottom(bottom: Keyword) {
        this._calcPos({ bottom });
    }

    get width(): number {
        return this._width;
    }
    set width(width: Keyword) {
        this._calcPos({ width });
    }

    get height(): number {
        return this._height;
    }
    set height(height: Keyword) {
        this._calcPos({ height });
    }

    get padding(): Required<Padding> {
        return this._padding;
    }
    set padding(p: Padding) {
        this._padding = this._constructPadding(p);
    }
    // raw attributes
    // dont edit these (unless you really want to)
    _left: number;
    _right: number;
    _top: number;
    _bottom: number;
    _width: number;
    _height: number;
    _content: string;
    _padding: Required<Padding>;
    /**
     * Original options object
     * @readonly
     */
    readonly options: ElementOptions;
    /**
     * Processed and usable options object
     */
    opts: Required<Omit<OptionsNoStyle, 'tabSize'>> & { tabSize?: number; };
    /**
     * Computed styles
     * @remarks Before editing something here, look for a helper function which could make things easier
     */
    style: StyleReq;
    get index() {
        return this._index;
    }
    /**
     * Insert at certain index
     */
    set index(idx: number) {
        this.screen?.insert(this, idx);
    }
    _index: number;
    contentMat: Mat;
    renderMat?: Mat;
    static nPer = {
        percent: -1,
        offset: 0
    }
    wport: number;
    hport: number;
    #preProcessStack: ((m: Mat, ...args: any[]) => Mat)[];
    #resizeListener: () => void;
    constructor(opts: ElementOptions) {
        super({
            parent: opts.parent instanceof Element ? opts.parent : undefined,
            children: opts.children
        });
        this.type = 'element';
        this.options = opts;
        this.#resizeListener = function(this: Element) {
            this._calcPos();
        }.bind(this);
        this.on('attach', (n: Node) => {
            if (n instanceof Screen) {
                if (!n.hasListener('resize', this.#resizeListener)) n.on('resize', this.#resizeListener);
            }
        });
        this.on('detach', (n: Node) => {
            if (n instanceof Screen) {
                if (n.hasListener('resize', this.#resizeListener)) n.off('resize', this.#resizeListener);
            }
        })
        if (opts.screen instanceof Screen) this._index = this.setScreen(opts.screen);
        else if (this.parent?.screen instanceof Screen) this._index = this.setScreen(this.parent.screen);
        else this._index = -1;
        this.#preProcessStack = [];
        this.opts = {
            bold: opts.bold ?? false,
            underline: opts.underline ?? false,
            content: opts.content ?? '',
            clickable: opts.clickable ?? false,
            focused: opts.focused ?? false,
            hidden: opts.hidden ?? false,
            label: opts.label ?? '',
            align: opts.align ?? opts.position?.align ?? 'left',
            valign: opts.valign ?? opts.position?.valign ?? 'top',
            shrink: opts.shrink ?? opts.position?.shrink ?? false,
            padding: opts.padding ?? opts.position?.padding ?? 0,
            width: opts.width ?? opts.position?.width ?? 'shrink',
            height: opts.height ?? opts.position?.height ?? 'shrink',
            left: opts.left ?? opts.position?.left ?? 'calc',
            right: opts.right ?? opts.position?.right ?? 'calc',
            top: opts.top ?? opts.position?.top ?? 'calc',
            bottom: opts.bottom ?? opts.position?.bottom ?? 'calc',
            scrollable: opts.scrollable ?? opts.scroll ?? true,
            ch: opts.ch ?? ' ',
            draggable: opts.draggable ?? opts.drag ?? false,
            shadow: opts.shadow ?? false,
            floor: opts.floor ?? true,
            tags: opts.tags ?? true,
            resize: opts.resize ?? true,
            dock: opts.dock ?? true,
            stripAnsi: opts.stripAnsi ?? false,
            tabSize: opts.tabSize
        }
        this.opts.tabSize 
        const fg = tc(opts.style?.fg ?? opts.fg);
        const bg = tc(opts.style?.bg ?? opts.bg);
        this.style = {
            fg: (fg.isValid() ? fg : false) || 'default',
            bg: (bg.isValid() ? bg : false) || 'default',
            border: opts.style?.border && opts.border ? {
                ...opts.style.border,
                ...opts.border
            } : (opts.style?.border || opts.border),
            scrollbar: opts.style?.scrollbar,
            focus: opts.style?.focus,
            hover: opts.style?.hover,
            label: opts.style?.label
        }
        // defaults to make typescript happy
        this._width = this._height =
            this._left = this._right = this._top = this._bottom =
            this.aleft = this.aright = this.atop = this.abottom =
            this.wport = this.hport = 0;
        // actually set position
        this._calcPos({
            regenContent: false
        });
        // padding
        this._padding = this._constructPadding(opts.padding);
        // content (and ts defaults)
        this._content = '';
        this.scrollPos = 0;
        this.contentMat = new Mat(0, 0);
        this.content = this.opts.content;

        this.on('scrollup', () => {
            console.error('scrlup')
            if (this.scrollPos > 0) this.scrollPos--;
            this._genContent();
            this.screen?.render();
        });
        this.on('scrolldown', () => {
            console.error('scrldown');
            if (this.scrollPos + this.hport + 1 <= this.contentHeight) this.scrollPos++;
            this._genContent();
            this.screen?.render();
        });
        this.on('resize', () => {
            this.screen?._reloadHover();
        });
        this.on('position', () => {
            this.screen?._reloadHover();
        });
    }
    /**
     * Add node to screen
     * @param scr The screen to add
     * @param nodeAdded If node was already added to screen
     * @returns 
     */
    setScreen(scr?: Screen, nodeAdded = false): number {
        this.screen = scr;
        if (!nodeAdded) this.screen?.append(this);
        if (scr) this.emit('attach', scr);
        else this.emit('detach');
        return scr ? scr.children.length : -1;
    }
    removeScreen() {
        // screen is undefined now :)
        this.setScreen();
    }
    /**
     * Set content (reccomended to just set the "content" property unless using ansi strip)
     * @param val The content value
     * @param strip Strip ansi escape codes
     */
    setContent(val: string, strip = this.opts.stripAnsi) {
        this.content = strip ? stripAnsi(val) : val;
    }
    /**
     * Set label text and options
     * @param label The label text and options
     */
    setLabel(label: Label): void
    /**
     * Set label text
     * @param text The label text
     */
    setLabel(text: string, opts?: Omit<Label, 'text'>): void
    setLabel(label: string | Label, opts?: Omit<Label, 'text'>): void {
        if (typeof label === 'string') {
            this.opts.label = label;
            if (opts) {
                this.style.label = opts;
            }
        } else if (label.text) {
            this.opts.label = label.text;
            this.style.label = {
                align: label.align,
                color: label.color,
                padding: label.padding,
                side: label.side
            }
        } else {
            this.opts.label = '';
            this.style.label = {};
        }
    }
    /**
     * Add a preprocessing function
     * @param fn The function
     * @param method The method for array addition (eg. append, prepend, insert...) (same as functions for adding children in Node)
     * @param idxOrRef The index, if inserting, or the reference function if using insertBefore/after
     * @param acceptInvalidIndexes Whether or not to accept invalid indexes (eg. for -1, prepends, or for something longer than the array, pushes)
     */
    addPreProcess(fn: (m: Mat) => Mat, method: ArrayEditAdd = 'append', idxOrRef?: number | ((m: Mat) => Mat), acceptInvalidIndexes = false) {
        const ins = (idx: number) => {
            if (!idx) throw new Error('No index provided');
            if (idx > this.#preProcessStack.length - 1 && acceptInvalidIndexes) this.#preProcessStack.push(fn);
            else if (idx < 0 && acceptInvalidIndexes) this.#preProcessStack.unshift(fn);
            else if (idx < 0 || idx > this.#preProcessStack.length - 1) {
                throw new Error('Invalid index (inserting child)');
            } else this.#preProcessStack.splice(idx, 0, fn);
        }
        switch (method) {
            case 'prepend':
            case 'prep':
            case 'unshift':
                this.#preProcessStack.unshift(fn);
                break;
            case 'insert':
                if (typeof idxOrRef !== 'number') throw new TypeError('Using reference function when index is expected, use insertBefore/after instead')
                ins(idxOrRef);
                break;
            case 'insertBefore':
            case 'insertBef': {
                if (typeof idxOrRef !== 'function') throw new TypeError('Using index when reference function is expected, use insert instead');
                const idx = this.#preProcessStack.indexOf(idxOrRef);
                if (idx < 0) throw new Error('Could not find reference function')
                ins(idx);
                break;
            }
            case 'insertAfter':
            case 'insertAft': {
                if (typeof idxOrRef !== 'function') throw new TypeError('Using index when reference function is expected, use insert instead');
                const idx = this.#preProcessStack.indexOf(idxOrRef);
                if (idx < 0) throw new Error('Could not find reference function')
                ins(idx + 1);
                break;
            }
            default:
                this.#preProcessStack.push(fn);
        }
    }
    /**
     * Remove the first instance of a function from the preprocess stack
     * @param fn The function to remove
     */
    removePreProcess(fn: (m: Mat) => Mat) {
        const idx = this.#preProcessStack.indexOf(fn);
        if (idx < 0) throw new Error('Could not find function to remove');
        this.#preProcessStack.splice(idx, 1);
    }
    /**
     * Remove all instances of a function from the preprocess stack
     * @param fn The function to remove
     */
    removeAllPreProcess(fn: (m: Mat) => Mat) {
        let idx = this.#preProcessStack.indexOf(fn);
        if (idx < 0) throw new Error('Could not find function to remove');
        while (idx > 0) {
            this.#preProcessStack.splice(idx, 1);
            idx = this.#preProcessStack.indexOf(fn);
        }
    }
    /**
     * Remove all preprocess funtions
     */
    clearPreProcess() {
        this.#preProcessStack = [];
    }
    /**
     * Get the preprocessing stack
     * @returns The preprocessing stack
     */
    getPreProcess() {
        return this.#preProcessStack;
    }
    moveToFront() {
        this.screen?.append(this, true);
    }
    /**
     * Calculate position
     * @internal
     */
    _calcPos(opts?: {
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
        // cache old values
        const getWHCache = () => [this._width, this._height];
        const whCache = getWHCache();
        this._width = this._parseKeywordWH(this.opts.width, 'w');
        this._height = this._parseKeywordWH(this.opts.height, 'h');
        if (this.screen && this.opts.resize && this.width + this.aleft > this.screen.width) this.width = this.screen.width - this.aleft;
        if (this.screen && this.opts.resize && this.height + this.atop > this.screen.height) this.height = this.screen.height - this.atop;
        // then margins
        const getPosCache = () => [this._left, this._right, this._top, this._bottom, this.aleft, this.aright, this.atop, this.abottom];
        const posCache = getPosCache();
        this._left = this._parseKeywordMargin(this.opts.left, 'left');
        this._right = this._parseKeywordMargin(this.opts.right, 'right');
        this._top = this._parseKeywordMargin(this.opts.top, 'top');
        this._bottom = this._parseKeywordMargin(this.opts.bottom, 'bottom');
        this.aleft = this._parseKeywordMargin(this.opts.left, 'left', this.screen);
        this.aright = this._parseKeywordMargin(this.opts.right, 'right', this.screen);
        this.atop = this._parseKeywordMargin(this.opts.top, 'top', this.screen);
        this.abottom = this._parseKeywordMargin(this.opts.bottom, 'bottom', this.screen);
        const newPos = getPosCache();
        const newWH = getWHCache();
        if (!posCache.every((val, i) => newPos[i] === val)) this.emit('position');
        if (!whCache.every((val, i) => newWH[i] === val)) this.emit('resize');
        // regen contentmat by calling setter
        if (opts?.regenContent ?? true) this.setContent(this.content);
    }
    _constructPositon() {

    }
    _constructSize() {

    }
    /**
     * Construct Padding
     * @param p A partial Padding object
     * @returns A complete Padding object
     */
    _constructPadding(p: ElementOptions['padding']): Required<Padding> {
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
    _withinBounds(x: number, y: number): boolean {
        return x >= this.aleft && x < this.aleft + this.width && y >= this.atop && y < this.atop + this.height;
    }
    /**
     * Check if a xy position is on the edge of this Element
     * @param x 
     * @param y 
     * @returns The result
     */
    _isOnEdge(x: number, y: number): boolean {
        return ((x === this.aleft || x === this.aleft + this.width - 1) && y >= this.atop && y <= this.aleft + this.width) ||
            ((y === this.atop || y === this.atop + this.height - 1) && x >= this.aleft && x <= this.aleft + this.width);
    }
    /**
     * Round a number according to options. Will consistently either round up or down.
     * @internal
     */
    _round(n: number): number {
        return Math[this.opts.floor ? 'floor' : 'ceil'](n);
    }
    /**
     * Focus element
     * @param thrw Whether or not to throw an error if not able to focus
     */
    focus(thrw = false): void {
        if (!this.screen) {
            if (thrw) throw new Error('Tried to focus element without a screen');
            else return;
        }
        this.screen.focused = this;
    }
    key(key: (string | RegExp)[] | string | RegExp, cb: (ch: string, key: Key | undefined) => void, opts?: KeyOptions) {
        opts = opts || {};
        opts.elem = this;
        if (!this.screen) throw new Error('Cannot register key without a screen');
        this.screen.key(key, cb, opts);
    }
    _mergeStyle(): StyleReq {
        const m = <Style>merge.all([
            this.style,
            (this.focused && this.style.focus ? this.style.focus : {}),
            (this.hovered && this.style.hover ? this.style.hover : {})
        ], {
            isMergeableObject: obj => {
                return obj instanceof tc ? false : isPlainObject(obj)
            }
        });
        const fg = tc(m?.fg);
        const bg = tc(m?.bg);
        m.fg = (fg.isValid() ? fg : false) || 'default';
        m.bg = (bg.isValid() ? bg : false) || 'default';
        return <StyleReq>m;
    }
    /**
     * Parse tags from a string
     * @param s The string
     * @returns An array of tag objects
     */
    _parseTags(s: string): Tag[] {
        const tab = ' '.repeat(this.opts.tabSize ?? this.screen?.opts.tabSize ?? 4);
        s = s.replace(/\t/g, tab);
        if (!this.opts.tags) {
            const tags = [];
            // see: https://en.wikipedia.org/wiki/Newline#Representation
            const t = s.split(/\r\n|\n/);
            for (let i = 0; i < t.length; i++) {
                tags.push({
                    type: 'content',
                    close: false,
                    val: t[i]
                });
                if (i + 1 !== t.length) tags.push({
                    type: 'newline',
                    close: false
                });
            }
            return tags;
        }
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
                    // {open} and  {close} tags represent the '{' and '}' characters respectively
                    val += raw === 'open' ? '{' : '}';
                } else {
                    tags.push({
                        type: raw,
                        close: false
                    });
                }
                tag = '';
            } else if (c.search(/(\r\n|\r|\n)/) >= 0) {
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
    /**
     * Generate a Mat from the content
     * @internal
     */
    _genContent<R extends boolean>(ret?: R, width?: number, height?: number, color = this.screen?._color): R extends true ? Mat : undefined {
        width = width ?? this.width;
        height = height ?? this.height;
        const style = this._mergeStyle();
        // main mat
        const m = new Mat(width, height, '');
        if (!color) color = new Color();

        // render
        const tags = this._parseTags(this.content);
        // set padding (nice for implementing border and scrollbar)
        // math.max will choose specified padding if it is both defined and bigger than 1, else it will default to 1
        // if no border exists, border padding will be 0
        // final note: border padding is applied equally to all sides
        let bdpad = style.border ? Math.max(style.border.padding || 1, 1) : 0;
        const hpad = this.padding.t + this.padding.b + (bdpad * 2);
        let scrlpad = this.contentHeight > height - hpad ? Number(!!this.opts.scrollable) : 0;

        // checks
        if (isNaN(scrlpad)) scrlpad = 0;
        if (isNaN(bdpad)) bdpad = 0;

        // *2 bc border is on all sides, scrlpad is only on right
        const wpad = this.padding.l + this.padding.r + bdpad * 2 + scrlpad;
        const lpad = this.padding.l + bdpad;
        const tpad = this.padding.t + bdpad;

        // usable content mat
        if (width - wpad < 0 || height - hpad < 0) throw new Error('Element padding (including border) may not exceed width or height');
        const c = new Mat(width - wpad, height - hpad, '');
        this.wport = c.x;
        this.hport = c.y;
        // calculate the valign
        let t = 0;
        switch (this.opts.valign) {
            case 'center':
            case 'middle':
                t = this._round(c.y / 2 - this.contentHeight / 2);
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
                    l = this._round(c.x / 2 - w / 2);
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
        let fg = style.fg || 'default';
        let bg = style.bg || 'default';
        let bold = this.opts.bold;
        let ul = this.opts.underline;
        let al = this.opts.align ?? 'left';
        let regen = false;

        /**
         * move x to the alignment position
         * @param idx 
         */
        function finalizeAlign(idx: number) {
            let a: 'left' | 'right' | 'center' | 'middle';
            a = <typeof a><unknown>undefined;
            // is seperator coming up
            for (let i = ++idx; i < tags.length; i++) {
                const t = tags[i];
                if (t.type === 'newline') break;
                else if (t.type === '|') {
                    a = 'left';
                    break;
                }
            }
            if (!a || idx < 1) {
                // has a seperator been passed
                // TODO: maybe optimize (eg. store seperator place(s))
                for (let i = --idx; i > 0; i--) {
                    const t = tags[i];
                    if (t.type === 'newline') break;
                    else if (t.type === '|') a = 'right';
                }
            }
            if (!a) a = al;
            let l = 0;
            let nope = false;
            for (let i = idx; i < tags.length; i++) {
                const t = tags[i];
                if (t.type === 'newline') break;
                else if (t.type.search(alignRe) >= 0 && t.type !== a) { // will not include anything not aligned the same way
                    nope = !t.close; // if it is closing then set nope to true
                }
                else if (t.type === 'content' && !nope) l += t.val?.length || 0;
            }
            x = align(l, a);
            //finalized = true;
        }
        /**
         * Find index to start if starting at line `tgt`
         * @param tgt Target starting line
         * @returns The index
         */
        function lineIdx(tgt: number) {
            let at = 0;
            let i = 0;
            for (; i < tags.length; i++) {
                if (at === tgt) break;
                if (tags[i].type === 'newline') at++;
            }
            return i;
        }

        let i = this.scrollPos ? lineIdx(this.scrollPos) : 0;
        for (; i < tags.length; i++) {
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
                const _bold = bold ? Ansi.attr.bold : '';
                const _ul = ul ? Ansi.attr.ul : '';
                //console.error({fg: tc(fg), bg, _fg, _bg})
                // correctly place characters on mat
                let val = '';
                for (let i = 0; i < t.val.length; i++) {
                    if (x > c.x) break;
                    val += t.val.at(i);
                    if (length(val) < 1) continue;
                    if (x >= c.x || y >= c.y) break;
                    c.xy(x, y, `${_bg}${_fg}${_bold}${_ul}${val}\x1b[0m`);
                    x += length(val);
                    val = '';
                }
            } else if (t.type === 'newline') {
                // reset align, x then increment
                al = this.opts.align;
                x = 0;
                y++;
            } else if (t.type === 'closeAll') {
                // reset all, no increment
                al = this.opts.align;
                fg = style.fg || 'default';
                bg = style.bg || 'default';
            } else if (t.type === 'bold') {
                bold = !t.close;
            } else if (t.type === 'underline') {
                ul = !t.close;
            } else if (t.type.search(colorRe) >= 0) {
                const col = t.type.replace(colorRe, '');
                if (t.type.endsWith('-fg')) {
                    fg = t.close ? style.fg || 'default' : col;
                } else if (t.type.endsWith('-bg')) {
                    bg = t.close ? style.bg || 'default' : col;
                }
            }
            if (y > c.y) break;
        }
        //c.yShrink(); // x alignment has already been applied, y is done at overlay
        function shiftColor(c?: Color_t, amount?: number, def: tc.ColorInput = 'black'): tc.Instance {
            const col = tc((c || '').toString());
            if (!c || c === 'default' || !col.isValid()) return tc(def);
            if (col.isDark()) return col.lighten(amount);
            return col.darken(amount);
        }
        if (scrlpad) {
            c.pushColumn();
            // color choice
            const bg = `${color.parse(style.scrollbar?.bg || shiftColor(style.bg), true)}${this.opts.ch}\x1b[0m`;
            let fg;
            if (style.scrollbar?.fg) fg = `${color.parse(style.scrollbar.fg)}`;
            else fg = `${color.parse(style.scrollbar?.fg || shiftColor(style.bg))}${this.opts.ch}\x1b[0m`;
            //console.error([fg, bg]);
            // calc
            let nP = Math.floor(this.scrollPos / this.contentHeight * c.y);
            const nY = Math.ceil(c.y / this.contentHeight * c.y);
            if (nP + nY === c.y && this.scrollPos + c.y !== this.contentHeight) nP--;
            if (nP === 0 && this.scrollPos !== 0) nP++;
            // render
            c.blk(c.x - 1, 0, 1, nP, bg);
            c.blk(c.x - 1, nP, 1, nY, fg);
            c.blk(c.x - 1, nP + nY, 1, c.y - nP - nY, bg);
        }
        m.overlay(lpad, t + tpad, c);
        // apply border
        if (m.x >= 1 && m.y >= 1 && style.border) {
            const lType = style.border.lineType;
            let bd: Border_t;
            if (style.border.type === 'bg') {
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
            const bg = color.parse(style.border.bg || 'default');
            const fg = color.parse(style.border.fg || 'default');
            const f = (c: string) => `${bg}${fg}${c}\x1b[0m`;
            if (m.x === 1 && m.y === 1) {
                if ((style.border.orientation ?? 'v').search(/horizontal|horiz|h/i) >= 0) m.xy(0, 0, bd.row);
                else m.xy(0, 0, bd.col);
            } else if (m.x === 1) m.blk(0, 0, 1, m.y, f(bd.col));
            else if (m.y === 1) m.blk(0, 0, m.x, 1, f(bd.row));
            else {
                m.blk(0, 0, m.x, 1, f(bd.row));
                m.blk(0, 0, 1, m.y, f(bd.col));
                m.blk(0, m.y - 1, m.x, 1, f(bd.row));
                m.blk(m.x - 1, 0, 1, m.y, f(bd.col));
                m.xy(0, 0, f(bd.tl)); m.xy(m.x - 1, 0, f(bd.tr));
                m.xy(0, m.y - 1, f(bd.bl)); m.xy(m.x - 1, m.y - 1, f(bd.br));
            }
        }
        // apply label
        if (this.opts.label) {
            const side = this.style.label?.side || this.style.label?.align || 'left';
            const text = this.opts.label;
            const col = this.style.label?.color || 'default';
            const lBg = this.style.label?.bg || 'default';
            let x = Math.max(this.style.label?.padding || 2, 1);

            // calc offset
            switch (side) {
                case 'center':
                case 'middle':
                    x = this.calcPercentage({
                        percent: 50,
                        offset: - (length(text) / 2)
                    }, 'w', this);
                    break;
                case 'right':
                    x = width - x - length(text);
                    break;
            }
            let val = '';
            let len = 0;
            for (const c of text.split('')) {
                if (x > width - 2) break;
                len += length(c);
                val += c;
                if (len < 1) continue;
                m.xy(x, 0, `${color.parse(col, false)}${color.parse(lBg, true)}${val}\x1b[0m`);
                //console.error(x, `${color.parse(col, false)}${color.parse(bg, true)}${val}\x1b[0m`);
                x += len;
                len = 0;
                val = '';
            }
        }

        if (ret) return <R extends true ? Mat : undefined>m;
        else this.contentMat = m;
        return <R extends true ? Mat : undefined>undefined;
    }
    render() {
        const style = this._mergeStyle();
        if (!this.screen?._color) throw new Error('Render cannot be run if no screen is available');
        const color = this.screen._color;
        let width = this.width;
        let height = this.height;
        //console.error(width + this.aleft, height + this.atop);
        const fg = color.parse(style.fg || 'default', false);
        const bg = color.parse(style.bg || 'default', true);
        let contentMat;
        // TODO: decide what to do on overflow
        // eg. whether or not to set contentmat to resized version, make duplicate contentmat that's rendered normally?
        if (width + this.aleft > this.screen.width) {
            width = this.screen.width - this.aleft;
            if (this.opts.resize) contentMat = this._genContent(true, width, height);
        }
        if (!contentMat) {
            this._genContent();
            contentMat = this.contentMat;
        }
        if (height + this.atop > this.screen.height) height = this.screen.height - this.atop;
        const cm = new Mat(width, height);
        //console.error(width, height)
        //console.error(this.screen.width, this.screen.height);
        cm.blk(0, 0, width, height, `${fg}${bg}${this.opts.ch}\x1b[0m`);
        cm.overlay(0, 0, contentMat);
        // run preprocessing stack
        for (const fn of this.#preProcessStack) {
            cm.preProcess(fn);
        }
        return cm;
    }
    /**
     * Parse a percentage string to the percent and offset
     * @param k The keyword to grab percentage from
     * @returns The percentage and offset as a Percentage object, or nPer
     */
    static parsePercentage(k: Keyword): Percentage {
        function isPercentage(ky: Keyword): ky is string {
            return ky ? typeof ky === 'number' ? false : !isNaN(Number(ky.replace('%', '').replace(/[+-]/, ''))) : false;
        }
        if (!isPercentage(k)) return Element.nPer;
        const spl = k.replace('%', '').split(/[+-]/);
        if (spl.length === 1 && !isNaN(Number(spl[0]))) {
            return {
                percent: Number(spl[0]),
                offset: 0
            }
        } else if (spl.length !== 2) return Element.nPer;
        else if (!k.match(/[+-]/)) return Element.nPer;
        const r: Percentage = {
            percent: Number(spl[0]),
            offset: k.includes('+') ? Number(spl[1]) : -Number(spl[1])
        }
        if (r.percent < 0 || r.percent > 100) return Element.nPer;
        return r;
    }
    /**
     * Calculate a percentage relative to a Node
     * @param p The percentage
     * @param type The percentage direction
     * @param parent The reference Node
     * @returns The number of characters
     */
    calcPercentage(p: Percentage, type: 'w' | 'h' | Tblr, parent?: Element | Screen): number {
        if (!parent) parent = this.parent || this.screen;
        if (!parent) return 0;
        if (p.percent < 0) return 0;
        function isWh(wh: string): wh is 'w' | 'h' {
            return ['w', 'h'].includes(wh)
        }
        function wh(wh: 'w' | 'h' = 'w'): 'width' | 'height' {
            return wh === 'w' ? 'width' : 'height';
        }
        return isWh(type) ? Math.round(parent[wh(type)] / 100 * p.percent + p.offset) : (() => {
            switch (type) {
                case 'top':
                case 'bottom':
                    if (p.percent === 100) return Math.ceil(parent.height + p.offset);
                    else if (p.percent === 0) return Math.floor(p.offset);
                    else return this._round(parent.height / 100 * p.percent + p.offset);
                case 'left':
                case 'right':
                    if (p.percent === 100) return Math.ceil(parent.width + p.offset);
                    else if (p.percent === 0) return Math.floor(p.offset);
                    return this._round(parent.width / 100 * p.percent + p.offset);
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
    _parseKeywordWH(k: Keyword, wh: 'w' | 'h' = 'w', parent?: Element | Screen): number {
        if (!parent) parent = this.parent || this.screen;
        if (!parent) return 0;
        if (wh !== 'w' && wh !== 'h') return 0;
        function _wh(wh: 'w' | 'h' = 'w'): 'width' | 'height' {
            return wh === 'w' ? 'width' : 'height';
        }
        switch (k) {
            case 'shrink': return this.contentLen;
            case 'half': return this._round(parent[_wh(wh)] / 2);
            default: {
                const num = Number(k);
                if (!isNaN(num)) return num;
                const p = Element.parsePercentage(k);
                return this.calcPercentage(p, wh, parent);
            }
        }
    }
    /**
     * Parse a margin to number of characters
     * @internal
     * @param k The keyword to parse
     * @param tblr The keyword direction
     * @param parent The reference Node
     * @returns The number of characters
     */
    _parseKeywordMargin(k: Keyword, tblr: Tblr, parent?: Element | Screen): number {
        if (!parent) parent = this.parent || this.screen;
        if (!parent) return 0;
        function isTblr(tblr: string): tblr is Tblr {
            return ['top', 'bottom', 'left', 'right'].includes(tblr)
        }
        if (!isTblr(tblr)) return 0;
        switch (tblr) {
            case 'left': {
                switch (k) {
                    case 'left': return 0;
                    case 'right': return parent.width - this.width;
                    case 'center': return this._round(parent.width / 2 - this.width / 2);
                    case 'calc': return parent.width - (this.width + this.right);
                    default: {
                        const num = Number(k);
                        if (!isNaN(num)) return num;
                        const p = Element.parsePercentage(k);
                        return this.calcPercentage(p, tblr, parent);
                    }
                }
            }
            case 'right': {
                switch (k) {
                    case 'left': return parent.width + this.width;
                    case 'right': return 0;
                    case 'center': return this._round(parent.width / 2 + this.width / 2);
                    case 'calc': return parent.width - (this.left + this.width);
                    default: {
                        const num = Number(k);
                        if (!isNaN(num)) return num;
                        const p = Element.parsePercentage(k);
                        return this.calcPercentage(p, tblr, parent);
                    }
                }
            }
            case 'top': {
                switch (k) {
                    case 'top': return 0;
                    case 'bottom': return parent.height - this.height;
                    case 'center': return this._round(parent.height / 2 - this.height / 2);
                    case 'calc': return parent.height - (this.bottom + this.height);
                    default: {
                        const num = Number(k);
                        if (!isNaN(num)) return num;
                        const p = Element.parsePercentage(k);
                        return this.calcPercentage(p, tblr, parent);
                    }
                }
            }
            case 'bottom': {
                switch (k) {
                    case 'top': return parent.height - this.height;
                    case 'bottom': return 0;
                    case 'center': return this._round(parent.height / 2 + this.height / 2);
                    case 'calc': return parent.height - (this.top + this.height);
                    default: {
                        const num = Number(k);
                        if (!isNaN(num)) return num;
                        const p = Element.parsePercentage(k);
                        return this.calcPercentage(p, tblr, parent);
                    }
                }
            }
        }
    }
}
