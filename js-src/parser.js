// src/parser.ts
function str2html(str) {
  return new DOMParser().parseFromString(str, "text/html");
}
function chainParser(parser2) {
  const oldParser = this;
  return {
    parse(e) {
      const res = oldParser.parse(e);
      return parser2.parse(res);
    },
    $: chainParser
  };
}
function domQueryAll(selector, parser2) {
  return {
    parse(e) {
      return [...e.querySelectorAll(selector)].map(
        (e2) => parser2.parse(e2)
      );
    },
    $: chainParser
  };
}
function domQuery(selector, doesExist, doesNotExist) {
  return {
    parse(e) {
      const res = e.querySelector(selector);
      return res ? doesExist(res) : doesNotExist();
    },
    $: chainParser
  };
}
function domQueryObj(fields) {
  return {
    parse(e) {
      return Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, v.parse(e)])
      );
    },
    $: chainParser
  };
}
function get(prop) {
  return parser((t) => t[prop]);
}
function parser(fn) {
  return {
    parse: fn,
    $: chainParser
  };
}
function regexMatch(regex) {
  return parser((s) => s.match(regex)?.[0]);
}
function orElse(fallback) {
  return parser((s) => s ?? fallback());
}
var ud = () => void 0;
function str2int(fallback, radix) {
  return parser((s) => {
    const i = parseInt(s, radix);
    if (isNaN(i)) {
      return fallback();
    }
    return i;
  });
}
function str2float(fallback) {
  return parser((s) => {
    const i = parseFloat(s);
    if (isNaN(i)) return fallback();
    return i;
  });
}
function innerTextRegex(selector, regex, fallbackIfNotExist, fallbackIfNoMatch) {
  return domQuery(
    selector,
    (e) => e.innerText.match(regex)?.[0] ?? fallbackIfNoMatch(e),
    () => fallbackIfNotExist
  );
}
export {
  chainParser,
  domQuery,
  domQueryAll,
  domQueryObj,
  get,
  innerTextRegex,
  orElse,
  parser,
  regexMatch,
  str2float,
  str2html,
  str2int,
  ud
};
