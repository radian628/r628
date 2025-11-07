// src/object-utils.ts
function mapObjKeys(obj, callback) {
  return mapObjEntries(obj, (k, v) => [callback(k, v), v]);
}
function mapObjValues(obj, callback) {
  return mapObjEntries(obj, (k, v) => [k, callback(k, v)]);
}
function mapObjEntries(obj, callback) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => callback(k, v))
  );
}
function map2obj(map) {
  return Object.fromEntries(map.entries());
}
function obj2map(r) {
  return new Map(Object.entries(r));
}
function mapMapEntries(map, callback) {
  return new Map([...map.entries()].map((e) => callback(...e)));
}
function mapMapKeys(map, callback) {
  return new Map([...map.entries()].map((e) => [callback(...e), e[1]]));
}
function mapMapValues(map, callback) {
  return new Map([...map.entries()].map((e) => [e[0], callback(...e)]));
}
function setDeep(obj, path, value) {
  if (path.length === 0) return value;
  const inner = setDeep(obj[path[0]], path.slice(1), value);
  if (Array.isArray(obj)) {
    return obj.map((e, i) => i === path[0] ? inner : e);
  }
  return {
    ...obj,
    [path[0]]: inner
  };
}
var ALL = Symbol("allKeys");
function nestedMap(obj, path, value) {
  function nestedMapInner(obj2, path2, value2, segs) {
    if (path2.length === 0) return value2(...segs);
    if (Array.isArray(path2[0])) {
      if (Array.isArray(obj2)) {
        const keys = new Set(path2[0]);
        return obj2.map(
          (e, i) => keys.has(i) ? nestedMapInner(e, path2.slice(1), value2, [[i, e], ...segs]) : e
        );
      } else {
        const obj22 = { ...obj2 };
        for (const key of path2[0]) {
          obj22[key] = nestedMapInner(obj2[key], path2.slice(1), value2, [
            [key, obj2[key]],
            ...segs
          ]);
        }
        return obj22;
      }
    } else if (path2[0] === ALL) {
      if (Array.isArray(obj2)) {
        return obj2.map(
          (e, i) => nestedMapInner(e, path2.slice(1), value2, [[i, e], ...segs])
        );
      } else {
        return Object.fromEntries(
          Object.entries(obj2).map(([k, v]) => [
            k,
            nestedMapInner(v, path2.slice(1), value2, [[k, v], ...segs])
          ])
        );
      }
    } else {
      const inner = nestedMapInner(obj2[path2[0]], path2.slice(1), value2, [
        [path2[0], obj2],
        ...segs
      ]);
      if (Array.isArray(obj2)) {
        return obj2.map((e, i) => i === path2[0] ? inner : e);
      }
      return {
        ...obj2,
        [path2[0]]: inner
      };
    }
  }
  return nestedMapInner(obj, path, value, []);
}
var _ALL = Symbol("all2");
export {
  ALL,
  map2obj,
  mapMapEntries,
  mapMapKeys,
  mapMapValues,
  mapObjEntries,
  mapObjKeys,
  mapObjValues,
  nestedMap,
  obj2map,
  setDeep
};
