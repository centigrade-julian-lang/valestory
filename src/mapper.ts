export const property =
  <T, K extends keyof T>(property: K) =>
  (instance: T): T[K] => {
    return instance[property];
  };
