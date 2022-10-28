import { createExtension } from "./utility";

export const state = <TTarget extends {}, TState extends TTarget>(
  stateDef: Partial<TState>
) =>
  createExtension((target: TTarget) => {
    Object.entries(stateDef).forEach(([prop, value]) => {
      target[prop] = value;
    });
  });
