import { genericTuple } from '../arbitrary/TupleArbitrary.js';
import { AsyncProperty } from './AsyncProperty.generic.js';
function asyncProperty(...args) {
    if (args.length < 2)
        throw new Error('asyncProperty expects at least two parameters');
    const arbs = args.slice(0, args.length - 1);
    const p = args[args.length - 1];
    return new AsyncProperty(genericTuple(arbs), t => p(...t));
}
export { asyncProperty };
