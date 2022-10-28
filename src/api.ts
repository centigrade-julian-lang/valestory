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
      and: (<R extends Ref<any>>(
        refOrFirstAction: R | Extension<TSubject>,
        ...restOfActions: Extension<TSubject>[]
      ) => {
        if (isExtensionFn<TSubject>(refOrTestStateOrFirstAction)) {
          // case: extension-fn import
          return createActor(subject, testState)(
            refOrTestStateOrFirstAction,
            ...restOfActions
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

async function executeTest(testState: TestState): Promise<void> {
  for (const step of testState.steps) {
    await step();
  }
}
