/* eslint no-useless-escape: 0 */
import type { ColorFormats } from 'tinycolor2';

export function c(r: number, g: number, b: number): ColorFormats.RGB {
    return { r, g, b };
}

/**
 * Average colors to default to (no 256 colors because they are hard to track down)
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

export const Ansi = {
    cur: {
        show: '\e[?25h',
        hide: '\e[?25l',
    },
    scrn: {
        alt: {
            enter: '\e[?1049h',
            exit: '\e[?1049l'
        }
    }
}
