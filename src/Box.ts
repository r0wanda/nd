import Element, { type ElementOptions } from './Element.js';

export default class Box extends Element {
    constructor(opts: ElementOptions) {
        super(opts);
        this.type = 'box';
    }
}

