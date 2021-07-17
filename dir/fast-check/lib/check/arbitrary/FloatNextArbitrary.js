"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.floatNext = exports.indexToFloat = exports.floatToIndex = exports.decomposeFloat = exports.EPSILON_32 = exports.MAX_VALUE_32 = exports.MIN_VALUE_32 = void 0;
const IntegerArbitrary_1 = require("./IntegerArbitrary");
exports.MIN_VALUE_32 = 2 ** -126 * 2 ** -23;
exports.MAX_VALUE_32 = 2 ** 127 * (1 + (2 ** 23 - 1) / 2 ** 23);
exports.EPSILON_32 = 2 ** -23;
const INDEX_POSITIVE_INFINITY = 2139095040;
const INDEX_NEGATIVE_INFINITY = -2139095041;
function decomposeFloat(f) {
    const maxSignificand = 1 + (2 ** 23 - 1) / 2 ** 23;
    for (let exponent = -126; exponent !== 128; ++exponent) {
        const powExponent = 2 ** exponent;
        const maxForExponent = maxSignificand * powExponent;
        if (Math.abs(f) <= maxForExponent) {
            return { exponent, significand: f / powExponent };
        }
    }
    return { exponent: Number.NaN, significand: Number.NaN };
}
exports.decomposeFloat = decomposeFloat;
function indexInFloatFromDecomp(exponent, significand) {
    if (exponent === -126) {
        return significand * 0x800000;
    }
    return (exponent + 127) * 0x800000 + (significand - 1) * 0x800000;
}
function floatToIndex(f) {
    if (f === Number.POSITIVE_INFINITY) {
        return INDEX_POSITIVE_INFINITY;
    }
    if (f === Number.NEGATIVE_INFINITY) {
        return INDEX_NEGATIVE_INFINITY;
    }
    const decomp = decomposeFloat(f);
    const exponent = decomp.exponent;
    const significand = decomp.significand;
    if (Number.isNaN(exponent) || Number.isNaN(significand) || !Number.isInteger(significand * 0x800000)) {
        return Number.NaN;
    }
    if (f > 0 || (f === 0 && 1 / f === Number.POSITIVE_INFINITY)) {
        return indexInFloatFromDecomp(exponent, significand);
    }
    else {
        return -indexInFloatFromDecomp(exponent, -significand) - 1;
    }
}
exports.floatToIndex = floatToIndex;
function indexToFloat(index) {
    if (index < 0) {
        return -indexToFloat(-index - 1);
    }
    if (index === INDEX_POSITIVE_INFINITY) {
        return Number.POSITIVE_INFINITY;
    }
    if (index < 0x1000000) {
        return index * 2 ** -149;
    }
    const postIndex = index - 0x1000000;
    const exponent = -125 + (postIndex >> 23);
    const significand = 1 + (postIndex & 0x7fffff) / 0x800000;
    return significand * 2 ** exponent;
}
exports.indexToFloat = indexToFloat;
function safeFloatToIndex(f, constraintsLabel) {
    const conversionTrick = 'you can convert any double to a 32-bit float by using `new Float32Array([myDouble])[0]`';
    const errorMessage = 'fc.floatNext constraints.' + constraintsLabel + ' must be a 32-bit float - ' + conversionTrick;
    if (Number.isNaN(f) || (Number.isFinite(f) && (f < -exports.MAX_VALUE_32 || f > exports.MAX_VALUE_32))) {
        throw new Error(errorMessage);
    }
    const index = floatToIndex(f);
    if (!Number.isInteger(index)) {
        throw new Error(errorMessage);
    }
    return index;
}
function floatNext(constraints = {}) {
    const { noDefaultInfinity = false, noNaN = false, min = noDefaultInfinity ? -exports.MAX_VALUE_32 : Number.NEGATIVE_INFINITY, max = noDefaultInfinity ? exports.MAX_VALUE_32 : Number.POSITIVE_INFINITY, } = constraints;
    const minIndex = safeFloatToIndex(min, 'min');
    const maxIndex = safeFloatToIndex(max, 'max');
    if (minIndex > maxIndex) {
        throw new Error('fc.floatNext constraints.min must be smaller or equal to constraints.max');
    }
    if (noNaN) {
        return IntegerArbitrary_1.integer({ min: minIndex, max: maxIndex }).map(indexToFloat);
    }
    const minIndexWithNaN = maxIndex > 0 ? minIndex : minIndex - 1;
    const maxIndexWithNaN = maxIndex > 0 ? maxIndex + 1 : maxIndex;
    return IntegerArbitrary_1.integer({ min: minIndexWithNaN, max: maxIndexWithNaN }).map((index) => {
        if (index > maxIndex || index < minIndex)
            return Number.NaN;
        else
            return indexToFloat(index);
    });
}
exports.floatNext = floatNext;
