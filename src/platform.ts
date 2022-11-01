import { ValestoryConfig } from "./config";
import { ValestoryExtensions } from "./extensions";

export const check = (value: any, negate: boolean) => ({
  equals: (b: any) => {
    return ValestoryConfig.get("isEqual")(value, b, negate);
  },
});

export class Valestory {
  public static readonly config = ValestoryConfig;
  public static readonly extensions = ValestoryExtensions;
}
