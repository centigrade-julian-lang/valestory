import { when } from "./api";
import { Ref } from "./types";
import { createExtension } from "./utility";

export const initially = when(() => undefined).does();

export const log = (output?: Ref<any[]>) =>
  createExtension((value, { addTestStep }) => {
    addTestStep(() => {
      const additionalOutput = output?.() ?? [];
      output ? console.log(...additionalOutput) : console.log(value);
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
