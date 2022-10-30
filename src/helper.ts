import { Ref } from "./types";
import { createExtension } from "./utility";

export const log = (output?: Ref<any[]>) =>
  createExtension((value) => {
    const additionalOutput = output?.() ?? [];
    console.log(value, ...additionalOutput);
  });

export const the = <T>(ref: T): T => ref;
