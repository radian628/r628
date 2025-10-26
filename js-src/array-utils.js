// src/array-utils.ts
function interleave(arr, cb) {
  let out = [];
  for (let i = 0; i < arr.length - 1; i++) {
    out.push(arr[i], cb(arr[i], arr[i + 1]));
  }
  if (arr.length > 0) {
    out.push(arr.at(-1));
  }
  return out;
}
function splitBy(arr, amount) {
  let outarr = [[]];
  for (let i = 0; i < arr.length; i++) {
    if (i % amount === amount - 1) outarr.push([]);
    outarr.at(-1).push(arr[i]);
  }
  return outarr;
}
function bifurcate(arr, fn) {
  const bools = arr.map(fn);
  return [arr.filter((e, i) => bools[i]), arr.filter((e, i) => !bools[i])];
}
export {
  bifurcate,
  interleave,
  splitBy
};
