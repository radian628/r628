// src/fp.ts
function multicast(fs) {
  return (...args) => fs.map((f) => f(...args));
}

// src/xray.ts
var xray = (a) => xrayInner(a, void 0, (x) => x);
function xrayMulticast(xrs) {
  return new Proxy(
    {},
    {
      get(target, prop, receiver) {
        const res = xrs.map((x) => x[prop]);
        if (prop === "$en") {
          return xrayMulticast(res);
        }
        if (prop === "$" || prop === "$s" || prop === "$ctx" || prop === "$e" || prop === "$ec" || prop === "$i" || prop === "$m" || prop === "$mx") {
          return (...args) => xrayMulticast(multicast(res)(...args));
        }
        return res;
      }
    }
  );
}
var xrayInner = (a, ctx, set) => new Proxy(
  {},
  {
    get(target, prop, receiver) {
      if (prop === "$v") {
        return set(a);
      } else if (prop === "$") {
        return (x) => xrayInner(a, ctx, () => set(x));
      } else if (prop === "$s") {
        return (cb) => xrayInner(a, ctx, () => set(cb(a, ctx)));
      } else if (prop === "$ctx") {
        return (cb) => xrayInner(a, cb(a, ctx), set);
      }
      if (Array.isArray(a)) {
        if (prop === "$e") {
          return xrayMulticast(a.map((e, i) => xrayInner(e, i, (x) => x)));
        } else if (prop === "$ec") {
        } else if (prop === "$en") {
          return xrayMulticast(
            a.map((e, i) => xrayInner(e, [...ctx ?? [], i], (x) => x))
          );
        } else if (prop === "$i") {
          return (p) => xrayInner(
            a[p],
            ctx,
            (x) => set(a.map((e, i) => i === p ? x : e))
          );
        }
      } else if (typeof a === "object" && a) {
        if (prop === "$m") {
          return (cb) => xrayInner(
            a,
            ctx,
            () => set({
              ...a,
              ...cb(a, ctx)
            })
          );
        } else if (prop === "$mx") {
        } else {
          return xrayInner(
            a[prop],
            ctx,
            (x) => set({
              ...a,
              [prop]: x
            })
          );
        }
      }
    }
  }
);
export {
  xray,
  xrayInner
};
