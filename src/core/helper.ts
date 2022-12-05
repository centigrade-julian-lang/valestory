import { when } from "./index";
import { DebugMode, Extension, ExtensionFn, Ref } from "./types";

export const createExtension = <T>(actionFn: ExtensionFn<T>): Extension<T> =>
  Object.assign(actionFn, { __valestoryType: "extension" } as const);

export const initially = () => when();

export const log = (output?: DebugMode | ((value: any) => any)) =>
  createExtension((value: Ref<any>, { addTestStep, debug }) => {
    if (output === "spies") {
      return debug("spies");
    }

    addTestStep(() => {
      const resolved = value();

      if (typeof output === "function") {
        const additionalOutput = output?.(resolved) ?? [];
        const valuesToPrint = Array.isArray(additionalOutput)
          ? additionalOutput
          : [additionalOutput];

        output != null ? console.log(...valuesToPrint) : console.log(resolved);
      }
    });
  });

export function the<T>(value: T): () => T;
export function the<T, K extends keyof T>(value: T, access: K): () => T[K];
export function the<T, R>(value: T, access: (value: T) => R): () => R;
export function the<T, K extends keyof T, R>(
  value: T,
  access?: K | ((value: T) => R)
): () => T | T[K] | R {
  return () => {
    if (access == null) return value;
    else {
      return typeof access === "string" ? value[access] : value;
    }
  };
}
