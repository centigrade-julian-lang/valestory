import { createExtension } from "../../core/helper";
import { check } from "../../core/platform";
import { Extension, Ref } from "../../core/types";

export interface NumberComparisonOpts {
  deviationTolerance?: number;
}
export interface ComparisonOpts extends NumberComparisonOpts {}

export function equal<T extends number, I extends T = T>(
  expected: I,
  opts?: NumberComparisonOpts
): Extension<T>;
export function equal<T extends any, I extends T = T>(
  expected: I
): Extension<T>;
export function equal<T, I extends T = T>(
  expected: I,
  opts: ComparisonOpts = { deviationTolerance: 0 }
) {
  return createExtension((actual: Ref<T>, { addTestStep, negateAssertion }) => {
    addTestStep(() => check(actual(), negateAssertion, opts).equals(expected));
  });
}
