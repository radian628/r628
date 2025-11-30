// src/array-map.ts
var ArrayMap = class _ArrayMap {
  constructor() {
    this.maps = /* @__PURE__ */ new Map();
  }
  nthMap(n) {
    let map = this.maps.get(n);
    if (!map) {
      if (n !== 0) {
        map = /* @__PURE__ */ new Map();
        this.maps.set(n, map);
      } else {
        return void 0;
      }
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
function table(data, indexPaths, indexes, propFilterKeys, propFilterValues) {
  if (!data) data = /* @__PURE__ */ new Set();
  if (!indexes) indexes = new ArrayMap();
  if (!indexPaths) indexPaths = new ArrayMap();
  if (!propFilterKeys) propFilterKeys = [];
  if (!propFilterValues) propFilterValues = [];
  return {
    // @ts-expect-error
    filter: new Proxy(
      {},
      {
        get(target, prop, receiver) {
          return (v) => table(
            data,
            indexPaths,
            indexes,
            propFilterKeys.concat(prop),
            propFilterValues.concat(v)
          );
        }
      }
    ),
    get() {
      if (propFilterKeys.length === 0) {
        return [...data];
      }
      propFilterKeys = [...new Set(propFilterKeys)].sort();
      const indexPathExists = indexPaths.get(propFilterKeys);
      if (!indexPathExists) {
        for (const d of data) {
          const filter = propFilterKeys.flatMap((e) => [e, d[e]]);
          const set2 = indexes.change(
            filter,
            (s) => (s ?? /* @__PURE__ */ new Set()).add(d)
          );
        }
        indexPaths.set(propFilterKeys, true);
      }
      const fullFilter = propFilterKeys.flatMap((e, i) => [
        e,
        propFilterValues[i]
      ]);
      const set = indexes.get(fullFilter);
      return set ? [...set] : [];
    },
    getOne() {
      const data2 = this.get();
      if (data2.length !== 1)
        throw new Error(
          `Expected a single result. path=${propFilterKeys.join(
            ","
          )}, values=${propFilterValues.join(",")}`
        );
      return data2[0];
    },
    delete() {
      propFilterKeys = [...new Set(propFilterKeys)].sort();
      const toDelete = this.get();
      indexPaths.forEach((path, set) => {
        for (const d of toDelete) {
          const filter = path.flatMap((e) => [e, d[e]]);
          indexes.change(filter, (s) => (s?.delete(d), s ?? /* @__PURE__ */ new Set()));
        }
      });
      for (const d of toDelete) {
        data.delete(d);
      }
      return toDelete;
    },
    add(t) {
      propFilterKeys = [...new Set(propFilterKeys)].sort();
      indexPaths.forEach((path, set) => {
        const filter = path.flatMap((e) => [e, t[e]]);
        indexes.change(filter, (s) => (s ?? /* @__PURE__ */ new Set()).add(t));
      });
      data.add(t);
    },
    [Symbol.iterator]() {
      return this.get()[Symbol.iterator]();
    }
  };
}
function tableWithData(data) {
  const tbl = table();
  for (const d of data) {
    tbl.add(d);
  }
  return tbl;
}
export {
  ArrayMap,
  table,
  tableWithData
};
