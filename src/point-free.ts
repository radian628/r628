import { TypeLevelError } from "./typelevel";

export type ComposeWith<
  F1 extends (args: any) => any,
  Fr extends ((args: any) => any)[],
> = Fr extends [
  infer F2 extends (args: any) => any,
  ...infer Fr2 extends ((args: any) => any)[],
]
  ? ReturnType<F1> extends Parameters<F2>[0]
    ? ComposeWith<(args: Parameters<F1>[0]) => ReturnType<F2>, Fr2>
    : TypeLevelError<
        ["Type", ReturnType<F1>, "is not assignable to", Parameters<F2>[0]]
      >
  : F1;

export type ComposeMany<T extends ((args: any) => any)[]> = T extends [
  infer F extends (args: any) => any,
  ...infer Fr extends ((args: any) => any)[],
]
  ? ComposeWith<F, Fr>
  : TypeLevelError<"Cannot compose an empty sequence of functions.">;

export function compose<Fs extends ((args: any) => any)[]>(
  ...args: Fs
): ComposeMany<Fs> {
  return ((x: any) => {
    for (const a of args) x = a(x);
    return x;
  }) as ComposeMany<Fs>;
}

export type Mutation =
  | {
      type: "fields";
      fields: Record<keyof any, Mutation>;
    }
  | {
      type: "map";
      next?: Mutation;
    }
  | {
      type: "tuple";
      index: number;
      next?: Mutation;
    }
  | {
      type: "replace";
      with: any;
    };

export type GetTupleEntry<T extends any[], N extends number> = N extends 0
  ? T extends [infer A, ...infer R]
    ? A
    : undefined
  : N extends 1
    ? T extends [infer A, infer B, ...infer R]
      ? B
      : undefined
    : N extends 2
      ? T extends [infer A, infer B, infer C, ...infer R]
        ? C
        : undefined
      : N extends 3
        ? T extends [infer A, infer B, infer C, infer D, ...infer R]
          ? D
          : undefined
        : T extends (infer Elem)[]
          ? Elem
          : never;

export type SetTupleEntry<T extends any[], N extends number, U> = N extends 0
  ? T extends [infer A, ...infer R]
    ? [U, ...R]
    : undefined
  : N extends 1
    ? T extends [infer A, infer B, ...infer R]
      ? [A, U, ...R]
      : undefined
    : N extends 2
      ? T extends [infer A, infer B, infer C, ...infer R]
        ? [A, B, U, ...R]
        : undefined
      : N extends 3
        ? T extends [infer A, infer B, infer C, infer D, ...infer R]
          ? [A, B, C, U, ...R]
          : undefined
        : T extends (infer Elem)[]
          ? Elem
          : never;

export type WithMutation<
  T extends any,
  M extends Mutation | undefined,
> = M extends undefined
  ? T
  : M extends { type: "fields"; fields: infer F extends Record<any, any> }
    ? T extends {}
      ? Omit<T, keyof F> & {
          [Fld in keyof F]: WithMutation<
            Fld extends keyof T ? T[Fld] : undefined,
            F[Fld]
          >;
        }
      : TypeLevelError<["Cannot access field of type", T]>
    : M extends { type: "map" }
      ? T extends (infer Elem)[]
        ? WithMutation<Elem, M["next"]>[]
        : TypeLevelError<["Cannot map over array indices in non-array type", T]>
      : M extends { type: "tuple"; index: infer N extends number }
        ? T extends any[]
          ? SetTupleEntry<T, N, WithMutation<GetTupleEntry<T, N>, M["next"]>>
          : TypeLevelError<[]>
        : M extends { type: "replace"; with: infer R }
          ? R
          : TypeLevelError<["Unrecognized mutation", M]>;

type TEST = WithMutation<
  {
    a: 3;
    b: [2, 4, 6];
  },
  {
    type: "fields";
    fields: {
      a: {
        type: "replace";
        with: 4;
      };
      b: {
        type: "tuple";
        index: 1;
        next: { type: "replace"; with: string };
      };
      c: {
        type: "replace";
        with: 69;
      };
    };
  }
>;
