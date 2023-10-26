import Node from './Node.js';
import ansi from 'ansi-escapes';
import process from 'node:process';
import isIntr from 'is-interactive';

export interface ScreenOptions {
    /**
     * Time (in milliseconds) to wait before updating screen contents after resize. Defaults to 300ms
     */
    resizeTimeout: number;
    /**
     * Disable terminal checks (eg. interactive, colors) (not reccomended). Default false
     */
    disableChecks: boolean;
    /**
     * Override inteactive-ness check (not reccomended). Default false
     */
    interactive: boolean;
    /**
     * Manually set terminal color depth (not reccomended). Defaults to the the terminal's color depth
     */
    bitDepth: number;
    /**
     * Whether or not to hide the cursor. Defaults to true
     */
    hideCursor: boolean;
    /**
     * Manually set stdout. Defaults to process.stdout
     */
    stdout: typeof process.stdout;
    /**
     * Whether or not to enter the alternative screen. Default true
     */
    fullScreen: boolean;
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
    constructor(opts: Partial<ScreenOptions> = {}) {
        super();

        this.type = 'screen';

        this.opts = {
            resizeTimeout: opts.resizeTimeout || 300,
            disableChecks: opts.disableChecks || false,
            interactive: opts.interactive || opts.disableChecks ? true : isIntr(),
            bitDepth: opts.bitDepth || opts.disableChecks ? 16 : process.stdout.getColorDepth(),
            hideCursor: opts.hideCursor || false, //change when done
            stdout: opts.stdout || process.stdout,
            fullScreen: opts.fullScreen || false, // this too
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
    write(data: string | Uint8Array): void {
        this.opts.stdout.write(data);
    }
}
