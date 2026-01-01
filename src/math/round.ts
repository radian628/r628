export function roundUp(factor: number, x: number) {
  return Math.ceil(x / factor) * factor;
}
