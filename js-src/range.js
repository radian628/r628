// src/range.ts
function range(hi) {
  let arr = [];
  for (let i = 0; i < hi && i < 1e7; i++) {
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
  const res = a.map((i, index, arr) => {
    return cb(
      {
        remap(lo, hi, inclEnd) {
          return i / (inclEnd ? n - 1 : n) * (hi - lo) + lo;
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
        next: i + 1
      },
      index,
      res
    );
  });
  return res;
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
export {
  id,
  pickrand,
  rand,
  range,
  smartRangeMap,
  smartRangeStringMapJoin,
  stringMapJoin,
  stringRangeMapJoin
};
