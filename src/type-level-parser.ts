import { Run } from "./type-level-lang-2";
import { TypeLevelError } from "./typelevel";

type Parser =
  | ["seq", ...Parser[]]
  | ["alt", ...Parser[]]
  | ["lit", string]
  | ["rule", string];

type Join<Strs> = Strs extends [infer A extends string, ...infer Bs]
  ? `${A}${Join<Bs>}`
  : "";

type ParseSeq<
  Ps extends any[],
  Rules extends Record<any, any>,
  Input extends string,
  OGInput extends string,
  OutList extends any[],
> = Ps extends [infer Pfirst, ...infer Prest]
  ? // should ignore
    Pfirst extends ["ign", infer Pfirst2]
    ? Parse<Pfirst2, Rules, Input> extends [
        infer NextInput extends string,
        infer Res,
      ]
      ? Res extends undefined
        ? [OGInput, undefined]
        : ParseSeq<Prest, Rules, NextInput, OGInput, OutList>
      : TypeLevelError<["Expected parse output."]>
    : // otherwise parse normally
      Parse<Pfirst, Rules, Input> extends [
          infer NextInput extends string,
          infer Res,
        ]
      ? Res extends undefined
        ? [OGInput, undefined]
        : ParseSeq<Prest, Rules, NextInput, OGInput, [...OutList, Res]>
      : TypeLevelError<["Expected parse output."]>
  : [Input, OutList];

type ParseAlt<
  Ps extends any[],
  Rules extends Record<any, any>,
  Input extends string,
  OGInput extends string,
> = Ps extends [infer Pfirst, ...infer Prest]
  ? Parse<Pfirst, Rules, Input> extends [
      infer NextInput extends string,
      infer Res,
    ]
    ? Res extends undefined
      ? ParseAlt<Prest, Rules, Input, OGInput>
      : [NextInput, Res]
    : TypeLevelError<["Expected parse output."]>
  : [OGInput, undefined];

type Parse<P, Rules extends Record<any, any>, Input extends string> =
  // parse literal
  P extends ["lit", infer S extends string]
    ? Input extends `${S}${infer Rest}`
      ? [Rest, S]
      : [Input, undefined]
    : // parse recursive rule
      P extends ["rule", infer P]
      ? Parse<Rules[P], Rules, Input>
      : // parse sequence
        P extends ["seq", ...infer Ps]
        ? ParseSeq<Ps, Rules, Input, Input, []>
        : P extends ["alt", ...infer Ps]
          ? ParseAlt<Ps, Rules, Input, Input>
          : // parse nothing
            P extends ["nil"]
            ? [Input, ""]
            : // mark data with marker
              P extends ["mark", infer T, infer P2]
              ? Parse<P2, Rules, Input> extends [infer NextInput, infer Res]
                ? Res extends undefined
                  ? [NextInput, Res]
                  : [NextInput, { type: T; data: Res }]
                : never
              : P extends ["flat", infer P2]
                ? Parse<P2, Rules, Input> extends [infer NextInput, infer Res]
                  ? Res extends undefined
                    ? [NextInput, Res]
                    : Res extends [infer A, infer B extends any[]]
                      ? [NextInput, [A, ...B]]
                      : Res extends [infer X]
                        ? [NextInput, X]
                        : [NextInput, Res]
                  : never
                : P extends ["join", infer P2]
                  ? Parse<P2, Rules, Input> extends [infer NextInput, infer Res]
                    ? Res extends undefined
                      ? [NextInput, Res]
                      : Res extends string[]
                        ? [NextInput, Join<Res>]
                        : [NextInput, Res]
                    : never
                  : P extends ["wrap", infer P2]
                    ? Parse<P2, Rules, Input> extends [
                        infer NextInput,
                        infer Res,
                      ]
                      ? Res extends undefined
                        ? [NextInput, Res]
                        : [NextInput, [Res]]
                      : never
                    : TypeLevelError<["Unrecognized parser: ", P]>;

type LispRules = {
  num: [
    "alt",
    ["lit", "0"],
    ["lit", "1"],
    ["lit", "2"],
    ["lit", "3"],
    ["lit", "4"],
    ["lit", "5"],
    ["lit", "6"],
    ["lit", "7"],
    ["lit", "8"],
    ["lit", "9"],
  ];
  lowercase: [
    "alt",
    ["lit", "a"],
    ["lit", "b"],
    ["lit", "c"],
    ["lit", "d"],
    ["lit", "e"],
    ["lit", "f"],
    ["lit", "g"],
    ["lit", "h"],
    ["lit", "i"],
    ["lit", "j"],
    ["lit", "k"],
    ["lit", "l"],
    ["lit", "m"],
    ["lit", "n"],
    ["lit", "o"],
    ["lit", "p"],
    ["lit", "q"],
    ["lit", "r"],
    ["lit", "s"],
    ["lit", "t"],
    ["lit", "u"],
    ["lit", "v"],
    ["lit", "w"],
    ["lit", "x"],
    ["lit", "y"],
    ["lit", "z"],
  ];
  uppercase: [
    "alt",
    ["lit", "A"],
    ["lit", "B"],
    ["lit", "C"],
    ["lit", "D"],
    ["lit", "E"],
    ["lit", "F"],
    ["lit", "G"],
    ["lit", "H"],
    ["lit", "I"],
    ["lit", "J"],
    ["lit", "K"],
    ["lit", "L"],
    ["lit", "M"],
    ["lit", "N"],
    ["lit", "O"],
    ["lit", "P"],
    ["lit", "Q"],
    ["lit", "R"],
    ["lit", "S"],
    ["lit", "T"],
    ["lit", "U"],
    ["lit", "V"],
    ["lit", "W"],
    ["lit", "X"],
    ["lit", "Y"],
    ["lit", "Z"],
  ];
  abc: ["seq", ["lit", "a"], ["lit", "b"], ["lit", "c"]];
  wschar: ["alt", ["lit", " "], ["lit", "\n"], ["lit", "\t"], ["lit", "\r"]];
  ws: ["alt", ["seq", ["rule", "wschar"], ["rule", "ws"]], ["rule", "wschar"]];
  wsopt: ["alt", ["rule", "ws"], ["nil"]];
  identChar: [
    "alt",
    ["rule", "num"],
    ["rule", "lowercase"],
    ["rule", "uppercase"],
    ["lit", "_"],
    ["lit", "-"],
    ["lit", "@"],
  ];
  identInner: [
    "alt",
    ["flat", ["seq", ["rule", "identChar"], ["rule", "identInner"]]],
    ["rule", "identChar"],
  ];
  ident: ["mark", "ident", ["join", ["rule", "identInner"]]];
  expr: ["alt", ["rule", "ident"], ["rule", "compound"]];
  exprlist: [
    "alt",
    [
      "flat",
      ["seq", ["rule", "expr"], ["ign", ["rule", "ws"]], ["rule", "exprlist"]],
    ],
    ["wrap", ["rule", "expr"]],
  ];
  compound: [
    "mark",
    "compound",
    [
      "flat",
      [
        "seq",
        ["ign", ["rule", "wsopt"]],
        ["ign", ["lit", "("]],
        ["ign", ["rule", "wsopt"]],
        ["rule", "exprlist"],
        ["ign", ["rule", "wsopt"]],
        ["ign", ["lit", ")"]],
      ],
    ],
  ];
};

type TestParse = Parse<["rule", "expr"], LispRules, "(abc (1 2 3) c)">;

export type ParseLisp<S extends string> =
  Parse<["rule", "expr"], LispRules, S> extends [infer _, infer Res]
    ? Res
    : never;

type CreateFnCall<FnObj, Args> = Args extends [infer A1, ...infer ARest]
  ? CreateFnCall<
      {
        type: "call";
        fn: FnObj;
        arg: ToTLLTree<A1>;
      },
      ARest
    >
  : FnObj;

type CreateFnDef<Args, Body> = Args extends [
  infer A1,
  ...infer ARest extends any[],
]
  ? {
      type: "defun";
      body: CreateFnDef<ARest, Body>;
      argname: A1 extends { type: "ident"; data: infer S }
        ? S
        : TypeLevelError<["Expected identifier; received ", A1]>;
    }
  : ToTLLTree<Body>;

export type ToTLLTree<ParseTree> = ParseTree extends {
  type: "ident";
  data: infer S;
}
  ? { type: "get"; binding: S }
  : ParseTree extends {
        type: "compound";
        data: [
          { type: "ident"; data: "@" },
          { type: "compound"; data: infer FnArgs },
          infer FnBody,
        ];
      }
    ? CreateFnDef<FnArgs, FnBody>
    : ParseTree extends {
          type: "compound";
          data: [infer Fn, ...infer Args extends any[]];
        }
      ? CreateFnCall<ToTLLTree<Fn>, Args>
      : TypeLevelError<["Unrecognized expression type: ", ParseTree]>;

// type A = ToTLLTree<ParseLisp<"(concat hello world)">>;

// type res = Run<{
//   type: "let",
//   body: A,
//   bindings:
// }>
