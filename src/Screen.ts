import Node from './Node.js';
import ansi from 'ansi-escapes';
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

export default interface Screen extends Node {
    on(ev: 'resize', listen: (d: Dims) => void): this;
}

export default class Screen extends Node {
    opts: ScreenOptions;
    focused?: Node;
    width: number;
    height: number;
    cols: number;
    rows: number;
    #resizeTimer?: ReturnType<typeof setTimeout>;
    constructor(opts: Partial<ScreenOptions>) {
        super();

        this.type = 'screen';

        this.opts = {
            resizeTimeout: opts.resizeTimeout || 300,
            disableChecks: opts.disableChecks || false,
            interactive: opts.interactive || opts.disableChecks ? true : isIntr(),
            bitDepth: opts.bitDepth || opts.disableChecks ? 16 : process.stdout.getColorDepth(),
            hideCursor: opts.hideCursor || true,
            stdout: opts.stdout || process.stdout,
            fullScreen: opts.fullScreen || true,
        }

        // option checks
        if (!this.opts.interactive) throw new Error('Terminal is not interactive');
        this.opts.hideCursor && this.write(ansi.cursorHide);
        this.opts.fullScreen && this.write(ansi.enterAlternativeScreen);

        // stdout stuff
        this.width = this.cols = this.opts.stdout.columns;
        this.height = this.rows = this.opts.stdout.rows;
        this.opts.stdout.on('resize', () => {
            clearTimeout(this.#resizeTimer); // does nothing if undefined
            this.#resizeTimer = setTimeout(() => {
                const d: Dims = <Dims>{};
                d.width = d.cols = d.columns = 0;
                d.height = d.rows = 0;
                this.emit('resize', d);
                this.#handleResize();
            }, this.opts.resizeTimeout);
        });
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
    #handleResize() {
        //TODO
    }
}
