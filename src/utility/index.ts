import { Extension, ExtensionFn } from "../types";

export const createExtension = <T>(actionFn: ExtensionFn<T>): Extension<T> =>
  Object.assign(actionFn, { __testoryType: "extension" } as const);
