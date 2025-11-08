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

type XRayWithModification<
  InitRoot,
  Root,
  NewAccess,
  Context,
  Chain extends NestedModKey[],
> = XRay<
  InitRoot,
  NestedModification<Root, Chain, NewAccess>,
  NewAccess,
  Context,
  Chain
>;

type XRay<InitRoot, Root, Access, Context, Chain extends NestedModKey[]> =
  // xray methods
  {
    $v: Root;
    $: <T>(
      a: T
    ) => XRay<InitRoot, NestedModification<Root, Chain, T>, T, Context, Chain>;
    $s: <T>(
      fn: (a: Access, c: Context) => T
    ) => XRay<InitRoot, NestedModification<Root, Chain, T>, T, Context, Chain>;
    $ctx: <T>(
      fn: (a: Access, s: Context) => T
    ) => XRay<InitRoot, Root, Access, T, Chain>;
  } &
    // array-specific xray methods
    (Access extends (infer Elem)[]
      ? {
          $ec: <T>(
            fn: (i: number, c: Context) => number
          ) => XRay<InitRoot, Root, Elem, T, [...Chain, number]>;
          $e: XRay<InitRoot, Root, Elem, number, [...Chain, number]>;
        }
      : {}) &
    // object-specific xray methods
    (Access extends Record<infer K, infer V>
      ? {
          [K in keyof Access]: XRay<
            InitRoot,
            Root,
            Access[K],
            Context,
            [...Chain, K]
          >;
        } & {
          $m: <T extends Record<any, any>>(
            cb: (a: Access) => T
          ) => XRayWithModification<
            InitRoot,
            Root,
            Omit<Access, keyof T> & T,
            Context,
            Chain
          >;

          $mx: <T extends Record<any, XRay<any, any, any, any, any>>>(
            cb: (t: {
              [K in keyof Access]: XRay<
                Access[K],
                Access[K],
                Access[K],
                Context,
                [...Chain, K]
              >;
            }) => T
          ) => XRayWithModification<
            InitRoot,
            Root,
            Omit<Access, keyof T> & {
              [K in keyof T]: T[K] extends XRay<any, infer Root, any, any, any>
                ? Root
                : never;
            },
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
  typeof dummy,
  undefined,
  []
>;

export const xray = <A>(a: A): XRay<A, A, A, undefined, []> =>
  undefined as unknown as XRay<A, A, A, undefined, []>;

// export const xr: <R, A, C, Ch extends NestedModKey[]>() => ((
//   x: XRay<R, A, C, Ch>
// ) => XRay<R, A, C, Ch>) &
//   XRay<R, A, C, Ch> = undefined;

const id: <T>(t: T) => T = (x) => x;

const test2 = asd.c.$([4, 5]);

const test3 = asd.$m((x) => ({
  fuck: ["penis"],
  cunt: 3,
})).$v.cunt;

const test4 = asd.$mx((o) => ({
  fuck: o.fuck.$(["penis"]),
  cunt: xray(3),
})).$v.fuck;

// const test5 = asd.$f //
//   .fuck((f) => f.$(["penis"])) //
//   .$nf.cunt(() => x(3)).$v; //
