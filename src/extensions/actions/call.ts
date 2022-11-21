import { createExtension } from "../../core/helper";
import { Ref } from "../../core/types";

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
