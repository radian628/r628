// src/fp.ts
function variadify(fn, rightAssociative = false) {
  if (rightAssociative) {
    return (a, b, ...ts) => {
      const arr = [a, b, ...ts];
      let x = fn(arr.at(-2), arr.at(-1));
      for (let i = arr.length - 3; i >= 0; i--) {
        x = fn(arr[i], x);
      }
      return x;
    };
  }
  return (a, b, ...ts) => {
    let x = fn(a, b);
    for (const t of ts) x = fn(x, t);
    return x;
  };
}
function curry(f, argc) {
  if (argc === 0) {
    return f();
  }
  if (argc === 1) {
    return f;
  }
  return (arg) => {
    return curry((...as) => f(arg, ...as), argc - 1);
  };
}
function kurry(f, keys) {
  keys = new Set(keys);
  if (keys.size === 0) {
    return f({});
  }
  return (p) => {
    const newSet = keys.difference(new Set(Object.keys(p)));
    return kurry((p2) => f({ ...p, ...p2 }), newSet);
  };
}
function multicast(fs) {
  return (...args) => fs.map((f) => f(...args));
}
export {
  curry,
  kurry,
  multicast,
  variadify
};
