import { createExtension } from "../../core/helper";
import { Fn, Ref } from "../../core/types";

export function call<T extends {}>(
  map: keyof T | ((input: T) => any),
  ...args: any[]
) {
  const caller = (awaitFn: boolean) =>
    createExtension((target: Ref<T>, { addTestStep }) => {
      addTestStep(() => {
        const resolved = target();
        const mapped =
          typeof map === "string" ? resolved[map] : (map as Fn)(resolved);
        const fn = mapped as Fn;

        if (awaitFn) return fn.call(resolved, ...args);
        // hint: fire and forget
        else fn.call(resolved, ...args);
      });
    });

  return Object.assign(caller(false), {
    andAwait: () => caller(true),
  });
}
