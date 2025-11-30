import { range } from "./range";

export function interleave<T>(arr: T[], cb: (before: T, after: T) => T): T[] {
  let out: T[] = [];
  for (let i = 0; i < arr.length - 1; i++) {
    out.push(arr[i], cb(arr[i], arr[i + 1]));
  }
  if (arr.length > 0) {
    out.push(arr.at(-1)!);
  }
  return out;
}

export function splitBy<T>(arr: T[], amount: number): T[][] {
  let outarr: T[][] = [[]];
  for (let i = 0; i < arr.length; i++) {
    if (i % amount === amount - 1) outarr.push([]);
    outarr.at(-1)!.push(arr[i]);
  }
  return outarr;
}

export function bifurcate<T>(arr: T[], fn: (t: T) => boolean): [T[], T[]] {
  const bools = arr.map(fn);
  return [arr.filter((e, i) => bools[i]), arr.filter((e, i) => !bools[i])];
}

export function groupBy<T, G>(arr: T[], getGroup: (t: T) => G): Map<G, T[]> {
  const groups = new Map<G, T[]>();

  for (const entry of arr) {
    const groupName = getGroup(entry);
    let group = groups.get(groupName) ?? [];
    group.push(entry);
    groups.set(groupName, group);
  }

  return groups;
}

export function argmax<T>(arr: [T, ...T[]], f: (t: T) => number): T {
  let maxFound = -Infinity;
  let maxElement = arr[0];
  for (const e of arr) {
    const val = f(e);
    if (val > maxFound) {
      maxElement = e;
      maxFound = val;
    }
  }
  return maxElement;
}

export function argmin<T>(arr: [T, ...T[]], f: (t: T) => number): T {
  return argmax(arr, (t) => -f(t));
}

export function powerSet<T>(arr: T[]): T[][] {
  if (arr.length === 0) return [[]];
  return powerSet(arr.slice(1)).flatMap((e) => [e, [arr[0], ...e]]);
}

export function permute<T>(arr: T[]): T[][] {
  if (arr.length === 0) return [[]];
  return permute(arr.slice(1)).flatMap((p) =>
    range(p.length + 1).map((i) =>
      p.slice(0, i).concat([arr[0]]).concat(p.slice(i))
    )
  );
}

function cartesianProductInner<Ts extends any[][]>(
  ts: Ts,
  arr: any[]
): { [K in keyof Ts]: Ts[K][number] }[] {
  // @ts-expect-error
  if (ts.length === 0) return [arr];
  return ts[0]
    .map((e) => cartesianProductInner(ts.slice(1), [...arr, e]))
    .flat(1) as ReturnType<typeof cartesianProduct<Ts>>;
}

export function cartesianProduct<Ts extends any[][]>(
  ...ts: Ts
): { [K in keyof Ts]: Ts[K][number] }[] {
  const res = cartesianProductInner(ts, []);
  return res;
}

export function pickrand<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function zip<Ts extends any[][]>(
  ...ts: Ts
): { [K in keyof Ts]: Ts[K][number] }[] {
  // @ts-expect-error
  return range(ts[0].length).map((i) => ts.map((t) => t[i]));
}

export function index<T>(arr: T[]): [T, number][] {
  return zip(arr, range(arr.length));
}

export function makeDitherKernel(iters: number) {
  if (iters === 0) {
    return [0];
  }

  const kernel = makeDitherKernel(iters - 1);
  const oldLength = kernel.length;
  const oldSideLength = Math.sqrt(oldLength);

  const newLength = kernel.length * 4;
  const newSideLength = Math.sqrt(newLength);

  let k = new Array(newLength);

  for (const [x, y, idx] of [
    [0, 0, 0],
    [1, 1, 1],
    [1, 0, 2],
    [0, 1, 3],
  ]) {
    let baseIndex = y * newSideLength + x;
    for (let i = 0; i < oldSideLength; i++) {
      for (let j = 0; j < oldSideLength; j++) {
        k[baseIndex + i * 2 * newSideLength + j * 2] =
          kernel[i * oldSideLength + j] + idx * kernel.length;
      }
    }
  }

  return k;
}

// export function toposort<T>(arr: T[], edges: [T, T][]) {

// }
