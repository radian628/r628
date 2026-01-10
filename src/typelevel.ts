export type TypeLevelError<T> = {
  _brand: "TYPE-LEVEL ERROR:";
  msg: T;
};

export type FromEntries<Arr> = Arr extends [
  [infer K extends keyof any, infer V],
  ...infer Rest,
]
  ? { [_ in K]: V } & FromEntries<Rest>
  : Arr extends []
    ? {}
    : TypeLevelError<["Expected k-v pair array; received", Arr]>;

export type Eq<A, B> = [A, B] extends [B, A] ? true : false;

export type All<Bools extends boolean[]> = Bools extends [
  true,
  ...infer Rest extends boolean[],
]
  ? All<Rest>
  : Bools extends [false, ...boolean[]]
    ? false
    : true;

export type Any<Bools extends boolean[]> = Bools extends [
  false,
  ...infer Rest extends boolean[],
]
  ? Any<Rest>
  : Bools extends [true, ...boolean[]]
    ? true
    : false;

export type AllEq<As extends any[], Bs extends any[]> =
  Eq<As["length"], Bs["length"]> extends true
    ? All<{
        [N in keyof As]: Eq<As[N], Bs[N & keyof Bs]>;
      }>
    : false;

export type OneLayerFlatten<A extends any[][]> = A extends [
  ...infer Init extends any[],
  infer Rest extends any[][],
]
  ? [...Init, ...OneLayerFlatten<Rest>]
  : [];

type LL = {
  next?: LL;
  data: any;
};

export type LinkedList<T> = {
  next?: LinkedList<T>;
  data: T;
};

export type ListAppend<List extends LL, T> = List extends undefined
  ? {
      data: T;
    }
  : List extends {
        next: LL;
      }
    ? {
        data: List["data"];
        next: ListAppend<List["next"], T>;
      }
    : {
        data: List["data"];
        next: ListAppend<undefined, T>;
      };

export type ListTail<List extends LL> = List extends {
  data: infer Data;
}
  ? Data
  : ListTail<List["next"]>;

type WIOERUT = ListAppend<ListAppend<ListAppend<undefined, 1>, 2>, 3>;

export type ArrayPrepend<Arr extends any[], A> = [A, ...Arr];

export type ArrayTail<Arr extends any[]> = Arr extends [...any[], infer Last]
  ? Last
  : never;
