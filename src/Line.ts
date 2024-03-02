import Element, { type ElementOptions, BorderOpts, Border_t, BorderArc, BorderDouble, BorderDash, BorderHeavy, BorderHeavyDash, Border } from './Element.js';

export interface LineOptions extends ElementOptions {
    orientation?: BorderOpts['orientation'];
    type?: BorderOpts['type'];
    lineType?: BorderOpts['lineType'];
}

export default class Line extends Element {
    constructor(opts: LineOptions) {
        opts.width = opts.width ?? opts.position?.width ?? 1;
        opts.height = opts.height ?? opts.position?.height ?? 1;
        if (!opts.style) opts.style = {};
        delete opts.style.border;
        opts.content = '';
        let bd: Border_t;
        switch (opts.lineType) {
            case 'arc': bd = BorderArc; break;
            case 'double': bd = BorderDouble; break;
            case 'dash': bd = BorderDash; break;
            case 'heavy': bd = BorderHeavy; break;
            case 'heavydash': bd = BorderHeavyDash; break;
            default: bd = Border;
        }
        super(opts);
        console.error(`line: ${this.height} full: ${this.screen?.height}`);
        const horiz = this.isHorizontal(opts.orientation ?? 'v');
        if (horiz) this.height = 1;
        else this.width = 1;
        this.opts.ch = horiz ? bd.row : bd.col;
    }
}
