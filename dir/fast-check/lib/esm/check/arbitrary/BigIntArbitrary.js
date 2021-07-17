import { Stream } from '../../stream/Stream.js';
import { ArbitraryWithContextualShrink } from './definition/ArbitraryWithContextualShrink.js';
import { biasWrapper } from './definition/BiasedArbitraryWrapper.js';
import { Shrinkable } from './definition/Shrinkable.js';
import { biasNumeric, bigIntLogLike } from './helpers/BiasNumeric.js';
import { shrinkBigInt } from './helpers/ShrinkBigInt.js';
class BigIntArbitrary extends ArbitraryWithContextualShrink {
    constructor(min, max, genMin, genMax) {
        super();
        this.min = min;
        this.max = max;
        this.genMin = genMin;
        this.genMax = genMax;
        this.biasedBigIntArbitrary = null;
    }
    wrapper(value, context) {
        return new Shrinkable(value, () => this.contextualShrink(value, context).map(([v, nextContext]) => this.wrapper(v, nextContext)));
    }
    generate(mrng) {
        return this.wrapper(mrng.nextBigInt(this.genMin, this.genMax), undefined);
    }
    contextualShrink(current, context) {
        if (current === BigInt(0)) {
            return Stream.nil();
        }
        if (!BigIntArbitrary.isValidContext(current, context)) {
            const target = this.defaultTarget();
            return shrinkBigInt(current, target, true);
        }
        if (this.isLastChanceTry(current, context)) {
            return Stream.of([context, undefined]);
        }
        return shrinkBigInt(current, context, false);
    }
    shrunkOnceContext() {
        return this.defaultTarget();
    }
    defaultTarget() {
        if (this.min <= 0 && this.max >= 0) {
            return BigInt(0);
        }
        return this.min < 0 ? this.max : this.min;
    }
    isLastChanceTry(current, context) {
        if (current > 0)
            return current === context + BigInt(1) && current > this.min;
        if (current < 0)
            return current === context - BigInt(1) && current < this.max;
        return false;
    }
    static isValidContext(current, context) {
        if (context === undefined) {
            return false;
        }
        if (typeof context !== 'bigint') {
            throw new Error(`Invalid context type passed to BigIntArbitrary (#1)`);
        }
        const differentSigns = (current > 0 && context < 0) || (current < 0 && context > 0);
        if (context !== BigInt(0) && differentSigns) {
            throw new Error(`Invalid context value passed to BigIntArbitrary (#2)`);
        }
        return true;
    }
    pureBiasedArbitrary() {
        if (this.biasedBigIntArbitrary != null) {
            return this.biasedBigIntArbitrary;
        }
        this.biasedBigIntArbitrary = biasNumeric(this.min, this.max, BigIntArbitrary, bigIntLogLike);
        return this.biasedBigIntArbitrary;
    }
    withBias(freq) {
        return biasWrapper(freq, this, (originalArbitrary) => originalArbitrary.pureBiasedArbitrary());
    }
}
function bigIntN(n) {
    const min = BigInt(-1) << BigInt(n - 1);
    const max = (BigInt(1) << BigInt(n - 1)) - BigInt(1);
    return new BigIntArbitrary(min, max, min, max);
}
function bigUintN(n) {
    const min = BigInt(0);
    const max = (BigInt(1) << BigInt(n)) - BigInt(1);
    return new BigIntArbitrary(min, max, min, max);
}
function buildCompleteBigIntConstraints(constraints) {
    const DefaultPow = 256;
    const DefaultMin = BigInt(-1) << BigInt(DefaultPow - 1);
    const DefaultMax = (BigInt(1) << BigInt(DefaultPow - 1)) - BigInt(1);
    const min = constraints.min;
    const max = constraints.max;
    return {
        min: min !== undefined ? min : DefaultMin - (max !== undefined && max < BigInt(0) ? max * max : BigInt(0)),
        max: max !== undefined ? max : DefaultMax + (min !== undefined && min > BigInt(0) ? min * min : BigInt(0)),
    };
}
function extractBigIntConstraints(args) {
    if (args[0] === undefined) {
        return {};
    }
    if (args[1] === undefined) {
        const constraints = args[0];
        return constraints;
    }
    return { min: args[0], max: args[1] };
}
function bigInt(...args) {
    const constraints = buildCompleteBigIntConstraints(extractBigIntConstraints(args));
    return new BigIntArbitrary(constraints.min, constraints.max, constraints.min, constraints.max);
}
function bigUint(constraints) {
    const max = constraints === undefined ? undefined : typeof constraints === 'object' ? constraints.max : constraints;
    return max === undefined ? bigUintN(256) : new BigIntArbitrary(BigInt(0), max, BigInt(0), max);
}
export { bigIntN, bigUintN, bigInt, bigUint };