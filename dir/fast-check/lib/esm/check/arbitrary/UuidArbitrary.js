import { integer, nat } from './IntegerArbitrary.js';
import { tuple } from './TupleArbitrary.js';
const padEight = (arb) => arb.map((n) => n.toString(16).padStart(8, '0'));
export function uuid() {
    const padded = padEight(nat(0xffffffff));
    const secondPadded = padEight(integer(0x10000000, 0x5fffffff));
    const thirdPadded = padEight(integer(0x80000000, 0xbfffffff));
    return tuple(padded, secondPadded, thirdPadded, padded).map((t) => {
        return `${t[0]}-${t[1].substring(4)}-${t[1].substring(0, 4)}-${t[2].substring(0, 4)}-${t[2].substring(4)}${t[3]}`;
    });
}
export function uuidV(versionNumber) {
    const padded = padEight(nat(0xffffffff));
    const secondPadded = padEight(nat(0x0fffffff));
    const thirdPadded = padEight(integer(0x80000000, 0xbfffffff));
    return tuple(padded, secondPadded, thirdPadded, padded).map((t) => {
        return `${t[0]}-${t[1].substring(4)}-${versionNumber}${t[1].substring(1, 4)}-${t[2].substring(0, 4)}-${t[2].substring(4)}${t[3]}`;
    });
}
