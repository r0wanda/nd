import { Color4Bit } from "./Constants.js";
import tc from 'tinycolor2';
import { deepEqual as assert } from "node:assert";

export default class Color {
    depth: number;
    /**
     * A map containing colors and values
     */
    colorMap: Map<number, tc.ColorFormats.RGB>;
    /**
     * Color system (internal)
     * @param bitDepth The color bit depth. Defaults to the STDOUT color depth
     * @param colorMap A map containing 4-bit color codes matched to rgb values. Used to find the closest color when support is limited
     */
    constructor(bitDepth: number = process.stdout.getColorDepth(), colorMap = Color4Bit) {
        this.depth = bitDepth;
        this.colorMap = colorMap;
    }
    /**
     * Get distance between 2 colors.
     * @see {@link https://en.wikipedia.org/wiki/Color_difference#sRGB}
     * @param param0 The first color (object with 3 numerical values, r, g, and b)
     * @param param1 The second color (same format as first)
     * @param sqrt Whethr or not to square root the output. Cases explained in the article above
     * @returns The distance between color 1 and 2 (float)
     */
    distance({ r: r1, g: g1, b: b1 }: tc.ColorFormats.RGB, { r: r2, g: g2, b: b2 }: tc.ColorFormats.RGB, sqrt: boolean = false) {
        const res = (r2 - r1) ** 2 + (g2 - g1) ** 2 + (b2 - b1) ** 2;
        return sqrt ? Math.sqrt(res) : res;
    }
    /**
     * Get a key from value in a map
     * @param map The map
     * @param val The value
     * @returns The key
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getByValue(map: Map<any, any>, val: any) {
        l: for (const [k, v] of map) {
            if (typeof v === 'object') {
                try {
                    assert(v, val);
                } catch { continue l; }
            } else if (v !== val) continue l;
            return k;
        }
    }
    /**
     * Get the closest color in a map of colors to the provided input color
     * @param col The color
     * @param bg Is background
     * @param map The color map. Defaults to the one provided in the constructor
     * @returns The color code to be used in an ansi escape
     */
    closest(col: tc.ColorInput, bg: boolean = false, map = this.colorMap) {
        const arr = [...map.values()];
        if (!(col instanceof tc)) col = tc(col);
        const rgb: tc.ColorFormats.RGB = col.toRgb();
        arr.sort((a, b) => {
            const dA = this.distance(rgb, a);
            const dB = this.distance(rgb, b);
            return dA > dB ? 1 : (dA === dB ? 0 : -1);
        });
        console.error(bg, arr);
        return this.getByValue(map, arr[0]) + (bg ? 10 : 0);
    }
    /**
     * Generate an ansi escape sequence from a RGB value
     * @param col The input color
     * @param bg Is background
     * @returns The generated escape
     */
    rgb(col: tc.ColorInput, bg: boolean = false) {
        if (!(col instanceof tc)) col = tc(col);
        const { r, g, b } = col.toRgb();
        return `\x1b[${bg ? 48 : 38};2;${r};${g};${b}m`
    }
    /**
     * Use data provided to generate an ansi escape sequence for the provided color, or the closest color if support is limited.
     * @param col The input color
     * @returns The escape code
     */
    parse(col: tc.ColorInput, bg: boolean = false) {
        if (col === 'default') return '';
        if (!(col instanceof tc)) col = tc(col);
        return this.depth < 24 ? `\x1b[${this.closest(col, bg)}m` : this.rgb(col.toRgb(), bg);
    }
}
