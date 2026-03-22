import { ArrayMap } from "./array-map.js";

export function memo<Params extends any[], RetType>(
  callback: (...params: Params) => RetType,
  serializeParams?: (p: Params) => any[],
) {
  if (!serializeParams) serializeParams = (x) => x;
  const map = new ArrayMap<any, RetType>();

  const fn = (...params: Params) => {
    const serialized = serializeParams(params);
    let hasCached = map.has(serialized);
    if (hasCached) {
      return map.get(serialized)!;
    }
    const result = callback(...params);
    map.set(serialized, result);
    return result;
  };

  fn.invalidate = (...params: Params) => {
    map.delete(serializeParams(params));
  };
  fn.getCache = () => map;

  return fn;
}

export function memoWithTimedInvalidation<Params extends any[], RetType>(
  callback: (...params: Params) => RetType,
  lifetime: (params: Params, ret: RetType) => number,
  serializeParams?: (p: Params) => any[],
) {
  const m = memo<Params, RetType>((...p) => {
    const res = callback(...p);
    setTimeout(
      () => {
        m.invalidate(...p);
      },
      lifetime(p, res),
    );
    return res;
  }, serializeParams);
  return m;
}

export function lazy<T>(callback: () => T): () => T {
  let executed = false;
  let cached: T;
  return () => {
    if (!executed) {
      cached = callback();
      executed = true;
    }
    return cached;
  };
}

export function deepEqual(a: any, b: any): boolean {
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((_, i) => deepEqual(a[i], b[i]));
  }
  if (typeof a === "object") {
    if (typeof b !== "object") return false;
    return deepEqual(Object.entries(a), Object.entries(b));
  }
  return a === b;
}

export function memoOnce<Params extends any[], RetType>(
  callback: (...params: Params) => RetType,
  equal?: (a: Params, b: Params) => boolean,
) {
  if (!equal) equal = (a: any[], b: any[]) => a.every((e, i) => e === b[i]);

  let initialized = false;
  let lastRet: RetType | undefined;
  let lastParams: Params | undefined;

  const fn = (...params: Params): RetType => {
    if (initialized && equal(params, lastParams as Params)) {
      return lastRet as RetType;
    }
    initialized = true;
    const ret = callback(...params);
    lastRet = ret;
    lastParams = params;
    return ret;
  };

  return fn;
}
