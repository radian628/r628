import { TypeLevelError } from "./typelevel";

type Dec2Bin = {
  "0": "0";
  "1": "1";
  "2": "01";
  "3": "11";
  "4": "001";
  "5": "101";
  "6": "011";
  "7": "111";
  "8": "0001";
  "9": "1001";
  "10": "0101";
};

type ParseDigit<D> = D extends keyof Dec2Bin
  ? Dec2Bin[D]
  : TypeLevelError<["Unrecognized digit: ", D]>;

type ParseDigits<S extends string> = never;

type Num<N extends number> = ParseDigits<`${N}`>;

type Xor<A, B> = A extends "1"
  ? B extends "1"
    ? "0"
    : "1"
  : B extends "1"
    ? "1"
    : "0";

type AddDigit<A extends string, B extends string, C extends string> = {
  digit: Xor<Xor<A, B>, C>;
  carry: A extends "1"
    ? B extends "1" // A and B are 1 -> carry
      ? "1"
      : C extends "1" // A and C are 1 -> carry
        ? "1"
        : "0"
    : B extends "1"
      ? C extends "1" // B and C are 1 -> carry
        ? "1"
        : "0"
      : "0";
};

type Bit = "0" | "1";

type AddNextDigit<
  A extends string,
  B extends string,
  DC extends { digit: Bit; carry: Bit },
> = `${DC["digit"]}${AddCarry<A, B, DC["carry"]>}`;

type AddCarry<
  A extends string,
  B extends string,
  C extends string,
> = `${A extends `${infer A0 extends Bit}${infer ARest}`
  ? B extends `${infer B0 extends Bit}${infer BRest}`
    ? AddNextDigit<ARest, BRest, AddDigit<A0, B0, C>>
    : AddNextDigit<ARest, "", AddDigit<A0, "0", C>>
  : B extends `${infer B0 extends Bit}${infer BRest}`
    ? AddNextDigit<"", BRest, AddDigit<"0", B0, C>>
    : C extends "1"
      ? "1"
      : ""}`;

type Add<A extends string, B extends string> = AddCarry<A, B, "0">;

type TestAdd = Add<"01", "101">;

// type SDFKJL = "1" extends `${infer A0 extends Bit}${infer ARest}` ? [ARest, A0] : false;

// type TSET  = AddDigit<"1", "1", "0">

// type SDKLGFJ = Xor<Xor<"1", "1">, "1">

type TestAdd2 = Add<"0111001101100000011", "1011001110011011101111">;
