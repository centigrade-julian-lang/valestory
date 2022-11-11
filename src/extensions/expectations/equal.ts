import { createExtension } from "../../core/helper";
import { check } from "../../core/platform";
import { Ref } from "../../core/types";

export const equal = <T, I extends T = T>(expected: I) =>
  createExtension((actual: Ref<T>, { addTestStep, negateAssertion }) => {
    addTestStep(() => check(actual(), negateAssertion).equals(expected));
  });
