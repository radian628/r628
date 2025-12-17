var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/typescript-parsec/lib/Lexer.js
var require_Lexer = __commonJS({
  "node_modules/typescript-parsec/lib/Lexer.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (b2.hasOwnProperty(p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildLexer = exports.extractByTokenRange = exports.extractByPositionRange = exports.TokenRangeError = exports.TokenError = void 0;
    function posToString(pos) {
      return pos === void 0 ? "<END-OF-FILE>" : JSON.stringify(pos);
    }
    var TokenError = (
      /** @class */
      function(_super) {
        __extends(TokenError2, _super);
        function TokenError2(pos, errorMessage) {
          var _this = _super.call(this, posToString(pos) + ": " + errorMessage) || this;
          _this.pos = pos;
          _this.errorMessage = errorMessage;
          return _this;
        }
        return TokenError2;
      }(Error)
    );
    exports.TokenError = TokenError;
    var TokenRangeError = (
      /** @class */
      function(_super) {
        __extends(TokenRangeError2, _super);
        function TokenRangeError2(first, next, errorMessage) {
          var _this = _super.call(this, posToString(first) + " - " + posToString(next) + ": " + errorMessage) || this;
          _this.first = first;
          _this.next = next;
          _this.errorMessage = errorMessage;
          return _this;
        }
        return TokenRangeError2;
      }(Error)
    );
    exports.TokenRangeError = TokenRangeError;
    function extractByPositionRange(input, first, next) {
      var firstIndex = first === void 0 ? input.length : first.index;
      var nextIndex = next === void 0 ? input.length : next.index;
      if (firstIndex >= nextIndex) {
        return "";
      }
      return input.substring(firstIndex, nextIndex);
    }
    exports.extractByPositionRange = extractByPositionRange;
    function extractByTokenRange(input, first, next) {
      return extractByPositionRange(input, first === void 0 ? void 0 : first.pos, next === void 0 ? void 0 : next.pos);
    }
    exports.extractByTokenRange = extractByTokenRange;
    var TokenImpl = (
      /** @class */
      function() {
        function TokenImpl2(lexer, input, kind, text, pos, keep) {
          this.lexer = lexer;
          this.input = input;
          this.kind = kind;
          this.text = text;
          this.pos = pos;
          this.keep = keep;
        }
        Object.defineProperty(TokenImpl2.prototype, "next", {
          get: function() {
            if (this.nextToken === void 0) {
              this.nextToken = this.lexer.parseNextAvailable(this.input, this.pos.index + this.text.length, this.pos.rowEnd, this.pos.columnEnd);
              if (this.nextToken === void 0) {
                this.nextToken = null;
              }
            }
            return this.nextToken === null ? void 0 : this.nextToken;
          },
          enumerable: false,
          configurable: true
        });
        return TokenImpl2;
      }()
    );
    var LexerImpl = (
      /** @class */
      function() {
        function LexerImpl2(rules) {
          this.rules = rules;
          for (var _i = 0, _a = this.rules; _i < _a.length; _i++) {
            var rule2 = _a[_i];
            if (rule2[1].source[0] !== "^") {
              throw new Error('Regular expression patterns for a tokenizer should start with "^": ' + rule2[1].source);
            }
            if (!rule2[1].global) {
              throw new Error("Regular expression patterns for a tokenizer should be global: " + rule2[1].source);
            }
          }
        }
        LexerImpl2.prototype.parse = function(input) {
          return this.parseNextAvailable(input, 0, 1, 1);
        };
        LexerImpl2.prototype.parseNext = function(input, indexStart, rowBegin, columnBegin) {
          if (indexStart === input.length) {
            return void 0;
          }
          var subString = input.substr(indexStart);
          var result;
          for (var _i = 0, _a = this.rules; _i < _a.length; _i++) {
            var _b = _a[_i], keep = _b[0], regexp = _b[1], kind = _b[2];
            regexp.lastIndex = 0;
            if (regexp.test(subString)) {
              var text = subString.substr(0, regexp.lastIndex);
              var rowEnd = rowBegin;
              var columnEnd = columnBegin;
              for (var _c = 0, text_1 = text; _c < text_1.length; _c++) {
                var c = text_1[_c];
                switch (c) {
                  case "\r":
                    break;
                  case "\n":
                    rowEnd++;
                    columnEnd = 1;
                    break;
                  default:
                    columnEnd++;
                }
              }
              var newResult = new TokenImpl(this, input, kind, text, { index: indexStart, rowBegin, columnBegin, rowEnd, columnEnd }, keep);
              if (result === void 0 || result.text.length < newResult.text.length) {
                result = newResult;
              }
            }
          }
          if (result === void 0) {
            throw new TokenError({ index: indexStart, rowBegin, columnBegin, rowEnd: rowBegin, columnEnd: columnBegin }, "Unable to tokenize the rest of the input: " + input.substr(indexStart));
          } else {
            return result;
          }
        };
        LexerImpl2.prototype.parseNextAvailable = function(input, index, rowBegin, columnBegin) {
          var token;
          while (true) {
            token = this.parseNext(input, token === void 0 ? index : token.pos.index + token.text.length, token === void 0 ? rowBegin : token.pos.rowEnd, token === void 0 ? columnBegin : token.pos.columnEnd);
            if (token === void 0) {
              return void 0;
            } else if (token.keep) {
              return token;
            }
          }
        };
        return LexerImpl2;
      }()
    );
    function buildLexer2(rules) {
      return new LexerImpl(rules);
    }
    exports.buildLexer = buildLexer2;
  }
});

// node_modules/typescript-parsec/lib/Parsers/ParserInterface.js
var require_ParserInterface = __commonJS({
  "node_modules/typescript-parsec/lib/Parsers/ParserInterface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.unableToConsumeToken = exports.resultOrError = exports.betterError = void 0;
    function betterError(e1, e2) {
      if (e1 === void 0) {
        return e2;
      }
      if (e2 === void 0) {
        return e1;
      }
      if (e1.pos === void 0) {
        return e1;
      }
      if (e2.pos === void 0) {
        return e2;
      }
      if (e1.pos.index < e2.pos.index) {
        return e2;
      } else if (e1.pos.index > e2.pos.index) {
        return e1;
      } else {
        return e1;
      }
    }
    exports.betterError = betterError;
    function resultOrError(result, error, successful) {
      if (successful) {
        return {
          candidates: result,
          successful: true,
          error
        };
      } else {
        return {
          successful: false,
          error
        };
      }
    }
    exports.resultOrError = resultOrError;
    function unableToConsumeToken(token) {
      return {
        kind: "Error",
        pos: token === void 0 ? void 0 : token.pos,
        message: "Unable to consume token: " + (token === void 0 ? "<END-OF-FILE>" : token.text)
      };
    }
    exports.unableToConsumeToken = unableToConsumeToken;
  }
});

// node_modules/typescript-parsec/lib/Parsers/TokenParser.js
var require_TokenParser = __commonJS({
  "node_modules/typescript-parsec/lib/Parsers/TokenParser.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tok = exports.str = exports.fail = exports.succ = exports.nil = void 0;
    var ParserInterface_1 = require_ParserInterface();
    function nil2() {
      return {
        parse: function(token) {
          return {
            candidates: [{
              firstToken: token,
              nextToken: token,
              result: void 0
            }],
            successful: true,
            error: void 0
          };
        }
      };
    }
    exports.nil = nil2;
    function succ(value) {
      return {
        parse: function(token) {
          return {
            candidates: [{
              firstToken: token,
              nextToken: token,
              result: value
            }],
            successful: true,
            error: void 0
          };
        }
      };
    }
    exports.succ = succ;
    function fail(errorMessage) {
      return {
        parse: function(token) {
          return {
            successful: false,
            error: {
              kind: "Error",
              pos: token === null || token === void 0 ? void 0 : token.pos,
              message: errorMessage
            }
          };
        }
      };
    }
    exports.fail = fail;
    function str2(toMatch) {
      return {
        parse: function(token) {
          if (token === void 0 || token.text !== toMatch) {
            return {
              successful: false,
              error: ParserInterface_1.unableToConsumeToken(token)
            };
          }
          return {
            candidates: [{
              firstToken: token,
              nextToken: token.next,
              result: token
            }],
            successful: true,
            error: void 0
          };
        }
      };
    }
    exports.str = str2;
    function tok2(toMatch) {
      return {
        parse: function(token) {
          if (token === void 0 || token.kind !== toMatch) {
            return {
              successful: false,
              error: ParserInterface_1.unableToConsumeToken(token)
            };
          }
          return {
            candidates: [{
              firstToken: token,
              nextToken: token.next,
              result: token
            }],
            successful: true,
            error: void 0
          };
        }
      };
    }
    exports.tok = tok2;
  }
});

// node_modules/typescript-parsec/lib/Parsers/MonadicSequencialParser.js
var require_MonadicSequencialParser = __commonJS({
  "node_modules/typescript-parsec/lib/Parsers/MonadicSequencialParser.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.combine = void 0;
    var ParserInterface_1 = require_ParserInterface();
    function combine(first) {
      var continuations = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        continuations[_i - 1] = arguments[_i];
      }
      return {
        parse: function(token) {
          var firstOutput = first.parse(token);
          if (!firstOutput.successful) {
            return firstOutput;
          }
          var result = firstOutput.candidates;
          var error = firstOutput.error;
          for (var _i2 = 0, continuations_1 = continuations; _i2 < continuations_1.length; _i2++) {
            var c = continuations_1[_i2];
            if (result.length === 0) {
              break;
            }
            var steps = result;
            result = [];
            for (var _a = 0, steps_1 = steps; _a < steps_1.length; _a++) {
              var step = steps_1[_a];
              var output = c(step.result).parse(step.nextToken);
              error = ParserInterface_1.betterError(error, output.error);
              if (output.successful) {
                for (var _b = 0, _c = output.candidates; _b < _c.length; _b++) {
                  var candidate = _c[_b];
                  result.push({
                    firstToken: step.firstToken,
                    nextToken: candidate.nextToken,
                    result: candidate.result
                  });
                }
              }
            }
          }
          return ParserInterface_1.resultOrError(result, error, result.length !== 0);
        }
      };
    }
    exports.combine = combine;
  }
});

// node_modules/typescript-parsec/lib/Parsers/SequencialParser.js
var require_SequencialParser = __commonJS({
  "node_modules/typescript-parsec/lib/Parsers/SequencialParser.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.seq = void 0;
    var ParserInterface_1 = require_ParserInterface();
    function seq2() {
      var ps = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        ps[_i] = arguments[_i];
      }
      return {
        parse: function(token) {
          var error;
          var result = [{ firstToken: token, nextToken: token, result: [] }];
          for (var _i2 = 0, ps_1 = ps; _i2 < ps_1.length; _i2++) {
            var p = ps_1[_i2];
            if (result.length === 0) {
              break;
            }
            var steps = result;
            result = [];
            for (var _a = 0, steps_1 = steps; _a < steps_1.length; _a++) {
              var step = steps_1[_a];
              var output = p.parse(step.nextToken);
              error = ParserInterface_1.betterError(error, output.error);
              if (output.successful) {
                for (var _b = 0, _c = output.candidates; _b < _c.length; _b++) {
                  var candidate = _c[_b];
                  result.push({
                    firstToken: step.firstToken,
                    nextToken: candidate.nextToken,
                    result: step.result.concat([candidate.result])
                  });
                }
              }
            }
          }
          return ParserInterface_1.resultOrError(result, error, result.length !== 0);
        }
      };
    }
    exports.seq = seq2;
  }
});

// node_modules/typescript-parsec/lib/Parsers/AlternativeParser.js
var require_AlternativeParser = __commonJS({
  "node_modules/typescript-parsec/lib/Parsers/AlternativeParser.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.alt = void 0;
    var ParserInterface_1 = require_ParserInterface();
    function alt() {
      var ps = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        ps[_i] = arguments[_i];
      }
      return {
        parse: function(token) {
          var error;
          var result = [];
          var successful = false;
          for (var _i2 = 0, ps_1 = ps; _i2 < ps_1.length; _i2++) {
            var p = ps_1[_i2];
            var output = p.parse(token);
            error = ParserInterface_1.betterError(error, output.error);
            if (output.successful) {
              result = result.concat(output.candidates);
              successful = true;
            }
          }
          return ParserInterface_1.resultOrError(result, error, successful);
        }
      };
    }
    exports.alt = alt;
  }
});

// node_modules/typescript-parsec/lib/Parsers/AlternativeScParser.js
var require_AlternativeScParser = __commonJS({
  "node_modules/typescript-parsec/lib/Parsers/AlternativeScParser.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.alt_sc = void 0;
    var ParserInterface_1 = require_ParserInterface();
    function alt_sc2() {
      var ps = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        ps[_i] = arguments[_i];
      }
      return {
        parse: function(token) {
          var error;
          for (var _i2 = 0, ps_1 = ps; _i2 < ps_1.length; _i2++) {
            var p = ps_1[_i2];
            var output = p.parse(token);
            error = ParserInterface_1.betterError(error, output.error);
            if (output.successful) {
              return ParserInterface_1.resultOrError(output.candidates, error, true);
            }
          }
          return {
            successful: false,
            error
          };
        }
      };
    }
    exports.alt_sc = alt_sc2;
  }
});

// node_modules/typescript-parsec/lib/Parsers/OptionalParser.js
var require_OptionalParser = __commonJS({
  "node_modules/typescript-parsec/lib/Parsers/OptionalParser.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.opt_sc = exports.opt = void 0;
    var AlternativeParser_1 = require_AlternativeParser();
    var TokenParser_1 = require_TokenParser();
    function opt(p) {
      return AlternativeParser_1.alt(p, TokenParser_1.nil());
    }
    exports.opt = opt;
    function opt_sc(p) {
      return {
        parse: function(token) {
          var output = p.parse(token);
          if (output.successful) {
            return output;
          } else {
            return {
              candidates: [{
                firstToken: token,
                nextToken: token,
                result: void 0
              }],
              successful: true,
              error: output.error
            };
          }
        }
      };
    }
    exports.opt_sc = opt_sc;
  }
});

// node_modules/typescript-parsec/lib/Parsers/ApplyParser.js
var require_ApplyParser = __commonJS({
  "node_modules/typescript-parsec/lib/Parsers/ApplyParser.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.kmid = exports.kright = exports.kleft = exports.apply = void 0;
    var SequencialParser_1 = require_SequencialParser();
    function apply2(p, callback) {
      return {
        parse: function(token) {
          var output = p.parse(token);
          if (output.successful) {
            return {
              candidates: output.candidates.map(function(value) {
                return {
                  firstToken: token,
                  nextToken: value.nextToken,
                  result: callback(value.result, [token, value.nextToken])
                };
              }),
              successful: true,
              error: output.error
            };
          } else {
            return output;
          }
        }
      };
    }
    exports.apply = apply2;
    function kleft2(p1, p2) {
      return apply2(SequencialParser_1.seq(p1, p2), function(value) {
        return value[0];
      });
    }
    exports.kleft = kleft2;
    function kright(p1, p2) {
      return apply2(SequencialParser_1.seq(p1, p2), function(value) {
        return value[1];
      });
    }
    exports.kright = kright;
    function kmid2(p1, p2, p3) {
      return apply2(SequencialParser_1.seq(p1, p2, p3), function(value) {
        return value[1];
      });
    }
    exports.kmid = kmid2;
  }
});

// node_modules/typescript-parsec/lib/Parsers/RepeativeParser.js
var require_RepeativeParser = __commonJS({
  "node_modules/typescript-parsec/lib/Parsers/RepeativeParser.js"(exports) {
    "use strict";
    var __spreadArrays = exports && exports.__spreadArrays || function() {
      for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
      for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
      return r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lrec_sc = exports.lrec = exports.list_n = exports.list_sc = exports.list = exports.rep_n = exports.repr = exports.rep_sc = exports.rep = void 0;
    var ApplyParser_1 = require_ApplyParser();
    var ParserInterface_1 = require_ParserInterface();
    var SequencialParser_1 = require_SequencialParser();
    var TokenParser_1 = require_TokenParser();
    function rep(p) {
      var reprParser = repr(p);
      return {
        parse: function(token) {
          var output = reprParser.parse(token);
          if (output.successful) {
            return {
              candidates: output.candidates.reverse(),
              successful: true,
              error: output.error
            };
          } else {
            return output;
          }
        }
      };
    }
    exports.rep = rep;
    function rep_sc2(p) {
      return {
        parse: function(token) {
          var error;
          var result = [{ firstToken: token, nextToken: token, result: [] }];
          while (true) {
            var steps = result;
            result = [];
            for (var _i = 0, steps_1 = steps; _i < steps_1.length; _i++) {
              var step = steps_1[_i];
              var output = p.parse(step.nextToken);
              error = ParserInterface_1.betterError(error, output.error);
              if (output.successful) {
                for (var _a = 0, _b = output.candidates; _a < _b.length; _a++) {
                  var candidate = _b[_a];
                  if (candidate.nextToken !== step.nextToken) {
                    result.push({
                      firstToken: step.firstToken,
                      nextToken: candidate.nextToken,
                      result: step.result.concat([candidate.result])
                    });
                  }
                }
              }
            }
            if (result.length === 0) {
              result = steps;
              break;
            }
          }
          return ParserInterface_1.resultOrError(result, error, true);
        }
      };
    }
    exports.rep_sc = rep_sc2;
    function repr(p) {
      return {
        parse: function(token) {
          var error;
          var result = [{ firstToken: token, nextToken: token, result: [] }];
          for (var i = 0; i < result.length; i++) {
            var step = result[i];
            var output = p.parse(step.nextToken);
            error = ParserInterface_1.betterError(error, output.error);
            if (output.successful) {
              for (var _i = 0, _a = output.candidates; _i < _a.length; _i++) {
                var candidate = _a[_i];
                if (candidate.nextToken !== step.nextToken) {
                  result.push({
                    firstToken: step.firstToken,
                    nextToken: candidate.nextToken,
                    result: step.result.concat([candidate.result])
                  });
                }
              }
            }
          }
          return ParserInterface_1.resultOrError(result, error, true);
        }
      };
    }
    exports.repr = repr;
    function rep_n(p, count) {
      return {
        parse: function(token) {
          var error;
          var candidates = [{ firstToken: token, nextToken: token, result: [] }];
          for (var i = 0; i < count; i++) {
            var newCandidates = [];
            for (var _i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
              var step = candidates_1[_i];
              var output = p.parse(step.nextToken);
              error = ParserInterface_1.betterError(error, output.error);
              if (output.successful) {
                for (var _a = 0, _b = output.candidates; _a < _b.length; _a++) {
                  var candidate = _b[_a];
                  newCandidates.push({
                    firstToken: step.firstToken,
                    nextToken: candidate.nextToken,
                    result: step.result.concat([candidate.result])
                  });
                }
              }
            }
            if (newCandidates.length === 0) {
              return {
                successful: false,
                error
              };
            } else {
              candidates = newCandidates;
            }
          }
          return ParserInterface_1.resultOrError(candidates, error, true);
        }
      };
    }
    exports.rep_n = rep_n;
    function applyList(_a) {
      var first = _a[0], tail = _a[1];
      return __spreadArrays([first], tail);
    }
    function list(p, s) {
      return ApplyParser_1.apply(SequencialParser_1.seq(p, rep(ApplyParser_1.kright(s, p))), applyList);
    }
    exports.list = list;
    function list_sc(p, s) {
      return ApplyParser_1.apply(SequencialParser_1.seq(p, rep_sc2(ApplyParser_1.kright(s, p))), applyList);
    }
    exports.list_sc = list_sc;
    function list_n(p, s, count) {
      if (count < 1) {
        return TokenParser_1.succ([]);
      } else if (count === 1) {
        return ApplyParser_1.apply(p, function(value) {
          return [value];
        });
      } else {
        return ApplyParser_1.apply(SequencialParser_1.seq(p, rep_n(ApplyParser_1.kright(s, p), count - 1)), applyList);
      }
    }
    exports.list_n = list_n;
    function applyLrec(callback) {
      return function(value) {
        var result = value[0];
        for (var _i = 0, _a = value[1]; _i < _a.length; _i++) {
          var tail = _a[_i];
          result = callback(result, tail);
        }
        return result;
      };
    }
    function lrec(p, q, callback) {
      return ApplyParser_1.apply(SequencialParser_1.seq(p, rep(q)), applyLrec(callback));
    }
    exports.lrec = lrec;
    function lrec_sc2(p, q, callback) {
      return ApplyParser_1.apply(SequencialParser_1.seq(p, rep_sc2(q)), applyLrec(callback));
    }
    exports.lrec_sc = lrec_sc2;
  }
});

// node_modules/typescript-parsec/lib/Parsers/AmbiguousParser.js
var require_AmbiguousParser = __commonJS({
  "node_modules/typescript-parsec/lib/Parsers/AmbiguousParser.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.amb = void 0;
    function amb(p) {
      return {
        parse: function(token) {
          var branches = p.parse(token);
          if (!branches.successful) {
            return branches;
          }
          var group = /* @__PURE__ */ new Map();
          for (var _i = 0, _a = branches.candidates; _i < _a.length; _i++) {
            var r = _a[_i];
            var rs = group.get(r.nextToken);
            if (rs === void 0) {
              group.set(r.nextToken, [r]);
            } else {
              rs.push(r);
            }
          }
          return {
            candidates: Array.from(group.values()).map(function(rs2) {
              return {
                firstToken: rs2[0].firstToken,
                nextToken: rs2[0].nextToken,
                result: rs2.map(function(r2) {
                  return r2.result;
                })
              };
            }),
            successful: true,
            error: branches.error
          };
        }
      };
    }
    exports.amb = amb;
  }
});

// node_modules/typescript-parsec/lib/Parsers/ErrorParser.js
var require_ErrorParser = __commonJS({
  "node_modules/typescript-parsec/lib/Parsers/ErrorParser.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.errd = exports.err = void 0;
    function err(p, errorMessage) {
      return {
        parse: function(token) {
          var branches = p.parse(token);
          if (branches.successful) {
            return branches;
          }
          return {
            successful: false,
            error: {
              kind: "Error",
              pos: branches.error.pos,
              message: errorMessage
            }
          };
        }
      };
    }
    exports.err = err;
    function errd(p, errorMessage, defaultValue) {
      return {
        parse: function(token) {
          var branches = p.parse(token);
          if (branches.successful) {
            return branches;
          }
          return {
            successful: true,
            candidates: [{
              firstToken: token,
              nextToken: token,
              result: defaultValue
            }],
            error: {
              kind: "Error",
              pos: branches.error.pos,
              message: errorMessage
            }
          };
        }
      };
    }
    exports.errd = errd;
  }
});

// node_modules/typescript-parsec/lib/Parsers/Rule.js
var require_Rule = __commonJS({
  "node_modules/typescript-parsec/lib/Parsers/Rule.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.expectSingleResult = exports.expectEOF = exports.rule = void 0;
    var Lexer_1 = require_Lexer();
    var ParserInterface_1 = require_ParserInterface();
    var RuleImpl = (
      /** @class */
      function() {
        function RuleImpl2() {
        }
        RuleImpl2.prototype.setPattern = function(parser) {
          this.parser = parser;
        };
        RuleImpl2.prototype.parse = function(token) {
          if (this.parser === void 0) {
            throw new Error("Rule has not been initialized. setPattern is required before calling parse.");
          }
          return this.parser.parse(token);
        };
        return RuleImpl2;
      }()
    );
    function rule2() {
      return new RuleImpl();
    }
    exports.rule = rule2;
    function expectEOF2(output) {
      if (!output.successful) {
        return output;
      }
      if (output.candidates.length === 0) {
        return {
          successful: false,
          error: {
            kind: "Error",
            pos: void 0,
            message: "No result is returned."
          }
        };
      }
      var filtered = [];
      var error = output.error;
      for (var _i = 0, _a = output.candidates; _i < _a.length; _i++) {
        var candidate = _a[_i];
        if (candidate.nextToken === void 0) {
          filtered.push(candidate);
        } else {
          error = ParserInterface_1.betterError(error, {
            kind: "Error",
            pos: candidate.nextToken === void 0 ? void 0 : candidate.nextToken.pos,
            message: 'The parser cannot reach the end of file, stops at "' + candidate.nextToken.text + '" at position ' + JSON.stringify(candidate.nextToken.pos) + "."
          });
        }
      }
      return ParserInterface_1.resultOrError(filtered, error, filtered.length !== 0);
    }
    exports.expectEOF = expectEOF2;
    function expectSingleResult2(output) {
      if (!output.successful) {
        throw new Lexer_1.TokenError(output.error.pos, output.error.message);
      }
      if (output.candidates.length === 0) {
        throw new Lexer_1.TokenError(void 0, "No result is returned.");
      }
      if (output.candidates.length !== 1) {
        throw new Lexer_1.TokenError(void 0, "Multiple results are returned.");
      }
      return output.candidates[0].result;
    }
    exports.expectSingleResult = expectSingleResult2;
  }
});

// node_modules/typescript-parsec/lib/ParserModule.js
var require_ParserModule = __commonJS({
  "node_modules/typescript-parsec/lib/ParserModule.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.makeParserModule = exports.lazy = void 0;
    function lazy(thunk) {
      return {
        parse: function(token) {
          return thunk().parse(token);
        }
      };
    }
    exports.lazy = lazy;
    var defineReadOnly = function(target, propName, value) {
      return Object.defineProperty(target, propName, {
        configurable: true,
        writable: false,
        enumerable: true,
        value
      });
    };
    function makeParserModule(definitions) {
      var parserModule = /* @__PURE__ */ Object.create(null);
      var _loop_1 = function(key2, parserThunk2) {
        parserModule = defineReadOnly(parserModule, key2, lazy(function() {
          return parserThunk2(parserModule);
        }));
      };
      for (var _i = 0, _a = Object.entries(definitions); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], parserThunk = _b[1];
        _loop_1(key, parserThunk);
      }
      return parserModule;
    }
    exports.makeParserModule = makeParserModule;
  }
});

// node_modules/typescript-parsec/lib/index.js
var require_lib = __commonJS({
  "node_modules/typescript-parsec/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !exports2.hasOwnProperty(p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_Lexer(), exports);
    __exportStar(require_ParserInterface(), exports);
    __exportStar(require_TokenParser(), exports);
    __exportStar(require_MonadicSequencialParser(), exports);
    __exportStar(require_SequencialParser(), exports);
    __exportStar(require_AlternativeParser(), exports);
    __exportStar(require_AlternativeScParser(), exports);
    __exportStar(require_OptionalParser(), exports);
    __exportStar(require_RepeativeParser(), exports);
    __exportStar(require_ApplyParser(), exports);
    __exportStar(require_AmbiguousParser(), exports);
    __exportStar(require_ErrorParser(), exports);
    __exportStar(require_Rule(), exports);
    __exportStar(require_ParserModule(), exports);
  }
});

// src/audio/notes.ts
var import_typescript_parsec = __toESM(require_lib());
var noteLexer = (0, import_typescript_parsec.buildLexer)([
  [true, /^\(/g, 0 /* Open */],
  [true, /^\)/g, 1 /* Close */],
  [true, /^\:/g, 2 /* Colon */],
  [true, /^\//g, 3 /* Slash */],
  [false, /^\s+/g, 4 /* Whitespace */],
  [false, /^\/\/[^\n]*/g, 7 /* Comment */],
  [true, /^(\+|\-)?[0-9]+/g, 5 /* Integer */],
  [true, /^[a-gA-G][b#]*[0-9]*/g, 6 /* ChromaticKey */]
]);
var note_timing = (0, import_typescript_parsec.alt_sc)(
  (0, import_typescript_parsec.apply)((0, import_typescript_parsec.kleft)((0, import_typescript_parsec.tok)(5 /* Integer */), (0, import_typescript_parsec.str)(":")), (t) => Number(t.text)),
  (0, import_typescript_parsec.apply)((0, import_typescript_parsec.nil)(), () => 1)
);
var primitive_note = (0, import_typescript_parsec.apply)(
  (0, import_typescript_parsec.seq)(note_timing, (0, import_typescript_parsec.alt_sc)((0, import_typescript_parsec.tok)(6 /* ChromaticKey */), (0, import_typescript_parsec.tok)(5 /* Integer */))),
  ([timing, note2]) => ({
    type: "note",
    timing,
    noteData: note2.text
  })
);
var chord_inner = (0, import_typescript_parsec.rule)();
var chord = (0, import_typescript_parsec.apply)(
  (0, import_typescript_parsec.seq)(
    note_timing,
    (0, import_typescript_parsec.lrec_sc)(
      (0, import_typescript_parsec.apply)(chord_inner, (x) => [x]),
      (0, import_typescript_parsec.seq)((0, import_typescript_parsec.str)("/"), chord_inner),
      (a, [_, b]) => [...a, b]
    )
  ),
  ([timing, notes]) => ({
    type: "chord",
    timing,
    notes
  })
);
var compound_note = (0, import_typescript_parsec.rule)();
var compound_note_inner = (0, import_typescript_parsec.rep_sc)(
  (0, import_typescript_parsec.alt_sc)(primitive_note, chord, compound_note)
);
compound_note.setPattern(
  (0, import_typescript_parsec.apply)(
    (0, import_typescript_parsec.seq)(note_timing, (0, import_typescript_parsec.kmid)((0, import_typescript_parsec.str)("("), compound_note_inner, (0, import_typescript_parsec.str)(")"))),
    ([timing, notes]) => ({ type: "compound", timing, notes })
  )
);
chord_inner.setPattern((0, import_typescript_parsec.alt_sc)(primitive_note, compound_note));
var note = (0, import_typescript_parsec.alt_sc)(chord, compound_note, primitive_note);
var track = (0, import_typescript_parsec.rep_sc)(note);
function parseNotes(src) {
  const tokens = noteLexer.parse(src);
  return (0, import_typescript_parsec.expectSingleResult)((0, import_typescript_parsec.expectEOF)(track.parse(tokens)));
}
function getBeatCount(notes) {
  return notes.reduce((p, c) => p + c.timing, 0);
}
function createTrackSpecForNoteSequence(startTime, duration, notes, lastFreq, patch) {
  let time = startTime;
  let freq = lastFreq;
  let spec = [];
  const timingTotal = getBeatCount(notes);
  for (const n of notes) {
    const thisNoteDuration = duration * n.timing / timingTotal;
    const data = createTrackSpecForNote(time, thisNoteDuration, n, freq, patch);
    spec.push(...data.trackSpec);
    time += thisNoteDuration;
    freq = data.freq;
  }
  return {
    freq,
    trackSpec: spec
  };
}
function createTrackSpecForNote(startTime, duration, note2, lastFreq, patch) {
  if (note2.type === "note") {
    const freq = note2freq(note2.noteData, lastFreq);
    return {
      freq,
      trackSpec: [
        {
          start: startTime,
          audio: patch(freq, duration)
        }
      ]
    };
  } else if (note2.type === "chord") {
    const results = note2.notes.map(
      (n) => createTrackSpecForNote(startTime, duration * n.timing, n, lastFreq, patch)
    );
    return {
      freq: results.at(-1).freq,
      trackSpec: results.flatMap((x) => x.trackSpec)
    };
  } else if (note2.type === "compound") {
    return createTrackSpecForNoteSequence(
      startTime,
      duration,
      note2.notes,
      lastFreq,
      patch
    );
  }
}
function createTrackSpec(track2, bpm, patch) {
  return createTrackSpecForNoteSequence(
    0,
    getBeatCount(track2) * 60 / bpm,
    track2,
    440,
    patch
  ).trackSpec;
}
function note2freq(note2, lastfreq) {
  if (note2[0].match(/[a-gA-G]/g)) {
    let semitone = {
      a: 0,
      b: 2,
      c: 3,
      d: 5,
      e: 7,
      f: 8,
      g: 10
    }[note2[0].toLowerCase()];
    let i;
    for (i = 1; note2[i] === "b" || note2[i] === "#"; i++) {
      semitone += note2[i] === "#" ? 1 : -1;
    }
    let octave = parseInt(note2.slice(i));
    if (isNaN(octave)) octave = 4;
    semitone += (octave - 4) * 12;
    return Math.pow(2, semitone / 12) * 440;
  } else {
    return (lastfreq ?? 440) * Math.pow(2, parseInt(note2) / 12);
  }
}
export {
  createTrackSpec,
  createTrackSpecForNote,
  createTrackSpecForNoteSequence,
  getBeatCount,
  note2freq,
  parseNotes
};
