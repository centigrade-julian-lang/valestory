import { Props } from "./types";
import { createExtension } from "./utility";

export const state = <TTarget extends {}>(stateDef: Partial<Props<TTarget>>) =>
  createExtension((target: TTarget, { addTestStep }) => {
    addTestStep(() => {
      Object.entries(stateDef).forEach(([prop, value]) => {
        target[prop] = value;
      });
    });
  });

export function call<T extends {}>(
  map: keyof T | ((input: T) => any),
  ...args: any[]
) {
  return createExtension((target: T, { addTestStep }) => {
    addTestStep(() => {
      const mapped =
        typeof map === "string" ? target[map] : (map as Function)(target);
      const fn = mapped as Function;
      fn.call(target, ...args);
    });
  });
}
