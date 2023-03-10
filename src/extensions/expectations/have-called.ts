import { ValestoryConfig } from "../../core/config";
import { createExtension } from "../../core/helper";
import { Ref } from "../../core/types";
import { CallAssertion } from "../types";

const EMPTY_VALUE = Symbol("Value.Empty");

// eslint-disable-next-line @typescript-eslint/ban-types
export const haveCalled = <TTarget extends {}>(
  target: keyof TTarget | object,
  opts: CallAssertion = {}
) =>
  createExtension(
    (host: Ref<TTarget>, { setSpy, addTestStep, negateAssertion }) => {
      const isPropertyName = typeof target === "string";

      // hint: the user may also pass in their own spy instance to use as "target"-param,
      // if so, the user must install their spies themselves
      let spy = target;

      /** If possible resets the spied value to its original value before spying. */
      let tryRestoreOriginal = () => {
        // noop unless given target is a property name
      };

      if (isPropertyName) {
        // safe access as we don't know if the host will be able to be found.
        const original = host()?.[target] ?? EMPTY_VALUE;

        tryRestoreOriginal = () => {
          const resolvedHost = host();
          if (resolvedHost != null && original !== EMPTY_VALUE) {
            resolvedHost[target] = original;
          }
        };

        spy = setSpy(host, target, opts?.returnValue);
      }

      addTestStep(() => {
        const checkHasBeenCalled = ValestoryConfig.get("hasBeenCalled");

        let times: number | undefined = 1;
        if (opts.times === null) times = undefined;
        else if (opts.times !== undefined) times = opts.times;

        // hint: right before checking if the spy was called, we can actually uninstall it
        // as no more calls to it are expected by now. Also the assertion could throw, which is
        // why we want to make sure the spy is uninstalled before any errors could interrupt
        // the code execution flow
        tryRestoreOriginal();

        checkHasBeenCalled(spy, negateAssertion, times, opts.withArgs);
      });
    }
  );
