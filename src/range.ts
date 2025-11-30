export function range(hi: number) {
  let arr: number[] = [];
  for (let i = 0; i < hi && i < 10_000_000; i++) {
    arr.push(i);
  }
  return arr;
}

export function rangeFrom(lo: number, hi: number) {
  let arr: number[] = [];
  for (let i = lo; i < hi && i < 10_000_000; i++) {
    arr.push(i);
  }
  return arr;
}

export type MapCallback<T, U> = (e: T, i: number, arr: T[]) => U;

export function stringRangeMapJoin(
  hi: number,
  f: MapCallback<number, string>,
  s = "\\n"
) {
  const r = range(hi);
  return r.map(f).join(s);
}

export function stringMapJoin<T>(a: T[], f: MapCallback<T, string>, s = "\\n") {
  return a.map(f).join(s);
}

type SmartRangeElement = {
  remap(lo: number, hi: number, inclEnd?: boolean): number;
  remapCenter(lo: number, hi: number): number;
  segment(lo: number, hi: number): [number, number];
  slidingWindow<T>(arr: T[]): [T, T];
  randkf(): number;
  get<T>(arr: T[]): T;
  i: number;
  next: number;
  end(): boolean;
  start(): boolean;
};

export function smartRangeMap<T>(
  n: number,
  cb: MapCallback<SmartRangeElement, T>
): T[] {
  const a = range(n);
  const res1 = a.map((i, index, arr) => {
    return {
      remap(lo: number, hi: number, inclEnd?: boolean) {
        return (i / (inclEnd ? n - 1 : n)) * (hi - lo) + lo;
      },
      remapCenter(lo: number, hi: number) {
        return ((i + 1) / (n + 1)) * (hi - lo) + lo;
      },
      segment(lo: number, hi: number): [number, number] {
        return [(i / n) * (hi - lo) + lo, ((i + 1) / n) * (hi - lo) + lo];
      },
      slidingWindow<T>(arr: T[]): [T, T] {
        return [arr[i], arr[i + 1]];
      },
      randkf() {
        if (i === 0) return 0;
        if (i === n - 1) return 100;
        const lo = (i / (n - 2)) * 100;
        const hi = ((i + 1) / (n - 2)) * 100;
        return rand(lo, hi);
      },
      get<T>(arr: T[]): T {
        return arr[i];
      },
      i,
      next: i + 1,
      end: () => i === n - 1,
      start: () => i === 0,
    };
  });
  const res = res1.map(cb);
  return res;
}

export function smartRange(n: number) {
  return smartRangeMap(n, id);
}

export function id<T>(x: T) {
  return x;
}

export function smartRangeStringMapJoin(
  n: number,
  cb: MapCallback<SmartRangeElement, string>,
  s = "\\n"
) {
  return stringMapJoin(smartRangeMap(n, id), cb, s);
}

export function rand(lo: number, hi: number, random?: () => number) {
  if (!random) random = () => Math.random();
  return random() * (hi - lo) + lo;
}
