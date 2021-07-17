"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToConstant = void 0;
const IntegerArbitrary_1 = require("./IntegerArbitrary");
function computeNumChoices(options) {
    if (options.length === 0)
        throw new Error(`fc.mapToConstant expects at least one option`);
    let numChoices = 0;
    for (let idx = 0; idx !== options.length; ++idx) {
        if (options[idx].num < 0)
            throw new Error(`fc.mapToConstant expects all options to have a number of entries greater or equal to zero`);
        numChoices += options[idx].num;
    }
    if (numChoices === 0)
        throw new Error(`fc.mapToConstant expects at least one choice among options`);
    return numChoices;
}
function mapToConstant(...entries) {
    const numChoices = computeNumChoices(entries);
    return IntegerArbitrary_1.nat(numChoices - 1).map((choice) => {
        let idx = -1;
        let numSkips = 0;
        while (choice >= numSkips) {
            numSkips += entries[++idx].num;
        }
        return entries[idx].build(choice - numSkips + entries[idx].num);
    });
}
exports.mapToConstant = mapToConstant;
