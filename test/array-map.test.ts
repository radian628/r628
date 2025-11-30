import { test, expect, describe } from "bun:test";
import { ArrayMap } from "../src";

test("arraymap", () => {
  const am = new ArrayMap<string, string>();

  expect(am.get([])).toEqual(undefined);

  am.set([], "empty value");

  expect(am.get([])).toEqual("empty value");

  am.set(["a"], "a value");

  expect(am.get(["a"])).toEqual("a value");
  expect(am.get([])).toEqual("empty value");

  am.set(["a", "b"], "ab value");

  expect(am.get(["a", "b"])).toEqual("ab value");
  expect(am.get(["a"])).toEqual("a value");
  expect(am.get([])).toEqual("empty value");

  am.change([], (v) => v + " 2");

  expect(am.get(["a", "b"])).toEqual("ab value");
  expect(am.get(["a"])).toEqual("a value");
  expect(am.get([])).toEqual("empty value 2");

  const v = am.delete([]);
  expect(v).toEqual("empty value 2");

  expect(am.get(["a", "b"])).toEqual("ab value");
  expect(am.get(["a"])).toEqual("a value");
  expect(am.get([])).toEqual(undefined);

  am.set(["a", "b"], "ab value 2");

  expect(am.get(["a", "b"])).toEqual("ab value 2");

  expect(am.has(["a", "b"])).toEqual(true);
  expect(am.has(["a"])).toEqual(true);
  expect(am.has([])).toEqual(false);
});
