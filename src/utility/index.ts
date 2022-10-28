import { Extension, ExtensionFn, TestoryMarker } from "../types";

export const createExtension = <T>(actionFn: ExtensionFn<T>): Extension<T> =>
  Object.assign(actionFn, TestoryMarker);
