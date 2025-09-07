export type SmartAsyncReplaceAllRet = {
  str: string;
  cursor: number;
};

export type SARCallbackRetVal =
  | string
  | { str: string; cursorPos: number | undefined };
export async function smartAsyncReplaceAll(
  input: string,
  rgx: RegExp,
  callback: (
    str: string,
    pos: number,
    cursor: number | undefined
  ) => Promise<SARCallbackRetVal> | SARCallbackRetVal,
  options?: {
    cursor?: number;
  }
): Promise<SmartAsyncReplaceAllRet> {
  if (!options) options = {};
  if (options.cursor === undefined) options.cursor = 0;

  const matchesRaw = input.matchAll(rgx);
  const matches = matchesRaw ? [...matchesRaw] : [];
  let outFragments: Promise<{
    beforeStr: string;
    afterStr: string;
    cursorPos: number | undefined;
  }>[] = [];

  function calcCursorPos(initCursor: number, start: number, length: number) {
    const outCursor = initCursor - start;
    if (outCursor < 0 || outCursor > length) return undefined;
    return outCursor;
  }

  for (let i = 0; i < matches.length + 1; i++) {
    const prevIndex = matches[i - 1]
      ? matches[i - 1].index + matches[i - 1][0].length
      : 0;
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
        ),
      })
    );

    if (matches[i] === undefined) break;

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
          cursorPos: typeof res === "string" ? undefined : res.cursorPos,
        };
      })()
    );
  }

  const awaitedOutFragments = await Promise.all(outFragments);

  let accumStringLength = 0;
  let finalCursorPos: number | undefined = undefined;
  for (const f of awaitedOutFragments) {
    if (f.cursorPos !== undefined) {
      finalCursorPos = accumStringLength + f.cursorPos;
      break;
    }
    accumStringLength += f.afterStr.length;
  }

  return {
    str: awaitedOutFragments.map((e) => e.afterStr).join(""),
    cursor: finalCursorPos ?? 0,
  };
}

export function multiDelimit(str: string, delimiters: string[]) {
  if (delimiters.length === 0) return str;
  return str
    .split(delimiters[0])
    .map((e) => multiDelimit(e, delimiters.slice(1)));
}

export function randUnicode(
  lo: number,
  hi: number,
  count: number,
  random?: () => number
) {
  if (!random) random = () => Math.random();
  return ""
    .padEnd(count)
    .split("")
    .map((e) => String.fromCharCode(Math.floor(random() * (hi - lo)) + lo));
}

export function getLinesAndCols(str: string): [number, number][] {
  let line = 1;
  let col = 1;
  let out: [number, number][] = [];
  for (const char of str) {
    out.push([line, col]);
    if (char === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  out.push([line, col]);
  return out;
}
