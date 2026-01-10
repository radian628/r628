import { TypeLevelError } from "./typelevel";

type NumInner<N extends number, A extends any[]> = [A["length"], N] extends [
  N,
  A["length"],
]
  ? A
  : NumInner<N, [...A, null]>;
type Num<N extends number> = NumInner<N, []>;

type Add<A extends any[], B extends any[]> = [...A, ...B];

type Dec<A> = A extends [any, ...infer Rest extends any[]]
  ? Rest
  : TypeLevelError<["Cannot go below zero."]>;

type FlatOne<A> = A extends [infer First extends any[], ...infer Rest]
  ? [...First, ...FlatOne<Rest>]
  : A extends []
    ? []
    : [TypeLevelError<["Unable to flatten", A]>];

type Mul<A extends any[], B extends any[]> = FlatOne<{
  [K in keyof A]: B;
}>;

type Six = Mul<Num<2>, Num<3>>;

type SixtyNine = Mul<Num<23>, Num<3>>;
