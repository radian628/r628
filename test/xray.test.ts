import { test, describe, expect } from "bun:test";
import { Vec3, xray } from "../src";

test("xray on primitive", () => {
  const x = xray(3);

  expect(x.$v).toEqual(3);
  expect(x.$(4).$v).toEqual(4);
});

test("xray object fields", () => {
  const y = xray({
    a: 3,
  });

  expect(y.$v).toEqual({ a: 3 });
  expect(y.a.$(4).$v).toEqual({ a: 4 });
  expect(y.a.$s((x) => x - 1).$v).toEqual({ a: 2 });
  expect(y.$ctx(() => 3).a.$s((x, c) => x + c).$v).toEqual({ a: 6 });
  expect(y.$({ b: 7 }).$v).toEqual({ b: 7 });
});

test("xray nested object fields", () => {
  const y = xray({
    a: { b: 3 },
  });

  expect(y.$v).toEqual({ a: { b: 3 } });
  expect(y.a.b.$(4).$v).toEqual({ a: { b: 4 } });
  expect(y.a.b.$s((x) => x - 1).$v).toEqual({ a: { b: 2 } });
  expect(y.$ctx(() => 3).a.b.$s((x, c) => x + c).$v).toEqual({ a: { b: 6 } });
  expect(y.$({ b: 7 }).$v).toEqual({ b: 7 });
});

test("xray tuples", () => {
  const z = xray([2, 3, 5] as Vec3);

  expect(z.$v).toEqual([2, 3, 5]);
  expect(z.$i(0).$(10).$v).toEqual([10, 3, 5]);
  expect(z.$i(0).$("hello").$v).toEqual(["hello", 3, 5]);
  expect(z.$i(1).$("hello").$v).toEqual([2, "hello", 5]);
  expect(z.$i(2).$("hello").$v).toEqual([2, 3, "hello"]);
});

test("xray arrays", () => {
  const a = xray([1, 2, 3, 4, 5]);

  expect(a.$v).toEqual([1, 2, 3, 4, 5]);
  expect(a.$e.$s((x) => x * 2).$v).toEqual([2, 4, 6, 8, 10]);
});

test("xray nested arrays", () => {
  const a = xray([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]);

  expect(a.$en.$en.$s((n) => n * 2).$v).toEqual([
    [2, 4, 6],
    [8, 10, 12],
    [14, 16, 18],
  ]);

  expect(a.$en.$en.$s((n, [i, j]) => i * 10 + j).$v).toEqual([
    [0, 1, 2],
    [10, 11, 12],
    [20, 21, 22],
  ]);
});

test("set multiple fields", () => {
  const y = xray({
    a: 3,
    b: 4,
    c: 5,
  });

  expect(
    y.$m(({ a, b, c }) => ({
      c: 1,
      d: 69,
    })).$v
  ).toEqual({
    a: 3,
    b: 4,
    c: 1,
    d: 69,
  });
});
