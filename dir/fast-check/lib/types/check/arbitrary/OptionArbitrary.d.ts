import { Arbitrary } from './definition/Arbitrary';
/**
 * Constraints to be applied on {@link option}
 * @remarks Since 2.2.0
 * @public
 */
export interface OptionConstraints<TNil = null> {
    /**
     * The probability to build a nil value is of `1 / freq`
     * @remarks Since 1.17.0
     */
    freq?: number;
    /**
     * The nil value (default would be null)
     * @remarks Since 1.17.0
     */
    nil?: TNil;
    /**
     * While going deeper and deeper within a recursive structure (see {@link letrec}),
     * this factor will be used to increase the probability to generate nil.
     *
     * Example of values: 0.1 (small impact as depth increases), 0.5, 1 (huge impact as depth increases).
     *
     * @remarks Since 2.14.0
     */
    depthFactor?: number;
    /**
     * Maximal authorized depth. Once this depth has been reached only nil will be used.
     *
     * @remarks Since 2.14.0
     */
    maxDepth?: number;
    /**
     * Depth identifier can be used to share the current depth between several instances.
     *
     * By default, if not specified, each instance of option will have its own depth.
     * In other words: you can have depth=1 in one while you have depth=100 in another one.
     *
     * @remarks Since 2.14.0
     */
    depthIdentifier?: string;
}
/**
 * For either null or a value coming from `arb`
 *
 * @param arb - Arbitrary that will be called to generate a non null value
 *
 * @remarks Since 0.0.6
 * @public
 */
declare function option<T>(arb: Arbitrary<T>): Arbitrary<T | null>;
/**
 * For either null or a value coming from `arb` with custom frequency
 *
 * @param arb - Arbitrary that will be called to generate a non null value
 * @param freq - The probability to build a null value is of `1 / freq`
 *
 * @deprecated
 * Superceded by `fc.option(arb, {freq})` - see {@link https://github.com/dubzzz/fast-check/issues/992 | #992}.
 * Ease the migration with {@link https://github.com/dubzzz/fast-check/tree/main/codemods/unify-signatures | our codemod script}.
 *
 * @remarks Since 0.0.6
 * @public
 */
declare function option<T>(arb: Arbitrary<T>, freq: number): Arbitrary<T | null>;
/**
 * For either nil or a value coming from `arb` with custom frequency
 *
 * @param arb - Arbitrary that will be called to generate a non nil value
 * @param constraints - Constraints on the option
 *
 * @remarks Since 1.17.0
 * @public
 */
declare function option<T, TNil = null>(arb: Arbitrary<T>, constraints: OptionConstraints<TNil>): Arbitrary<T | TNil>;
export { option };
