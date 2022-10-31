import {
  AndStatement,
  Extension,
  Ref,
  TargetActions,
  TestEnding,
  TestExtendingOrExpecter,
  TestState,
  WhenStatement,
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
          return createActor(
            subject,
            updatePartially(testState, {
              steps: testState.steps.concat(refOrTestStateOrFirstAction.steps),
            })
          )();
        } else {
          // case: target-ref
          return createTestApi(refOrTestStateOrFirstAction, testState);
        }
      }) as AndStatement<TSubject>,
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

    return extendOrExpectApi;
  };

export const when: WhenStatement = createTestApi as WhenStatement;

// ---------------------------------
// module internal code
// ---------------------------------

function addTestStep<TTarget>(
  testState: TestState,
  effects: Extension<TTarget>[],
  target: Ref<TTarget>,
  negateAssertion: boolean = false
): void {
  testState.steps = [
    ...testState.steps,
    async () => {
      for (const effect of effects) {
        await effect(target(), {
          negateAssertion: negateAssertion,
        });
      }
    },
  ];
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
  for (const step of testState.steps) {
    await step();
  }

  // clear memory
  testState.steps = [];
}

function updatePartially<T extends {}>(original: T, update: Partial<T>) {
  return {
    ...original,
    ...update,
  };
}
