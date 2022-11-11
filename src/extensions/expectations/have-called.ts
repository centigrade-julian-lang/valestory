import { ValestoryConfig } from "../../core/config";
import { createExtension } from "../../core/helper";
import { Ref } from "../../core/types";
import { CallAssertion } from "../types";

export const haveCalled = <TTarget extends {}>(
  target: keyof TTarget,
  opts: CallAssertion = {}
) =>
  createExtension(
    (host: Ref<TTarget>, { setSpy, addTestStep, negateAssertion }) => {
      const spy = setSpy(host, target, opts?.returnValue);

      addTestStep(() => {
        const matcher = ValestoryConfig.get("hasBeenCalled");

        let times: number | undefined = 1;
        if (opts.times === null) times = undefined;
        else if (opts.times !== undefined) times = opts.times;

        matcher(spy, negateAssertion, times, opts.withArgs);
      });
    }
  );
