import { Ref } from "./types";
import { createExtension } from "./utility";

export const log = (output?: Ref<any[]>) =>
  createExtension((value) => {
    const additionalOutput = output?.() ?? [];
    console.log(value, ...additionalOutput);
  });

export function the<T, K extends keyof T>(value: T): () => T;
export function the<T, K extends keyof T>(value: T, access: K): () => T[K];
export function the<T, K extends keyof T>(
  value: T,
  access?: K
): () => T | T[K] {
  return () => (access ? value[access] : value);
}
