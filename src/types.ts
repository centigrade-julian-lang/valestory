export type Ref<T> = () => T;
export type ExtensionFn<T> = (target: T) => void | Promise<void>;
export type TestStep = () => Promise<void>;
export interface TestState {
  steps: TestStep[];
}
export type Extension<T> = ExtensionFn<T> & {
  __testoryType: "extension";
};
export interface TestoryConfiguration {
  isEqual: (a: any, b: any) => void;
}

export type TestApi = TargetedExtension;
export type TargetedExtension = <T extends Ref<any>>(
  target: T
) => TargetActions<T>;

export interface TargetActions<T> {
  has: TargetAction<T>;
  does: TargetAction<T>;
  is: TargetAction<T>;
}

export type TargetAction<T> = (
  ...actions: Extension<T>[]
) => TestExtendingOrExpecter<T>;

export interface TestExtendingOrExpecter<T> {
  and: Extensions<T>;
  expect: TestExpectation;
}

export type Extensions<T> = TestApi & TargetAction<T>;

export type TestExpectation = <T extends Ref<any>>(target: T) => TestEnding<T>;

export interface TestEnding<Target> {
  will: TestExpectator<Target, TestState>;
  to: TestExpectator<Target, Promise<void>>;
}

export type TestExpectator<Target, Result> = (
  ...expectation: Extension<Target>[]
) => Result;
