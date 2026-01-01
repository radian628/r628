import { test, describe, expect } from "bun:test";
import { curry, kurry, variadify } from "../src/fp";

const sum = (a: number, b: number) => a + b;

test("variadify", () => {
  expect(sum(1, 1)).toEqual(2);
  expect(sum(2, 3)).toEqual(5);

  const vsuml = variadify(sum);
  const vsumr = variadify(sum, true);

  for (const vsum of [vsuml, vsumr]) {
    expect(vsum(1, 1)).toEqual(2);
    expect(vsum(2, 3)).toEqual(5);
    expect(vsum(1, 2, 3)).toEqual(6);
    expect(vsum(2, 2, 4, 7)).toEqual(15);
  }
});

test("curry", () => {
  const sumc = curry(sum, 2);

  const sum3 = curry((a, b, c) => a + b + c, 3);

  const idcurry = curry((x) => x, 1);

  const noargcurry = curry(() => 3, 0);

  expect(sumc(1)(2)).toEqual(3);
  expect(sumc(3)(4)).toEqual(7);

  expect(sum3(2)(5)(9)).toEqual(16);
  expect(sum3(2)(5)(9)).toEqual(16);

  expect(idcurry(2)).toEqual(2);
  expect(idcurry("test")).toEqual("test");

  expect(noargcurry).toEqual(3);
});

test("kurry", () => {
  const sumk = kurry((p: { a: number; b: number }) => p.a + p.b, ["a", "b"]);

  const sumk3 = kurry(
    (p: { a: number; b: number; c: number }) => p.a + p.b + p.c,
    ["a", "b", "c"]
  );

  expect(sumk({ a: 1, b: 2 })).toEqual(3);
  expect(sumk({ a: 1 })({ b: 2 })).toEqual(3);

  expect(sumk3({ a: 1, b: 2, c: 3 })).toEqual(6);
  expect(sumk3({ a: 1, b: 2 })({ c: 3 })).toEqual(6);
  expect(sumk3({ a: 1 })({ c: 3, b: 2 })).toEqual(6);
  expect(sumk3({ c: 1 })({ b: 3, a: 2 })).toEqual(6);
  expect(sumk3({ c: 1 })({ a: 2 })({ b: 3 })).toEqual(6);
});
