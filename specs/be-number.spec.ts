import { when } from "../src/core";
import { the } from "../src/core/helper";
import {
  beNumber,
  NumberComparisonOperator,
} from "../src/extensions/expectations/be-number";

describe("beNumber", () => {
  (
    [
      [1, "<", 2],
      [1, "<=", 2],
      [2, "<=", 2],
      [3, ">", 2],
      [3, ">=", 2],
      [3, ">=", 3],
    ] as [number, NumberComparisonOperator, number][]
  ).forEach(([a, comparer, b]) => {
    it(`should pass for ${a} ${comparer} ${b}`, () => {
      return when().expect(the(a)).to(beNumber(comparer, b));
    });
  });

  (
    [
      [2, "<", 1],
      [2, "<=", 1],
      [2, ">", 3],
      [2, ">=", 3],
    ] as [number, NumberComparisonOperator, number][]
  ).forEach(([a, comparer, b]) => {
    it(`should pass for ${a} not ${comparer} ${b}`, () => {
      return when().expect(the(a)).not.to(beNumber(comparer, b));
    });
  });
});
