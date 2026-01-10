import {
  ParseLibLisp,
  ParseLisp,
  ToTLLLib,
  ToTLLTree,
} from "./type-level-parser";
import { TypeLevelError } from "./typelevel";

// type SDSF = {a :1 , b:2} extends { [K in "a"]: any } ? 1 : 0

type StackFrame = {
  type: "eager" | "lazy";
  data: Record<any, any>;
};

type Stack = StackFrame[];

type StackGet<
  Stk extends Stack,
  V extends keyof any,
  OgCallStack = Stk,
> = Stk extends [
  infer Frame extends StackFrame,
  ...infer Rest extends StackFrame[],
]
  ? Frame extends {
      type: infer T extends "eager" | "lazy";
      data: infer Data extends { [K in V]: any };
    }
    ? T extends "eager"
      ? Data[V]
      : Run<Data[V], Stk>
    : StackGet<Rest, V, OgCallStack>
  : TypeLevelError<
      ["Variable does not exist, ", V, ".", "Call stack:", OgCallStack]
    >;

type SplitString<Str> = Str extends `${infer A}${infer Rest}`
  ? [A, ...SplitString<Rest>]
  : [];

type ArrayMap<A, Stk extends Stack, Fn> = A extends [infer First, ...infer Rest]
  ? [Run<Call<Lit<Fn>, Lit<First>>, Stk>, ...ArrayMap<Rest, Stk, Fn>]
  : [];

type GetFieldIfObj<Obj, Field> = [Obj, Field] extends [
  infer Obj2 extends Object,
  infer Field2 extends keyof Obj,
]
  ? Obj[Field2]
  : TypeLevelError<
      [
        "Expected ",
        Obj,
        "to be an object and",
        Field,
        "to be one of its fields",
      ]
    >;

type Intersection<A, B> = Omit<A, keyof B> & B;

type ObjectWithField<K, V> = K extends keyof any
  ? { [K2 in K]: V }
  : TypeLevelError<["Expected", K, "to be a valid key."]>;

type FirstEntry<P> = P extends [infer F, ...infer Rest] ? F : never;
type SecondEntry<P> = P extends [any, infer S, ...infer Rest] ? S : never;

type PairsToEntries<O> = {
  [K in keyof O as FirstEntry<O[K]> extends keyof any
    ? FirstEntry<O[K]>
    : never]: SecondEntry<O[K]>;
};

type ObjectMap<F, O, Stk extends Stack> = PairsToEntries<{
  [K in keyof O]: Run<Call<Call<Lit<F>, Lit<K>>, Lit<O[K]>>, Stk>;
}>;

type RunList<Exprs, Stk extends Stack> = Exprs extends [
  infer First,
  ...infer Rest,
]
  ? [Run<First, Stk>, ...RunList<Rest, Stk>]
  : [];

export type Run<Expr, Stk extends Stack> =
  // concat two strings
  Expr extends {
    type: "str-append";
  }
    ? [StackGet<Stk, "a", Stk>, StackGet<Stk, "b", Stk>] extends [
        infer S1 extends string,
        infer S2 extends string,
      ]
      ? `${S1}${S2}`
      : TypeLevelError<
          [
            "Expected two strings; got ",
            StackGet<Stk, "a", Stk>,
            "and",
            StackGet<Stk, "b", Stk>,
            "Call stack:",
            Stk,
          ]
        >
    : // "let" binding
      Expr extends {
          type: "let";
          bindings: infer Bindings extends Record<any, any>;
          body: infer Body;
        }
      ? Run<
          Body,
          [
            {
              type: "eager";
              data: {
                [B in keyof Bindings]: Run<Bindings[B], Stk>;
              };
            },
            ...Stk,
          ]
        >
      : Expr extends {
            type: "lazy-let";
            bindings: infer Bindings extends Record<any, any>;
            body: infer Body;
          }
        ? Run<
            Body,
            [
              {
                type: "lazy";
                data: Bindings;
              },
              ...Stk,
            ]
          >
        : // literal value
          Expr extends {
              type: "literal";
              value: infer Value;
            }
          ? Value
          : // define a function w/ closure scope
            Expr extends {
                type: "defun";
                body: infer Body;
                argname: infer Argname;
              }
            ? {
                body: Body;
                argname: Argname;
                stack: Stk;
              }
            : // access a variable
              Expr extends {
                  type: "get";
                  binding: infer B extends keyof any;
                }
              ? StackGet<Stk, B, Stk>
              : // call a function
                Expr extends {
                    type: "call";
                    fn: infer Fn extends any;
                    arg: infer Arg extends any;
                  }
                ? Fn extends {
                    body: infer Body;
                    argname: infer Argname extends keyof any;
                    stack: infer Stk2 extends Stack;
                  }
                  ? Run<
                      Body,
                      [
                        {
                          type: "eager";
                          data: { [A in Argname]: Run<Arg, Stk> };
                        },
                        ...Stk2,
                      ]
                    >
                  : Run<Fn, Stk> extends {
                        body: infer Body;
                        argname: infer Argname extends keyof any;
                        stack: infer Stk2 extends Stack;
                      }
                    ? Run<
                        Body,
                        [
                          {
                            type: "eager";
                            data: { [A in Argname]: Run<Arg, Stk> };
                          },
                          ...Stk2,
                        ]
                      >
                    : TypeLevelError<["Expected function, received ", Fn]>
                : // recurse (f, cond, in)
                  Expr extends {
                      type: "recurse";
                    }
                  ? Run<
                      Call<
                        Lit<StackGet<Stk, "cond">>,
                        Lit<StackGet<Stk, "in", Stk>>
                      >,
                      Stk
                    > extends true
                    ? Run<
                        Expr,
                        [
                          {
                            type: "eager";
                            data: {
                              in: Run<
                                Call<
                                  Lit<StackGet<Stk, "f">>,
                                  Lit<StackGet<Stk, "in">>
                                >,
                                Stk
                              >;
                            };
                          },
                          ...Stk,
                        ]
                      >
                    : StackGet<Stk, "in">
                  : // head of array
                    Expr extends {
                        type: "head";
                      }
                    ? StackGet<Stk, "a"> extends [infer First, ...infer Rest]
                      ? First
                      : TypeLevelError<
                          ["Cannot get head of:", StackGet<Stk, "a">]
                        >
                    : // tail of array
                      Expr extends {
                          type: "tail";
                        }
                      ? StackGet<Stk, "a"> extends [infer First, ...infer Rest]
                        ? Rest
                        : TypeLevelError<
                            ["Cannot get tail of:", StackGet<Stk, "a">]
                          >
                      : // is array empty
                        Expr extends {
                            type: "isempty";
                          }
                        ? StackGet<Stk, "a"> extends []
                          ? true
                          : false
                        : // if/else
                          Expr extends {
                              type: "if";
                            }
                          ? StackGet<Stk, "cond"> extends true
                            ? StackGet<Stk, "true">
                            : StackGet<Stk, "false">
                          : // append
                            Expr extends {
                                type: "append";
                              }
                            ? StackGet<Stk, "a"> extends any[]
                              ? [...StackGet<Stk, "a">, StackGet<Stk, "b">]
                              : TypeLevelError<
                                  [
                                    "expected array; received",
                                    StackGet<Stk, "b">,
                                  ]
                                >
                            : // wrap in array
                              Expr extends {
                                  type: "arrayify";
                                }
                              ? [StackGet<Stk, "a">]
                              : // split string into array
                                Expr extends {
                                    type: "split-str";
                                  }
                                ? SplitString<StackGet<Stk, "a">>
                                : Expr extends {
                                      type: "eq";
                                    }
                                  ? [
                                      StackGet<Stk, "a">,
                                      StackGet<Stk, "b">,
                                    ] extends [
                                      StackGet<Stk, "b">,
                                      StackGet<Stk, "a">,
                                    ]
                                    ? true
                                    : false
                                  : // array map
                                    Expr extends {
                                        type: "array-map";
                                      }
                                    ? ArrayMap<
                                        StackGet<Stk, "a">,
                                        Stk,
                                        StackGet<Stk, "f">
                                      >
                                    : // get obj field
                                      Expr extends {
                                          type: "get-field";
                                        }
                                      ? GetFieldIfObj<
                                          StackGet<Stk, "obj">,
                                          StackGet<Stk, "field">
                                        >
                                      : // obj union
                                        Expr extends {
                                            type: "union";
                                          }
                                        ?
                                            | StackGet<Stk, "a">
                                            | StackGet<Stk, "b">
                                        : // stymmetric intersection
                                          Expr extends {
                                              type: "symmetric-intersection";
                                            }
                                          ? StackGet<Stk, "a"> &
                                              StackGet<Stk, "b">
                                          : // intersection, prioritizing b
                                            Expr extends {
                                                type: "intersection";
                                              }
                                            ? Intersection<
                                                StackGet<Stk, "a">,
                                                StackGet<Stk, "b">
                                              >
                                            : // create object with single field
                                              Expr extends {
                                                  type: "obj-with-field";
                                                }
                                              ? ObjectWithField<
                                                  StackGet<Stk, "k">,
                                                  StackGet<Stk, "v">
                                                >
                                              : // map over all object entries
                                                Expr extends {
                                                    type: "object-map";
                                                  }
                                                ? ObjectMap<
                                                    StackGet<Stk, "f">,
                                                    StackGet<Stk, "o">,
                                                    Stk
                                                  >
                                                : Expr extends {
                                                      type: "list-literal";
                                                      items: infer Items extends
                                                        any[];
                                                    }
                                                  ? RunList<Items, Stk>
                                                  : TypeLevelError<
                                                      [
                                                        "Unrecognized expression: ",
                                                        Expr,
                                                      ]
                                                    >;

type SDKLJF = [1, ...[2, 3, 4]];

type Lambda<Argname, Body> = {
  type: "defun";
  body: Body;
  argname: Argname;
};

type Call<Fn, Arg> = {
  type: "call";
  fn: Fn;
  arg: Arg;
};

type Lit<V> = {
  type: "literal";
  value: V;
};

type ConcatExpanded = {
  type: "literal";
  value: {
    argname: "a";
    body: {
      type: "literal";
      value: {
        argname: "b";
        body: {
          type: "str-append";
        };
      };
    };
  };
};

type Id = Lambda<"x", { type: "get"; binding: "x" }>;

type IdTest = Run<Call<Id, Lit<69>>, []>;

type Concat = Lambda<"a", Lambda<"b", { type: "str-append" }>>;
type Append = Lambda<"a", Lambda<"b", { type: "append" }>>;
type Eq = Lambda<"a", Lambda<"b", { type: "eq" }>>;
type Get<T extends keyof any> = { type: "get"; binding: T };
type Arrayify = Lambda<"a", { type: "arrayify" }>;
type Head = Lambda<"a", { type: "head" }>;
type SplitStr = Lambda<"a", { type: "split-str" }>;
type Tail = Lambda<"a", { type: "tail" }>;
type IsEmpty = Lambda<"a", { type: "isempty" }>;
type If = Lambda<"cond", Lambda<"true", Lambda<"false", { type: "if" }>>>;
type Recurse = Lambda<"f", Lambda<"cond", Lambda<"in", { type: "recurse" }>>>;

type Not = Lambda<"x", Call<Call<Call<If, Get<"x">>, Lit<false>>, Lit<true>>>;

type IsNonempty = Lambda<"a", Call<Not, Call<IsEmpty, Get<"a">>>>;

type SDFKJ = Run<Call<Tail, Lit<[1, 2, 3]>>, []>;

type SKLDFJ = Run<Call<Call<Call<If, Lit<false>>, Lit<1>>, Lit<2>>, []>;

type SKJLDF = Run<Call<IsNonempty, Lit<[]>>, []>;

type Second = Lambda<"x", Call<Head, Call<Tail, Get<"x">>>>;

type Pair = Lambda<
  "a",
  Lambda<"b", Call<Call<Append, Call<Arrayify, Get<"a">>>, Get<"b">>>
>;

type Testsdfsdf = Run<Call<Call<Pair, Lit<1>>, Lit<"a">>, []>;

type ConcatReduce = Lambda<
  "x",
  Call<
    Call<Pair, Call<Tail, Call<Head, Get<"x">>>>,
    Call<Call<Concat, Call<Second, Get<"x">>>, Call<Head, Call<Head, Get<"x">>>>
  >
>;

type ConcatReduceData = Lit<[["asd", "fgh"], "init"]>;

type ReduceCond = Lambda<"c", Call<IsNonempty, Call<Head, Get<"c">>>>;
// Lambda<"x", Lit<true>>;

type SingleIter = Run<Call<ConcatReduce, ConcatReduceData>, []>;

type Cont = Run<Call<ReduceCond, Lit<[[1], ""]>>, []>;

type ConcatAll = Run<
  Call<
    Call<Call<Recurse, ConcatReduce>, ReduceCond>,
    Lit<[["a", "b", "c"], ""]>
  >,
  []
>;

type Reduction = Call<
  Call<Get<"f">, Call<Second, Get<"d">>>,
  Call<Head, Call<Head, Get<"d">>>
>;

type ReduceGeneric = Lambda<
  "d",
  Call<Call<Pair, Call<Tail, Call<Head, Get<"d">>>>, Reduction>
>;

type SingleIter2 = Run<
  {
    type: "let";
    bindings: {
      f: Concat;
    };
    body: Call<ReduceGeneric, Lit<[["a", "b", "c"], "shit"]>>;
  },
  []
>;

type Reduce = Lambda<
  "f",
  Lambda<
    "z",
    Lambda<
      "x",
      Call<
        Second,
        Call<
          Call<Call<Recurse, ReduceGeneric>, ReduceCond>,
          Call<Call<Pair, Get<"x">>, Get<"z">>
        >
      >
    >
  >
>;

type ConcatAll2 = Run<
  Call<Call<Call<Reduce, Concat>, Lit<"">>, Lit<["a", "b", "c"]>>,
  []
>;

type Greet = Lambda<
  "b",
  {
    type: "let";
    bindings: {
      a: Lit<"Hello, ">;
    };
    body: { type: "str-append" };
  }
>;

type IfThenElse<I, T, E> = Call<Call<Call<If, I>, T>, E>;
type IsEqual<A, B> = Call<Call<Eq, A>, B>;
type MakePair<A, B> = Call<Call<Pair, A>, B>;
type FReduce<F, I, D> = Call<Call<Call<Reduce, F>, I>, D>;
type FRecurse<F, C, In> = Call<Call<Call<Recurse, F>, C>, In>;

type HW2 = Run<Call<Greet, Lit<"World">>, []>;

type HelloWorld = Run<Call<Call<Concat, Lit<"Hello, ">>, Lit<"World">>, []>;

type AAAAAA = Run<Call<Concat, Lit<"A">>, []>;

type AAAAA2 = Run<
  Call<Lit<AAAAAA>, Lit<"B">>,
  [{ type: "eager"; data: { a: "A" } }]
>;

type MatchChar = Lambda<
  "c",
  Lambda<
    "x",
    IfThenElse<
      IsEqual<Get<"c">, Call<Head, Get<"x">>>,
      MakePair<Call<Tail, Get<"x">>, Get<"c">>,
      MakePair<Get<"x">, Lit<undefined>>
    >
  >
>;

// seq takes in list of parser functions
// iff second elemenet of parser return type is undefined, assume it failed and fail.
// otherwise appewd

// type Seq = Lambda<"s", Lambda<"x",
//   FRecurse<
//     Lambda<"x2", Call<Call<Head, Get<"s">>, Get<"x2">>>
//   >
// >>

type MCTest = Run<
  Call<Call<MatchChar, Lit<"x">>, Lit<["y", "a", "b", "c"]>>,
  []
>;

// type HelloWorld = Run<
//   {
//     type: "call";
//     fn: { type: "call"; fn: Concat; arg: "hello, " };
//     arg: "world";
//   },
//   [{}]
// >;

type SDKLFJ = Run<
  {
    type: "let";
    bindings: {
      a: {
        type: "literal";
        value: "hello, ";
      };
      c: {
        type: "literal";
        value: "world";
      };
    };
    body: {
      type: "let";
      bindings: {
        b: {
          type: "get";
          binding: "c";
        };
      };
      body: {
        type: "str-append";
      };
    };
  },
  []
>;

type TLLStdlib = {
  objfield: Lambda<"k", Lambda<"v", { type: "obj-with-field" }>>;
  objmap: Lambda<"f", Lambda<"o", { type: "object-map" }>>;
  concat: Concat;
  concat2: CompileTLL<"(@ (a b) (concat a b))">;
  append: Append;
  // concat22: Lambda<"a", Lambda<"b", Get<"concat">>>;
  head: Head;
  tail: Tail;
  isempty: IsEmpty;
  hello: Lit<"hello, ">;
  world: Lit<"world">;
  if: If;
  eq: Eq;
  arrayify: Arrayify;
  emptyArray: Lit<[]>;
  emptyObject: Lit<{}>;
  arr1: Lit<[1, 2]>;
  arr2: Lit<[3, 4]>;
  arr3: Lit<["a", "b", "c"]>;
  pair: Pair;
  map: Lambda<"f", Lambda<"a", { type: "array-map" }>>;
  intersection: Lambda<"a", Lambda<"b", { type: "intersection" }>>;
} & CompileTLLLib<`
(fst (x) (head x))

(snd (x) (head (tail x)))


(arrayConcat (a b) 
  (if 
    (isempty b) 
    a
    (arrayConcat (append a (head b)) (tail b))))  
`> &
  CompileTLLLib<`
(fromEntries (a) (if
    (isempty a)
    emptyObject
    (intersection (objfield (fst (head a)) (snd (head a))) (fromEntries (tail a)))
  ))
`>;

/*
(map (f a)
  (if
    (isempty a) 
    a
    (arrayConcat (arrayify (f (head a))) (map f (tail a)))
))
*/

type ENTRIES2 = RunTLL<`(intersection (objfield "a" "b") (objfield "c" "d"))`>;

type ENTRIESTEST = RunTLL<`(fromEntries (list (list "a" "b") (list "c" "d")))`>;

type ListLitTest = RunTLL<`(map (concat "hello, ") (list "a" "b" "c"))`>;

type fieldtest = RunTLL<`(objfield "hi whats up" world)`>;

type fieldtest2 =
  RunTLL<`(objmap (@ (k v) (pair v k)) (objfield hello world))`>;

type SDKJFL = RunTLL<"(arrayConcat arr2 arr2)">;

type AAAAA = RunTLL<`(map (concat hello) arr3)`>;

type CompileTLL<Code extends string> = ToTLLTree<ParseLisp<Code>>;
type CompileTLLLib<Code extends string> = ToTLLLib<ParseLibLisp<Code>>;

type RunTLL<Code extends string, Libraries = TLLStdlib> = Run<
  {
    type: "lazy-let";
    bindings: Libraries;
    body: CompileTLL<Code>;
  },
  []
>;

type Q = ParseLisp<"(concat hello world)">;

type TLLT = ToTLLTree<Q>;

type SDLKFJ = Run<
  {
    type: "let";
    bindings: {
      concat: Concat;
      hello: Lit<"hello, ">;
      world: Lit<"world">;
    };
    body: TLLT;
  },
  []
>;

type TREEE = ParseLisp<"(@ (a b) c)">;

type TREEE2 = ToTLLTree<TREEE>;

type AAAAAAAA = RunTLL<"(concat hello world)">;
type AAAAAAAA2 = RunTLL<"(concat2 hello world)">;

type AAAAAAAAsdfdkljl = RunTLL<`
(
(@ (concat3) (concat3 hello world world))
(@ (a b c) (concat (concat a b) c))
)`>;

type SLKDHJF = RunTLL<"((@ (a b) (concat a b)) hello world)">;
