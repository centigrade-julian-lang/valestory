import { call } from "../extensions/actions";
import { ValestoryConfig } from "./config";
import { Valestory } from "./platform";
import {
  CallStatement,
  Extension,
  Ref,
  SpyRequest,
  TargetActions,
  TestEnding,
  TestExtendingOrExpecter,
  TestState,
  WhenStatement,
} from "./types";

const createTestApi = <T = undefined>(
  baseState: TestState = { steps: [], spyRequests: [] },
  subject?: Ref<T>
) => {
  return (
    subjectOrExtensionOrTestState:
      | Ref<T>
      | TestState
      | Extension<undefined>
      | undefined,
    ...otherExtensions: Extension<undefined>[]
  ): TestExtendingOrExpecter<T | undefined> | TargetActions<T> => {
    if (isTestState(subjectOrExtensionOrTestState)) {
      return createActor(
        () => subject?.(),
        clone(subjectOrExtensionOrTestState)
      )();
    }

    if (
      isExtensionFn(subjectOrExtensionOrTestState) ||
      subjectOrExtensionOrTestState == null
    ) {
      const extensions = [
        subjectOrExtensionOrTestState,
        ...otherExtensions,
      ].filter((x): x is Extension<any> => x != null);
      return createActor(() => subject?.(), clone(baseState))(...extensions);
    }

    return withApiExtensions(
      {
        has: createActor(subjectOrExtensionOrTestState, clone(baseState)),
        does: createActor(subjectOrExtensionOrTestState, clone(baseState)),
        is: createActor(subjectOrExtensionOrTestState, clone(baseState)),
        calls: createCaller<T>(subjectOrExtensionOrTestState, clone(baseState)),
      },
      createExpectOrAndApi(clone(baseState), subjectOrExtensionOrTestState)
    );
  };
};

const createActor =
  <TSubject>(subject: Ref<TSubject>, testState: TestState) =>
  (...actions: Extension<TSubject>[]): TestExtendingOrExpecter<TSubject> => {
    addTestStep(testState, actions, subject);

    const extendOrExpectApi: TestExtendingOrExpecter<TSubject> =
      createExpectOrAndApi<TSubject>(testState, subject);

    return extendOrExpectApi;
  };

export const when = createTestApi() as WhenStatement<undefined>;

// ---------------------------------
// module internal code
// ---------------------------------
function createCaller<T>(
  subjectOrTestState: Ref<T>,
  baseState: TestState
): CallStatement<T> {
  return (mapFnOrPropertyName, ...args) => {
    return createActor(
      subjectOrTestState,
      baseState
    )(call(mapFnOrPropertyName as string, ...args) as any);
  };
}

function withApiExtensions<T, C>(
  apiToExtend: TargetActions<T>,
  apiToContinueWith: C
): TargetActions<T> {
  return new Proxy(apiToExtend, {
    get(target, name: string) {
      if (Valestory.extensions.has(name)) {
        // expected to be (apiToContinueWith) => (...args: any[]) => any
        return Valestory.extensions.getExtension(name)(apiToContinueWith);
      }

      return target[name];
    },
  });
}

function createExpectOrAndApi<TSubject>(
  testState: TestState,
  subject: Ref<TSubject>
): TestExtendingOrExpecter<TSubject> {
  return {
    ...testState,
    and: createTestApi(testState, subject) as any,
    expect: <TObject>(object: Ref<TObject>): TestEnding<TObject> => {
      const assertions = (negate: boolean) => {
        return {
          will(...expectations: Extension<TObject>[]) {
            addTestStep(testState, expectations, object, negate);
            return testState;
          },
          async to(...expectations: Extension<TObject>[]) {
            addTestStep(testState, expectations, object, negate);
            await executeTest(testState);
          },
        };
      };

      return Object.assign(assertions(false), {
        not: assertions(true),
      });
    },
  };
}

function addTestStep<TTarget>(
  testState: TestState,
  userActions: Extension<TTarget>[],
  target: Ref<TTarget>,
  negateAssertion: boolean = false
): void {
  userActions.forEach((action) => {
    const userAction: any = action(target, {
      negateAssertion,
      addTestStep: (...steps) => {
        testState.steps = [...testState.steps, ...steps];
      },
      setSpy: (host, target, returnValue) => {
        const spyFactory = ValestoryConfig.get("spyFactory");
        const spy = spyFactory(returnValue);
        testState.spyRequests.push({ host, target, spyInstance: spy });

        return spy;
      },
      wrapTestExecution: (wrapFn) => {
        testState.testExecutionWrapperFn = wrapFn;
      },
    });

    warnIfPromise(userAction, action);
  });
}

function warnIfPromise(userAction: any, action: Extension<any>) {
  if (userAction instanceof Promise) {
    console.warn(
      "[valestory] processed action that returned a promise!",
      action.toString()
    );
  }
}

function isExtensionFn<T>(value: any): value is Extension<T> {
  return (
    value != null &&
    "__valestoryType" in value &&
    value.__valestoryType === "extension"
  );
}

function isTestState(value: any): value is TestState {
  return value != null && "steps" in value && Array.isArray(value.steps);
}

async function executeTest(testState: TestState): Promise<void> {
  // hint: allows the user to wrap the whole test body; e.g. for: expect(() => testBody()).toThrow()
  const testWrapFn =
    testState.testExecutionWrapperFn ?? ((execTest) => execTest());

  // hint: do not rely on shared testState as this can lead to strange errors
  // if one test fails, others can fail, too, even if they should succeed.
  // this can be avoided by not referencing the testState, but keeping the state local
  // to this function. Maybe some async fn is not correctly awaited, and thus, the access
  // to the testState is something like a "side-effect".
  let spyRequests = testState.spyRequests;
  const steps = testState.steps;

  const executeTestSteps = async () => {
    for (const step of steps) {
      spyRequests = trySetSpies(spyRequests);
      await step();
    }
  };

  // clear memory
  testState.spyRequests = [];
  testState.steps = [];
  testState.testExecutionWrapperFn = undefined;

  // run
  await testWrapFn(executeTestSteps);

  if (spyRequests.length > 0) {
    const count = spyRequests.length;
    const names = spyRequests.map((s) => s.target);

    throw new Error(
      `[valestory] Could not set all spies. ${count} spies could not be set: ${names.join(
        ", "
      )}.`
    );
  }
}

function trySetSpies(spyRequests: SpyRequest[]): SpyRequest[] {
  return spyRequests.filter((spy) => {
    const host = spy.host();

    // do not remove from array and retry next tick:
    if (host == null) return true;
    if (host[spy.target] == null) return true;

    // successfully added spy
    host[spy.target] = spy.spyInstance;

    return false;
  });
}

function clone(
  importedTestState: TestState,
  testState: TestState = { spyRequests: [], steps: [] }
): TestState {
  return {
    steps: [...importedTestState.steps, ...testState.steps],
    spyRequests: [...testState.spyRequests, ...importedTestState.spyRequests],
    // bug: rest of test state is not imported, e.g. test exec wrapper
  };
}
