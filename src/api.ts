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
  baseState: TestState = { steps: [], meta: { negateAssertion: false } }
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
        const assertions = {
          will(...expectations: Extension<TObject>[]) {
            addTestStep(testState, expectations, object);
            return testState;
          },
          async to(...expectations: Extension<TObject>[]) {
            addTestStep(testState, expectations, object);
            await executeTest(testState);
          },
        };

        const createNotApi: () => any = () => {
          return new Proxy(assertions, {
            get(_, propertyName) {
              testState.meta.negateAssertion = !testState.meta.negateAssertion;

              if (propertyName == "not") return createNotApi();
              return assertions[propertyName];
            },
          });
        };

        return Object.assign(assertions, {
          not: createNotApi(),
        }) as TestEnding<TObject>;
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
  target: Ref<TTarget>
): void {
  testState.steps = [
    ...testState.steps,
    async () => {
      for (const effect of effects) {
        await effect(target(), {
          negateAssertion: testState.meta.negateAssertion,
        });
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
  return value != null && "steps" in value && Array.isArray(value.steps);
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
