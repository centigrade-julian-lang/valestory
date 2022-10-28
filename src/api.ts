import {
  Extension,
  Extensions,
  Ref,
  TargetActions,
  TestApi,
  TestEnding,
  TestExtendingOrExpecter,
  TestState,
} from "./types";

const createTestApi = <T>(
  subjectOrTestState: Ref<T> | TestState,
  baseState: TestState = { steps: [] }
): TargetActions<T> => {
  if (isTestState(subjectOrTestState)) {
    return createActor(undefined!, subjectOrTestState)() as any;
  }

  return {
    has: createActor(subjectOrTestState, baseState),
    does: createActor(subjectOrTestState, baseState),
    is: createActor(subjectOrTestState, baseState),
  };
};

const createActor =
  <TSubject>(subject: Ref<TSubject>, testState: TestState) =>
  (...actions: Extension<TSubject>[]): TestExtendingOrExpecter<TSubject> => {
    addTestStep(testState, actions, subject);

    const extendOrExpectApi: TestExtendingOrExpecter<TSubject> = {
      ...testState,
      and: (<R extends Ref<any>>(
        refOrTestStateOrFirstAction: R | TestState | Extension<TSubject>,
        ...restOfActions: Extension<TSubject>[]
      ) => {
        if (isExtensionFn<TSubject>(refOrTestStateOrFirstAction)) {
          // case: extension-fn import
          return createActor(subject, testState)(
            refOrTestStateOrFirstAction,
            ...restOfActions
          );
        } else if (isTestState(refOrTestStateOrFirstAction)) {
          // case: test-state import
          return createTestApi(
            subject,
            updatePartially(testState, {
              steps: testState.steps.concat(refOrTestStateOrFirstAction.steps),
            })
          );
        } else {
          // case: target-ref
          return createTestApi(refOrTestStateOrFirstAction, testState);
        }
      }) as Extensions<TSubject>,
      expect: <TObject>(object: Ref<TObject>): TestEnding<TObject> => {
        return {
          will(...expectations: Extension<TObject>[]) {
            addTestStep(testState, expectations, object);
            return testState;
          },
          async to(...expectations: Extension<TObject>[]) {
            addTestStep(testState, expectations, object);
            await executeTest(testState);
          },
        };
      },
    };

    return extendOrExpectApi;
  };

export const when: TestApi = createTestApi as TestApi;

// ---------------------------------
// module internal code
// ---------------------------------

function addTestStep<TTarget>(
  testState: TestState,
  effects: Extension<TTarget>[],
  target: Ref<TTarget>
): void {
  testState.steps = [
    ...testState.steps,
    async () => {
      for (const effect of effects) {
        await effect(target());
      }
    },
  ];
}

function isExtensionFn<T>(value: any): value is Extension<T> {
  return (
    value != null &&
    "__testoryType" in value &&
    value.__testoryType === "extension"
  );
}

function isTestState(value: any): value is TestState {
  return "steps" in value && Array.isArray(value.steps);
}

async function executeTest(testState: TestState): Promise<void> {
  for (const step of testState.steps) {
    await step();
  }
}

function updatePartially<T extends {}>(original: T, update: Partial<T>) {
  return {
    ...original,
    ...update,
  };
}
