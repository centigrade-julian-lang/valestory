import { createExtension } from "../../core/helper";
import { check } from "../../core/platform";

export type TypeOfIdentifier =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

// eslint-disable-next-line @typescript-eslint/ban-types
export const beInstanceOf = (type: {} | TypeOfIdentifier) =>
  createExtension((ref, { addTestStep, negateAssertion }) => {
    addTestStep(() => {
      const target = ref();

      if (typeof type === "string") {
        check(typeof target, negateAssertion).equals(type);
      } else {
        check(target, negateAssertion).beInstanceOf(type);
      }
    });
  });
