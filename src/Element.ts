import Node from './Node.js';

class Element extends Node {
    left: number;
    right: number;
    top: number;
    bottom: number;
    aleft: number;
    aright: number;
    atop: number;
    abottom: number;
    constructor() {
        super();
        this.left = this.right = this.top = this.bottom = 0;
        this.aleft = this.aright = this.atop = this.abottom = 0;
    }
}