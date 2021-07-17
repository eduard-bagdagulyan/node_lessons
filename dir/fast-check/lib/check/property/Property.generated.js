"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.property = void 0;
const TupleArbitrary_1 = require("../arbitrary/TupleArbitrary");
const Property_generic_1 = require("./Property.generic");
function property(...args) {
    if (args.length < 2)
        throw new Error('property expects at least two parameters');
    const arbs = args.slice(0, args.length - 1);
    const p = args[args.length - 1];
    return new Property_generic_1.Property(TupleArbitrary_1.genericTuple(arbs), t => p(...t));
}
exports.property = property;