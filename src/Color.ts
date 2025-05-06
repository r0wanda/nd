/**
 * Color utilities
 * From nd (https://github.com/r0wanda/nd/blob/main/src/Color.ts)
 */

import tc, { type ColorFormats } from 'tinycolor2';

export function c(r: number, g: number, b: number): ColorFormats.RGB {
    return { r, g, b };
}

/**
 * A map of color codes
 * key: the color code for the value
 * value: the rgb values for the color code
 */
export type ColorMap = Map<number, ColorFormats.RGB>;
export interface ColorLookupMap {
    /**
     * Function to generate the escape code for a given key
     * @param key A key of the provided map
     * @param bg Use the bg variant of the escape code
     * @returns The escape code for the provided color (eg. '\x1b[30m' where `key` is 30 and `map` is 4 bit colors)
     */
    fn: (key: number, bg?: boolean) => string;
    /**
     * The color map
     */
    map: ColorMap;
}
function isColorLookupMap(m: any): m is ColorLookupMap {
    const mAs = <ColorLookupMap>m || {};
    return !!mAs['fn'] && !!mAs.map;
}

// i feel like xterm is a good baseline for these colors even if no one uses (or should use) xterm
/**
 * 4 bit colors (xterm rgb values)
 */
export const Color4Bit: ColorLookupMap = {
    fn: (key: number, bg?: boolean) => `\x1b[${key + (bg ? 10 : 0)}m`,
    map: new Map([
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
    ])
}

/**
 * 8 bit colors (xterm rgb values)
 */
export const Color8Bit: ColorLookupMap = {
    fn: (key: number, bg?: boolean) => `\x1b[${38 + (bg ? 10 : 0)};5;${key}m`,
    map: new Map([
        [ 0, c(0,0,0) ],
        [ 1, c(128,0,0) ],
        [ 2, c(0,128,0) ],
        [ 3, c(128,128,0) ],
        [ 4, c(0,0,128) ],
        [ 5, c(128,0,128) ],
        [ 6, c(0,128,128) ],
        [ 7, c(192,192,192) ],
        [ 8, c(128,128,128) ],
        [ 9, c(255,0,0) ],
        [ 10, c(0,255,0) ],
        [ 11, c(255,255,0) ],
        [ 12, c(0,0,255) ],
        [ 13, c(255,0,255) ],
        [ 14, c(0,255,255) ],
        [ 15, c(255,255,255) ],
        [ 16, c(0,0,0) ],
        [ 17, c(0,0,95) ],
        [ 18, c(0,0,135) ],
        [ 19, c(0,0,175) ],
        [ 20, c(0,0,215) ],
        [ 21, c(0,0,255) ],
        [ 22, c(0,95,0) ],
        [ 23, c(0,95,95) ],
        [ 24, c(0,95,135) ],
        [ 25, c(0,95,175) ],
        [ 26, c(0,95,215) ],
        [ 27, c(0,95,255) ],
        [ 28, c(0,135,0) ],
        [ 29, c(0,135,95) ],
        [ 30, c(0,135,135) ],
        [ 31, c(0,135,175) ],
        [ 32, c(0,135,215) ],
        [ 33, c(0,135,255) ],
        [ 34, c(0,175,0) ],
        [ 35, c(0,175,95) ],
        [ 36, c(0,175,135) ],
        [ 37, c(0,175,175) ],
        [ 38, c(0,175,215) ],
        [ 39, c(0,175,255) ],
        [ 40, c(0,215,0) ],
        [ 41, c(0,215,95) ],
        [ 42, c(0,215,135) ],
        [ 43, c(0,215,175) ],
        [ 44, c(0,215,215) ],
        [ 45, c(0,215,255) ],
        [ 46, c(0,255,0) ],
        [ 47, c(0,255,95) ],
        [ 48, c(0,255,135) ],
        [ 49, c(0,255,175) ],
        [ 50, c(0,255,215) ],
        [ 51, c(0,255,255) ],
        [ 52, c(95,0,0) ],
        [ 53, c(95,0,95) ],
        [ 54, c(95,0,135) ],
        [ 55, c(95,0,175) ],
        [ 56, c(95,0,215) ],
        [ 57, c(95,0,255) ],
        [ 58, c(95,95,0) ],
        [ 59, c(95,95,95) ],
        [ 60, c(95,95,135) ],
        [ 61, c(95,95,175) ],
        [ 62, c(95,95,215) ],
        [ 63, c(95,95,255) ],
        [ 64, c(95,135,0) ],
        [ 65, c(95,135,95) ],
        [ 66, c(95,135,135) ],
        [ 67, c(95,135,175) ],
        [ 68, c(95,135,215) ],
        [ 69, c(95,135,255) ],
        [ 70, c(95,175,0) ],
        [ 71, c(95,175,95) ],
        [ 72, c(95,175,135) ],
        [ 73, c(95,175,175) ],
        [ 74, c(95,175,215) ],
        [ 75, c(95,175,255) ],
        [ 76, c(95,215,0) ],
        [ 77, c(95,215,95) ],
        [ 78, c(95,215,135) ],
        [ 79, c(95,215,175) ],
        [ 80, c(95,215,215) ],
        [ 81, c(95,215,255) ],
        [ 82, c(95,255,0) ],
        [ 83, c(95,255,95) ],
        [ 84, c(95,255,135) ],
        [ 85, c(95,255,175) ],
        [ 86, c(95,255,215) ],
        [ 87, c(95,255,255) ],
        [ 88, c(135,0,0) ],
        [ 89, c(135,0,95) ],
        [ 90, c(135,0,135) ],
        [ 91, c(135,0,175) ],
        [ 92, c(135,0,215) ],
        [ 93, c(135,0,255) ],
        [ 94, c(135,95,0) ],
        [ 95, c(135,95,95) ],
        [ 96, c(135,95,135) ],
        [ 97, c(135,95,175) ],
        [ 98, c(135,95,215) ],
        [ 99, c(135,95,255) ],
        [ 100, c(135,135,0) ],
        [ 101, c(135,135,95) ],
        [ 102, c(135,135,135) ],
        [ 103, c(135,135,175) ],
        [ 104, c(135,135,215) ],
        [ 105, c(135,135,255) ],
        [ 106, c(135,175,0) ],
        [ 107, c(135,175,95) ],
        [ 108, c(135,175,135) ],
        [ 109, c(135,175,175) ],
        [ 110, c(135,175,215) ],
        [ 111, c(135,175,255) ],
        [ 112, c(135,215,0) ],
        [ 113, c(135,215,95) ],
        [ 114, c(135,215,135) ],
        [ 115, c(135,215,175) ],
        [ 116, c(135,215,215) ],
        [ 117, c(135,215,255) ],
        [ 118, c(135,255,0) ],
        [ 119, c(135,255,95) ],
        [ 120, c(135,255,135) ],
        [ 121, c(135,255,175) ],
        [ 122, c(135,255,215) ],
        [ 123, c(135,255,255) ],
        [ 124, c(175,0,0) ],
        [ 125, c(175,0,95) ],
        [ 126, c(175,0,135) ],
        [ 127, c(175,0,175) ],
        [ 128, c(175,0,215) ],
        [ 129, c(175,0,255) ],
        [ 130, c(175,95,0) ],
        [ 131, c(175,95,95) ],
        [ 132, c(175,95,135) ],
        [ 133, c(175,95,175) ],
        [ 134, c(175,95,215) ],
        [ 135, c(175,95,255) ],
        [ 136, c(175,135,0) ],
        [ 137, c(175,135,95) ],
        [ 138, c(175,135,135) ],
        [ 139, c(175,135,175) ],
        [ 140, c(175,135,215) ],
        [ 141, c(175,135,255) ],
        [ 142, c(175,175,0) ],
        [ 143, c(175,175,95) ],
        [ 144, c(175,175,135) ],
        [ 145, c(175,175,175) ],
        [ 146, c(175,175,215) ],
        [ 147, c(175,175,255) ],
        [ 148, c(175,215,0) ],
        [ 149, c(175,215,95) ],
        [ 150, c(175,215,135) ],
        [ 151, c(175,215,175) ],
        [ 152, c(175,215,215) ],
        [ 153, c(175,215,255) ],
        [ 154, c(175,255,0) ],
        [ 155, c(175,255,95) ],
        [ 156, c(175,255,135) ],
        [ 157, c(175,255,175) ],
        [ 158, c(175,255,215) ],
        [ 159, c(175,255,255) ],
        [ 160, c(215,0,0) ],
        [ 161, c(215,0,95) ],
        [ 162, c(215,0,135) ],
        [ 163, c(215,0,175) ],
        [ 164, c(215,0,215) ],
        [ 165, c(215,0,255) ],
        [ 166, c(215,95,0) ],
        [ 167, c(215,95,95) ],
        [ 168, c(215,95,135) ],
        [ 169, c(215,95,175) ],
        [ 170, c(215,95,215) ],
        [ 171, c(215,95,255) ],
        [ 172, c(215,135,0) ],
        [ 173, c(215,135,95) ],
        [ 174, c(215,135,135) ],
        [ 175, c(215,135,175) ],
        [ 176, c(215,135,215) ],
        [ 177, c(215,135,255) ],
        [ 178, c(215,175,0) ],
        [ 179, c(215,175,95) ],
        [ 180, c(215,175,135) ],
        [ 181, c(215,175,175) ],
        [ 182, c(215,175,215) ],
        [ 183, c(215,175,255) ],
        [ 184, c(215,215,0) ],
        [ 185, c(215,215,95) ],
        [ 186, c(215,215,135) ],
        [ 187, c(215,215,175) ],
        [ 188, c(215,215,215) ],
        [ 189, c(215,215,255) ],
        [ 190, c(215,255,0) ],
        [ 191, c(215,255,95) ],
        [ 192, c(215,255,135) ],
        [ 193, c(215,255,175) ],
        [ 194, c(215,255,215) ],
        [ 195, c(215,255,255) ],
        [ 196, c(255,0,0) ],
        [ 197, c(255,0,95) ],
        [ 198, c(255,0,135) ],
        [ 199, c(255,0,175) ],
        [ 200, c(255,0,215) ],
        [ 201, c(255,0,255) ],
        [ 202, c(255,95,0) ],
        [ 203, c(255,95,95) ],
        [ 204, c(255,95,135) ],
        [ 205, c(255,95,175) ],
        [ 206, c(255,95,215) ],
        [ 207, c(255,95,255) ],
        [ 208, c(255,135,0) ],
        [ 209, c(255,135,95) ],
        [ 210, c(255,135,135) ],
        [ 211, c(255,135,175) ],
        [ 212, c(255,135,215) ],
        [ 213, c(255,135,255) ],
        [ 214, c(255,175,0) ],
        [ 215, c(255,175,95) ],
        [ 216, c(255,175,135) ],
        [ 217, c(255,175,175) ],
        [ 218, c(255,175,215) ],
        [ 219, c(255,175,255) ],
        [ 220, c(255,215,0) ],
        [ 221, c(255,215,95) ],
        [ 222, c(255,215,135) ],
        [ 223, c(255,215,175) ],
        [ 224, c(255,215,215) ],
        [ 225, c(255,215,255) ],
        [ 226, c(255,255,0) ],
        [ 227, c(255,255,95) ],
        [ 228, c(255,255,135) ],
        [ 229, c(255,255,175) ],
        [ 230, c(255,255,215) ],
        [ 231, c(255,255,255) ],
        [ 232, c(8,8,8) ],
        [ 233, c(18,18,18) ],
        [ 234, c(28,28,28) ],
        [ 235, c(38,38,38) ],
        [ 236, c(48,48,48) ],
        [ 237, c(58,58,58) ],
        [ 238, c(68,68,68) ],
        [ 239, c(78,78,78) ],
        [ 240, c(88,88,88) ],
        [ 241, c(98,98,98) ],
        [ 242, c(108,108,108) ],
        [ 243, c(118,118,118) ],
        [ 244, c(128,128,128) ],
        [ 245, c(138,138,138) ],
        [ 246, c(148,148,148) ],
        [ 247, c(158,158,158) ],
        [ 248, c(168,168,168) ],
        [ 249, c(178,178,178) ],
        [ 250, c(188,188,188) ],
        [ 251, c(198,198,198) ],
        [ 252, c(208,208,208) ],
        [ 253, c(218,218,218) ],
        [ 254, c(228,228,228) ],
        [ 255, c(238,238,238) ]
    ])
}

/**
 * Color lookup methods
 * key: number of bits (bit depth)
 * value: either a map of 
 */
export type ColorLookups = Map<number, ColorLookupMap | ((rgb: ColorFormats.RGB, bg?: boolean) => string)>;
/**
 * For initializing a ColorLookup map using new Map(iterable)
 * @example
 * new Map(<ColorLookupIterable>[
 *     [4, lookupMap4Bit]
 * ]);
 */
export type ColorLookupIterable = [number, (ColorLookupMap | ((rgb: ColorFormats.RGB, bg?: boolean) => string))][];

export default class Color {
    /**
     * Color bit depth
     */
    get depth() {
        return this._depth;
    }
    set depth(depth: number) {
        if (depth >= 24) depth = 24;
        else if (depth >= 8) depth = 8;
        else if (depth >= 4) depth = 4;
        else depth = 1;
        this._depth = depth;
    }
    _depth!: number;
    /**
     * A map containing colors and values
     */
    colorLookup: ColorLookups;
    /**
     * Color system (internal)
     * @param bitDepth The color bit depth. Defaults to the STDOUT color depth
     * @param colorMap A map containing 4-bit color codes matched to rgb values. Used to find the closest color when support is limited
     */
    constructor(bitDepth: number = process.stdout.getColorDepth(), colorLookup?: ColorLookups) {
        this.depth = bitDepth;
        this.colorLookup = colorLookup || new Map(<ColorLookupIterable>[
            [4, Color4Bit],
            [8, Color8Bit],
            [24, this.rgb]
        ]);
    }
    /**
     * Get distance between 2 colors.
     * @internal
     * @see {@link https://en.wikipedia.org/wiki/Color_difference#sRGB}
     * @param param0 The first color (object with 3 numerical values, r, g, and b)
     * @param param1 The second color (same format as first)
     * @param sqrt Whether or not to square root the output. Cases explained in the article above
     * @returns The distance between color 1 and 2 (float)
     */
    distance({ r: r1, g: g1, b: b1 }: tc.ColorFormats.RGB, { r: r2, g: g2, b: b2 }: tc.ColorFormats.RGB, sqrt = false) {
        const res = (r2 - r1) ** 2 + (g2 - g1) ** 2 + (b2 - b1) ** 2;
        return sqrt ? Math.sqrt(res) : res;
    }
    /**
     * Get the closest color in a map of colors to the provided input color
     * @internal
     * @param col The color
     * @param map The color map. Defaults to the one provided in the constructor
     * @returns The color code to be used in an ansi escape
     */
    closest(col: tc.ColorInput, map: ColorMap) {
        const arr = [...map.entries()];
        if (!(col instanceof tc)) col = tc(col);
        const rgb: tc.ColorFormats.RGB = col.toRgb();
        arr.sort((a, b) => {
            const dA = this.distance(rgb, a[1]);
            const dB = this.distance(rgb, b[1]);
            return dA > dB ? 1 : (dA === dB ? 0 : -1);
        });
        return arr[0][0];
    }
    /**
     * Generate an ansi escape sequence from a RGB value
     * @internal
     * @param col The input color
     * @param bg Is background
     * @returns The generated escape
     */
    rgb(col: tc.ColorInput, bg = false) {
        if (!(col instanceof tc)) col = tc(col);
        const { r, g, b } = col.toRgb();
        return `\x1b[${bg ? 48 : 38};2;${r};${g};${b}m`
    }
    /**
     * Use data provided to generate an ansi escape sequence for the provided color, or the closest color if support is limited.
     * Any half-decent terminal made within the past few decades should support some color.
     * @param col The input color
     * @returns The escape code
     */
    parse(col: tc.ColorInput, bg = false) {
        if (col === 'default' || !tc(col).isValid()) return '';
        if (!(col instanceof tc)) col = tc(col);
        const look = this.colorLookup.get(this.depth);
        if (!look) return '';
        if (isColorLookupMap(look)) {
            return look.fn(this.closest(col, look.map), bg);
        } else {
            return look(col.toRgb(), bg);
        }
    }
}
