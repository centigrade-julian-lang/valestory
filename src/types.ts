//#region library internal types
export type Props<T extends {}> = Record<keyof T, any>;
export type ApiExtensionFn<C> = (apiToContinueWith: C) => Function;
export type ExtensionFn<T> = (target: T, meta: TestEnv) => void | Promise<void>;
export type TestStep = () => Promise<void> | void;
export interface TestState {
  steps: TestStep[];
  spyRequests: SpyRequest[];
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
export type TestExpectation = <T>(target: Ref<T>) => TestEnding<T>;
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
  spyFactory: (returnValue: any) => any;
}
export interface TestEnv {
  negateAssertion: boolean;
  addTestStep: (...steps: TestStep[]) => void;
  setSpy: <T extends {}>(
    host: Ref<T>,
    target: keyof T,
    returnValue?: any
  ) => SpyInstance;
}
export type SpyInstance = any;
//#endregion
