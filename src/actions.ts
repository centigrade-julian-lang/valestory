import { Ref } from "./types";
import { createExtension } from "./utility";

export const state = <TTarget extends {}, TState extends TTarget>(
  stateDef: Partial<TState>
) =>
  createExtension((target: Ref<TTarget>) => {
    Object.entries(stateDef).forEach(([prop, value]) => {
      target[prop] = value;
    });
  });
