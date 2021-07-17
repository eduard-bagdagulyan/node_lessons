import { fullUnicode } from '../CharacterArbitrary.js';
import { frequency } from '../FrequencyArbitrary.js';
import { mapToConstant } from '../MapToConstantArbitrary.js';
const lowerCaseMapper = { num: 26, build: (v) => String.fromCharCode(v + 0x61) };
const upperCaseMapper = { num: 26, build: (v) => String.fromCharCode(v + 0x41) };
const numericMapper = { num: 10, build: (v) => String.fromCharCode(v + 0x30) };
const percentCharArb = fullUnicode().map((c) => {
    const encoded = encodeURIComponent(c);
    return c !== encoded ? encoded : `%${c.charCodeAt(0).toString(16)}`;
});
export const buildLowerAlphaArb = (others) => mapToConstant(lowerCaseMapper, { num: others.length, build: (v) => others[v] });
export const buildLowerAlphaNumericArb = (others) => mapToConstant(lowerCaseMapper, numericMapper, { num: others.length, build: (v) => others[v] });
export const buildAlphaNumericArb = (others) => mapToConstant(lowerCaseMapper, upperCaseMapper, numericMapper, { num: others.length, build: (v) => others[v] });
export const buildAlphaNumericPercentArb = (others) => frequency({
    weight: 10,
    arbitrary: buildAlphaNumericArb(others),
}, {
    weight: 1,
    arbitrary: percentCharArb,
});
