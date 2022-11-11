import { ValestoryConfig } from "../../core/config";
import { createExtension } from "../../core/helper";

export const haveThrown = (error?: string | RegExp | Error | any) =>
  createExtension((_, { wrapTestExecution, negateAssertion }) => {
    wrapTestExecution(async (testBody) => {
      const didThrow = ValestoryConfig.get("didThrow");
      await didThrow(testBody, negateAssertion, error);
    });
  });
