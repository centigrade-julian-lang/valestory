import { ValestoryConfig } from "../../core/config";
import { createExtension } from "../../core/helper";
import { Ref } from "../../core/types";
import { CallAssertion } from "../types";

export const haveCalled = <TTarget extends {}>(
  target: keyof TTarget | object,
  opts: CallAssertion = {}
) =>
  createExtension(
    (host: Ref<TTarget>, { setSpy, addTestStep, negateAssertion }) => {
      const isPropertyName = typeof target === "string";

      const spy = isPropertyName
        ? setSpy(host, target, opts?.returnValue)
        : // hint: the user may also pass in their own spy instance to use,
          // if so, the user must install the spy themselves
          target;

      addTestStep(() => {
        const matcher = ValestoryConfig.get("hasBeenCalled");

        let times: number | undefined = 1;
        if (opts.times === null) times = undefined;
        else if (opts.times !== undefined) times = opts.times;

        matcher(spy, negateAssertion, times, opts.withArgs);
      });
    }
  );
