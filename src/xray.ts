type Last<Arr extends any[]> = Arr extends [infer Final]
  ? Final
  : Arr extends [infer Head, ...infer Tail]
    ? Last<Tail>
    : never;

type First<Arr extends any[]> = Arr extends [infer Head, ...infer Tail]
  ? Head
  : never;

type WithoutLast<Arr extends any[]> = Arr extends [infer Final]
  ? []
  : Arr extends [infer Head, ...infer Tail]
    ? [Head, WithoutLast<Tail>]
    : never;

type NestedModification<Obj, Chain, Value> = Chain extends [
  infer K,
  ...infer Kr,
]
  ? Obj extends (infer Elem)[]
    ? [K, number] extends [number, K]
      ? NestedModification<Elem, Kr, Value>
      : NestedModification<Elem, Kr, Value> | Elem
    : {
        [Key in keyof Obj]: Key extends K
          ? NestedModification<Obj[Key], Kr, Value>
          : Obj[Key];
      }
  : Value;

type NestedModKey = string | number | symbol;

type XRay<Root, Access, Context, Chain extends NestedModKey[]> =
  // xray methods
  {
    $v: Root;
    $: <T>(a: T) => XRay<NestedModification<Root, Chain, T>, T, Context, Chain>;
    $s: <T>(
      fn: (a: Access, c: Context) => T
    ) => XRay<NestedModification<Root, Chain, T>, T, Context, Chain>;
    $ctx: <T>(fn: (a: Access, s: Context) => T) => XRay<Root, Access, T, Chain>;
  } &
    // array-specific xray methods
    (Access extends (infer Elem)[]
      ? {
          $ec: <T>(
            fn: (i: number, c: Context) => number
          ) => XRay<Root, Elem, T, [...Chain, number]>;
          $e: XRay<Root, Elem, number, [...Chain, number]>;
        }
      : {}) &
    // object-specific xray methods
    (Access extends Record<infer K, infer V>
      ? {
          [K in keyof Access]: XRay<Root, Access[K], Context, [...Chain, K]>;
        } & {
          $m: <
            T extends {
              [K in keyof Access]?: (
                e: XRay<Root, Access[K], Context, [...Chain, K]>
              ) => XRay<any, any, any, any[]>;
            },
          >(
            a: T
          ) => XRay<
            Omit<Root, keyof T> & {
              [K in keyof T]: T[K] extends (
                ...p: any[]
              ) => XRay<infer R2, infer A2, any, any[]>
                ? A2
                : never;
            },
            Access,
            Context,
            Chain
          >;
        }
      : {});

const dummy = {
  a: {
    b: [2, 3, 4],
  },
  c: true,
  fuck: "shit",
};

let asd = undefined as unknown as XRay<
  typeof dummy,
  typeof dummy,
  undefined,
  []
>;

// export const xr: <R, A, C, Ch extends NestedModKey[]>() => ((
//   x: XRay<R, A, C, Ch>
// ) => XRay<R, A, C, Ch>) &
//   XRay<R, A, C, Ch> = undefined;

const test2 = asd.c.$([4, 5]).$v;

const test3 = asd.$m({
  fuck: (e) => e.$(69),
  c: (e) => e.$(420),
}).$v;
