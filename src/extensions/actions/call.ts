import { createExtension } from "../../core/helper";
import { Fn, Ref } from "../../core/types";

export function call<T extends {}>(
  map: keyof T | ((input: T) => any),
  ...args: any[]
) {
  return createExtension((target: Ref<T>, { addTestStep }) => {
    addTestStep(() => {
      const resolved = target();
      const mapped =
        typeof map === "string" ? resolved[map] : (map as Fn)(resolved);
      const fn = mapped as Fn;

      fn.call(resolved, ...args);
    });
  });
}
