export type Result<T, E> =
  | {
      ok: true;
      data: T;
      error?: undefined;
    }
  | {
      ok: false;
      data?: undefined;
      error: E;
    };

export function ok<T>(t: T): Result<T, any> {
  return {
    ok: true,
    data: t,
  };
}

export function err<E>(e: E): Result<any, E> {
  return {
    ok: false,
    error: e,
  };
}
