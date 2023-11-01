export type Row_t = Array<string>;
/**
 * Raw matrix
 */
export type Mat_t = Array<Row_t>;
/**
 * A 2-dimensional character matrix (used to additively render elements to screen)
 * @remarks The origin is the top/left corner, not the center.
 * @abstract
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
}
