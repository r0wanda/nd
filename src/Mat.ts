export type Row_t = Array<string>;
/**
 * Raw matrix
 */
export type Mat_t = Array<Row_t>;
/**
 * A 2-dimensional character matrix (used to additively render elements to screen)
 * @remarks The origin is the top/left corner, not the center.
 */
export default class Mat {
    m: Mat_t;
    x: number;
    y: number;
    blnk: string;
    constructor(x: number, y: number, blank: string = ' ') {
        this.x = x;
        this.y = y;
        this.m = [];
        this.blnk = blank;
        this.genMat();
    }
    /**
     * Genrate a 2-dimensional character matrix and write it to the `m` property on this instance
     * @param blank The string to fll the matrix with
     */
    genMat(blank: string = this.blnk) {
        this.m = [];
        for (let i = 0; i < this.y; i++) {
            this.m.push(Array(this.x).fill(blank));
        }
    }
    /**
     * Set a value on this matrix using x/y coordinates
     * @param x The x-coordinate
     * @param y The y-coordinate
     * @param val The value to set the character to
     */
    xy(x: number, y: number, val: string = this.blnk): void {
        this.m[y][x] = val;
    }
    /**
     * Set a "block" of charcters, basically setting x/y characters in bulk
     * @param _x The beginning x-coordinate
     * @param _y The beginning y-coordinate
     * @param width The width of the block
     * @param height The height of the block
     * @param val The value to set the character to
     */
    blk(_x: number, _y: number, width: number, height: number, val: string = this.blnk) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) this.xy(x + _x, y + _y, val);
        }
    }
    /**
     * Apply a processing function to the current mat (returns a copy)
     */
    preProcess(fn: (m: Mat) => Mat) {
        const mat = new Mat(this.x, this.y, this.blnk);
        mat.m = structuredClone(this.m);
        return fn(mat);
    }
    /**
     * Render the final screen
     * @returns The rendered string
     */
    render() {
        let buf = '';
        for (const row of this.m) {
            for (const ch of row) {
                buf += ch;
            }
            buf += '\n';
        }
        return buf;
    }
    /**
     * Overlay a mat onto this instance
     * @param _x Offset x
     * @param _y Offset y
     * @param m The mat
     * @param blnk The blank character
     */
    overlay(_x: number, _y: number, m: Mat, blnk = m.blnk) {
        if (m.x > this.x || m.y > this.y) throw new RangeError('Overlaying Mat: Overlay dimensions exceed base dimensions');
        for (let y = 0; y < m.y; y++) {
            for (let x = 0; x < m.x; x++) {
                if (m.m[y][x] !== blnk) this.xy(x + _x, y + _y, m.m[y][x]);
            }
        }
    }
    column(x: number) {
        if (x >= this.x) throw new RangeError('Generating Column: Requested column position is out of range');
        const c: Row_t = [];
        for (let y = 0; y < this.y; y++) {
            c.push(this.m[y][x]);
        }
        return c;
    }
    removeColumn(x: number) {
        if (x >= this.x) throw new RangeError('Removing Column: Requested column position is out of range');
        for (let y = 0; y < this.y; y++) {
            this.m[y].splice(x, 1);
        }
        this.x--;
    }
    shiftColumn() {
        const c = this.column(0);
        this.removeColumn(0);
        return c;
    }
    popColumn() {
        const c = this.column(this.x - 1);
        this.removeColumn(this.x - 1)
        return c;
    }
    createShrinkable(blnk = this.blnk) {
        return (r: Row_t) => r.reduce((p, c) => p ? c === blnk : p, true);
    }
    xShrink(blnk = this.blnk) {
        const isShrinkable = this.createShrinkable(blnk);
        for (let x = 0; x < this.x; x++) {
            if (isShrinkable(this.column(x))) {
                this.shiftColumn();
            } else break;
        }
        for (let x = this.x - 1; x > 0; x--) {
            if (isShrinkable(this.column(x))) {
                this.popColumn();
            } else break;
        }
    }
    yShrink(blnk = this.blnk) {
        const isShrinkable = this.createShrinkable(blnk);
        for (let y = 0; y < this.y; y++) {
            if (isShrinkable(this.m[y])) {
                this.m.shift();
                this.y--;
            } else break;
        }
        for (let y = this.y - 1; y > 0; y--) {
            if (isShrinkable(this.m[y])) {
                this.m.pop();
                this.y--;
            } else break;
        }
    }
    shrink(blnk = this.blnk) {
        this.xShrink(blnk);
        this.yShrink(blnk);
    }
}
