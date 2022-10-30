import { ValestoryConfig } from "./config";

export const check = (value: any, negate: boolean) => ({
  equals: (b: any) => {
    return ValestoryConfig.get("isEqual")(value, b, negate);
  },
});
