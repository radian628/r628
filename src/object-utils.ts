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

export type NestedKeyOf<T, K> = K extends [infer K1, ...infer Kr]
  ? K1 extends keyof T
    ? NestedKeyOf<T[K1], Kr>
    : never
  : K extends []
    ? T
    : never;

type Last<Arr extends any[]> = Arr extends [infer Final]
  ? Final
  : Arr extends [infer Head, ...infer Tail]
    ? Last<Tail>
    : never;
