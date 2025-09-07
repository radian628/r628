import { expect, test, describe } from "bun:test";
import { multiDelimit, smartAsyncReplaceAll } from "../src/stringutils";

test("multi delim", () => {
  expect(multiDelimit("a,b,c", [","])).toEqual(["a", "b", "c"]);
  expect(multiDelimit("a,b,c;d,e,f", [";", ","])).toEqual([
    ["a", "b", "c"],
    ["d", "e", "f"],
  ]);
  expect(multiDelimit("a,b,c;d,e,f", [",", ";"])).toEqual([
    ["a"],
    ["b"],
    ["c", "d"],
    ["e"],
    ["f"],
  ]);
});

describe("smart async replaceAll", () => {
  test("simple example", async () => {
    expect(
      (await smartAsyncReplaceAll("abcabcabc", /a/g, (a) => "b")).str
    ).toEqual("bbcbbcbbc");
  });

  test("async callback", async () => {
    expect(
      (await smartAsyncReplaceAll("abcabcabc", /a/g, async (a) => "b")).str
    ).toEqual("bbcbbcbbc");
  });

  test("with cursor output", async () => {
    expect(
      (
        await smartAsyncReplaceAll("abcabcabc", /a/g, async (a) => ({
          str: "b",
          cursorPos: 0,
        }))
      ).str
    ).toEqual("bbcbbcbbc");
  });

  test("cursor should not shift", async () => {
    expect(
      (
        await smartAsyncReplaceAll(
          "abcabcabc",
          /a/g,
          async (a, p, c) => ({
            str: "b",
            cursorPos: c,
          }),
          { cursor: 5 }
        )
      ).cursor
    ).toEqual(5);
  });

  test("cursor shift due to new chars", async () => {
    expect(
      (
        await smartAsyncReplaceAll(
          "abcabcabc",
          /a/g,
          async (a, p, c) => ({
            str: "bb",
            cursorPos: c === undefined ? undefined : 2,
          }),
          { cursor: 5 }
        )
      ).cursor
    ).toEqual(7);
  });

  test("cursor in unchanged block", async () => {
    expect(
      (
        await smartAsyncReplaceAll(
          "aaabbbaaabbb",
          /bbb/g,
          async (a, p, c) => ({
            str: "xxxxxx",
            cursorPos: c === undefined ? undefined : 6,
          }),
          { cursor: 7 }
        )
      ).cursor
    ).toEqual(10);
  });
});
