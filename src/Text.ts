import Element, { type ElementOptions } from './Element.js';

export default class Text extends Element {
    constructor(opts: ElementOptions) {
        opts = opts || {};
        opts.shrink = true;
        super(opts);
        this.type = 'text';
    }
} 

