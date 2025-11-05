export function str2html(str: string): Document {
  return new DOMParser().parseFromString(str, "text/html");
}

export type Parser<TIn, TOut> = {
  parse: (input: TIn) => TOut;
  $<TOut2>(parser: Parser<TOut, TOut2>): Parser<TIn, TOut2>;
};

export function chainParser(parser: Parser<any, any>): any {
  return {
    parse(e: any) {
      const res = this.parse(e);
      return parser.parse(res);
    },
    $: chainParser,
  };
}

export function domQueryAll<TIn extends HTMLElement, TOut>(
  selector: string,
  parser: Parser<TIn, TOut>
): Parser<TIn, TOut[]> {
  return {
    parse(e) {
      return [...e.querySelectorAll(selector)].map((e) =>
        parser.parse(e as TIn)
      );
    },
    $: chainParser,
  };
}

export function domQuery<TIn extends HTMLElement, TOut>(
  selector: string,
  doesExist: (e: TIn) => TOut,
  doesNotExist: () => TOut
): Parser<TIn, TOut> {
  return {
    parse(e) {
      const res = e.querySelector(selector) as TIn;
      return res ? doesExist(res) : doesNotExist();
    },
    $: chainParser,
  };
}

type D2JOut<P extends Parser<HTMLElement, any>> =
  P extends Parser<HTMLElement, infer TOut> ? TOut : never;

type D2JObjectOut<Fields extends Record<keyof any, Parser<HTMLElement, any>>> =
  {
    [Key in keyof Fields]: D2JOut<Fields[Key]>;
  };

export function domQueryObj<
  TIn extends HTMLElement,
  Fields extends Record<keyof any, Parser<HTMLElement, any>>,
>(fields: Fields): Parser<TIn, D2JObjectOut<Fields>> {
  return {
    parse(e): D2JObjectOut<Fields> {
      return Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, v.parse(e)])
      ) as D2JObjectOut<Fields>;
    },
    $: chainParser,
  };
}

export function get<TIn extends Record<any, any>, Prop extends keyof TIn>(
  prop: Prop
): Parser<TIn, TIn[Prop]> {
  return parser((t) => t[prop]);
}

export function parser<A, B>(fn: (a: A) => B): Parser<A, B> {
  return {
    parse: fn,
    $: chainParser,
  };
}

export function regexMatch(regex: RegExp): Parser<string, string | undefined> {
  return parser((s) => s.match(regex)?.[0]);
}

export function orElse<T>(fallback: () => T): Parser<T | undefined, T> {
  return parser((s) => s ?? fallback());
}

export const ud = () => undefined;

export function str2int<T>(
  fallback: () => T,
  radix?: number
): Parser<string, number | T> {
  return parser((s) => {
    const i = parseInt(s, radix);
    if (isNaN(i)) {
      return fallback();
    }
    return i;
  });
}

export function str2float<T>(fallback: () => T): Parser<string, number | T> {
  return parser((s) => {
    const i = parseFloat(s);
    if (isNaN(i)) return fallback();
    return i;
  });
}

export function innerTextRegex(
  selector: string,
  regex: RegExp,
  fallbackIfNotExist: string,
  fallbackIfNoMatch: (e: HTMLElement) => string
): Parser<HTMLElement, string> {
  return domQuery(
    selector,
    (e) => e.innerText.match(regex)?.[0] ?? fallbackIfNoMatch(e),
    () => fallbackIfNotExist
  );
}
