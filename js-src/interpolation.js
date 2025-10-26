// src/interpolation.ts
function lerp(x, a, b) {
  return a * (1 - x) + b * x;
}
function unlerp(x, a, b) {
  return (x - a) / (b - a);
}
function rescale(x, a1, b1, a2, b2) {
  return lerp(unlerp(x, a1, b1), a2, b2);
}
function rescaleClamped(x, a1, b1, a2, b2) {
  return lerp(clamp(unlerp(x, a1, b1), 0, 1), a2, b2);
}
function clamp(x, lo, hi) {
  return Math.max(Math.min(x, hi), lo);
}
function clampToArray(x, array) {
  return clamp(x, 0, array.length - 1);
}
function getClamped(arr, i) {
  return arr[clampToArray(i, arr)];
}
function unclampedSmoothstep(x) {
  return x * x * (3 - 2 * x);
}
function smoothstep(x) {
  return unclampedSmoothstep(clamp(x, 0, 1));
}
export {
  clamp,
  clampToArray,
  getClamped,
  lerp,
  rescale,
  rescaleClamped,
  smoothstep,
  unclampedSmoothstep,
  unlerp
};
