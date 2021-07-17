"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffledSubarray = exports.subarray = void 0;
const Stream_1 = require("../../stream/Stream");
const Arbitrary_1 = require("./definition/Arbitrary");
const BiasedArbitraryWrapper_1 = require("./definition/BiasedArbitraryWrapper");
const Shrinkable_1 = require("./definition/Shrinkable");
const IntegerArbitrary_1 = require("./IntegerArbitrary");
const LazyIterableIterator_1 = require("../../stream/LazyIterableIterator");
class SubarrayArbitrary extends Arbitrary_1.Arbitrary {
    constructor(originalArray, isOrdered, minLength, maxLength) {
        super();
        this.originalArray = originalArray;
        this.isOrdered = isOrdered;
        this.minLength = minLength;
        this.maxLength = maxLength;
        if (minLength < 0 || minLength > originalArray.length)
            throw new Error('fc.*{s|S}ubarrayOf expects the minimal length to be between 0 and the size of the original array');
        if (maxLength < 0 || maxLength > originalArray.length)
            throw new Error('fc.*{s|S}ubarrayOf expects the maximal length to be between 0 and the size of the original array');
        if (minLength > maxLength)
            throw new Error('fc.*{s|S}ubarrayOf expects the minimal length to be inferior or equal to the maximal length');
        this.lengthArb = IntegerArbitrary_1.integer(minLength, maxLength);
    }
    wrapper(items, itemsLengthContext) {
        return new Shrinkable_1.Shrinkable(items, () => this.shrinkImpl(items, itemsLengthContext).map((contextualValue) => this.wrapper(contextualValue[0], contextualValue[1])));
    }
    generate(mrng) {
        const remainingElements = this.originalArray.map((_v, idx) => idx);
        const size = this.lengthArb.generate(mrng).value;
        const ids = [];
        for (let idx = 0; idx !== size; ++idx) {
            const selectedIdIndex = mrng.nextInt(0, remainingElements.length - 1);
            ids.push(remainingElements[selectedIdIndex]);
            remainingElements.splice(selectedIdIndex, 1);
        }
        if (this.isOrdered)
            ids.sort((a, b) => a - b);
        return this.wrapper(ids.map((i) => this.originalArray[i]), undefined);
    }
    shrinkImpl(items, itemsLengthContext) {
        if (items.length === 0) {
            return Stream_1.Stream.nil();
        }
        return this.lengthArb
            .contextualShrink(items.length, itemsLengthContext)
            .map((contextualValue) => {
            return [
                items.slice(items.length - contextualValue[0]),
                contextualValue[1],
            ];
        })
            .join(items.length > this.minLength
            ? LazyIterableIterator_1.makeLazy(() => this.shrinkImpl(items.slice(1), undefined)
                .filter((contextualValue) => this.minLength <= contextualValue[0].length + 1)
                .map((contextualValue) => [[items[0]].concat(contextualValue[0]), undefined]))
            : Stream_1.Stream.nil());
    }
    withBias(freq) {
        return this.minLength !== this.maxLength
            ? BiasedArbitraryWrapper_1.biasWrapper(freq, this, (originalArbitrary) => {
                return new SubarrayArbitrary(originalArbitrary.originalArray, originalArbitrary.isOrdered, originalArbitrary.minLength, originalArbitrary.minLength +
                    Math.floor(Math.log(originalArbitrary.maxLength - originalArbitrary.minLength) / Math.log(2)));
            })
            : this;
    }
}
function subarray(originalArray, ...args) {
    if (typeof args[0] === 'number' && typeof args[1] === 'number') {
        return new SubarrayArbitrary(originalArray, true, args[0], args[1]);
    }
    const ct = args[0];
    const minLength = ct !== undefined && ct.minLength !== undefined ? ct.minLength : 0;
    const maxLength = ct !== undefined && ct.maxLength !== undefined ? ct.maxLength : originalArray.length;
    return new SubarrayArbitrary(originalArray, true, minLength, maxLength);
}
exports.subarray = subarray;
function shuffledSubarray(originalArray, ...args) {
    if (typeof args[0] === 'number' && typeof args[1] === 'number') {
        return new SubarrayArbitrary(originalArray, false, args[0], args[1]);
    }
    const ct = args[0];
    const minLength = ct !== undefined && ct.minLength !== undefined ? ct.minLength : 0;
    const maxLength = ct !== undefined && ct.maxLength !== undefined ? ct.maxLength : originalArray.length;
    return new SubarrayArbitrary(originalArray, false, minLength, maxLength);
}
exports.shuffledSubarray = shuffledSubarray;
