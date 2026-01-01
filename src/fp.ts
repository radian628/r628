export function variadify<T>(
  fn: (a: T, b: T) => T,
  rightAssociative: boolean = false
): (a: T, b: T, ...ts: T[]) => T {
  if (rightAssociative) {
    return (a, b, ...ts) => {
      const arr = [a, b, ...ts];
      let x = fn(arr.at(-2)!, arr.at(-1)!);
      for (let i = arr.length - 3; i >= 0; i--) {
        x = fn(arr[i], x);
      }
      return x;
    };
  }

  return (a, b, ...ts) => {
    let x = fn(a, b);
    for (const t of ts) x = fn(x, t);
    return x;
  };
}

type Curried<F extends (...args: any) => any> =
  Parameters<F>["length"] extends 0
    ? ReturnType<F>
    : F extends (
          ...args: [infer FirstArg, ...infer RemainingArgs extends any[]]
        ) => infer Ret
      ? (arg: FirstArg) => Curried<(...args: RemainingArgs) => Ret>
      : never;

export function curry<F extends (...args: any) => any>(
  f: F,
  argc: Parameters<F>["length"]
): Curried<F> {
  if (argc === 0) {
    return f();
  }

  if (argc === 1) {
    // @ts-expect-error
    return f;
  }

  // @ts-expect-error
  return (arg) => {
    return curry((...as) => f(arg, ...as), argc - 1);
  };
}

type Kurryable = (params: Record<any, any>) => any;

type Kurried<F extends Kurryable> = F extends (
  param: infer P extends Record<any, any>
) => infer Ret
  ? {} extends P
    ? Ret
    : <P2 extends Partial<P>>(
        param: P2
      ) => Kurried<(param: Omit<P, keyof P2>) => Ret>
  : never;

export function kurry<F extends Kurryable>(
  f: F,
  keys: (keyof Parameters<F>[0])[] | Set<keyof Parameters<F>[0]>
): Kurried<F> {
  keys = new Set(keys);

  if (keys.size === 0) {
    return f({});
  }

  // @ts-expect-error
  return (p) => {
    const newSet = keys.difference(new Set(Object.keys(p)));

    // @ts-expect-error
    return kurry((p2) => f({ ...p, ...p2 }), newSet);
  };
}

export function multicast<F extends (...args: any) => any>(
  fs: F[]
): F extends (...args: infer Args extends any[]) => infer Result
  ? (...args: Args) => Result[]
  : never {
  // @ts-expect-error
  return (...args) => fs.map((f) => f(...args));
}
