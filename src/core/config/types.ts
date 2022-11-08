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
