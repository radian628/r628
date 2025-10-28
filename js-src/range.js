// src/range.ts
function range(hi) {
  let arr = [];
  for (let i = 0; i < hi && i < 1e7; i++) {
    arr.push(i);
  }
  return arr;
}
function rangeFrom(lo, hi) {
  let arr = [];
  for (let i = lo; i < hi && i < 1e7; i++) {
    arr.push(i);
  }
  return arr;
}
function stringRangeMapJoin(hi, f, s = "\\n") {
  const r = range(hi);
  return r.map(f).join(s);
}
function stringMapJoin(a, f, s = "\\n") {
  return a.map(f).join(s);
}
function smartRangeMap(n, cb) {
  const a = range(n);
  const res1 = a.map((i, index, arr) => {
    return {
      remap(lo, hi, inclEnd) {
        return i / (inclEnd ? n - 1 : n) * (hi - lo) + lo;
      },
      remapCenter(lo, hi) {
        return (i + 1) / (n + 1) * (hi - lo) + lo;
      },
      segment(lo, hi) {
        return [i / n * (hi - lo) + lo, (i + 1) / n * (hi - lo) + lo];
      },
      slidingWindow(arr2) {
        return [arr2[i], arr2[i + 1]];
      },
      randkf() {
        if (i === 0) return 0;
        if (i === n - 1) return 100;
        const lo = i / (n - 2) * 100;
        const hi = (i + 1) / (n - 2) * 100;
        return rand(lo, hi);
      },
      get(arr2) {
        return arr2[i];
      },
      i,
      next: i + 1,
      end: () => i === n - 1,
      start: () => i === 0
    };
  });
  const res = res1.map(cb);
  return res;
}
function smartRange(n) {
  return smartRangeMap(n, id);
}
function id(x) {
  return x;
}
function smartRangeStringMapJoin(n, cb, s = "\\n") {
  return stringMapJoin(smartRangeMap(n, id), cb, s);
}
function rand(lo, hi, random) {
  if (!random) random = () => Math.random();
  return random() * (hi - lo) + lo;
}
function pickrand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function cartesianProductInner(ts, arr) {
  if (ts.length === 0) return [arr];
  return ts[0].map((e) => cartesianProductInner(ts.slice(1), [...arr, e])).flat(1);
}
function cartesianProduct(...ts) {
  const res = cartesianProductInner(ts, []);
  return res;
}
export {
  cartesianProduct,
  id,
  pickrand,
  rand,
  range,
  rangeFrom,
  smartRange,
  smartRangeMap,
  smartRangeStringMapJoin,
  stringMapJoin,
  stringRangeMapJoin
};
