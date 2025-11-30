import { expect, test, describe } from "bun:test";
import { permute } from "../src";

test("permute", () => {
  const str = "abc".split("");

  expect(new Set(permute(str).map((s) => s.join("")))).toEqual(
    new Set(["abc", "acb", "bca", "bac", "cab", "cba"])
  );
});
