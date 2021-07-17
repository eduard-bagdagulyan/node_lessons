import { array } from './ArrayArbitrary.js';
import { buildAlphaNumericPercentArb, buildLowerAlphaArb, buildLowerAlphaNumericArb, } from './helpers/SpecificCharacterRange.js';
import { option } from './OptionArbitrary.js';
import { stringOf } from './StringArbitrary.js';
import { tuple } from './TupleArbitrary.js';
export function filterInvalidSubdomainLabel(subdomainLabel) {
    if (subdomainLabel.length > 63) {
        return false;
    }
    return (subdomainLabel.length < 4 ||
        subdomainLabel[0] !== 'x' ||
        subdomainLabel[1] !== 'n' ||
        subdomainLabel[2] !== '-' ||
        subdomainLabel[3] !== '-');
}
function subdomainLabel() {
    const alphaNumericArb = buildLowerAlphaNumericArb([]);
    const alphaNumericHyphenArb = buildLowerAlphaNumericArb(['-']);
    return tuple(alphaNumericArb, option(tuple(stringOf(alphaNumericHyphenArb, { maxLength: 61 }), alphaNumericArb)))
        .map(([f, d]) => (d === null ? f : `${f}${d[0]}${d[1]}`))
        .filter(filterInvalidSubdomainLabel);
}
export function domain() {
    const alphaNumericArb = buildLowerAlphaArb([]);
    const publicSuffixArb = stringOf(alphaNumericArb, { minLength: 2, maxLength: 10 });
    return (tuple(array(subdomainLabel(), { minLength: 1, maxLength: 5 }), publicSuffixArb)
        .map(([mid, ext]) => `${mid.join('.')}.${ext}`)
        .filter((d) => d.length <= 255));
}
export function hostUserInfo() {
    const others = ['-', '.', '_', '~', '!', '$', '&', "'", '(', ')', '*', '+', ',', ';', '=', ':'];
    return stringOf(buildAlphaNumericPercentArb(others));
}
