import { ArbitraryWithContextualShrink } from './definition/ArbitraryWithContextualShrink';
/**
 * Constraints to be applied on {@link integer}
 * @remarks Since 2.6.0
 * @public
 */
export interface IntegerConstraints {
    /**
     * Lower bound for the generated integers (included)
     * @defaultValue -0x80000000
     * @remarks Since 2.6.0
     */
    min?: number;
    /**
     * Upper bound for the generated integers (included)
     * @defaultValue 0x7fffffff
     * @remarks Since 2.6.0
     */
    max?: number;
}
/**
 * For integers between -2147483648 (included) and 2147483647 (included)
 * @remarks Since 0.0.1
 * @public
 */
declare function integer(): ArbitraryWithContextualShrink<number>;
/**
 * For integers between -2147483648 (included) and max (included)
 *
 * @param max - Upper bound for the generated integers (eg.: 2147483647, Number.MAX_SAFE_INTEGER)
 *
 * @deprecated
 * Superceded by `fc.integer({max})` - see {@link https://github.com/dubzzz/fast-check/issues/992 | #992}.
 * Ease the migration with {@link https://github.com/dubzzz/fast-check/tree/main/codemods/unify-signatures | our codemod script}.
 *
 * @remarks Since 0.0.1
 * @public
 */
declare function integer(max: number): ArbitraryWithContextualShrink<number>;
/**
 * For integers between min (included) and max (included)
 *
 * @param min - Lower bound for the generated integers (eg.: 0, Number.MIN_SAFE_INTEGER)
 * @param max - Upper bound for the generated integers (eg.: 2147483647, Number.MAX_SAFE_INTEGER)
 *
 * @remarks You may prefer to use `fc.integer({min, max})` instead.
 * @remarks Since 0.0.1
 * @public
 */
declare function integer(min: number, max: number): ArbitraryWithContextualShrink<number>;
/**
 * For integers between min (included) and max (included)
 *
 * @param constraints - Constraints to apply when building instances
 *
 * @remarks Since 2.6.0
 * @public
 */
declare function integer(constraints: IntegerConstraints): ArbitraryWithContextualShrink<number>;
/**
 * For integers between Number.MIN_SAFE_INTEGER (included) and Number.MAX_SAFE_INTEGER (included)
 * @remarks Since 1.11.0
 * @public
 */
declare function maxSafeInteger(): ArbitraryWithContextualShrink<number>;
/**
 * Constraints to be applied on {@link nat}
 * @remarks Since 2.6.0
 * @public
 */
export interface NatConstraints {
    /**
     * Upper bound for the generated postive integers (included)
     * @defaultValue 0x7fffffff
     * @remarks Since 2.6.0
     */
    max?: number;
}
/**
 * For positive integers between 0 (included) and 2147483647 (included)
 * @remarks Since 0.0.1
 * @public
 */
declare function nat(): ArbitraryWithContextualShrink<number>;
/**
 * For positive integers between 0 (included) and max (included)
 *
 * @param max - Upper bound for the generated integers
 *
 * @remarks You may prefer to use `fc.nat({max})` instead.
 * @remarks Since 0.0.1
 * @public
 */
declare function nat(max: number): ArbitraryWithContextualShrink<number>;
/**
 * For positive integers between 0 (included) and max (included)
 *
 * @param constraints - Constraints to apply when building instances
 *
 * @remarks Since 2.6.0
 * @public
 */
declare function nat(constraints: NatConstraints): ArbitraryWithContextualShrink<number>;
/**
 * For positive integers between 0 (included) and Number.MAX_SAFE_INTEGER (included)
 * @remarks Since 1.11.0
 * @public
 */
declare function maxSafeNat(): ArbitraryWithContextualShrink<number>;
export { integer, nat, maxSafeInteger, maxSafeNat };
