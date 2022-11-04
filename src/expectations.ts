import { ValestoryConfig } from "./config";
import { check } from "./platform";
import { Props, Ref } from "./types";
import { createExtension } from "./utility";

export const haveState = <TTarget extends {}, TState extends TTarget>(
  stateDef: Partial<Props<TState>>
) =>
  createExtension((target: Ref<TTarget>, { addTestStep, negateAssertion }) => {
    addTestStep(() => {
      Object.entries(stateDef).forEach(([prop, value]) => {
        const actual = target()[prop];
        const expected = value;

        check(actual, negateAssertion).equals(expected);
      });
    });
  });

export const equal = <T, I extends T = T>(expected: I) =>
  createExtension((actual: Ref<T>, { addTestStep, negateAssertion }) => {
    addTestStep(() => check(actual(), negateAssertion).equals(expected));
  });

export const haveCalled = <TTarget extends {}>(
  target: keyof TTarget,
  opts: { returnValue?: any; times?: number | null } = {}
) =>
  createExtension(
    (host: Ref<TTarget>, { setSpy, addTestStep, negateAssertion }) => {
      const spy = setSpy(host, target, opts?.returnValue);

      addTestStep(() => {
        const matcher = ValestoryConfig.get("hasBeenCalled");

        let times: number | undefined = 1;
        if (opts.times === null) times = undefined;
        else if (opts.times !== undefined) times = opts.times;

        matcher(spy, negateAssertion, times);
      });
    }
  );

export const haveThrown = (error?: string | RegExp | Error | any) =>
  createExtension((_, { wrapTestExecution, negateAssertion }) => {
    wrapTestExecution(async (testBody) => {
      const didThrow = ValestoryConfig.get("didThrow");

      await didThrow(testBody, negateAssertion, error);
    });
  });
