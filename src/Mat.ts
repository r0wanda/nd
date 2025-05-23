/**
 * Matrix row
 */
export type Row_t = Array<string>;
/**
 * Raw matrix
 */
export type Mat_t = Array<Row_t>;

/**
 * A 2-dimensional character matrix (used to additively render elements to screen)
 * @remarks The origin is the top/left corner, not the center.
 * @remarks This is not marked as internal as users can directly access it in preprocessing stacks
 */
export default class Mat {
    /**
     * 
     */
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
        //if (this.x < 1 || this.y < 1) throw new Range('')
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
        if (y >= this.y || x >= this.x) throw new RangeError('Setting value: Coordinates out of range')
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
     * Duplicate this Mat
     * @returns A copy of this mat
     */
    duplicate() {
        const mat = new Mat(this.x, this.y, this.blnk);
        if (!structuredClone) throw new Error('structuredClone cannot be found, probably because of an outdated node.js version.');
        mat.m = structuredClone(this.m);
        return mat;
    }
    dupe = this.duplicate;

    // preprocessing functions
    // note: im not sure if the term preprocess is correct
    // there was originally going to be a stack of preprocessing functions done before render
    /**
     * Apply a processing function to a copy of the current mat
     * @param fn The processing function
     * @param args Any args to pass to the function
     * @returns The processed mat
     */
    preProcessRet(fn: (m: Mat, ...args: any[]) => Mat, ...args: any[]) {
        return fn(this.dupe(), ...args);
    }
    /**
     * Apply a processing function to the current mat
     * @param fn The processing function
     * @param args Any args to pass to the function
     */
    preProcess(fn: (m: Mat, ...args: any[]) => Mat, ...args: any[]) {
        Object.assign(this, fn(this.dupe(), ...args));
    }
    /**
     * Indiscriminately process pixels from a copy of the current mat
     * @param fn The processing function
     * @param bind Set the value of `this` in the function to the current mat (default true)
     * @param args Any args to pass to the function
     * @returns The processed mat
     */
    preProcessPixelsRet(fn: (px: string, ...args: any[]) => string, bind = true, ...args: any[]) {
        const mat = this.dupe();
        if (bind) fn = fn.bind(mat);
        for (let y = 0; y < mat.y; y++) {
            for (let x = 0; x < mat.x; x++) {
                mat.xy(x, y, fn(mat.m[y][x], ...args));
            }
        }
        return mat;
    }
    /**
     * Indiscriminately process pixels from the current mat
     * @remarks If any advanced preprocessing needs to be done, 
     * @param fn The processing function
     * @param bind Set the value of `this` in the function to the current mat (default true)
     * @param args Any args to pass to the function.
     */
    preProcessPixels(fn: (px: string, ...args: any[]) => string, bind = true, ...args: any[]) {
        Object.assign(this, this.preProcessPixelsRet(fn, bind, ...args));
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
        // trim off last newline
        buf = buf.slice(0, -1);
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
    pushRow(blnk = this.blnk, r?: Row_t) {
        if (r?.length ?? 0 > this.x) throw new RangeError('pushRow: Width of supplied row is larger then width of Mat');
        if (r) {
            if (r.length < this.x) r.fill(blnk, r.length, this.x);
            this.m.push(r);
        } else this.m.push(Array(this.x).fill(blnk));
        this.y++;
    }
    pushColumn(blnk = this.blnk, c?: Row_t) {
        if (c?.length ?? 0 > this.x) throw new RangeError('pushColumn: Height of supplied column is larger then height of Mat');
        for (let y = 0; y < this.y; y++) {
            this.m[y].push(c?.[y] ?? blnk);
        }
        this.x++;
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
