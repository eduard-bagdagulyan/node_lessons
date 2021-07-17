"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncProperty = void 0;
const TupleArbitrary_1 = require("../arbitrary/TupleArbitrary");
const AsyncProperty_generic_1 = require("./AsyncProperty.generic");
function asyncProperty(...args) {
    if (args.length < 2)
        throw new Error('asyncProperty expects at least two parameters');
    const arbs = args.slice(0, args.length - 1);
    const p = args[args.length - 1];
    return new AsyncProperty_generic_1.AsyncProperty(TupleArbitrary_1.genericTuple(arbs), t => p(...t));
}
exports.asyncProperty = asyncProperty;