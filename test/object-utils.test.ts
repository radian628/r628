import { expect, test, describe } from "bun:test";
import { ALL, nestedMap } from "../src/object-utils";

test("nestedmap", () => {
  expect(nestedMap({ a: 12345 }, ["a"] as const, (e) => 6969)).toEqual({
    a: 6969,
  });

  expect(
    nestedMap({ a: { b: 12345 } }, ["a", "b"] as const, () => 6969)
  ).toEqual({
    a: { b: 6969 },
  });

  expect(
    nestedMap({ a: [2, 4, 6] }, ["a", ALL] as const, ([k, v]) => v * 2)
  ).toEqual({
    a: [4, 8, 12],
  });

  expect(
    nestedMap(
      {
        a: "x",
        b: "y",
      },
      [["a", "b"]] as const,
      () => "poop"
    )
  ).toEqual({
    a: "poop",
    b: "poop",
  });
});
