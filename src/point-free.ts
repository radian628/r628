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
