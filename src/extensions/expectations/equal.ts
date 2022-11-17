import { createExtension } from "../../core/helper";
import { check } from "../../core/platform";
import { Extension, Ref } from "../../core/types";

export interface NumberComparisonOpts {
  deviationTolerance?: number;
}

// hint: there will be more options likely in future
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ComparisonOpts extends NumberComparisonOpts {}

export function equal<T, I extends T = T>(expected: I): Extension<T>;
export function equal<T extends number, I extends T = T>(
  expected: I,
  opts?: NumberComparisonOpts
): Extension<T>;
export function equal<T, I extends T = T>(expected: I, opts?: ComparisonOpts) {
  return createExtension((actual: Ref<T>, { addTestStep, negateAssertion }) => {
    addTestStep(() => check(actual(), negateAssertion, opts).equals(expected));
  });
}
