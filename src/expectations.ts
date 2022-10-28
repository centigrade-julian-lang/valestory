import { TestoryConfig } from "./config";
import { Ref } from "./types";
import { createExtension } from "./utility";

export const haveState = <TTarget extends {}, TState extends TTarget>(
  stateDef: Partial<TState>
) =>
  createExtension((target: Ref<TTarget>) => {
    Object.entries(stateDef).forEach(([prop, value]) => {
      const actual = target[prop];
      const expected = value;
      const isEqual = TestoryConfig.get("isEqual");
      isEqual(actual, expected);
    });
  });
