import { ComparisonOpts } from "../extensions/expectations";
import { ValestoryConfig } from "./config";
import { ValestoryApiExtensions } from "./extensions";

export const check = (
  value: any,
  negate: boolean,
  opts: ComparisonOpts = {}
) => ({
  equals: (b: any) => {
    return ValestoryConfig.get("isEqual")(value, b, negate, opts);
  },
  hasBeenCalled: (times?: number) => {
    return ValestoryConfig.get("hasBeenCalled")(value, negate, times);
  },
  beInstanceOf: (b: any) => {
    return ValestoryConfig.get("beInstanceOf")(value, b, negate);
  },
});

export class Valestory {
  public static readonly config = ValestoryConfig;
  public static readonly extensions = ValestoryApiExtensions;
}
