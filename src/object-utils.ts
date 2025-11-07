import { compose } from "./point-free";

export function mapObjKeys<K extends keyof any, V>(
  obj: Record<K, V>,
  callback: (k: K, v: V) => K
) {
  return mapObjEntries(obj, (k, v) => [callback(k, v), v]);
}

export function mapObjValues<K extends keyof any, V>(
  obj: Record<K, V>,
  callback: (k: K, v: V) => V
) {
  return mapObjEntries(obj, (k, v) => [k, callback(k, v)] as const);
}

export function mapObjEntries<K extends keyof any, V>(
  obj: Record<K, V>,
  callback: (k: K, v: V) => [K, V]
) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => callback(k as K, v as V))
  );
}

export function map2obj<K extends keyof any, V>(map: Map<K, V>): Record<K, V> {
  return Object.fromEntries(map.entries()) as Record<K, V>;
}

export function obj2map<R extends Record<any, any>>(
  r: R
): Map<keyof R, R[keyof R]> {
  return new Map(Object.entries(r));
}

export function mapMapEntries<K, V>(
  map: Map<K, V>,
  callback: (k: K, v: V) => [K, V]
) {
  return new Map([...map.entries()].map((e) => callback(...e)));
}

export function mapMapKeys<K, V>(map: Map<K, V>, callback: (k: K, v: V) => K) {
  return new Map([...map.entries()].map((e) => [callback(...e), e[1]]));
}

export function mapMapValues<K, V>(
  map: Map<K, V>,
  callback: (k: K, v: V) => V
) {
  return new Map([...map.entries()].map((e) => [e[0], callback(...e)]));
}

export function setDeep<T, KeyChain extends (keyof any)[]>(
  obj: T,
  path: KeyChain,
  value: NestedKeyOf<T, KeyChain>
): T {
  if (path.length === 0) return value;
  // @ts-expect-error
  const inner = setDeep(obj[path[0]], path.slice(1), value);
  if (Array.isArray(obj)) {
    // @ts-expect-error
    return obj.map((e, i) => (i === path[0] ? inner : e));
  }
  return {
    ...obj,
    [path[0]]: inner,
  };
}

export const ALL = Symbol("allKeys");

export function nestedMap<
  T,
  KeyChain extends (keyof any | (keyof any)[] | typeof ALL)[],
  U = NestedKeyOf<T, NestedMapKeyify<KeyChain>>,
>(
  obj: T,
  path: KeyChain,
  value: (...e: Reverse<KeyChainLayers<T, NestedMapKeyify<KeyChain>>>) => U
): SetNestedKey<T, NestedMapKeyify<KeyChain>, U> {
  function nestedMapInner(obj: any, path: any, value: any, segs: any): any {
    if (path.length === 0) return value(...segs);

    if (Array.isArray(path[0])) {
      if (Array.isArray(obj)) {
        const keys = new Set(path[0]);
        return obj.map((e, i) =>
          keys.has(i)
            ? nestedMapInner(e, path.slice(1), value, [[i, e], ...segs])
            : e
        );
      } else {
        const obj2 = { ...obj };
        for (const key of path[0]) {
          obj2[key] = nestedMapInner(obj[key], path.slice(1), value, [
            [key, obj[key]],
            ...segs,
          ]);
        }
        return obj2;
      }
    } else if (path[0] === ALL) {
      if (Array.isArray(obj)) {
        return obj.map((e, i) =>
          nestedMapInner(e, path.slice(1), value, [[i, e], ...segs])
        );
      } else {
        return Object.fromEntries(
          Object.entries(obj).map(([k, v]) => [
            k,
            nestedMapInner(v, path.slice(1), value, [[k, v], ...segs]),
          ])
        );
      }
    } else {
      const inner = nestedMapInner(obj[path[0]], path.slice(1), value, [
        [path[0], obj],
        ...segs,
      ]);
      if (Array.isArray(obj)) {
        return obj.map((e, i) => (i === path[0] ? inner : e));
      }
      return {
        ...obj,
        [path[0]]: inner,
      };
    }
  }

  return nestedMapInner(obj, path, value, []);
}

const _ALL = Symbol("all2");

export type NestedMapKeyifySingle<T> = T extends typeof ALL
  ? typeof _ALL
  : T extends keyof any
    ? T
    : T extends (infer E)[]
      ? E
      : never;

export type NestedMapKeyify<T> = T extends [infer F, ...infer R]
  ? [NestedMapKeyifySingle<F>, ...NestedMapKeyify<R>]
  : [];

type HAK<Obj, K> = K extends typeof _ALL ? keyof Obj : K;
type HAKSelect<Obj, K> = K extends keyof Obj
  ? Obj[K]
  : K extends typeof _ALL
    ? Obj extends any[]
      ? number
      : Obj[keyof Obj]
    : never;

export type KeyChainLayers<T, K> = K extends [infer K1, ...infer Kr]
  ? K1 extends keyof T | typeof _ALL
    ? [[HAK<T, K1>, HAKSelect<T, K1>], ...KeyChainLayers<HAKSelect<T, K1>, Kr>]
    : never
  : K extends []
    ? []
    : never;

export type Reverse<A extends any[]> = A extends [infer F, ...infer R]
  ? [...Reverse<R>, F]
  : [];

export type SetNestedKey<T, K, U> = K extends [infer K1, ...infer Kr]
  ? K1 extends keyof T | typeof _ALL
    ? [K1, T] extends [typeof _ALL, (infer E)[]]
      ? SetNestedKey<E, Kr, U>[]
      : Omit<T, HAK<T, K1>> & {
          [key in K1]: SetNestedKey<HAKSelect<T, K1>, Kr, U>;
        }
    : never
  : K extends []
    ? U
    : never;

export type NestedKeyOf<T, K> = K extends [infer K1, ...infer Kr]
  ? K1 extends keyof T | typeof _ALL
    ? NestedKeyOf<HAKSelect<T, K1>, Kr>
    : never
  : K extends []
    ? T
    : never;
