import { maxLengthFromMinLength } from './ArrayArbitrary.js';
import { nat } from './IntegerArbitrary.js';
import { set } from './SetArbitrary.js';
import { tuple } from './TupleArbitrary.js';
function extractMaxIndex(indexesAndValues) {
    let maxIndex = -1;
    for (let index = 0; index !== indexesAndValues.length; ++index) {
        maxIndex = Math.max(maxIndex, indexesAndValues[index][0]);
    }
    return maxIndex;
}
function arrayFromItems(length, indexesAndValues) {
    const array = Array(length);
    for (let index = 0; index !== indexesAndValues.length; ++index) {
        const it = indexesAndValues[index];
        if (it[0] < length)
            array[it[0]] = it[1];
    }
    return array;
}
export function sparseArray(arb, constraints = {}) {
    const { minNumElements = 0, maxNumElements = maxLengthFromMinLength(minNumElements), maxLength = Math.min(maxLengthFromMinLength(maxNumElements), 4294967295), noTrailingHole, } = constraints;
    if (minNumElements > maxLength) {
        throw new Error(`The minimal number of non-hole elements cannot be higher than the maximal length of the array`);
    }
    if (minNumElements > maxNumElements) {
        throw new Error(`The minimal number of non-hole elements cannot be higher than the maximal number of non-holes`);
    }
    const resultedMaxNumElements = Math.min(maxNumElements, maxLength);
    if (noTrailingHole) {
        const maxIndexAuthorized = Math.max(maxLength - 1, 0);
        return set(tuple(nat(maxIndexAuthorized), arb), {
            minLength: minNumElements,
            maxLength: resultedMaxNumElements,
            compare: (itemA, itemB) => itemA[0] === itemB[0],
        }).map((items) => {
            const lastIndex = extractMaxIndex(items);
            return arrayFromItems(lastIndex + 1, items);
        });
    }
    return set(tuple(nat(maxLength), arb), {
        minLength: minNumElements + 1,
        maxLength: resultedMaxNumElements + 1,
        compare: (itemA, itemB) => itemA[0] === itemB[0],
    }).map((items) => {
        const length = extractMaxIndex(items);
        return arrayFromItems(length, items);
    });
}
