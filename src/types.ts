//#region library internal types
export type Props<T extends {}> = Record<keyof T, any>;
export type ExtensionFn<T> = (
  target: T,
  meta: TestMeta
) => void | Promise<void>;
export type TestStep = () => Promise<void>;
export interface TestState {
  steps: TestStep[];
  meta: TestMeta;
}

export type WhenStatement = TargetedExtension & TestImport;
export type TestImport = (
  state: TestState
) => TestExtendingOrExpecter<undefined>;
export type TargetedExtension = <T>(target: Ref<T>) => TargetActions<T>;
export interface TargetActions<T> {
  has: DoesStatement<T>;
  does: DoesStatement<T>;
  is: DoesStatement<T>;
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
  not: TestEnding<Target>;
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
  __testoryType: "extension";
};
export interface ValestoryConfiguration {
  isEqual: (a: any, b: any, negated: boolean) => void;
}
export interface TestMeta {
  negateAssertion: boolean;
}
//#endregion
