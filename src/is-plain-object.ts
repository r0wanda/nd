/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Converted to ts by r0wanda
 * Released under the MIT License.
 */

function isObject(o: any): o is object {
    return Object.prototype.toString.call(o) === '[object Object]';
}

export function isPlainObject(o: any): boolean {
    if (isObject(o) === false) return false;

    // If has modified constructor
    const ctor = o.constructor;
    if (ctor === undefined) return true;

    // If has modified prototype
    const prot = ctor.prototype;
    if (isObject(prot) === false) return false;

    // If constructor does not have an Object-specific method
    // eslint-disable-next-line no-prototype-builtins
    if (prot.hasOwnProperty('isPrototypeOf') === false) return false;

    // Most likely a plain Object
    return true;
}
