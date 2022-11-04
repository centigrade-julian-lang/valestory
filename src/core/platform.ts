import { ValestoryConfig } from "./config";
import { ValestoryApiExtensions } from "./extensions";

export const check = (value: any, negate: boolean) => ({
  equals: (b: any) => {
    return ValestoryConfig.get("isEqual")(value, b, negate);
  },
  hasBeenCalled: (times?: number) => {
    return ValestoryConfig.get("hasBeenCalled")(value, negate, times);
  },
});

export class Valestory {
  public static readonly config = ValestoryConfig;
  public static readonly extensions = ValestoryApiExtensions;
}
