import { createExtension } from "../../core/helper";
import { check } from "../../core/platform";
import { Props, Ref } from "../../core/types";

export const haveState = <TTarget extends {}, TState extends TTarget>(
  stateDef: Partial<Props<TState>>
) =>
  createExtension((target: Ref<TTarget>, { addTestStep, negateAssertion }) => {
    addTestStep(() => {
      Object.entries(stateDef).forEach(([prop, value]) => {
        const actual = target()[prop];
        const expected = value;

        check(actual, negateAssertion).equals(expected);
      });
    });
  });
