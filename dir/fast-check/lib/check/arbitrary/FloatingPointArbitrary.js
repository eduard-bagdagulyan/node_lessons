"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.double = exports.float = void 0;
const DoubleNextArbitrary_1 = require("./DoubleNextArbitrary");
const FloatNextArbitrary_1 = require("./FloatNextArbitrary");
const IntegerArbitrary_1 = require("./IntegerArbitrary");
const TupleArbitrary_1 = require("./TupleArbitrary");
function next(n) {
    return IntegerArbitrary_1.integer(0, (1 << n) - 1);
}
const floatInternal = () => {
    return next(24).map((v) => v / (1 << 24));
};
function float(...args) {
    if (typeof args[0] === 'object') {
        if (args[0].next) {
            return FloatNextArbitrary_1.floatNext(args[0]);
        }
        const min = args[0].min !== undefined ? args[0].min : 0;
        const max = args[0].max !== undefined ? args[0].max : 1;
        return (floatInternal()
            .map((v) => min + v * (max - min))
            .filter((g) => g !== max || g === min));
    }
    else {
        const a = args[0];
        const b = args[1];
        if (a === undefined)
            return floatInternal();
        if (b === undefined)
            return (floatInternal()
                .map((v) => v * a)
                .filter((g) => g !== a || g === 0));
        return (floatInternal()
            .map((v) => a + v * (b - a))
            .filter((g) => g !== b || g === a));
    }
}
exports.float = float;
const doubleFactor = Math.pow(2, 27);
const doubleDivisor = Math.pow(2, -53);
const doubleInternal = () => {
    return TupleArbitrary_1.tuple(next(26), next(27)).map((v) => (v[0] * doubleFactor + v[1]) * doubleDivisor);
};
function double(...args) {
    if (typeof args[0] === 'object') {
        if (args[0].next) {
            return DoubleNextArbitrary_1.doubleNext(args[0]);
        }
        const min = args[0].min !== undefined ? args[0].min : 0;
        const max = args[0].max !== undefined ? args[0].max : 1;
        return (doubleInternal()
            .map((v) => min + v * (max - min))
            .filter((g) => g !== max || g === min));
    }
    else {
        const a = args[0];
        const b = args[1];
        if (a === undefined)
            return doubleInternal();
        if (b === undefined)
            return (doubleInternal()
                .map((v) => v * a)
                .filter((g) => g !== a || g === 0));
        return (doubleInternal()
            .map((v) => a + v * (b - a))
            .filter((g) => g !== b || g === a));
    }
}
exports.double = double;
