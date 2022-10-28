import { TestoryConfig } from "./config";

export const check = (value: any) => ({
  equals: (b: any) => {
    return TestoryConfig.get("isEqual")(value, b);
  },
});
