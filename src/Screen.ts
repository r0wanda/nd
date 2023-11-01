import Mat from './Mat.js';
import Node from './Node.js';
import Element from './Element.js';
import Color from './color/Color.js';
import ansi from 'ansi-escapes';
import tc from 'tinycolor2';
import process from 'node:process';
import isIntr from 'is-interactive';

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
    color: Color;
    constructor(opts: Partial<ScreenOptions> = {}) {
        super();

        this.type = 'screen';
        this.#clearCoords = this.#fillCoords = [];

        this.opts = {
            resizeTimeout: opts.resizeTimeout || 300,
            disableChecks: opts.disableChecks || false,
            interactive: opts.interactive || opts.disableChecks ? true : isIntr(),
            bitDepth: opts.bitDepth || opts.disableChecks ? 16 : process.stdout.getColorDepth(),
            hideCursor: opts.hideCursor || false, //change when done
            stdout: opts.stdout || process.stdout,
            fullScreen: opts.fullScreen || false, // this too
            dockBorders: opts.dockBorders || true,
            ignoreDockContrast: opts.ignoreDockContrast || false
        }

        // option checks
        if (!this.opts.interactive) throw new Error('Terminal is not interactive');
        this.opts.hideCursor && this.write(ansi.cursorHide);
        this.opts.fullScreen && this.write(ansi.enterAlternativeScreen);
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
    }
    constructDims(rows: number, cols: number) {
        const d: Dims = <Dims>{};
        d.width = d.cols = d.columns = cols;
        d.height = d.rows = rows;
        return d;
    }
    /**
     * Exit the screen
     * @param proc Whether or not to call process.exit. Default false
     */
    exit(proc = false): void {
        this.opts.hideCursor && this.write(ansi.cursorShow);
        this.opts.fullScreen && this.write(ansi.exitAlternativeScreen);
        proc && process.exit(0);
    }

    // rendering
    pruneNodes(arr: Array<Node> = this.children): Array<Element> {
        const a = arr as Array<Element>;
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
            m.blk(ch.aleft, ch.atop, width, height, `${fg}${bg}${ch.opts.ch}\x1b[0m`);
            m.overlay(ch.aleft, ch.atop, ch.contentMat.preProcess(m => {
                for (let y = 0; y < m.y; y++) {
                    for (let x = 0; x < m.x; x++) {
                        if (m.m[y][x] !== m.blnk) m.xy(x, y, `${fg + bg + m.m[y][x]}\x1b[0m`)
                    }
                }
                return m;
            }));
            for (const c of this.#clearCoords) {
                if (c.length !== 2) continue;
                m.xy(c[0], c[1]);
            }
            for (const c of this.#fillCoords) {
                if (c.length !== 4) continue;
                if (typeof c[0] && typeof c[1] === 'number') break;
            }
        }
        const rend = m.render();
        this.write(rend);
    }
    write(data: string | Uint8Array): void {
        this.opts.stdout.write(data);
    }
}
