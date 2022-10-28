import { createExtension } from "./utility";

export const state = <TTarget extends {}>(stateDef: Partial<TTarget>) =>
  createExtension((target: TTarget) => {
    Object.entries(stateDef).forEach(([prop, value]) => {
      target[prop] = value;
    });
  });
