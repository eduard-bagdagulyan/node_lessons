import { array } from './ArrayArbitrary.js';
import { constantFrom } from './ConstantArbitrary.js';
import { constant } from './ConstantArbitrary.js';
import { buildAlphaNumericPercentArb } from './helpers/SpecificCharacterRange.js';
import { domain, hostUserInfo } from './HostArbitrary.js';
import { nat } from './IntegerArbitrary.js';
import { ipV4, ipV4Extended, ipV6 } from './IpArbitrary.js';
import { oneof } from './OneOfArbitrary.js';
import { option } from './OptionArbitrary.js';
import { stringOf } from './StringArbitrary.js';
import { tuple } from './TupleArbitrary.js';
export function webAuthority(constraints) {
    const c = constraints || {};
    const hostnameArbs = [domain()]
        .concat(c.withIPv4 === true ? [ipV4()] : [])
        .concat(c.withIPv6 === true ? [ipV6().map((ip) => `[${ip}]`)] : [])
        .concat(c.withIPv4Extended === true ? [ipV4Extended()] : []);
    return tuple(c.withUserInfo === true ? option(hostUserInfo()) : constant(null), oneof(...hostnameArbs), c.withPort === true ? option(nat(65535)) : constant(null)).map(([u, h, p]) => (u === null ? '' : `${u}@`) + h + (p === null ? '' : `:${p}`));
}
export function webSegment() {
    const others = ['-', '.', '_', '~', '!', '$', '&', "'", '(', ')', '*', '+', ',', ';', '=', ':', '@'];
    return stringOf(buildAlphaNumericPercentArb(others));
}
function uriQueryOrFragment() {
    const others = ['-', '.', '_', '~', '!', '$', '&', "'", '(', ')', '*', '+', ',', ';', '=', ':', '@', '/', '?'];
    return stringOf(buildAlphaNumericPercentArb(others));
}
export function webQueryParameters() {
    return uriQueryOrFragment();
}
export function webFragments() {
    return uriQueryOrFragment();
}
export function webUrl(constraints) {
    const c = constraints || {};
    const validSchemes = c.validSchemes || ['http', 'https'];
    const schemeArb = constantFrom(...validSchemes);
    const authorityArb = webAuthority(c.authoritySettings);
    const pathArb = array(webSegment()).map((p) => p.map((v) => `/${v}`).join(''));
    return tuple(schemeArb, authorityArb, pathArb, c.withQueryParameters === true ? option(webQueryParameters()) : constant(null), c.withFragments === true ? option(webFragments()) : constant(null)).map(([s, a, p, q, f]) => `${s}://${a}${p}${q === null ? '' : `?${q}`}${f === null ? '' : `#${f}`}`);
}
