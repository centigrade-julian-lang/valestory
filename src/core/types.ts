/* eslint-disable @typescript-eslint/ban-types */
export type Ref<T> = () => T;
export type ExtensionFn<T> = (target: Ref<T>, meta: TestEnv) => void;
export type Extension<T> = ExtensionFn<T> & {
  __valestoryType: "extension";
};

export type Fn<I extends any[] = any[], O = any> = (...args: I) => O;

export interface TestEnv {
  negateAssertion: boolean;
  addTestStep: (...steps: TestStep[]) => void;
  /**
   * Allows to wrap the whole test body, e.g. to assert that it throws an error (or not).
   */
  wrapTestExecution: (wrapFn: TestExecutionWrapperFn) => void;
  setSpy: <T extends {}>(
    host: Ref<T>,
    target: keyof T,
    returnValue?: any,
    spyInstanceToUse?: any
  ) => SpyInstance;
  debug: (interestedIn: "spies") => void;
}
export type TestExecutionWrapperFn = (
  executeTest: () => Promise<void>
) => Promise<void>;
export type SpyInstance = any;
export type Props<T extends {}> = Record<keyof T, any>;
export type ApiExtensionFn<C> = (apiToContinueWith: C) => Function;
export type TestStep = () => Promise<void> | void;
export type DebugMode = "spies";
export interface TestState {
  steps: TestStep[];
  spyRequests: SpyRequest[];
  debugOutput?: DebugMode;
  testExecutionWrapperFn?: TestExecutionWrapperFn;
}
export interface SpyRequest<T = any> {
  host: Ref<T>;
  target: keyof T;
  spyInstance: SpyInstance;
}
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

export type WhenStatement<T> = DoesStatement<T> &
  TargetedExtension &
  TestImport;
export type AndStatement<T> = WhenStatement<T>;
export interface TestExpectation {
  <T>(target?: Ref<T>): TestEnding<T>;
  (...expectation: TestState[]): Promise<void>;
}

export interface TestEnding<Target> {
  not: Omit<TestEnding<Target>, "not">;
  will: TestExpectator<Target, TestState>;
  to: TestExpectator<Target, Promise<void>>;
}

export type TestExpectator<Target, Result> = (
  ...expectation: Extension<Target>[]
) => Result;
