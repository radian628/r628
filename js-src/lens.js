// src/lens.ts
function setDeep(obj, path, value) {
  if (path.length === 0) return value;
  return {
    ...obj,
    [path[0]]: setDeep(obj[path[0]], path.slice(1), value)
  };
}
function getDeep(obj, path) {
  if (path.length === 0) return obj;
  return getDeep(obj[path[0]], path.slice(1));
}
function lensInner(s, path = []) {
  return new Proxy(
    {},
    {
      get(target, prop, receiver) {
        if (prop === "$") {
          return (v) => setDeep(s.at(-1), path, v);
        } else if (prop === "$push") {
          return lensInner([...s, getDeep(s.at(-1), path)], []);
        } else if (prop === "$pop") {
          return lensInner(s.slice(0, -1), []);
        } else {
          return lensInner(s.at(-1), [...path, prop]);
        }
      }
    }
  );
}
function lens(t) {
  return lensInner([t], []);
}
export {
  lens,
  lensInner
};
