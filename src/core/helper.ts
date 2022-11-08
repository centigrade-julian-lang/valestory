import { when } from "./index";
import { Extension, ExtensionFn } from "./types";

export const createExtension = <T>(actionFn: ExtensionFn<T>): Extension<T> =>
  Object.assign(actionFn, { __valestoryType: "extension" } as const);

export const initially = when();

export const log = (output?: (value: any) => any) =>
  createExtension((value, { addTestStep }) => {
    addTestStep(() => {
      const resolved = value();
      const additionalOutput = output?.(resolved) ?? [];
      const valuesToPrint = Array.isArray(additionalOutput)
        ? additionalOutput
        : [];

      output ? console.log(...valuesToPrint) : console.log(resolved);
    });
  });

export function the<T, K extends keyof T>(value: T): () => T;
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
