import { createExtension } from "../../core/helper";
import { check } from "../../core/platform";
import { Ref } from "../../core/types";

export type NumberComparisonOperator = ">" | "<" | "=>" | "<=";

const comparerFns = {
  ">": (a: number, b: number) => a > b,
  ">=": (a: number, b: number) => a >= b,
  "<": (a: number, b: number) => a < b,
  "<=": (a: number, b: number) => a <= b,
};

export const beNumber = (
  comparer: NumberComparisonOperator,
  comparedNumber: number
) =>
  createExtension((target: Ref<number>, { addTestStep, negateAssertion }) => {
    addTestStep(() => {
      const compare = comparerFns[comparer];
      // TODO: use native compare functions from jest/jasmine passed in from user
      check(compare(target(), comparedNumber), negateAssertion).equals(true);
    });
  });
