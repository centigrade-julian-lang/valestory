import { ValestoryConfig } from "./config";

export const check = (value: any) => ({
  equals: (b: any) => {
    return ValestoryConfig.get("isEqual")(value, b);
  },
});
