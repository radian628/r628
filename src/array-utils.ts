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
