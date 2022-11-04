//#region library internal types
export type Props<T extends {}> = Record<keyof T, any>;
export type ApiExtensionFn<C> = (apiToContinueWith: C) => Function;
export type ExtensionFn<T> = (
  target: Ref<T>,
  meta: TestEnv
) => void | Promise<void>;
export type TestStep = () => Promise<void> | void;
export interface TestState {
  steps: TestStep[];
  spyRequests: SpyRequest[];
  testExecutionWrapperFn?: TestExecutionWrapperFn;
}
export interface InternalTestState extends TestState {}
export interface SpyRequest<T = any> {
  host: Ref<T>;
  target: keyof T;
  spyInstance: SpyInstance;
}
export type WhenStatement = TargetedExtension & TestImport;
export type TestImport = (
  state: TestState
) => TestExtendingOrExpecter<undefined>;
export type TargetedExtension = <T>(target: Ref<T>) => TargetActions<T>;
export type CallStatement<T> = (
  map: keyof T | ((input: T) => any),
  ...args: any[]
) => TestExtendingOrExpecter<T>;

export interface TargetActions<T> {
  has: DoesStatement<T>;
  does: DoesStatement<T>;
  is: DoesStatement<T>;
  calls: CallStatement<T>;
}
export type DoesStatement<T> = (
  ...actions: Extension<T>[]
) => TestExtendingOrExpecter<T>;

export interface TestExtendingOrExpecter<T> extends TestState {
  and: AndStatement<T>;
  expect: TestExpectation;
}

export type AndStatement<T> = WhenStatement & DoesStatement<T>;
export type TestExpectation = <T>(target?: Ref<T>) => TestEnding<T>;
export interface TestEnding<Target> {
  not: Omit<TestEnding<Target>, "not">;
  will: TestExpectator<Target, TestState>;
  to: TestExpectator<Target, Promise<void>>;
}

export type TestExpectator<Target, Result> = (
  ...expectation: Extension<Target>[]
) => Result;
//#endregion

//#region public types
export type Ref<T> = () => T;
export type Extension<T> = ExtensionFn<T> & {
  __valestoryType: "extension";
};
export interface ValestoryConfiguration {
  isEqual: (a: any, b: any, negated: boolean) => void;
  hasBeenCalled: (spy: any, negate: boolean, times?: number) => void;
  didThrow: (
    fnBody: () => Promise<any>,
    negate: boolean,
    error?: string | Error | any
  ) => Promise<void>;
  spyFactory: (returnValue: any) => any;
}
export interface TestEnv {
  /** Whether the current test has called `.not.to(...)` and thus needs to negate the assertion. */
  readonly negateAssertion: boolean;
  /**
   * Adds the given function as a step along the current test.
   *
   * ~~~ts
   * const callMethod = <T>(methodName: keyof T, ...args: any[]) =>
   *  createExtension((target: Ref<T>, { addTestStep }) => {
   *    addTestStep(() => {
   *      const methodHost = target();
   *      methodHost[methodName].call(methodHost, ...args);
   *    });
   * });
   * ~~~
   *
   * Then in your tests you can use this test-step:
   *
   * ~~~ts
   * const person = { greet: () => console.log("hi!") };
   * when(() => person).does(callMethod("greet")).expect(...).to(...);
   * ~~~
   */
  addTestStep: (...steps: TestStep[]) => void;
  /**
   * Allows you to register a spy on the specific target's method.
   *
   * ~~~ts
   * const spyOnTarget = <T>(methodName: keyof T) =>
   *   createExtension((target: Ref<T>, { setSpy, addTestStep }) => {
   *      const spy = setSpy(target, methodName);
   *      addTestStep(() => {
   *        expect(spy).toHaveBeenCalled();
   *      });
   * });
   * ~~~
   */
  setSpy: <T extends {}>(
    host: Ref<T>,
    target: keyof T,
    returnValue?: any
  ) => SpyInstance;
  /**
   * Allows to wrap the whole test body, e.g. to assert that it throws an error (or not).
   */
  wrapTestExecution: (wrapFn: TestExecutionWrapperFn) => void;
}
export type TestExecutionWrapperFn = (
  executeTest: () => Promise<void>
) => Promise<void>;
export type SpyInstance = any;
//#endregion
