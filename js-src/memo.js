// src/array-map.ts
var ArrayMap = class _ArrayMap {
  constructor() {
    this.maps = /* @__PURE__ */ new Map();
  }
  nthMap(n) {
    let map = this.maps.get(n);
    if (!map) {
      map = /* @__PURE__ */ new Map();
      this.maps.set(n, map);
    }
    return map;
  }
  get(path) {
    let map = this.nthMap(path.length);
    for (const p of path) {
      map = map.get(p);
      if (!map) return void 0;
    }
    return map;
  }
  has(path) {
    if (path.length === 0) return this.maps.has(0);
    let map = this.nthMap(path.length);
    for (const p of path) {
      map = map.get(p);
      if (!map) return false;
    }
    return true;
  }
  delete(path) {
    if (path.length === 0) {
      const item2 = this.maps.get(0);
      this.maps.delete(0);
      return item2;
    }
    let map = this.nthMap(path.length);
    for (const p of path.slice(0, -1)) {
      map = map.get(p);
      if (!map) return void 0;
    }
    const item = map.get(path.at(-1));
    map.delete(path.at(-1));
    return item;
  }
  change(path, cb) {
    if (path.length === 0) {
      this.maps.set(0, cb(this.maps.get(0)));
      return;
    }
    let map = this.nthMap(path.length);
    for (const p of path.slice(0, -1)) {
      let oldMap = map;
      map = map.get(p);
      if (!map) {
        map = /* @__PURE__ */ new Map();
        oldMap.set(p, map);
      }
    }
    map.set(path.at(-1), cb(map.get(path.at(-1))));
  }
  set(path, value) {
    this.change(path, () => value);
  }
  forEach(map) {
    const r = (n, m, path) => {
      if (n === 0) {
        map(path, m);
      } else {
        for (const [k, v] of m) r(n - 1, m, path.concat(k));
      }
    };
    for (const [n, map2] of this.maps) {
      r(n, map2, []);
    }
  }
  serialize() {
    const out = [];
    this.forEach((arr, v) => out.push([arr, v]));
    return out;
  }
  static fromSerialized(s) {
    const am = new _ArrayMap();
    for (const [k, v] of s) {
      am.set(k, v);
    }
    return am;
  }
};

// src/memo.ts
function memo(callback, serializeParams) {
  if (!serializeParams) serializeParams = (x) => x;
  const map = new ArrayMap();
  const fn = (...params) => {
    const serialized = serializeParams(params);
    let hasCached = map.has(serialized);
    if (hasCached) {
      return map.get(serialized);
    }
    const result = callback(...params);
    map.set(serialized, result);
    return result;
  };
  fn.invalidate = (...params) => {
    map.delete(serializeParams(params));
  };
  fn.getCache = () => map;
  return fn;
}
function memoWithTimedInvalidation(callback, lifetime, serializeParams) {
  const m = memo((...p) => {
    const res = callback(...p);
    setTimeout(
      () => {
        m.invalidate(...p);
      },
      lifetime(p, res)
    );
    return res;
  }, serializeParams);
  return m;
}
function lazy(callback) {
  let executed = false;
  let cached;
  return () => {
    if (!executed) {
      cached = callback();
      executed = true;
    }
    return cached;
  };
}
export {
  lazy,
  memo,
  memoWithTimedInvalidation
};
