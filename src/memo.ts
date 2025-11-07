import { ArrayMap } from "./array-map.js";

export function memo<Params extends any[], RetType>(
  callback: (...params: Params) => RetType,
  serializeParams?: (p: Params) => any[]
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
  serializeParams?: (p: Params) => any[]
) {
  const m = memo<Params, RetType>((...p) => {
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
