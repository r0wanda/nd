import tc from "tinycolor2";
import glMatrix from "gl-matrix";
import bresenham from "bresenham";
import Color from "../Color.js";

// TODO: license statement
type CanvasSetUnset = (x: number, y: number) => void;
interface _canvas {
	set: CanvasSetUnset;
	unset: CanvasSetUnset;
}
export class Canvas implements _canvas {
	width: number;
	height: number;
	content: Buffer;
	colors: (tc.ColorInput | null)[];
	chars: (string | null)[];
	fontFg: tc.ColorInput;
	fontBg: tc.ColorInput;
	color: tc.ColorInput;
	colorInst: Color;
	static _map = [
		[0x1, 0x8],
		[0x2, 0x10],
		[0x4, 0x20],
		[0x40, 0x80],
	];
	constructor(width: number, height: number, color?: Color) {
		if (width % 2 != 0) {
			throw new Error("Width must be multiple of 2!");
		}

		if (height % 4 != 0) {
			throw new Error("Height must be multiple of 4!");
		}
		// init props
		this.width = width;
		this.height = height;
		this.content = Buffer.alloc((width * height) / 8);
		this.colors = new Array((width * height) / 8);
		this.chars = new Array((width * height) / 8);
		this.content.fill(0);
		this.fontFg = "default";
		this.fontBg = "default";
		this.color = "default";
		this.colorInst = color ?? new Color();
	}
	#xy(x: number, y: number) {
		const coord = this.getCoord(x, y);
		const mask = Canvas._map[y % 4][x % 2];
		return { coord, mask };
	}
	#check(x: number, y: number) {
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
	}
	getCoord(x: number, y: number) {
		x = Math.floor(x);
		y = Math.floor(y);
		const nx = Math.floor(x / 2);
		const ny = Math.floor(y / 4);
		const coord = nx + (this.width / 2) * ny;
		return coord;
	}
	set(x: number, y: number) {
		if (!this.#check(x, y)) return;
		const { coord, mask } = this.#xy(x, y);

		this.content[coord] |= mask;
		this.colors[coord] = this.color;
		this.chars[coord] = null;
	}
	unset(x: number, y: number) {
		if (!this.#check(x, y)) return;
		const { coord, mask } = this.#xy(x, y);

		this.content[coord] &= ~mask;
		this.colors[coord] = null;
		this.chars[coord] = null;
	}
	toggle(x: number, y: number) {
		if (!this.#check(x, y)) return;
		const { coord, mask } = this.#xy(x, y);

		this.content[coord] ^= mask;
		this.colors[coord] = null;
		this.chars[coord] = null;
	}
	clear() {
		this.content.fill(0);
	}
	measureText(str: string) {
		return { width: str.length * 2 + 2 };
	}
	writeText(str: string, x: number, y: number) {
		const coord = this.getCoord(x, y);
		for (let i = 0; i < str.length; i++) {
			this.chars[coord + i] = str[i];
		}
		this.chars[coord] = `${this.colorInst.parse(
			this.fontFg
		)}${this.colorInst.parse(this.fontBg, true)}${this.chars[coord]}`;
		this.chars[coord + str.length - 1] += "\x1b[39m\x1b[49m";
	}
	frame(delim?: string) {
		delim = delim || "\n";
		const result = [];
		for (let i = 0, j = 0; i < this.content.length; i++, j++) {
			if (j == this.width / 2) {
				result.push(delim);
				j = 0;
			}
			if (this.chars[i]) {
				result.push(this.chars[i]);
			} else if (this.content[i] == 0) {
				result.push(" ");
			} else {
				result.push(
					`${this.colors[i] === null ? "" : this.colorInst.parse(this.colors[i]!)
					}${String.fromCharCode(0x2800 + this.content[i])}\x1b[39m`
				);
			}
		}
		result.push(delim);
		return result.join("");
	}
}

/**
 * The following class `Context` has been modified from drawille-canvas-blessed-contrib, licensed under the MIT license
 * The source is available on NPM: https://www.npmjs.com/package/drawille-canvas-blessed-contrib
 * The source on NPM is also a modified version of other code, available on Github: https://github.com/madbence/node-drawille-canvas
 * Changes made: The code is mostly reused, just rearranged into a class format and made to work with the Color class of ND.
 */
export interface PathSeg {
	point: [number, number];
	stroke: boolean;
}
type context_t = {
	[key in typeof Context['methods'][number]]: (...args: any[]) => void;
}
export interface Context extends context_t { };
export class Context {
	_canvas: Canvas;
	canvas: Canvas;
	_matrix: glMatrix.mat2d;
	_stack: glMatrix.mat2d[];
	_currentPath: PathSeg[];
	colorInst: Color;
	lineWidth?: number;
	static readonly methods = <const>[
		"save",
		"restore",
		"scale",
		"rotate",
		"translate",
		"transform",
		"setTransform",
		"resetTransform",
		"createLinearGradient",
		"createRadialGradient",
		"createPattern",
		"clearRect",
		"fillRect",
		"strokeRect",
		"beginPath",
		"fill",
		"stroke",
		"drawFocusIfNeeded",
		"clip",
		"isPointInPath",
		"isPointInStroke",
		"fillText",
		"strokeText",
		"measureText",
		"drawImage",
		"createImageData",
		"getImageData",
		"putImageData",
		"getContextAttributes",
		"setLineDash",
		"getLineDash",
		"setAlpha",
		"setCompositeOperation",
		"setLineWidth",
		"setLineCap",
		"setLineJoin",
		"setMiterLimit",
		"clearShadow",
		"setStrokeColor",
		"setFillColor",
		"drawImageFromRect",
		"setShadow",
		"closePath",
		"moveTo",
		"lineTo",
		"quadraticCurveTo",
		"bezierCurveTo",
		"arcTo",
		"rect",
		"arc",
		"ellipse",
	]
	static init() {
		for (const name of Context.methods) {
			// @ts-ignore
			Context.prototype[name] = function () { };
		}
	}
	static mat2d = glMatrix.mat2d;
	static vec2 = glMatrix.vec2;
	constructor(width: number, height: number, canvasClass: typeof Canvas, color?: Color) {
		canvasClass = canvasClass || Canvas;

		this._canvas = new canvasClass(width, height);
		this.canvas = this._canvas; //compatability
		this._matrix = Context.mat2d.create();
		this._stack = [];
		this._currentPath = [];
		this.colorInst = color ?? new Color();
	}
	#getFgCode(color: tc.ColorInput) {
		return this.colorInst.parse(color);
	}
	#getBgCode(color: tc.ColorInput) {
		return this.colorInst.parse(color, true);
	}
	#br(p1: glMatrix.vec2, p2: glMatrix.vec2) {
		return bresenham(
			Math.floor(p1[0]),
			Math.floor(p1[1]),

			Math.floor(p2[0]),
			Math.floor(p2[1])
		);
	}
	#triangle(pa: glMatrix.vec2, pb: glMatrix.vec2, pc: glMatrix.vec2, f: CanvasSetUnset) {
		const a = this.#br(pb, pc);
		const b = this.#br(pa, pc);
		const c = this.#br(pa, pb);
		const s = a
			.concat(b)
			.concat(c)
			.sort(function (a, b) {
				if (a.y == b.y) {
					return a.x - b.x;
				}
				return a.y - b.y;
			});
		for (let i = 0; i < s.length - 1; i++) {
			const cur = s[i];

			const nex = s[i + 1];

			if (cur.y == nex.y) {
				for (let j = cur.x; j <= nex.x; j++) {
					f(j, cur.y);
				}
			} else {
				f(cur.x, cur.y);
			}
		}
	}
	#quad(m: glMatrix.ReadonlyMat2d, x: number, y: number, w: number, h: number, f: CanvasSetUnset) {
		const p1 = Context.vec2.transformMat2d(Context.vec2.create(), Context.vec2.fromValues(x, y), m);
		const p2 = Context.vec2.transformMat2d(Context.vec2.create(), Context.vec2.fromValues(x + w, y), m);
		const p3 = Context.vec2.transformMat2d(Context.vec2.create(), Context.vec2.fromValues(x, y + h), m);
		const p4 = Context.vec2.transformMat2d(Context.vec2.create(), Context.vec2.fromValues(x + w, y + h), m);
		this.#triangle(p1, p2, p3, f);
		this.#triangle(p3, p2, p4, f);
	}
	set fillStyle(val: tc.ColorInput) {
		this._canvas.fontFg = val;
	}
	set strokeStyle(val: tc.ColorInput) {
		this._canvas.color = val;
	}
	clearRect(x: number, y: number, w: number, h: number) {
		this.#quad(this._matrix, x, y, w, h, this._canvas.unset.bind(this._canvas));
	}
	fillRect(x: number, y: number, w: number, h: number) {
		this.#quad(this._matrix, x, y, w, h, this._canvas.set.bind(this._canvas));
	}
	save() {
		// @ts-ignore
		this._stack.push(Context.mat2d.clone(Context.mat2d.create(), this._matrix));
	}
	restore() {
		const top = this._stack.pop();
		if (top) this._matrix = top;
	}
	translate(x: number, y: number) {
		Context.mat2d.translate(this._matrix, this._matrix, Context.vec2.fromValues(x, y));
	}
	rotate(a: number) {
		Context.mat2d.rotate(this._matrix, this._matrix, (a / 180) * Math.PI);
	}
	scale(x: number, y: number) {
		Context.mat2d.scale(this._matrix, this._matrix, Context.vec2.fromValues(x, y));
	}
	beginPath() {
		this._currentPath = [];
	}
	stroke() {
		if (this.lineWidth == 0) return;
		const set = this._canvas.set.bind(this._canvas);

		for (let i = 0; i < this._currentPath.length - 1; i++) {
			const cur = this._currentPath[i];

			const nex = this._currentPath[i + 1];
		
			if (nex.stroke) {
				bresenham(cur.point[0], cur.point[1], nex.point[0], nex.point[1], set);
			}
		}
	}
	#addPoint(x: number, y: number, s: boolean) {
		const v = Context.vec2.transformMat2d(Context.vec2.create(), Context.vec2.fromValues(x, y), this._matrix);
		this._currentPath.push({
			point: [Math.floor(v[0]), Math.floor(v[1])],
			stroke: s,
		});
	}
	moveTo(x: number, y: number) {
		this.#addPoint(x, y, false);
	}
	lineTo(x: number, y: number) {
		this.#addPoint(x, y, true);
	}
	fillText(str: string, x: number, y: number) {
		const v = Context.vec2.transformMat2d(
			Context.vec2.create(),
			Context.vec2.fromValues(x, y),
			this._matrix
		);
	
		this._canvas.writeText(str, Math.floor(v[0]), Math.floor(v[1]));
	}
	measureText(str: string) {
		return this._canvas.measureText(str);
	}
}
Context.init();

export function CanvasCtx(this: { getContext: () => Context }, width: number, height: number, canvasClass: typeof Canvas) {
	let ctx:  undefined | Context = undefined;
	this.getContext = function () {
		if (!ctx) ctx = new Context(width, height, canvasClass);
		return ctx;
	};
};