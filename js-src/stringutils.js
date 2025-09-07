// src/stringutils.ts
async function smartAsyncReplaceAll(input, rgx, callback, options) {
  if (!options) options = {};
  if (options.cursor === void 0) options.cursor = 0;
  const matchesRaw = input.matchAll(rgx);
  const matches = matchesRaw ? [...matchesRaw] : [];
  let outFragments = [];
  function calcCursorPos(initCursor, start, length) {
    const outCursor = initCursor - start;
    if (outCursor < 0 || outCursor > length) return void 0;
    return outCursor;
  }
  for (let i = 0; i < matches.length + 1; i++) {
    const prevIndex = matches[i - 1] ? matches[i - 1].index + matches[i - 1][0].length : 0;
    const currIndex = matches[i] ? matches[i].index : input.length;
    let precedingFragment = input.slice(prevIndex, currIndex);
    let matchedFragment = matches[i] ? matches[i][0] : "";
    outFragments.push(
      Promise.resolve({
        beforeStr: precedingFragment,
        afterStr: precedingFragment,
        cursorPos: calcCursorPos(
          options.cursor,
          prevIndex,
          precedingFragment.length
        )
      })
    );
    if (matches[i] === void 0) break;
    outFragments.push(
      (async () => {
        const res = await callback(
          matchedFragment,
          currIndex,
          calcCursorPos(options.cursor ?? 0, currIndex, matchedFragment.length)
        );
        return {
          beforeStr: matchedFragment,
          afterStr: typeof res === "string" ? res : res.str,
          cursorPos: typeof res === "string" ? void 0 : res.cursorPos
        };
      })()
    );
  }
  const awaitedOutFragments = await Promise.all(outFragments);
  let accumStringLength = 0;
  let finalCursorPos = void 0;
  for (const f of awaitedOutFragments) {
    if (f.cursorPos !== void 0) {
      finalCursorPos = accumStringLength + f.cursorPos;
      break;
    }
    accumStringLength += f.afterStr.length;
  }
  return {
    str: awaitedOutFragments.map((e) => e.afterStr).join(""),
    cursor: finalCursorPos ?? 0
  };
}
function multiDelimit(str, delimiters) {
  if (delimiters.length === 0) return str;
  return str.split(delimiters[0]).map((e) => multiDelimit(e, delimiters.slice(1)));
}
function randUnicode(lo, hi, count, random) {
  if (!random) random = () => Math.random();
  return "".padEnd(count).split("").map((e) => String.fromCharCode(Math.floor(random() * (hi - lo)) + lo));
}
function getLinesAndCols(str) {
  let line = 1;
  let col = 1;
  let out = [];
  for (const char of str) {
    out.push([line, col]);
    if (char === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return out;
}
export {
  getLinesAndCols,
  multiDelimit,
  randUnicode,
  smartAsyncReplaceAll
};
