type Key = string | symbol;

function setDeep(obj: any, path: Key[], value: string) {
  if (path.length === 0) return value;
  return {
    ...obj,
    [path[0]]: setDeep(obj[path[0]], path.slice(1), value),
  };
}

function getDeep(obj: any, path: Key[]) {
  if (path.length === 0) return obj;
  return getDeep(obj[path[0]], path.slice(1));
}

type NestedKeyOf<T, K> = K extends [infer K1, ...infer Kr]
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

type LensObject<Stk extends any[]> = {
  
};

export function lensInner<Stk extends any[]>(s: Stk, path: Key[] = []) {
  return new Proxy(
    {},
    {
      get(target, prop, receiver) {
        // basic setter
        if (prop === "$") {
          return (v) => setDeep(s.at(-1), path, v);

          // "push stack"
        } else if (prop === "$push") {
          return lensInner([...s, getDeep(s.at(-1), path)], []);

          // "pop stack"
        } else if (prop === "$pop") {
          return lensInner(s.slice(0, -1), []);

          // generic property getter
        } else {
          return lensInner(s.at(-1), [...path, prop]);
        }
      },
    }
  );
}

export function lens<T>(t: T) {
  return lensInner([t], []);
}
