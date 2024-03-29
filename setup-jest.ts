import { ComparisonOpts, Valestory } from "./src";

// TODO: looks like it is problematic to define the expectation adapters in setup-jest script as it is not expected to throw errors here,
// as usual matchers do when a test fails.
Valestory.config.override({
  spyFactory: (value) => jest.fn().mockReturnValue(value),
  didThrow: async (testBodyFn, negate, error) => {
    if (negate) {
      if (error != null) {
        await expect(testBodyFn).rejects.not.toThrow(error);
      } else {
        await expect(testBodyFn()).resolves.not.toThrowError();
      }
    } else {
      await expect(testBodyFn).rejects.toThrow(error);
    }
  },
  hasBeenCalled: (spy: any, negate, times?: number, withArgs?: any[]) => {
    if (negate) {
      times != null
        ? expect(spy).not.toHaveBeenCalledTimes(times)
        : expect(spy).not.toHaveBeenCalled();

      if (withArgs != null) {
        expect(spy).not.toHaveBeenCalledWith(...withArgs);
      }
    } else {
      times != null
        ? expect(spy).toHaveBeenCalledTimes(times)
        : expect(spy).toHaveBeenCalled();

      if (withArgs != null) {
        expect(spy).toHaveBeenCalledWith(...withArgs);
      }
    }
  },
  isEqual: (a: any, b: any, negate: boolean, opts: ComparisonOpts) => {
    const numberComparisonTolerance = opts.deviationTolerance;

    if (numberComparisonTolerance != null) {
      const delta = Math.abs(a - b);

      negate
        ? expect(delta).toBeGreaterThan(numberComparisonTolerance)
        : expect(delta).toBeLessThanOrEqual(numberComparisonTolerance);
    } else {
      negate ? expect(a).not.toEqual(b) : expect(a).toEqual(b);
    }
  },
  beInstanceOf: (a, b, negated) => {
    if (typeof b === "string") {
      if (negated) {
        expect(typeof a).not.toEqual(b);
      } else {
        expect(typeof a).toEqual(b);
      }
    } else {
      if (negated) {
        expect(a).not.toBeInstanceOf(b);
      } else {
        expect(a).toBeInstanceOf(b);
      }
    }
  },
});
