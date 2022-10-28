export type Ref<T> = () => T;
export type ExtensionFn<T> = (target: T) => void | Promise<void>;
export type TestStep = () => Promise<void>;
export interface TestState {
  steps: TestStep[];
}
export type Extension<T> = ExtensionFn<T> & {
  __testoryType: "extension";
};
export interface ValestoryConfiguration {
  isEqual: (a: any, b: any) => void;
}

export type TestApi = TargetedExtension & TestImport;
export type TestImport = (state: TestState) => TestExtendingOrExpecter<unknown>;
export type TargetedExtension = <T>(target: Ref<T>) => TargetActions<T>;

export interface TargetActions<T> {
  has: TargetAction<T>;
  does: TargetAction<T>;
  is: TargetAction<T>;
}

export type TargetAction<T> = (
  ...actions: Extension<T>[]
) => TestExtendingOrExpecter<T>;

export interface TestExtendingOrExpecter<T> extends TestState {
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
