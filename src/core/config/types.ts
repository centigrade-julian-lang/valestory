export interface ValestoryConfiguration {
  isEqual: (a: any, b: any, negated: boolean) => void;
  hasBeenCalled: (spy: any, negate: boolean, times?: number) => void;
  spyFactory: (returnValue: any) => any;
}
