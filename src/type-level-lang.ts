import { TypeLevelError } from "./typelevel";

type Exec<Data, Instr> =
  // access field of structure
  Instr extends {
    type: "field";
    field: infer Field extends keyof Data;
    next?: infer Next;
  }
    ? Exec<Data[Field], Next>
    : // add field to structure
      Instr extends {
          type: "add-field";
          key: infer Key extends keyof any;
          value: infer Value;
          next?: infer Next;
        }
      ? Exec<
          Data & {
            [K in Key]: Exec<K, Value>;
          },
          Next
        >
      : // generate value
        Instr extends {
            type: "value";
            value: infer Value;
            next?: infer Next;
          }
        ? Exec<Value, Next>
        : Instr extends {
              type: "array-append";
              next?: infer Next;
            }
          ? Data extends [any[], any]
            ? Exec<[...Data[0], Data[1]], Next>
            : TypeLevelError<
                ["array-append parameter must be an array but received", Data]
              >
          : Instr extends {
                type: "string-append";
                next?: infer Next;
              }
            ? Data extends [string, string]
              ? Exec<`${Data[0]}${Data[1]}`, Next>
              : TypeLevelError<
                  [
                    "string-append parameters must be strings but received",
                    Data,
                  ]
                >
            : Instr extends {
                  type: "cons";
                  a: infer A;
                  b: infer B;
                  next?: infer Next;
                }
              ? Exec<[Exec<Data, A>, Exec<Data, B>], Next>
              : Instr extends {
                    type: "reduce";
                    callback: infer Cb;
                    prev: infer Prev;
                    next?: infer Next;
                  }
                ? Data extends any[]
                  ? Data extends [...infer First, ...infer Rest extends any[]]
                    ? Exec<[Prev, First], Cb>
                    : Exec<Data, Next>
                  : TypeLevelError<
                      ["Cannot reduce a non-array type. Received", Data]
                    >
                : Instr extends unknown
                  ? Data
                  : TypeLevelError<["Unrecognized Instruction", Instr]>;

type Vector = Exec<
  undefined,
  {
    type: "value";
    value: {};
    next: {
      type: "add-field";
      key: "x";
      value: {
        type: "value";
        value: number;
      };
      next: {
        type: "add-field";
        key: "y";
        value: {
          type: "value";
          value: number;
        };
      };
    };
  }
>;

const m = (a: any[], f: (a: any) => any) =>
  a.reduce((p, c) => [...p, f(c)], []);

type SKDJFH = Exec<
  ["a", "b", "c"],
  {
    type: "reduce";
    callback: {
      type: "string-append";
    };
    prev: "";
  }
>;

type ReduceArray<Arr extends any[], Fn, Prev> = Arr extends [
  infer First,
  ...infer Rest,
]
  ? ReduceArray<Rest, Fn, Exec<[Prev, First], Fn>>
  : Prev;

type MapArray<Arr extends any[], Fn> = ReduceArray<
  Arr,
  {
    type: "cons";
    a: {
      type: "field";
      field: 0;
    };
    b: {
      type: "field";
      field: 1;
      next: Fn;
    };
    next: {
      type: "array-append";
    };
  },
  []
>;

type Test = MapArray<[1, 2, 3], { type: "value"; value: 4 }>;
type Test2 = ReduceArray<[[1], [2], [3]], { type: "value"; value: 4 }, []>;
type Test3 = ReduceArray<
  [1, 2, 3],
  {
    type: "cons";
    a: {
      type: "field";
      field: 0;
    };
    b: {
      type: "value";
      value: 5;
    };
    next: {
      type: "array-append";
    };
  },
  []
>;

type Greet = MapArray<
  ["world", "mom", "dad"],
  {
    type: "cons";
    a: {
      type: "value";
      value: "hello, ";
    };
    b: unknown;
    next: {
      type: "string-append";
    };
  }
>;

// type ALSKJDF = Exec<["a", "b", "c"], { type: "field", field: 1 }>
