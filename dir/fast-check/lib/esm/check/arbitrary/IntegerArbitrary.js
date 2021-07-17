import { Stream } from '../../stream/Stream.js';
import { ArbitraryWithContextualShrink } from './definition/ArbitraryWithContextualShrink.js';
import { biasWrapper } from './definition/BiasedArbitraryWrapper.js';
import { Shrinkable } from './definition/Shrinkable.js';
import { biasNumeric, integerLogLike } from './helpers/BiasNumeric.js';
import { shrinkInteger } from './helpers/ShrinkInteger.js';
class IntegerArbitrary extends ArbitraryWithContextualShrink {
    constructor(min, max, genMin, genMax) {
        super();
        this.min = min;
        this.max = max;
        this.genMin = genMin;
        this.genMax = genMax;
        this.biasedIntegerArbitrary = null;
    }
    wrapper(value, context) {
        return new Shrinkable(value, () => this.contextualShrink(value, context).map(([v, nextContext]) => this.wrapper(v, nextContext)));
    }
    generate(mrng) {
        return this.wrapper(mrng.nextInt(this.genMin, this.genMax), undefined);
    }
    contextualShrink(current, context) {
        if (current === 0) {
            return Stream.nil();
        }
        if (!IntegerArbitrary.isValidContext(current, context)) {
            const target = this.defaultTarget();
            return shrinkInteger(current, target, true);
        }
        if (this.isLastChanceTry(current, context)) {
            return Stream.of([context, undefined]);
        }
        return shrinkInteger(current, context, false);
    }
    shrunkOnceContext() {
        return this.defaultTarget();
    }
    defaultTarget() {
        if (this.min <= 0 && this.max >= 0) {
            return 0;
        }
        return this.min < 0 ? this.max : this.min;
    }
    isLastChanceTry(current, context) {
        if (current > 0)
            return current === context + 1 && current > this.min;
        if (current < 0)
            return current === context - 1 && current < this.max;
        return false;
    }
    static isValidContext(current, context) {
        if (context === undefined) {
            return false;
        }
        if (typeof context !== 'number') {
            throw new Error(`Invalid context type passed to IntegerArbitrary (#1)`);
        }
        if (context !== 0 && Math.sign(current) !== Math.sign(context)) {
            throw new Error(`Invalid context value passed to IntegerArbitrary (#2)`);
        }
        return true;
    }
    pureBiasedArbitrary() {
        if (this.biasedIntegerArbitrary != null) {
            return this.biasedIntegerArbitrary;
        }
        this.biasedIntegerArbitrary = biasNumeric(this.min, this.max, IntegerArbitrary, integerLogLike);
        return this.biasedIntegerArbitrary;
    }
    withBias(freq) {
        return biasWrapper(freq, this, (originalArbitrary) => originalArbitrary.pureBiasedArbitrary());
    }
}
IntegerArbitrary.MIN_INT = 0x80000000 | 0;
IntegerArbitrary.MAX_INT = 0x7fffffff | 0;
function buildCompleteIntegerConstraints(constraints) {
    const min = constraints.min !== undefined ? constraints.min : IntegerArbitrary.MIN_INT;
    const max = constraints.max !== undefined ? constraints.max : IntegerArbitrary.MAX_INT;
    return { min, max };
}
function extractIntegerConstraints(args) {
    if (args[0] === undefined) {
        return {};
    }
    if (args[1] === undefined) {
        const sargs = args;
        if (typeof sargs[0] === 'number')
            return { max: sargs[0] };
        return sargs[0];
    }
    const sargs = args;
    return { min: sargs[0], max: sargs[1] };
}
function integer(...args) {
    const constraints = buildCompleteIntegerConstraints(extractIntegerConstraints(args));
    if (constraints.min > constraints.max) {
        throw new Error('fc.integer maximum value should be equal or greater than the minimum one');
    }
    return new IntegerArbitrary(constraints.min, constraints.max, constraints.min, constraints.max);
}
function maxSafeInteger() {
    return integer(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
}
function nat(arg) {
    const max = typeof arg === 'number' ? arg : arg && arg.max !== undefined ? arg.max : IntegerArbitrary.MAX_INT;
    if (max < 0) {
        throw new Error('fc.nat value should be greater than or equal to 0');
    }
    return new IntegerArbitrary(0, max, 0, max);
}
function maxSafeNat() {
    return nat(Number.MAX_SAFE_INTEGER);
}
export { integer, nat, maxSafeInteger, maxSafeNat };