export function lerp(x: number, a: number, b: number) {
  return a * (1 - x) + b * x;
}

export function unlerp(x: number, a: number, b: number) {
  return (x - a) / (b - a);
}

export function rescale(
  x: number,
  a1: number,
  b1: number,
  a2: number,
  b2: number
) {
  return lerp(unlerp(x, a1, b1), a2, b2);
}

export function clamp(x: number, lo: number, hi: number) {
  return Math.max(Math.min(x, hi), lo);
}

export function clampToArray(x: number, array: any[]) {
  return clamp(x, 0, array.length - 1);
}

export function getClamped<T>(arr: T[], i: number): T {
  return arr[clampToArray(i, arr)];
}

export function unclampedSmoothstep(x: number) {
  return x * x * (3 - 2 * x);
}

export function smoothstep(x: number) {
  return unclampedSmoothstep(clamp(x, 0, 1));
}
