import { test, describe, expect } from "bun:test";
import { memo } from "../src";

test("memo", () => {
  let sideEffect = 0;
  const memoAdd = memo((a: number, b: number) => {
    sideEffect++;
    return a + b;
  });

  expect(sideEffect).toEqual(0);

  expect(memoAdd(1, 1)).toEqual(2);

  expect(sideEffect).toEqual(1);

  expect(memoAdd(1, 1)).toEqual(2);

  expect(sideEffect).toEqual(1);

  expect(memoAdd(2, 3)).toEqual(5);

  expect(sideEffect).toEqual(2);

  expect(memoAdd(2, 3)).toEqual(5);
  expect(memoAdd(2, 3)).toEqual(5);
  expect(memoAdd(2, 3)).toEqual(5);

  expect(sideEffect).toEqual(2);

  memoAdd.invalidate(1, 1);

  expect(sideEffect).toEqual(2);

  expect(memoAdd(1, 1)).toEqual(2);

  expect(sideEffect).toEqual(3);

  expect(memoAdd(2, 3)).toEqual(5);

  expect(sideEffect).toEqual(3);
});
