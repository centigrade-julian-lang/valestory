import { Props, Ref } from "./types";
import { createExtension } from "./utility";

export const state = <TTarget extends {}>(stateDef: Partial<Props<TTarget>>) =>
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
