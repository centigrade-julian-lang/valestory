import { createExtension } from "../../core/helper";
import { Props, Ref } from "../../core/types";

export const state = <TTarget extends {}, TState extends TTarget = TTarget>(
  stateDef: Partial<Props<TState>>
) =>
  createExtension((target: Ref<TTarget>, { addTestStep }) => {
    addTestStep(() => {
      Object.entries(stateDef).forEach(([prop, value]) => {
        target()[prop] = value;
      });
    });
  });
