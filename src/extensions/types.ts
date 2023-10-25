export interface CallAssertion<TTarget> {
  returnValue?: any;
  times?: number | null;
  withArgs?: any[] | ((target: TTarget) => any[]);
}
