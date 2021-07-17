import { genericTuple } from '../arbitrary/TupleArbitrary.js';
import { Property } from './Property.generic.js';
function property(...args) {
    if (args.length < 2)
        throw new Error('property expects at least two parameters');
    const arbs = args.slice(0, args.length - 1);
    const p = args[args.length - 1];
    return new Property(genericTuple(arbs), t => p(...t));
}
export { property };