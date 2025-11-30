// src/range.ts
function range(hi) {
  let arr = [];
  for (let i = 0; i < hi && i < 1e7; i++) {
    arr.push(i);
  }
  return arr;
}

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
function groupBy(arr, getGroup) {
  const groups = /* @__PURE__ */ new Map();
  for (const entry of arr) {
    const groupName = getGroup(entry);
    let group = groups.get(groupName) ?? [];
    group.push(entry);
    groups.set(groupName, group);
  }
  return groups;
}
function argmax(arr, f) {
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
function argmin(arr, f) {
  return argmax(arr, (t) => -f(t));
}
function powerSet(arr) {
  if (arr.length === 0) return [[]];
  return powerSet(arr.slice(1)).flatMap((e) => [e, [arr[0], ...e]]);
}
function permute(arr) {
  if (arr.length === 0) return [[]];
  return permute(arr.slice(1)).flatMap(
    (p) => range(p.length + 1).map(
      (i) => p.slice(0, i).concat([arr[0]]).concat(p.slice(i))
    )
  );
}
function cartesianProductInner(ts, arr) {
  if (ts.length === 0) return [arr];
  return ts[0].map((e) => cartesianProductInner(ts.slice(1), [...arr, e])).flat(1);
}
function cartesianProduct(...ts) {
  const res = cartesianProductInner(ts, []);
  return res;
}
function pickrand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function zip(...ts) {
  return range(ts[0].length).map((i) => ts.map((t) => t[i]));
}
function index(arr) {
  return zip(arr, range(arr.length));
}
function makeDitherKernel(iters) {
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
    [0, 1, 3]
  ]) {
    let baseIndex = y * newSideLength + x;
    for (let i = 0; i < oldSideLength; i++) {
      for (let j = 0; j < oldSideLength; j++) {
        k[baseIndex + i * 2 * newSideLength + j * 2] = kernel[i * oldSideLength + j] + idx * kernel.length;
      }
    }
  }
  return k;
}
export {
  argmax,
  argmin,
  bifurcate,
  cartesianProduct,
  groupBy,
  index,
  interleave,
  makeDitherKernel,
  permute,
  pickrand,
  powerSet,
  splitBy,
  zip
};
