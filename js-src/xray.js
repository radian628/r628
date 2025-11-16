// src/xray.ts
var xray = (a) => xrayInner(a, (x) => x);
var xrayInner = (a, set) => new Proxy(
  {},
  {
    get(target, prop, receiver) {
      if (prop === "$v") {
        return set(a);
      } else if (prop === "$") {
      } else if (prop === "$s") {
      } else if (prop === "$ctx") {
      }
      if (Array.isArray(a)) {
        if (prop === "$e") {
        } else if (prop === "$ec") {
        }
      } else if (typeof a === "object" && a) {
        if (prop === "$m") {
        } else if (prop === "$mx") {
        } else {
        }
      }
    }
  }
);
export {
  xray,
  xrayInner
};
