"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shrinkInteger = void 0;
const Stream_1 = require("../../../stream/Stream");
function halvePosInteger(n) {
    return Math.floor(n / 2);
}
function halveNegInteger(n) {
    return Math.ceil(n / 2);
}
function shrinkInteger(current, target, tryTargetAsap) {
    const realGap = current - target;
    function* shrinkDecr() {
        let previous = tryTargetAsap ? undefined : target;
        const gap = tryTargetAsap ? realGap : halvePosInteger(realGap);
        for (let toremove = gap; toremove > 0; toremove = halvePosInteger(toremove)) {
            const next = current - toremove;
            yield [next, previous];
            previous = next;
        }
    }
    function* shrinkIncr() {
        let previous = tryTargetAsap ? undefined : target;
        const gap = tryTargetAsap ? realGap : halveNegInteger(realGap);
        for (let toremove = gap; toremove < 0; toremove = halveNegInteger(toremove)) {
            const next = current - toremove;
            yield [next, previous];
            previous = next;
        }
    }
    return realGap > 0 ? Stream_1.stream(shrinkDecr()) : Stream_1.stream(shrinkIncr());
}
exports.shrinkInteger = shrinkInteger;