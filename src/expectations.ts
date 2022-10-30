import { check } from "./platform";
import { Props } from "./types";
import { createExtension } from "./utility";

export const haveState = <TTarget extends {}, TState extends TTarget>(
  stateDef: Partial<Props<TState>>
) =>
  createExtension((target: TTarget, { negateAssertion }) => {
    Object.entries(stateDef).forEach(([prop, value]) => {
      const actual = target[prop];
      const expected = value;

      check(actual, negateAssertion).equals(expected);
    });
  });
