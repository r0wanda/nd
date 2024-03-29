import tc, { type ColorFormats } from 'tinycolor2';
import { deepEqual as assert } from "node:assert";

export function c(r: number, g: number, b: number): ColorFormats.RGB {
    return { r, g, b };
}

/**
 * Average colors to default to (no 256 colors because they are hard to track down, feel free to add support if you can)
 */
export const Color4Bit: Map<number, ColorFormats.RGB> = new Map([
    [ 30, c(0, 0, 0) ],
    [ 31, c(255, 0, 0) ],
    [ 32, c(0, 255, 0) ],
    [ 33, c(255, 255, 0) ],
    [ 34, c(0, 0, 255) ],
    [ 35, c(255, 0, 255) ],
    [ 36, c(0, 255, 255) ],
    [ 37, c(255, 255, 255) ],
    [ 90, c(128, 128, 128) ],
    [ 91, c(255, 0, 0) ],
    [ 92, c(0, 255, 0) ],
    [ 93, c(255, 255, 0) ],
    [ 94, c(0, 0, 255) ],
    [ 95, c(255, 0, 255) ],
    [ 96, c(0, 255, 255) ],
    [ 97, c(255, 255, 255) ]
]);

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
     * I feel it's safe to assume that all terminals used for this support color, as all semi-modern terminals support at least 4bit color (most/all of the time)
     * @param col The input color
     * @returns The escape code
     */
    parse(col: tc.ColorInput, bg: boolean = false) {
        if (col === 'default' || !tc(col).isValid()) return '';
        if (!(col instanceof tc)) col = tc(col);
        return this.depth < 24 ? `\x1b[${this.closest(col, bg)}m` : this.rgb(col.toRgb(), bg);
    }
    /**
     * Checks if instance has access to full 24bit color
     */
    fullColorSpace() {
        // not sure why it would be above 24 but ig it would work
        return this.depth >= 24;
    }
}
