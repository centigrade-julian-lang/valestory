import { createExtension } from "../core/helper";
import { Props, Ref } from "../core/types";

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

export function call<T extends {}>(
  map: keyof T | ((input: T) => any),
  ...args: any[]
) {
  return createExtension((target: Ref<T>, { addTestStep }) => {
    addTestStep(() => {
      const resolved = target();
      const mapped =
        typeof map === "string" ? resolved[map] : (map as Function)(resolved);
      const fn = mapped as Function;
      fn.call(resolved, ...args);
    });
  });
}
