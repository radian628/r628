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
