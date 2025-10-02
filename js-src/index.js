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

// node_modules/fft.js/lib/fft.js
var require_fft = __commonJS({
  "node_modules/fft.js/lib/fft.js"(exports, module) {
    "use strict";
    function FFT2(size) {
      this.size = size | 0;
      if (this.size <= 1 || (this.size & this.size - 1) !== 0)
        throw new Error("FFT size must be a power of two and bigger than 1");
      this._csize = size << 1;
      var table = new Array(this.size * 2);
      for (var i = 0; i < table.length; i += 2) {
        const angle = Math.PI * i / this.size;
        table[i] = Math.cos(angle);
        table[i + 1] = -Math.sin(angle);
      }
      this.table = table;
      var power = 0;
      for (var t = 1; this.size > t; t <<= 1)
        power++;
      this._width = power % 2 === 0 ? power - 1 : power;
      this._bitrev = new Array(1 << this._width);
      for (var j = 0; j < this._bitrev.length; j++) {
        this._bitrev[j] = 0;
        for (var shift = 0; shift < this._width; shift += 2) {
          var revShift = this._width - shift - 2;
          this._bitrev[j] |= (j >>> shift & 3) << revShift;
        }
      }
      this._out = null;
      this._data = null;
      this._inv = 0;
    }
    module.exports = FFT2;
    FFT2.prototype.fromComplexArray = function fromComplexArray(complex, storage) {
      var res = storage || new Array(complex.length >>> 1);
      for (var i = 0; i < complex.length; i += 2)
        res[i >>> 1] = complex[i];
      return res;
    };
    FFT2.prototype.createComplexArray = function createComplexArray() {
      const res = new Array(this._csize);
      for (var i = 0; i < res.length; i++)
        res[i] = 0;
      return res;
    };
    FFT2.prototype.toComplexArray = function toComplexArray(input, storage) {
      var res = storage || this.createComplexArray();
      for (var i = 0; i < res.length; i += 2) {
        res[i] = input[i >>> 1];
        res[i + 1] = 0;
      }
      return res;
    };
    FFT2.prototype.completeSpectrum = function completeSpectrum(spectrum) {
      var size = this._csize;
      var half = size >>> 1;
      for (var i = 2; i < half; i += 2) {
        spectrum[size - i] = spectrum[i];
        spectrum[size - i + 1] = -spectrum[i + 1];
      }
    };
    FFT2.prototype.transform = function transform(out, data) {
      if (out === data)
        throw new Error("Input and output buffers must be different");
      this._out = out;
      this._data = data;
      this._inv = 0;
      this._transform4();
      this._out = null;
      this._data = null;
    };
    FFT2.prototype.realTransform = function realTransform(out, data) {
      if (out === data)
        throw new Error("Input and output buffers must be different");
      this._out = out;
      this._data = data;
      this._inv = 0;
      this._realTransform4();
      this._out = null;
      this._data = null;
    };
    FFT2.prototype.inverseTransform = function inverseTransform(out, data) {
      if (out === data)
        throw new Error("Input and output buffers must be different");
      this._out = out;
      this._data = data;
      this._inv = 1;
      this._transform4();
      for (var i = 0; i < out.length; i++)
        out[i] /= this.size;
      this._out = null;
      this._data = null;
    };
    FFT2.prototype._transform4 = function _transform4() {
      var out = this._out;
      var size = this._csize;
      var width = this._width;
      var step = 1 << width;
      var len = size / step << 1;
      var outOff;
      var t;
      var bitrev = this._bitrev;
      if (len === 4) {
        for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
          const off = bitrev[t];
          this._singleTransform2(outOff, off, step);
        }
      } else {
        for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
          const off = bitrev[t];
          this._singleTransform4(outOff, off, step);
        }
      }
      var inv = this._inv ? -1 : 1;
      var table = this.table;
      for (step >>= 2; step >= 2; step >>= 2) {
        len = size / step << 1;
        var quarterLen = len >>> 2;
        for (outOff = 0; outOff < size; outOff += len) {
          var limit = outOff + quarterLen;
          for (var i = outOff, k = 0; i < limit; i += 2, k += step) {
            const A = i;
            const B = A + quarterLen;
            const C = B + quarterLen;
            const D = C + quarterLen;
            const Ar = out[A];
            const Ai = out[A + 1];
            const Br = out[B];
            const Bi = out[B + 1];
            const Cr = out[C];
            const Ci = out[C + 1];
            const Dr = out[D];
            const Di = out[D + 1];
            const MAr = Ar;
            const MAi = Ai;
            const tableBr = table[k];
            const tableBi = inv * table[k + 1];
            const MBr = Br * tableBr - Bi * tableBi;
            const MBi = Br * tableBi + Bi * tableBr;
            const tableCr = table[2 * k];
            const tableCi = inv * table[2 * k + 1];
            const MCr = Cr * tableCr - Ci * tableCi;
            const MCi = Cr * tableCi + Ci * tableCr;
            const tableDr = table[3 * k];
            const tableDi = inv * table[3 * k + 1];
            const MDr = Dr * tableDr - Di * tableDi;
            const MDi = Dr * tableDi + Di * tableDr;
            const T0r = MAr + MCr;
            const T0i = MAi + MCi;
            const T1r = MAr - MCr;
            const T1i = MAi - MCi;
            const T2r = MBr + MDr;
            const T2i = MBi + MDi;
            const T3r = inv * (MBr - MDr);
            const T3i = inv * (MBi - MDi);
            const FAr = T0r + T2r;
            const FAi = T0i + T2i;
            const FCr = T0r - T2r;
            const FCi = T0i - T2i;
            const FBr = T1r + T3i;
            const FBi = T1i - T3r;
            const FDr = T1r - T3i;
            const FDi = T1i + T3r;
            out[A] = FAr;
            out[A + 1] = FAi;
            out[B] = FBr;
            out[B + 1] = FBi;
            out[C] = FCr;
            out[C + 1] = FCi;
            out[D] = FDr;
            out[D + 1] = FDi;
          }
        }
      }
    };
    FFT2.prototype._singleTransform2 = function _singleTransform2(outOff, off, step) {
      const out = this._out;
      const data = this._data;
      const evenR = data[off];
      const evenI = data[off + 1];
      const oddR = data[off + step];
      const oddI = data[off + step + 1];
      const leftR = evenR + oddR;
      const leftI = evenI + oddI;
      const rightR = evenR - oddR;
      const rightI = evenI - oddI;
      out[outOff] = leftR;
      out[outOff + 1] = leftI;
      out[outOff + 2] = rightR;
      out[outOff + 3] = rightI;
    };
    FFT2.prototype._singleTransform4 = function _singleTransform4(outOff, off, step) {
      const out = this._out;
      const data = this._data;
      const inv = this._inv ? -1 : 1;
      const step2 = step * 2;
      const step3 = step * 3;
      const Ar = data[off];
      const Ai = data[off + 1];
      const Br = data[off + step];
      const Bi = data[off + step + 1];
      const Cr = data[off + step2];
      const Ci = data[off + step2 + 1];
      const Dr = data[off + step3];
      const Di = data[off + step3 + 1];
      const T0r = Ar + Cr;
      const T0i = Ai + Ci;
      const T1r = Ar - Cr;
      const T1i = Ai - Ci;
      const T2r = Br + Dr;
      const T2i = Bi + Di;
      const T3r = inv * (Br - Dr);
      const T3i = inv * (Bi - Di);
      const FAr = T0r + T2r;
      const FAi = T0i + T2i;
      const FBr = T1r + T3i;
      const FBi = T1i - T3r;
      const FCr = T0r - T2r;
      const FCi = T0i - T2i;
      const FDr = T1r - T3i;
      const FDi = T1i + T3r;
      out[outOff] = FAr;
      out[outOff + 1] = FAi;
      out[outOff + 2] = FBr;
      out[outOff + 3] = FBi;
      out[outOff + 4] = FCr;
      out[outOff + 5] = FCi;
      out[outOff + 6] = FDr;
      out[outOff + 7] = FDi;
    };
    FFT2.prototype._realTransform4 = function _realTransform4() {
      var out = this._out;
      var size = this._csize;
      var width = this._width;
      var step = 1 << width;
      var len = size / step << 1;
      var outOff;
      var t;
      var bitrev = this._bitrev;
      if (len === 4) {
        for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
          const off = bitrev[t];
          this._singleRealTransform2(outOff, off >>> 1, step >>> 1);
        }
      } else {
        for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
          const off = bitrev[t];
          this._singleRealTransform4(outOff, off >>> 1, step >>> 1);
        }
      }
      var inv = this._inv ? -1 : 1;
      var table = this.table;
      for (step >>= 2; step >= 2; step >>= 2) {
        len = size / step << 1;
        var halfLen = len >>> 1;
        var quarterLen = halfLen >>> 1;
        var hquarterLen = quarterLen >>> 1;
        for (outOff = 0; outOff < size; outOff += len) {
          for (var i = 0, k = 0; i <= hquarterLen; i += 2, k += step) {
            var A = outOff + i;
            var B = A + quarterLen;
            var C = B + quarterLen;
            var D = C + quarterLen;
            var Ar = out[A];
            var Ai = out[A + 1];
            var Br = out[B];
            var Bi = out[B + 1];
            var Cr = out[C];
            var Ci = out[C + 1];
            var Dr = out[D];
            var Di = out[D + 1];
            var MAr = Ar;
            var MAi = Ai;
            var tableBr = table[k];
            var tableBi = inv * table[k + 1];
            var MBr = Br * tableBr - Bi * tableBi;
            var MBi = Br * tableBi + Bi * tableBr;
            var tableCr = table[2 * k];
            var tableCi = inv * table[2 * k + 1];
            var MCr = Cr * tableCr - Ci * tableCi;
            var MCi = Cr * tableCi + Ci * tableCr;
            var tableDr = table[3 * k];
            var tableDi = inv * table[3 * k + 1];
            var MDr = Dr * tableDr - Di * tableDi;
            var MDi = Dr * tableDi + Di * tableDr;
            var T0r = MAr + MCr;
            var T0i = MAi + MCi;
            var T1r = MAr - MCr;
            var T1i = MAi - MCi;
            var T2r = MBr + MDr;
            var T2i = MBi + MDi;
            var T3r = inv * (MBr - MDr);
            var T3i = inv * (MBi - MDi);
            var FAr = T0r + T2r;
            var FAi = T0i + T2i;
            var FBr = T1r + T3i;
            var FBi = T1i - T3r;
            out[A] = FAr;
            out[A + 1] = FAi;
            out[B] = FBr;
            out[B + 1] = FBi;
            if (i === 0) {
              var FCr = T0r - T2r;
              var FCi = T0i - T2i;
              out[C] = FCr;
              out[C + 1] = FCi;
              continue;
            }
            if (i === hquarterLen)
              continue;
            var ST0r = T1r;
            var ST0i = -T1i;
            var ST1r = T0r;
            var ST1i = -T0i;
            var ST2r = -inv * T3i;
            var ST2i = -inv * T3r;
            var ST3r = -inv * T2i;
            var ST3i = -inv * T2r;
            var SFAr = ST0r + ST2r;
            var SFAi = ST0i + ST2i;
            var SFBr = ST1r + ST3i;
            var SFBi = ST1i - ST3r;
            var SA = outOff + quarterLen - i;
            var SB = outOff + halfLen - i;
            out[SA] = SFAr;
            out[SA + 1] = SFAi;
            out[SB] = SFBr;
            out[SB + 1] = SFBi;
          }
        }
      }
    };
    FFT2.prototype._singleRealTransform2 = function _singleRealTransform2(outOff, off, step) {
      const out = this._out;
      const data = this._data;
      const evenR = data[off];
      const oddR = data[off + step];
      const leftR = evenR + oddR;
      const rightR = evenR - oddR;
      out[outOff] = leftR;
      out[outOff + 1] = 0;
      out[outOff + 2] = rightR;
      out[outOff + 3] = 0;
    };
    FFT2.prototype._singleRealTransform4 = function _singleRealTransform4(outOff, off, step) {
      const out = this._out;
      const data = this._data;
      const inv = this._inv ? -1 : 1;
      const step2 = step * 2;
      const step3 = step * 3;
      const Ar = data[off];
      const Br = data[off + step];
      const Cr = data[off + step2];
      const Dr = data[off + step3];
      const T0r = Ar + Cr;
      const T1r = Ar - Cr;
      const T2r = Br + Dr;
      const T3r = inv * (Br - Dr);
      const FAr = T0r + T2r;
      const FBr = T1r;
      const FBi = -T3r;
      const FCr = T0r - T2r;
      const FDr = T1r;
      const FDi = T3r;
      out[outOff] = FAr;
      out[outOff + 1] = 0;
      out[outOff + 2] = FBr;
      out[outOff + 3] = FBi;
      out[outOff + 4] = FCr;
      out[outOff + 5] = 0;
      out[outOff + 6] = FDr;
      out[outOff + 7] = FDi;
    };
  }
});

// node_modules/next-power-of-two/index.js
var require_next_power_of_two = __commonJS({
  "node_modules/next-power-of-two/index.js"(exports, module) {
    module.exports = nextPowerOfTwo;
    function nextPowerOfTwo(n) {
      if (n === 0) return 1;
      n--;
      n |= n >> 1;
      n |= n >> 2;
      n |= n >> 4;
      n |= n >> 8;
      n |= n >> 16;
      return n + 1;
    }
  }
});

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports, module) {
    "use strict";
    (function() {
      function defineDeprecationWarning(methodName, info) {
        Object.defineProperty(Component.prototype, methodName, {
          get: function() {
            console.warn(
              "%s(...) is deprecated in plain JavaScript React classes. %s",
              info[0],
              info[1]
            );
          }
        });
      }
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable)
          return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      function warnNoop(publicInstance, callerName) {
        publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
        var warningKey = publicInstance + "." + callerName;
        didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error(
          "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",
          callerName,
          publicInstance
        ), didWarnStateUpdateForUnmountedComponent[warningKey] = true);
      }
      function Component(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function ComponentDummy() {
      }
      function PureComponent(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return (type.displayName || "Context") + ".Provider";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x2) {
              }
          }
        return null;
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x2) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, self2, source, owner, props, debugStack, debugTask) {
        self2 = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== self2 ? self2 : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function cloneAndReplaceKey(oldElement, newKey) {
        newKey = ReactElement(
          oldElement.type,
          newKey,
          void 0,
          void 0,
          oldElement._owner,
          oldElement.props,
          oldElement._debugStack,
          oldElement._debugTask
        );
        oldElement._store && (newKey._store.validated = oldElement._store.validated);
        return newKey;
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function escape(key) {
        var escaperLookup = { "=": "=0", ":": "=2" };
        return "$" + key.replace(/[=:]/g, function(match) {
          return escaperLookup[match];
        });
      }
      function getElementKey(element, index) {
        return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);
      }
      function noop$1() {
      }
      function resolveThenable(thenable) {
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
          default:
            switch ("string" === typeof thenable.status ? thenable.then(noop$1, noop$1) : (thenable.status = "pending", thenable.then(
              function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
              },
              function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            )), thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                throw thenable.reason;
            }
        }
        throw thenable;
      }
      function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
        var type = typeof children;
        if ("undefined" === type || "boolean" === type) children = null;
        var invokeCallback = false;
        if (null === children) invokeCallback = true;
        else
          switch (type) {
            case "bigint":
            case "string":
            case "number":
              invokeCallback = true;
              break;
            case "object":
              switch (children.$$typeof) {
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                  invokeCallback = true;
                  break;
                case REACT_LAZY_TYPE:
                  return invokeCallback = children._init, mapIntoArray(
                    invokeCallback(children._payload),
                    array,
                    escapedPrefix,
                    nameSoFar,
                    callback
                  );
              }
          }
        if (invokeCallback) {
          invokeCallback = children;
          callback = callback(invokeCallback);
          var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
          isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
            return c;
          })) : null != callback && (isValidElement(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(
            callback,
            escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(
              userProvidedKeyEscapeRegex,
              "$&/"
            ) + "/") + childKey
          ), "" !== nameSoFar && null != invokeCallback && isValidElement(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
          return 1;
        }
        invokeCallback = 0;
        childKey = "" === nameSoFar ? "." : nameSoFar + ":";
        if (isArrayImpl(children))
          for (var i = 0; i < children.length; i++)
            nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if (i = getIteratorFn(children), "function" === typeof i)
          for (i === children.entries && (didWarnAboutMaps || console.warn(
            "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
          ), didWarnAboutMaps = true), children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
            nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if ("object" === type) {
          if ("function" === typeof children.then)
            return mapIntoArray(
              resolveThenable(children),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
          array = String(children);
          throw Error(
            "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return invokeCallback;
      }
      function mapChildren(children, func, context) {
        if (null == children) return children;
        var result = [], count = 0;
        mapIntoArray(children, result, "", "", function(child) {
          return func.call(context, child, count++);
        });
        return result;
      }
      function lazyInitializer(payload) {
        if (-1 === payload._status) {
          var ctor = payload._result;
          ctor = ctor();
          ctor.then(
            function(moduleObject) {
              if (0 === payload._status || -1 === payload._status)
                payload._status = 1, payload._result = moduleObject;
            },
            function(error) {
              if (0 === payload._status || -1 === payload._status)
                payload._status = 2, payload._result = error;
            }
          );
          -1 === payload._status && (payload._status = 0, payload._result = ctor);
        }
        if (1 === payload._status)
          return ctor = payload._result, void 0 === ctor && console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?",
            ctor
          ), "default" in ctor || console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))",
            ctor
          ), ctor.default;
        throw payload._result;
      }
      function resolveDispatcher() {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error(
          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
        );
        return dispatcher;
      }
      function noop() {
      }
      function enqueueTask(task) {
        if (null === enqueueTaskImpl)
          try {
            var requireString = ("require" + Math.random()).slice(0, 7);
            enqueueTaskImpl = (module && module[requireString]).call(
              module,
              "timers"
            ).setImmediate;
          } catch (_err) {
            enqueueTaskImpl = function(callback) {
              false === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = true, "undefined" === typeof MessageChannel && console.error(
                "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."
              ));
              var channel = new MessageChannel();
              channel.port1.onmessage = callback;
              channel.port2.postMessage(void 0);
            };
          }
        return enqueueTaskImpl(task);
      }
      function aggregateErrors(errors) {
        return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];
      }
      function popActScope(prevActQueue, prevActScopeDepth) {
        prevActScopeDepth !== actScopeDepth - 1 && console.error(
          "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "
        );
        actScopeDepth = prevActScopeDepth;
      }
      function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
        var queue = ReactSharedInternals.actQueue;
        if (null !== queue)
          if (0 !== queue.length)
            try {
              flushActQueue(queue);
              enqueueTask(function() {
                return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
              });
              return;
            } catch (error) {
              ReactSharedInternals.thrownErrors.push(error);
            }
          else ReactSharedInternals.actQueue = null;
        0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);
      }
      function flushActQueue(queue) {
        if (!isFlushing) {
          isFlushing = true;
          var i = 0;
          try {
            for (; i < queue.length; i++) {
              var callback = queue[i];
              do {
                ReactSharedInternals.didUsePromise = false;
                var continuation = callback(false);
                if (null !== continuation) {
                  if (ReactSharedInternals.didUsePromise) {
                    queue[i] = callback;
                    queue.splice(0, i);
                    return;
                  }
                  callback = continuation;
                } else break;
              } while (1);
            }
            queue.length = 0;
          } catch (error) {
            queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
          } finally {
            isFlushing = false;
          }
        }
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler");
      Symbol.for("react.provider");
      var REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
        isMounted: function() {
          return false;
        },
        enqueueForceUpdate: function(publicInstance) {
          warnNoop(publicInstance, "forceUpdate");
        },
        enqueueReplaceState: function(publicInstance) {
          warnNoop(publicInstance, "replaceState");
        },
        enqueueSetState: function(publicInstance) {
          warnNoop(publicInstance, "setState");
        }
      }, assign = Object.assign, emptyObject = {};
      Object.freeze(emptyObject);
      Component.prototype.isReactComponent = {};
      Component.prototype.setState = function(partialState, callback) {
        if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, partialState, callback, "setState");
      };
      Component.prototype.forceUpdate = function(callback) {
        this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
      };
      var deprecatedAPIs = {
        isMounted: [
          "isMounted",
          "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
        ],
        replaceState: [
          "replaceState",
          "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
        ]
      }, fnName;
      for (fnName in deprecatedAPIs)
        deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
      ComponentDummy.prototype = Component.prototype;
      deprecatedAPIs = PureComponent.prototype = new ComponentDummy();
      deprecatedAPIs.constructor = PureComponent;
      assign(deprecatedAPIs, Component.prototype);
      deprecatedAPIs.isPureReactComponent = true;
      var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = {
        H: null,
        A: null,
        T: null,
        S: null,
        V: null,
        actQueue: null,
        isBatchingLegacy: false,
        didScheduleLegacyUpdate: false,
        didUsePromise: false,
        thrownErrors: [],
        getCurrentStack: null,
        recentlyCreatedOwnerStacks: 0
      }, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      deprecatedAPIs = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = deprecatedAPIs.react_stack_bottom_frame.bind(
        deprecatedAPIs,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutMaps = false, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
          var event = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error
          });
          if (!window.dispatchEvent(event)) return;
        } else if ("object" === typeof process && "function" === typeof process.emit) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      }, didWarnAboutMessageChannel = false, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = false, isFlushing = false, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {
        queueMicrotask(function() {
          return queueMicrotask(callback);
        });
      } : enqueueTask;
      deprecatedAPIs = Object.freeze({
        __proto__: null,
        c: function(size) {
          return resolveDispatcher().useMemoCache(size);
        }
      });
      exports.Children = {
        map: mapChildren,
        forEach: function(children, forEachFunc, forEachContext) {
          mapChildren(
            children,
            function() {
              forEachFunc.apply(this, arguments);
            },
            forEachContext
          );
        },
        count: function(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        },
        toArray: function(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        },
        only: function(children) {
          if (!isValidElement(children))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return children;
        }
      };
      exports.Component = Component;
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.Profiler = REACT_PROFILER_TYPE;
      exports.PureComponent = PureComponent;
      exports.StrictMode = REACT_STRICT_MODE_TYPE;
      exports.Suspense = REACT_SUSPENSE_TYPE;
      exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
      exports.__COMPILER_RUNTIME = deprecatedAPIs;
      exports.act = function(callback) {
        var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
        actScopeDepth++;
        var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = false;
        try {
          var result = callback();
        } catch (error) {
          ReactSharedInternals.thrownErrors.push(error);
        }
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        if (null !== result && "object" === typeof result && "function" === typeof result.then) {
          var thenable = result;
          queueSeveralMicrotasks(function() {
            didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
              "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"
            ));
          });
          return {
            then: function(resolve, reject) {
              didAwaitActCall = true;
              thenable.then(
                function(returnValue) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  if (0 === prevActScopeDepth) {
                    try {
                      flushActQueue(queue), enqueueTask(function() {
                        return recursivelyFlushAsyncActWork(
                          returnValue,
                          resolve,
                          reject
                        );
                      });
                    } catch (error$0) {
                      ReactSharedInternals.thrownErrors.push(error$0);
                    }
                    if (0 < ReactSharedInternals.thrownErrors.length) {
                      var _thrownError = aggregateErrors(
                        ReactSharedInternals.thrownErrors
                      );
                      ReactSharedInternals.thrownErrors.length = 0;
                      reject(_thrownError);
                    }
                  } else resolve(returnValue);
                },
                function(error) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(
                    ReactSharedInternals.thrownErrors
                  ), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
                }
              );
            }
          };
        }
        var returnValue$jscomp$0 = result;
        popActScope(prevActQueue, prevActScopeDepth);
        0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {
          didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
            "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"
          ));
        }), ReactSharedInternals.actQueue = null);
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        return {
          then: function(resolve, reject) {
            didAwaitActCall = true;
            0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
              return recursivelyFlushAsyncActWork(
                returnValue$jscomp$0,
                resolve,
                reject
              );
            })) : resolve(returnValue$jscomp$0);
          }
        };
      };
      exports.cache = function(fn) {
        return function() {
          return fn.apply(null, arguments);
        };
      };
      exports.captureOwnerStack = function() {
        var getCurrentStack = ReactSharedInternals.getCurrentStack;
        return null === getCurrentStack ? null : getCurrentStack();
      };
      exports.cloneElement = function(element, config, children) {
        if (null === element || void 0 === element)
          throw Error(
            "The argument must be a React element, but you passed " + element + "."
          );
        var props = assign({}, element.props), key = element.key, owner = element._owner;
        if (null != config) {
          var JSCompiler_inline_result;
          a: {
            if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(
              config,
              "ref"
            ).get) && JSCompiler_inline_result.isReactWarning) {
              JSCompiler_inline_result = false;
              break a;
            }
            JSCompiler_inline_result = void 0 !== config.ref;
          }
          JSCompiler_inline_result && (owner = getOwner());
          hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
          for (propName in config)
            !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
        }
        var propName = arguments.length - 2;
        if (1 === propName) props.children = children;
        else if (1 < propName) {
          JSCompiler_inline_result = Array(propName);
          for (var i = 0; i < propName; i++)
            JSCompiler_inline_result[i] = arguments[i + 2];
          props.children = JSCompiler_inline_result;
        }
        props = ReactElement(
          element.type,
          key,
          void 0,
          void 0,
          owner,
          props,
          element._debugStack,
          element._debugTask
        );
        for (key = 2; key < arguments.length; key++)
          owner = arguments[key], isValidElement(owner) && owner._store && (owner._store.validated = 1);
        return props;
      };
      exports.createContext = function(defaultValue) {
        defaultValue = {
          $$typeof: REACT_CONTEXT_TYPE,
          _currentValue: defaultValue,
          _currentValue2: defaultValue,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        };
        defaultValue.Provider = defaultValue;
        defaultValue.Consumer = {
          $$typeof: REACT_CONSUMER_TYPE,
          _context: defaultValue
        };
        defaultValue._currentRenderer = null;
        defaultValue._currentRenderer2 = null;
        return defaultValue;
      };
      exports.createElement = function(type, config, children) {
        for (var i = 2; i < arguments.length; i++) {
          var node = arguments[i];
          isValidElement(node) && node._store && (node._store.validated = 1);
        }
        i = {};
        node = null;
        if (null != config)
          for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn(
            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
          )), hasValidKey(config) && (checkKeyStringCoercion(config.key), node = "" + config.key), config)
            hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);
        var childrenLength = arguments.length - 2;
        if (1 === childrenLength) i.children = children;
        else if (1 < childrenLength) {
          for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++)
            childArray[_i] = arguments[_i + 2];
          Object.freeze && Object.freeze(childArray);
          i.children = childArray;
        }
        if (type && type.defaultProps)
          for (propName in childrenLength = type.defaultProps, childrenLength)
            void 0 === i[propName] && (i[propName] = childrenLength[propName]);
        node && defineKeyPropWarningGetter(
          i,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        var propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return ReactElement(
          type,
          node,
          void 0,
          void 0,
          getOwner(),
          i,
          propName ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports.createRef = function() {
        var refObject = { current: null };
        Object.seal(refObject);
        return refObject;
      };
      exports.forwardRef = function(render) {
        null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error(
          "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."
        ) : "function" !== typeof render ? console.error(
          "forwardRef requires a render function but was given %s.",
          null === render ? "null" : typeof render
        ) : 0 !== render.length && 2 !== render.length && console.error(
          "forwardRef render functions accept exactly two parameters: props and ref. %s",
          1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."
        );
        null != render && null != render.defaultProps && console.error(
          "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"
        );
        var elementType = { $$typeof: REACT_FORWARD_REF_TYPE, render }, ownName;
        Object.defineProperty(elementType, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
          }
        });
        return elementType;
      };
      exports.isValidElement = isValidElement;
      exports.lazy = function(ctor) {
        return {
          $$typeof: REACT_LAZY_TYPE,
          _payload: { _status: -1, _result: ctor },
          _init: lazyInitializer
        };
      };
      exports.memo = function(type, compare) {
        null == type && console.error(
          "memo: The first argument must be a component. Instead received: %s",
          null === type ? "null" : typeof type
        );
        compare = {
          $$typeof: REACT_MEMO_TYPE,
          type,
          compare: void 0 === compare ? null : compare
        };
        var ownName;
        Object.defineProperty(compare, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
          }
        });
        return compare;
      };
      exports.startTransition = function(scope) {
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        ReactSharedInternals.T = currentTransition;
        currentTransition._updatedFibers = /* @__PURE__ */ new Set();
        try {
          var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
        } catch (error) {
          reportGlobalError(error);
        } finally {
          null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn(
            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
          )), ReactSharedInternals.T = prevTransition;
        }
      };
      exports.unstable_useCacheRefresh = function() {
        return resolveDispatcher().useCacheRefresh();
      };
      exports.use = function(usable) {
        return resolveDispatcher().use(usable);
      };
      exports.useActionState = function(action, initialState, permalink) {
        return resolveDispatcher().useActionState(
          action,
          initialState,
          permalink
        );
      };
      exports.useCallback = function(callback, deps) {
        return resolveDispatcher().useCallback(callback, deps);
      };
      exports.useContext = function(Context) {
        var dispatcher = resolveDispatcher();
        Context.$$typeof === REACT_CONSUMER_TYPE && console.error(
          "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"
        );
        return dispatcher.useContext(Context);
      };
      exports.useDebugValue = function(value, formatterFn) {
        return resolveDispatcher().useDebugValue(value, formatterFn);
      };
      exports.useDeferredValue = function(value, initialValue) {
        return resolveDispatcher().useDeferredValue(value, initialValue);
      };
      exports.useEffect = function(create, createDeps, update) {
        null == create && console.warn(
          "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        var dispatcher = resolveDispatcher();
        if ("function" === typeof update)
          throw Error(
            "useEffect CRUD overload is not enabled in this build of React."
          );
        return dispatcher.useEffect(create, createDeps);
      };
      exports.useId = function() {
        return resolveDispatcher().useId();
      };
      exports.useImperativeHandle = function(ref, create, deps) {
        return resolveDispatcher().useImperativeHandle(ref, create, deps);
      };
      exports.useInsertionEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useInsertionEffect(create, deps);
      };
      exports.useLayoutEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useLayoutEffect(create, deps);
      };
      exports.useMemo = function(create, deps) {
        return resolveDispatcher().useMemo(create, deps);
      };
      exports.useOptimistic = function(passthrough, reducer) {
        return resolveDispatcher().useOptimistic(passthrough, reducer);
      };
      exports.useReducer = function(reducer, initialArg, init) {
        return resolveDispatcher().useReducer(reducer, initialArg, init);
      };
      exports.useRef = function(initialValue) {
        return resolveDispatcher().useRef(initialValue);
      };
      exports.useState = function(initialState) {
        return resolveDispatcher().useState(initialState);
      };
      exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
        return resolveDispatcher().useSyncExternalStore(
          subscribe,
          getSnapshot,
          getServerSnapshot
        );
      };
      exports.useTransition = function() {
        return resolveDispatcher().useTransition();
      };
      exports.version = "19.1.1";
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_development();
    }
  }
});

// src/workerify.ts
function workerifyServer(i, discriminator, onReceive, send) {
  let inf = i;
  const unsub = onReceive(async (req) => {
    if (!req || req._discriminator !== discriminator) {
      return;
    }
    const typedReq = req;
    const responseContents = await inf[typedReq.type](...typedReq.contents);
    send({
      contents: responseContents,
      _discriminator: discriminator,
      id: typedReq.id
    });
  });
  return {
    unsub,
    setInterface(i2) {
      inf = i2;
    }
  };
}
function workerifyClient(discriminator, onReceive, send) {
  let msgid = 0;
  return new Proxy({}, {
    get(i, prop) {
      return (...args) => {
        const id2 = (msgid++).toString();
        const req = {
          type: prop,
          contents: args,
          _discriminator: discriminator,
          id: id2
        };
        return new Promise((resolve, reject) => {
          const unsub = onReceive((res) => {
            if (!res || res._discriminator !== discriminator) {
              return;
            }
            const typedRes = res;
            if (typedRes.id === id2) {
              resolve(typedRes.contents);
              unsub();
            }
          });
          send(req);
        });
      };
    }
  });
}
function workerifyServerIframe(discriminator, i, target) {
  return workerifyServer(
    i,
    discriminator,
    (cb) => {
      const listener = (e) => cb(e.data);
      window.addEventListener("message", listener);
      return () => {
        window.removeEventListener("message", listener);
      };
    },
    (r) => {
      target.postMessage(r, "*");
    }
  );
}
function workerifyClientIframe(discriminator, target) {
  return workerifyClient(
    discriminator,
    (cb) => {
      const listener = (e) => cb(e.data);
      window.addEventListener("message", listener);
      return () => {
        window.removeEventListener("message", listener);
      };
    },
    (req) => {
      target.postMessage(req, "*");
    }
  );
}
function createWorkerWithInterface(discriminator, src) {
  const worker = new Worker(src);
  return workerifyClient(
    discriminator,
    (cb) => {
      const listener = (e) => cb(e.data);
      worker.addEventListener("message", listener);
      return () => {
        worker.removeEventListener("message", listener);
      };
    },
    (req) => {
      worker.postMessage(req);
    }
  );
}
function createWorkerReceiver(discriminator, t) {
  return workerifyServer(
    t,
    discriminator,
    (cb) => {
      const listener = (e) => cb(e.data);
      globalThis.addEventListener("message", listener);
      return () => {
        globalThis.removeEventListener("message", listener);
      };
    },
    (req) => {
      globalThis.postMessage(req);
    }
  );
}

// src/wait.ts
function waitUntil(fn) {
  return new Promise((resolve, reject) => {
    const unsub = fn((t) => {
      unsub();
      resolve(t);
    });
  });
}
function wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}
function waitForCond(fn, checkInterval = 0) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const result = fn();
      if (result !== void 0) {
        resolve(result);
        clearInterval(interval);
      }
    }, checkInterval);
  });
}

// src/throttle.ts
function throttle(callback, options) {
  let queue = [];
  const requestHistorySize = options.limits.reduce(
    (prev, curr) => Math.max(prev, curr.duration),
    0
  );
  let requestHistory = [];
  const pendingRequests = /* @__PURE__ */ new Set();
  setInterval(() => {
    while (true) {
      const req = queue.at(0);
      if (!req) return;
      const time = Date.now();
      requestHistory = requestHistory.filter(
        (h) => (time - h.time) / 1e3 <= requestHistorySize
      );
      if (pendingRequests.size >= options.maxConcurrentRequests) return;
      for (const l of options.limits) {
        let reqCount = 0;
        for (const h of requestHistory) {
          const secondsAgo = (time - h.time) / 1e3;
          if (secondsAgo <= l.duration) {
            reqCount++;
          }
        }
        if (reqCount >= l.maxRequests) {
          return;
        }
      }
      queue.shift();
      requestHistory.push({
        time: Date.now()
      });
      const responsePromise = callback(...req.params);
      pendingRequests.add(responsePromise);
      (async () => {
        const response = await responsePromise;
        req.callback(response);
        pendingRequests.delete(responsePromise);
      })();
    }
  });
  const fn = (...params) => {
    return new Promise((resolve, reject) => {
      queue.push({
        params,
        callback: (rt) => {
          resolve(rt);
        }
      });
    });
  };
  fn._throttled = true;
  return fn;
}

// src/threadpool.ts
function createRoundRobinThreadpool(src) {
  const count = navigator.hardwareConcurrency;
  const workers = [];
  let nextWorker = 0;
  for (let i = 0; i < count; i++) {
    workers.push(new Worker(src));
  }
  function getNextWorker() {
    const w2 = workers[nextWorker];
    nextWorker = (nextWorker + 1) % count;
    return w2;
  }
  let id2 = 0;
  return new Proxy({}, {
    get(i, prop) {
      return (...args) => {
        return new Promise((resolve, reject) => {
          const myid = id2;
          id2++;
          const nextWorker2 = getNextWorker();
          const onResponse = (e) => {
            if (e.data.id !== myid) return;
            nextWorker2.removeEventListener("message", onResponse);
            resolve(e.data.returnValue);
          };
          nextWorker2.addEventListener("message", onResponse);
          nextWorker2.postMessage({
            type: prop,
            args,
            id: myid
          });
        });
      };
    }
  });
}
function createRoundRobinThread(t) {
  self.addEventListener("message", async (e) => {
    const resp = await t[e.data.type](...e.data.args);
    postMessage({
      returnValue: resp,
      id: e.data.id
    });
  });
}

// src/stringutils.ts
async function smartAsyncReplaceAll(input, rgx, callback, options) {
  if (!options) options = {};
  if (options.cursor === void 0) options.cursor = 0;
  const matchesRaw = input.matchAll(rgx);
  const matches = matchesRaw ? [...matchesRaw] : [];
  let outFragments = [];
  function calcCursorPos(initCursor, start, length) {
    const outCursor = initCursor - start;
    if (outCursor < 0 || outCursor > length) return void 0;
    return outCursor;
  }
  for (let i = 0; i < matches.length + 1; i++) {
    const prevIndex = matches[i - 1] ? matches[i - 1].index + matches[i - 1][0].length : 0;
    const currIndex = matches[i] ? matches[i].index : input.length;
    let precedingFragment = input.slice(prevIndex, currIndex);
    let matchedFragment = matches[i] ? matches[i][0] : "";
    outFragments.push(
      Promise.resolve({
        beforeStr: precedingFragment,
        afterStr: precedingFragment,
        cursorPos: calcCursorPos(
          options.cursor,
          prevIndex,
          precedingFragment.length
        )
      })
    );
    if (matches[i] === void 0) break;
    outFragments.push(
      (async () => {
        const res = await callback(
          matchedFragment,
          currIndex,
          calcCursorPos(options.cursor ?? 0, currIndex, matchedFragment.length)
        );
        return {
          beforeStr: matchedFragment,
          afterStr: typeof res === "string" ? res : res.str,
          cursorPos: typeof res === "string" ? void 0 : res.cursorPos
        };
      })()
    );
  }
  const awaitedOutFragments = await Promise.all(outFragments);
  let accumStringLength = 0;
  let finalCursorPos = void 0;
  for (const f of awaitedOutFragments) {
    if (f.cursorPos !== void 0) {
      finalCursorPos = accumStringLength + f.cursorPos;
      break;
    }
    accumStringLength += f.afterStr.length;
  }
  return {
    str: awaitedOutFragments.map((e) => e.afterStr).join(""),
    cursor: finalCursorPos ?? 0
  };
}
function multiDelimit(str, delimiters) {
  if (delimiters.length === 0) return str;
  return str.split(delimiters[0]).map((e) => multiDelimit(e, delimiters.slice(1)));
}
function randUnicode(lo, hi, count, random) {
  if (!random) random = () => Math.random();
  return "".padEnd(count).split("").map((e) => String.fromCharCode(Math.floor(random() * (hi - lo)) + lo));
}
function getLinesAndCols(str) {
  let line = 1;
  let col = 1;
  let out = [];
  for (const char of str) {
    out.push([line, col]);
    if (char === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  out.push([line, col]);
  return out;
}

// src/string-field.ts
function stringField(src) {
  const element = document.createElement("input");
  element.value = src.get();
  const unsub = src.subscribe((t) => {
    if (element.value !== t) {
      element.value = t;
    }
  });
  element.oninput = () => {
    src.set(element.value);
  };
  return {
    element,
    unmount: unsub
  };
}

// src/result.ts
function ok(t) {
  return {
    ok: true,
    data: t
  };
}
function err(e) {
  return {
    ok: false,
    error: e
  };
}

// src/range.ts
function range(hi) {
  let arr = [];
  for (let i = 0; i < hi && i < 1e7; i++) {
    arr.push(i);
  }
  return arr;
}
function rangeFrom(lo, hi) {
  let arr = [];
  for (let i = lo; i < hi && i < 1e7; i++) {
    arr.push(i);
  }
  return arr;
}
function stringRangeMapJoin(hi, f, s = "\\n") {
  const r = range(hi);
  return r.map(f).join(s);
}
function stringMapJoin(a, f, s = "\\n") {
  return a.map(f).join(s);
}
function smartRangeMap(n, cb) {
  const a = range(n);
  const res = a.map((i, index, arr) => {
    return cb(
      {
        remap(lo, hi, inclEnd) {
          return i / (inclEnd ? n - 1 : n) * (hi - lo) + lo;
        },
        segment(lo, hi) {
          return [i / n * (hi - lo) + lo, (i + 1) / n * (hi - lo) + lo];
        },
        slidingWindow(arr2) {
          return [arr2[i], arr2[i + 1]];
        },
        randkf() {
          if (i === 0) return 0;
          if (i === n - 1) return 100;
          const lo = i / (n - 2) * 100;
          const hi = (i + 1) / (n - 2) * 100;
          return rand(lo, hi);
        },
        get(arr2) {
          return arr2[i];
        },
        i,
        next: i + 1
      },
      index,
      res
    );
  });
  return res;
}
function id(x2) {
  return x2;
}
function smartRangeStringMapJoin(n, cb, s = "\\n") {
  return stringMapJoin(smartRangeMap(n, id), cb, s);
}
function rand(lo, hi, random) {
  if (!random) random = () => Math.random();
  return random() * (hi - lo) + lo;
}
function pickrand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function cartesianProductInner(ts, arr) {
  if (ts.length === 0) return [arr];
  return ts[0].map((e) => cartesianProductInner(ts.slice(1), [...arr, e])).flat(1);
}
function cartesianProduct(...ts) {
  const res = cartesianProductInner(ts, []);
  return res;
}

// src/quadtree.ts
function makeQuadtree(data, x1, y1, x2, y2, maxPoints, maxDepth) {
  let midX = (x1 + x2) / 2;
  let midY = (y1 + y2) / 2;
  if (maxDepth === 0 || data.length <= maxPoints) {
    return {
      data: { type: "points", points: data },
      x1,
      y1,
      x2,
      y2,
      midX,
      midY
    };
  }
  const childQuadtreeDatas = [
    [],
    [],
    [],
    []
  ];
  for (let i = 0; i < data.length; i++) {
    const pt = data[i];
    let idx = (pt.x > midX ? 1 : 0) + (pt.y > midY ? 2 : 0);
    childQuadtreeDatas[idx].push(pt);
  }
  return {
    x1,
    y1,
    x2,
    y2,
    midX,
    midY,
    data: {
      type: "children",
      children: [
        makeQuadtree(
          childQuadtreeDatas[0],
          x1,
          y1,
          midX,
          midY,
          maxPoints,
          maxDepth - 1
        ),
        makeQuadtree(
          childQuadtreeDatas[1],
          midX,
          y1,
          x2,
          midY,
          maxPoints,
          maxDepth - 1
        ),
        makeQuadtree(
          childQuadtreeDatas[2],
          x1,
          midY,
          midX,
          y2,
          maxPoints,
          maxDepth - 1
        ),
        makeQuadtree(
          childQuadtreeDatas[3],
          midX,
          midY,
          x2,
          y2,
          maxPoints,
          maxDepth - 1
        )
      ]
    }
  };
}
function doRangesIntersect(aLo, aHi, bLo, bHi) {
  return !(aHi < bLo || bHi < aLo);
}
function lookupQuadtree(qt, x1, y1, x2, y2) {
  if (!(doRangesIntersect(x1, x2, qt.x1, qt.x2) && doRangesIntersect(y1, y2, qt.y1, qt.y2)))
    return [];
  if (qt.data.type === "points") return qt.data.points;
  return [
    ...lookupQuadtree(qt.data.children[0], x1, y1, x2, y2),
    ...lookupQuadtree(qt.data.children[1], x1, y1, x2, y2),
    ...lookupQuadtree(qt.data.children[2], x1, y1, x2, y2),
    ...lookupQuadtree(qt.data.children[3], x1, y1, x2, y2)
  ];
}

// src/array-map.ts
var ArrayMap = class _ArrayMap {
  maps;
  constructor() {
    this.maps = /* @__PURE__ */ new Map();
  }
  nthMap(n) {
    let map = this.maps.get(n);
    if (!map) {
      map = /* @__PURE__ */ new Map();
      this.maps.set(n, map);
    }
    return map;
  }
  get(path) {
    let map = this.nthMap(path.length);
    for (const p of path) {
      map = map.get(p);
      if (!map) return void 0;
    }
    return map;
  }
  has(path) {
    let map = this.nthMap(path.length);
    for (const p of path) {
      map = map.get(p);
      if (!map) return false;
    }
    return true;
  }
  delete(path) {
    let map = this.nthMap(path.length);
    for (const p of path.slice(0, -1)) {
      map = map.get(p);
      if (!map) return void 0;
    }
    const item = map.get(path.at(-1));
    map.delete(path.at(-1));
    return item;
  }
  change(path, cb) {
    let map = this.nthMap(path.length);
    for (const p of path.slice(0, -1)) {
      let oldMap = map;
      map = map.get(p);
      if (!map) {
        map = /* @__PURE__ */ new Map();
        oldMap.set(p, map);
      }
    }
    map.set(path.at(-1), cb(map.get(path.at(-1))));
  }
  set(path, value) {
    this.change(path, () => value);
  }
  forEach(map) {
    const r = (n, m, path) => {
      if (n === 0) {
        map(path, m);
      } else {
        for (const [k, v] of m) r(n - 1, m, path.concat(k));
      }
    };
    for (const [n, map2] of this.maps) {
      r(n, map2, []);
    }
  }
  serialize() {
    const out = [];
    this.forEach((arr, v) => out.push([arr, v]));
    return out;
  }
  static fromSerialized(s) {
    const am = new _ArrayMap();
    for (const [k, v] of s) {
      am.set(k, v);
    }
    return am;
  }
};

// src/memo.ts
function memo(callback, serializeParams) {
  if (!serializeParams) serializeParams = (x2) => x2;
  const map = new ArrayMap();
  const fn = (...params) => {
    const serialized = serializeParams(params);
    let hasCached = map.has(serialized);
    if (hasCached) {
      return map.get(serialized);
    }
    const result = callback(...params);
    map.set(serialized, result);
    return result;
  };
  fn.invalidate = (...params) => {
    map.delete(serializeParams(params));
  };
  fn.getCache = () => map;
  return fn;
}
function lazy(callback) {
  let executed = false;
  let cached;
  return () => {
    if (!executed) {
      cached = callback();
      executed = true;
    }
    return cached;
  };
}

// src/localstorage-io.ts
function registerStorageItem(name, defaultValue) {
  name = "radian628-wikidot-usertools-" + name;
  let subscriptions = /* @__PURE__ */ new Set();
  const obj = {
    get() {
      const it = localStorage.getItem(name);
      if (!it) return defaultValue;
      try {
        return JSON.parse(it);
      } catch {
        return defaultValue;
      }
    },
    set(content) {
      localStorage.setItem(name, JSON.stringify(content));
      for (const s of subscriptions) {
        s(content);
      }
    },
    subscribe(cb) {
      subscriptions.add(cb);
      return () => {
        subscriptions.delete(cb);
      };
    }
  };
  if (!obj.get() && defaultValue) obj.set(defaultValue);
  return obj;
}

// src/listen-for-element.ts
function listenForSelector(selector) {
  const elem = document.querySelector(selector);
  if (elem) return Promise.resolve(elem);
  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(() => {
      const elem2 = document.querySelector(selector);
      if (elem2) {
        observer.disconnect();
        resolve(elem2);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}
function listenForNoSelector(selector) {
  const elem = document.querySelector(selector);
  if (!elem) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(() => {
      const elem2 = document.querySelector(selector);
      if (!elem2) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}
var alterElementsCallbackId = 0;
function alterElements(selector, callback) {
  const id2 = alterElementsCallbackId++;
  const alteredByKey = "alteredby" + id2;
  let unmountCallbacks = [];
  function alter() {
    const elems = document.querySelectorAll(selector);
    for (const e of Array.from(elems)) {
      if (e.dataset[alteredByKey]) continue;
      const unmount = callback(e);
      unmountCallbacks.push(unmount);
      e.dataset[alteredByKey] = "true";
    }
  }
  alter();
  const observer = new MutationObserver(() => {
    alter();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  return () => {
    observer.disconnect();
    for (const cb of unmountCallbacks) cb();
  };
}
var injectedCallbackId = 0;
function injectElementsAt(selector, position, element) {
  const myid = injectedCallbackId++;
  const key = "injectedBy" + injectedCallbackId;
  let shouldStop = false;
  let currentElements = [];
  function observerCallback() {
    currentElements = currentElements.filter((e) => {
      if (document.body.contains(e.anchor)) {
        return true;
      } else {
        e.unmount();
        e.element.parentElement?.removeChild(e.element);
        return false;
      }
    });
    const elems = document.querySelectorAll(selector);
    for (const e of Array.from(elems)) {
      if (!(e instanceof HTMLElement) || e.dataset[key]) continue;
      e.dataset[key] = "true";
      const r = element(e);
      e.insertAdjacentElement(position, r.element);
      currentElements.push({
        element: r.element,
        unmount: r.unmount,
        anchor: e
      });
    }
  }
  const observer = new MutationObserver(() => {
    observerCallback();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  observerCallback();
  return () => {
    observer.disconnect();
    shouldStop = true;
  };
}

// src/lens.ts
function setDeep(obj, path, value) {
  if (path.length === 0) return value;
  return {
    ...obj,
    [path[0]]: setDeep(obj[path[0]], path.slice(1), value)
  };
}
function getDeep(obj, path) {
  if (path.length === 0) return obj;
  return getDeep(obj[path[0]], path.slice(1));
}
function lensInner(s, path = []) {
  return new Proxy(
    {},
    {
      get(target, prop, receiver) {
        if (prop === "$") {
          return (v) => setDeep(s.at(-1), path, v);
        } else if (prop === "$push") {
          return lensInner([...s, getDeep(s.at(-1), path)], []);
        } else if (prop === "$pop") {
          return lensInner(s.slice(0, -1), []);
        } else {
          return lensInner(s.at(-1), [...path, prop]);
        }
      }
    }
  );
}
function lens(t) {
  return lensInner([t], []);
}

// src/intersect.ts
function rangeIntersects(a1, a2, b1, b2) {
  return !(a1 > b2 || b1 > a2);
}
function rectIntersects(a, b) {
  return rangeIntersects(a.left, a.right, b.left, b.right) && rangeIntersects(a.top, a.bottom, b.top, b.bottom);
}

// src/interpolation.ts
function lerp(x2, a, b) {
  return a * (1 - x2) + b * x2;
}
function unlerp(x2, a, b) {
  return (x2 - a) / (b - a);
}
function rescale(x2, a1, b1, a2, b2) {
  return lerp(unlerp(x2, a1, b1), a2, b2);
}
function clamp(x2, lo, hi) {
  return Math.max(Math.min(x2, hi), lo);
}
function clampToArray(x2, array) {
  return clamp(x2, 0, array.length - 1);
}
function getClamped(arr, i) {
  return arr[clampToArray(i, arr)];
}
function unclampedSmoothstep(x2) {
  return x2 * x2 * (3 - 2 * x2);
}
function smoothstep(x2) {
  return unclampedSmoothstep(clamp(x2, 0, 1));
}

// src/inject.ts
async function injectFunction(get, set, injector) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const fn = get();
      if (!fn) return;
      set(injector(fn));
      clearInterval(interval);
      resolve();
    });
  });
}

// src/evalbox.ts
function createEvalbox() {
  const evalbox = document.createElement("iframe");
  evalbox.sandbox = "allow-scripts";
  let index = 0;
  return new Promise((resolve, reject) => {
    const initLoadListener = () => {
      evalbox.removeEventListener("load", initLoadListener);
      resolve({
        iframe: evalbox,
        eval(str) {
          return new Promise((resolve2, reject2) => {
            let myindex = index++;
            const listener = (e) => {
              if (e.data && e.data.id === myindex) {
                resolve2(
                  e.data.type === "eval-success" ? {
                    data: e.data.payload,
                    success: true
                  } : {
                    success: false,
                    error: typeof e.data.payload === "string" ? e.data.payload : "No Error Provided"
                  }
                );
                window.removeEventListener("message", listener);
              }
            };
            window.addEventListener("message", listener);
            evalbox.contentWindow?.postMessage(
              {
                id: myindex,
                payload: str,
                type: "eval"
              },
              "*"
            );
          });
        },
        kill() {
          document.body.removeChild(evalbox);
        },
        reload() {
          return new Promise((resolve2, reject2) => {
            const refreshListener = () => {
              evalbox.removeEventListener("load", refreshListener);
              resolve2();
            };
            evalbox.addEventListener("load", refreshListener);
            evalbox.contentWindow?.location.reload();
          });
        }
      });
    };
    evalbox.addEventListener("load", initLoadListener);
    evalbox.style.display = "none";
    document.body.appendChild(evalbox);
    evalbox.srcdoc = `
<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <script>
      window.addEventListener("message", async (e) => {
        if (e.data && e.data.type === "eval") {
          try {
            const res = await eval(e.data.payload);
            e.source.postMessage({
              type: "eval-success",
              payload: res,
              id: e.data.id
            }, "*");
          } catch (err) {
            e.source.postMessage({
              type: "eval-fail",
              payload: err.toString(),
              id: e.data.id
            }, "*"); 
          }
        }
      });
    <\/script> 
  </body>
</html>
`;
  });
}

// src/download.ts
function download(file, name) {
  const a = document.createElement("a");
  a.download = name;
  const url = URL.createObjectURL(file);
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}
function downloadText(text, name) {
  const blob = new Blob([text], { type: "text/plain" });
  download(blob, name);
}
function canvasToBlob(c, type, quality) {
  return new Promise((resolve, reject) => {
    c.toBlob(
      (blob) => {
        resolve(blob);
      },
      type,
      quality
    );
  });
}
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      resolve(reader.result);
    });
    reader.readAsDataURL(blob);
  });
}
function loadImg(url) {
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => {
      resolve(img);
    };
    img.src = url;
  });
}

// src/debounce.ts
function debounce(callback) {
  let nextRequestIndex = 0;
  let currentRequest = void 0;
  const fn = async (...params) => {
    nextRequestIndex += 1;
    const myindex = nextRequestIndex;
    if (currentRequest) {
      await currentRequest;
    }
    if (nextRequestIndex === myindex) {
      const myreq = callback(...params);
      currentRequest = myreq;
      const res = await myreq;
      currentRequest = void 0;
      return res;
    }
    return void 0;
  };
  fn._debounced = true;
  return fn;
}

// src/array-utils.ts
function interleave(arr, cb) {
  let out = [];
  for (let i = 0; i < arr.length - 1; i++) {
    out.push(arr[i], cb(arr[i], arr[i + 1]));
  }
  if (arr.length > 0) {
    out.push(arr.at(-1));
  }
  return out;
}
function splitBy(arr, amount) {
  let outarr = [[]];
  for (let i = 0; i < arr.length; i++) {
    if (i % amount === amount - 1) outarr.push([]);
    outarr.at(-1).push(arr[i]);
  }
  return outarr;
}

// node_modules/ml-convolution/src/utils.js
function checkSize(size) {
  if (!Number.isInteger(size) || size < 1) {
    throw new TypeError(`size must be a positive integer. Got ${size}`);
  }
}
function checkKernel(kernel) {
  if (kernel.length === 0 || kernel.length % 2 !== 1) {
    throw new RangeError(
      `kernel must have an odd positive length. Got ${kernel.length}`
    );
  }
}
function checkBorderType(borderType) {
  if (borderType !== "CONSTANT" && borderType !== "CUT") {
    throw new RangeError(`unexpected border type: ${borderType}`);
  }
}
function checkInputLength(actual, expected) {
  if (actual !== expected) {
    throw new RangeError(
      `input length (${actual}) does not match setup size (${expected})`
    );
  }
}
function createArray(len) {
  const array = [];
  for (var i = 0; i < len; i++) {
    array.push(0);
  }
  return array;
}

// node_modules/ml-convolution/src/fftConvolution.js
var import_fft = __toESM(require_fft());
var import_next_power_of_two = __toESM(require_next_power_of_two());
var FFTConvolution = class {
  constructor(size, kernel, borderType = "CONSTANT") {
    checkSize(size);
    checkKernel(kernel);
    checkBorderType(borderType);
    this.size = size;
    this.kernelOffset = (kernel.length - 1) / 2;
    this.doubleOffset = 2 * this.kernelOffset;
    this.borderType = borderType;
    const resultLength = size + this.doubleOffset;
    this.fftLength = (0, import_next_power_of_two.default)(Math.max(resultLength, 2));
    this.fftComplexLength = this.fftLength * 2;
    this.fft = new import_fft.default(this.fftLength);
    kernel = kernel.slice().reverse();
    const paddedKernel = createArray(this.fftComplexLength);
    this.fftKernel = createArray(this.fftComplexLength);
    pad(kernel, paddedKernel, this.fftComplexLength);
    this.fft.transform(this.fftKernel, paddedKernel);
    this.paddedInput = createArray(this.fftComplexLength);
    this.fftInput = createArray(this.fftComplexLength);
    this.ifftOutput = createArray(this.fftComplexLength);
    this.result = paddedKernel;
  }
  convolve(input) {
    checkInputLength(input.length, this.size);
    pad(input, this.paddedInput, this.fftComplexLength);
    this.fft.transform(this.fftInput, this.paddedInput);
    for (var i = 0; i < this.fftInput.length; i += 2) {
      const tmp = this.fftInput[i] * this.fftKernel[i] - this.fftInput[i + 1] * this.fftKernel[i + 1];
      this.fftInput[i + 1] = this.fftInput[i] * this.fftKernel[i + 1] + this.fftInput[i + 1] * this.fftKernel[i];
      this.fftInput[i] = tmp;
    }
    this.fft.inverseTransform(this.ifftOutput, this.fftInput);
    const r = this.fft.fromComplexArray(this.ifftOutput, this.result);
    if (this.borderType === "CONSTANT") {
      return r.slice(this.kernelOffset, this.kernelOffset + input.length);
    } else {
      return r.slice(this.doubleOffset, input.length);
    }
  }
};
function fftConvolution(input, kernel, borderType) {
  return new FFTConvolution(input.length, kernel, borderType).convolve(input);
}
function pad(data, out, len) {
  let i = 0;
  for (; i < data.length; i++) {
    out[i * 2] = data[i];
    out[i * 2 + 1] = 0;
  }
  i *= 2;
  for (; i < len; i += 2) {
    out[i] = 0;
    out[i + 1] = 0;
  }
}

// node_modules/mediabunny/dist/modules/src/misc.js
function assert(x2) {
  if (!x2) {
    throw new Error("Assertion failed.");
  }
}
var Bitstream = class _Bitstream {
  constructor(bytes) {
    this.bytes = bytes;
    this.pos = 0;
  }
  seekToByte(byteOffset) {
    this.pos = 8 * byteOffset;
  }
  readBit() {
    const byteIndex = Math.floor(this.pos / 8);
    const byte = this.bytes[byteIndex] ?? 0;
    const bitIndex = 7 - (this.pos & 7);
    const bit = (byte & 1 << bitIndex) >> bitIndex;
    this.pos++;
    return bit;
  }
  readBits(n) {
    if (n === 1) {
      return this.readBit();
    }
    let result = 0;
    for (let i = 0; i < n; i++) {
      result <<= 1;
      result |= this.readBit();
    }
    return result;
  }
  writeBits(n, value) {
    const end = this.pos + n;
    for (let i = this.pos; i < end; i++) {
      const byteIndex = Math.floor(i / 8);
      let byte = this.bytes[byteIndex];
      const bitIndex = 7 - (i & 7);
      byte &= ~(1 << bitIndex);
      byte |= (value & 1 << end - i - 1) >> end - i - 1 << bitIndex;
      this.bytes[byteIndex] = byte;
    }
    this.pos = end;
  }
  readAlignedByte() {
    if (this.pos % 8 !== 0) {
      throw new Error("Bitstream is not byte-aligned.");
    }
    const byteIndex = this.pos / 8;
    const byte = this.bytes[byteIndex] ?? 0;
    this.pos += 8;
    return byte;
  }
  skipBits(n) {
    this.pos += n;
  }
  getBitsLeft() {
    return this.bytes.length * 8 - this.pos;
  }
  clone() {
    const clone = new _Bitstream(this.bytes);
    clone.pos = this.pos;
    return clone;
  }
};
var toUint8Array = (source) => {
  if (source instanceof Uint8Array) {
    return source;
  } else if (source instanceof ArrayBuffer) {
    return new Uint8Array(source);
  } else {
    return new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
  }
};
var toDataView = (source) => {
  if (source instanceof DataView) {
    return source;
  } else if (source instanceof ArrayBuffer) {
    return new DataView(source);
  } else {
    return new DataView(source.buffer, source.byteOffset, source.byteLength);
  }
};
var textDecoder = new TextDecoder();
var textEncoder = new TextEncoder();
var invertObject = (object) => {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [value, key]));
};
var COLOR_PRIMARIES_MAP = {
  bt709: 1,
  // ITU-R BT.709
  bt470bg: 5,
  // ITU-R BT.470BG
  smpte170m: 6,
  // ITU-R BT.601 525 - SMPTE 170M
  bt2020: 9,
  // ITU-R BT.202
  smpte432: 12
  // SMPTE EG 432-1
};
var COLOR_PRIMARIES_MAP_INVERSE = invertObject(COLOR_PRIMARIES_MAP);
var TRANSFER_CHARACTERISTICS_MAP = {
  "bt709": 1,
  // ITU-R BT.709
  "smpte170m": 6,
  // SMPTE 170M
  "linear": 8,
  // Linear transfer characteristics
  "iec61966-2-1": 13,
  // IEC 61966-2-1
  "pg": 16,
  // Rec. ITU-R BT.2100-2 perceptual quantization (PQ) system
  "hlg": 18
  // Rec. ITU-R BT.2100-2 hybrid loggamma (HLG) system
};
var TRANSFER_CHARACTERISTICS_MAP_INVERSE = invertObject(TRANSFER_CHARACTERISTICS_MAP);
var MATRIX_COEFFICIENTS_MAP = {
  "rgb": 0,
  // Identity
  "bt709": 1,
  // ITU-R BT.709
  "bt470bg": 5,
  // ITU-R BT.470BG
  "smpte170m": 6,
  // SMPTE 170M
  "bt2020-ncl": 9
  // ITU-R BT.2020-2 (non-constant luminance)
};
var MATRIX_COEFFICIENTS_MAP_INVERSE = invertObject(MATRIX_COEFFICIENTS_MAP);
var isAllowSharedBufferSource = (x2) => {
  return x2 instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && x2 instanceof SharedArrayBuffer || ArrayBuffer.isView(x2);
};
var AsyncMutex = class {
  constructor() {
    this.currentPromise = Promise.resolve();
  }
  async acquire() {
    let resolver;
    const nextPromise = new Promise((resolve) => {
      resolver = resolve;
    });
    const currentPromiseAlias = this.currentPromise;
    this.currentPromise = nextPromise;
    await currentPromiseAlias;
    return resolver;
  }
};
var promiseWithResolvers = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
var assertNever = (x2) => {
  throw new Error(`Unexpected value: ${x2}`);
};
var setUint24 = (view, byteOffset, value, littleEndian) => {
  value = value >>> 0;
  value = value & 16777215;
  if (littleEndian) {
    view.setUint8(byteOffset, value & 255);
    view.setUint8(byteOffset + 1, value >>> 8 & 255);
    view.setUint8(byteOffset + 2, value >>> 16 & 255);
  } else {
    view.setUint8(byteOffset, value >>> 16 & 255);
    view.setUint8(byteOffset + 1, value >>> 8 & 255);
    view.setUint8(byteOffset + 2, value & 255);
  }
};
var setInt24 = (view, byteOffset, value, littleEndian) => {
  value = clamp2(value, -8388608, 8388607);
  if (value < 0) {
    value = value + 16777216 & 16777215;
  }
  setUint24(view, byteOffset, value, littleEndian);
};
var setInt64 = (view, byteOffset, value, littleEndian) => {
  if (littleEndian) {
    view.setUint32(byteOffset + 0, value, true);
    view.setInt32(byteOffset + 4, Math.floor(value / 2 ** 32), true);
  } else {
    view.setInt32(byteOffset + 0, Math.floor(value / 2 ** 32), true);
    view.setUint32(byteOffset + 4, value, true);
  }
};
var clamp2 = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};
var ilog = (x2) => {
  let ret = 0;
  while (x2) {
    ret++;
    x2 >>= 1;
  }
  return ret;
};
var ISO_639_2_REGEX = /^[a-z]{3}$/;
var isIso639Dash2LanguageCode = (x2) => {
  return ISO_639_2_REGEX.test(x2);
};
var SECOND_TO_MICROSECOND_FACTOR = 1e6 * (1 + Number.EPSILON);
var CallSerializer = class {
  constructor() {
    this.currentPromise = Promise.resolve();
  }
  call(fn) {
    return this.currentPromise = this.currentPromise.then(fn);
  }
};
var keyValueIterator = function* (object) {
  for (const key in object) {
    const value = object[key];
    if (value === void 0) {
      continue;
    }
    yield { key, value };
  }
};
var bytesToBase64 = (bytes) => {
  let string = "";
  for (let i = 0; i < bytes.length; i++) {
    string += String.fromCharCode(bytes[i]);
  }
  return btoa(string);
};

// node_modules/mediabunny/dist/modules/src/tags.js
var RichImageData = class {
  /** Creates a new {@link RichImageData}. */
  constructor(data, mimeType) {
    this.data = data;
    this.mimeType = mimeType;
  }
};
var validateMetadataTags = (tags) => {
  if (!tags || typeof tags !== "object") {
    throw new TypeError("tags must be an object.");
  }
  if (tags.title !== void 0 && typeof tags.title !== "string") {
    throw new TypeError("tags.title, when provided, must be a string.");
  }
  if (tags.description !== void 0 && typeof tags.description !== "string") {
    throw new TypeError("tags.description, when provided, must be a string.");
  }
  if (tags.artist !== void 0 && typeof tags.artist !== "string") {
    throw new TypeError("tags.artist, when provided, must be a string.");
  }
  if (tags.album !== void 0 && typeof tags.album !== "string") {
    throw new TypeError("tags.album, when provided, must be a string.");
  }
  if (tags.albumArtist !== void 0 && typeof tags.albumArtist !== "string") {
    throw new TypeError("tags.albumArtist, when provided, must be a string.");
  }
  if (tags.trackNumber !== void 0 && (!Number.isInteger(tags.trackNumber) || tags.trackNumber <= 0)) {
    throw new TypeError("tags.trackNumber, when provided, must be a positive integer.");
  }
  if (tags.tracksTotal !== void 0 && (!Number.isInteger(tags.tracksTotal) || tags.tracksTotal <= 0)) {
    throw new TypeError("tags.tracksTotal, when provided, must be a positive integer.");
  }
  if (tags.discNumber !== void 0 && (!Number.isInteger(tags.discNumber) || tags.discNumber <= 0)) {
    throw new TypeError("tags.discNumber, when provided, must be a positive integer.");
  }
  if (tags.discsTotal !== void 0 && (!Number.isInteger(tags.discsTotal) || tags.discsTotal <= 0)) {
    throw new TypeError("tags.discsTotal, when provided, must be a positive integer.");
  }
  if (tags.genre !== void 0 && typeof tags.genre !== "string") {
    throw new TypeError("tags.genre, when provided, must be a string.");
  }
  if (tags.date !== void 0 && (!(tags.date instanceof Date) || Number.isNaN(tags.date.getTime()))) {
    throw new TypeError("tags.date, when provided, must be a valid Date.");
  }
  if (tags.lyrics !== void 0 && typeof tags.lyrics !== "string") {
    throw new TypeError("tags.lyrics, when provided, must be a string.");
  }
  if (tags.images !== void 0) {
    if (!Array.isArray(tags.images)) {
      throw new TypeError("tags.images, when provided, must be an array.");
    }
    for (const image of tags.images) {
      if (!image || typeof image !== "object") {
        throw new TypeError("Each image in tags.images must be an object.");
      }
      if (!(image.data instanceof Uint8Array)) {
        throw new TypeError("Each image.data must be a Uint8Array.");
      }
      if (typeof image.mimeType !== "string") {
        throw new TypeError("Each image.mimeType must be a string.");
      }
      if (!["coverFront", "coverBack", "unknown"].includes(image.kind)) {
        throw new TypeError("Each image.kind must be 'coverFront', 'coverBack', or 'unknown'.");
      }
    }
  }
  if (tags.comment !== void 0 && typeof tags.comment !== "string") {
    throw new TypeError("tags.comment, when provided, must be a string.");
  }
  if (tags.raw !== void 0) {
    if (!tags.raw || typeof tags.raw !== "object") {
      throw new TypeError("tags.raw, when provided, must be an object.");
    }
    for (const value of Object.values(tags.raw)) {
      if (value !== null && typeof value !== "string" && !(value instanceof Uint8Array) && !(value instanceof RichImageData)) {
        throw new TypeError("Each value in tags.raw must be a string, Uint8Array, RichImageData, or null.");
      }
    }
  }
};

// node_modules/mediabunny/dist/modules/src/codec.js
var VIDEO_CODECS = [
  "avc",
  "hevc",
  "vp9",
  "av1",
  "vp8"
];
var PCM_AUDIO_CODECS = [
  "pcm-s16",
  // We don't prefix 'le' so we're compatible with the WebCodecs-registered PCM codec strings
  "pcm-s16be",
  "pcm-s24",
  "pcm-s24be",
  "pcm-s32",
  "pcm-s32be",
  "pcm-f32",
  "pcm-f32be",
  "pcm-f64",
  "pcm-f64be",
  "pcm-u8",
  "pcm-s8",
  "ulaw",
  "alaw"
];
var NON_PCM_AUDIO_CODECS = [
  "aac",
  "opus",
  "mp3",
  "vorbis",
  "flac"
];
var AUDIO_CODECS = [
  ...NON_PCM_AUDIO_CODECS,
  ...PCM_AUDIO_CODECS
];
var SUBTITLE_CODECS = [
  "webvtt"
];
var buildAudioCodecString = (codec, numberOfChannels, sampleRate) => {
  if (codec === "aac") {
    if (numberOfChannels >= 2 && sampleRate <= 24e3) {
      return "mp4a.40.29";
    }
    if (sampleRate <= 24e3) {
      return "mp4a.40.5";
    }
    return "mp4a.40.2";
  } else if (codec === "mp3") {
    return "mp3";
  } else if (codec === "opus") {
    return "opus";
  } else if (codec === "vorbis") {
    return "vorbis";
  } else if (codec === "flac") {
    return "flac";
  } else if (PCM_AUDIO_CODECS.includes(codec)) {
    return codec;
  }
  throw new TypeError(`Unhandled codec '${codec}'.`);
};
var OPUS_INTERNAL_SAMPLE_RATE = 48e3;
var PCM_CODEC_REGEX = /^pcm-([usf])(\d+)+(be)?$/;
var parsePcmCodec = (codec) => {
  assert(PCM_AUDIO_CODECS.includes(codec));
  if (codec === "ulaw") {
    return { dataType: "ulaw", sampleSize: 1, littleEndian: true, silentValue: 255 };
  } else if (codec === "alaw") {
    return { dataType: "alaw", sampleSize: 1, littleEndian: true, silentValue: 213 };
  }
  const match = PCM_CODEC_REGEX.exec(codec);
  assert(match);
  let dataType;
  if (match[1] === "u") {
    dataType = "unsigned";
  } else if (match[1] === "s") {
    dataType = "signed";
  } else {
    dataType = "float";
  }
  const sampleSize = Number(match[2]) / 8;
  const littleEndian = match[3] !== "be";
  const silentValue = codec === "pcm-u8" ? 2 ** 7 : 0;
  return { dataType, sampleSize, littleEndian, silentValue };
};
var inferCodecFromCodecString = (codecString) => {
  if (codecString.startsWith("avc1") || codecString.startsWith("avc3")) {
    return "avc";
  } else if (codecString.startsWith("hev1") || codecString.startsWith("hvc1")) {
    return "hevc";
  } else if (codecString === "vp8") {
    return "vp8";
  } else if (codecString.startsWith("vp09")) {
    return "vp9";
  } else if (codecString.startsWith("av01")) {
    return "av1";
  }
  if (codecString.startsWith("mp4a.40") || codecString === "mp4a.67") {
    return "aac";
  } else if (codecString === "mp3" || codecString === "mp4a.69" || codecString === "mp4a.6B" || codecString === "mp4a.6b") {
    return "mp3";
  } else if (codecString === "opus") {
    return "opus";
  } else if (codecString === "vorbis") {
    return "vorbis";
  } else if (codecString === "flac") {
    return "flac";
  } else if (codecString === "ulaw") {
    return "ulaw";
  } else if (codecString === "alaw") {
    return "alaw";
  } else if (PCM_CODEC_REGEX.test(codecString)) {
    return codecString;
  }
  if (codecString === "webvtt") {
    return "webvtt";
  }
  return null;
};
var getAudioEncoderConfigExtension = (codec) => {
  if (codec === "aac") {
    return {
      aac: {
        format: "aac"
        // Ensure the format is not ADTS
      }
    };
  } else if (codec === "opus") {
    return {
      opus: {
        format: "opus"
      }
    };
  }
  return {};
};
var VALID_AUDIO_CODEC_STRING_PREFIXES = ["mp4a", "mp3", "opus", "vorbis", "flac", "ulaw", "alaw", "pcm"];
var validateAudioChunkMetadata = (metadata) => {
  if (!metadata) {
    throw new TypeError("Audio chunk metadata must be provided.");
  }
  if (typeof metadata !== "object") {
    throw new TypeError("Audio chunk metadata must be an object.");
  }
  if (!metadata.decoderConfig) {
    throw new TypeError("Audio chunk metadata must include a decoder configuration.");
  }
  if (typeof metadata.decoderConfig !== "object") {
    throw new TypeError("Audio chunk metadata decoder configuration must be an object.");
  }
  if (typeof metadata.decoderConfig.codec !== "string") {
    throw new TypeError("Audio chunk metadata decoder configuration must specify a codec string.");
  }
  if (!VALID_AUDIO_CODEC_STRING_PREFIXES.some((prefix) => metadata.decoderConfig.codec.startsWith(prefix))) {
    throw new TypeError("Audio chunk metadata decoder configuration codec string must be a valid audio codec string as specified in the WebCodecs Codec Registry.");
  }
  if (!Number.isInteger(metadata.decoderConfig.sampleRate) || metadata.decoderConfig.sampleRate <= 0) {
    throw new TypeError("Audio chunk metadata decoder configuration must specify a valid sampleRate (positive integer).");
  }
  if (!Number.isInteger(metadata.decoderConfig.numberOfChannels) || metadata.decoderConfig.numberOfChannels <= 0) {
    throw new TypeError("Audio chunk metadata decoder configuration must specify a valid numberOfChannels (positive integer).");
  }
  if (metadata.decoderConfig.description !== void 0) {
    if (!isAllowSharedBufferSource(metadata.decoderConfig.description)) {
      throw new TypeError("Audio chunk metadata decoder configuration description, when defined, must be an ArrayBuffer or an ArrayBuffer view.");
    }
  }
  if (metadata.decoderConfig.codec.startsWith("mp4a") && metadata.decoderConfig.codec !== "mp4a.69" && metadata.decoderConfig.codec !== "mp4a.6B" && metadata.decoderConfig.codec !== "mp4a.6b") {
    const validStrings = ["mp4a.40.2", "mp4a.40.02", "mp4a.40.5", "mp4a.40.05", "mp4a.40.29", "mp4a.67"];
    if (!validStrings.includes(metadata.decoderConfig.codec)) {
      throw new TypeError("Audio chunk metadata decoder configuration codec string for AAC must be a valid AAC codec string as specified in https://www.w3.org/TR/webcodecs-aac-codec-registration/.");
    }
    if (!metadata.decoderConfig.description) {
      throw new TypeError("Audio chunk metadata decoder configuration for AAC must include a description, which is expected to be an AudioSpecificConfig as specified in ISO 14496-3.");
    }
  } else if (metadata.decoderConfig.codec.startsWith("mp3") || metadata.decoderConfig.codec.startsWith("mp4a")) {
    if (metadata.decoderConfig.codec !== "mp3" && metadata.decoderConfig.codec !== "mp4a.69" && metadata.decoderConfig.codec !== "mp4a.6B" && metadata.decoderConfig.codec !== "mp4a.6b") {
      throw new TypeError('Audio chunk metadata decoder configuration codec string for MP3 must be "mp3", "mp4a.69" or "mp4a.6B".');
    }
  } else if (metadata.decoderConfig.codec.startsWith("opus")) {
    if (metadata.decoderConfig.codec !== "opus") {
      throw new TypeError('Audio chunk metadata decoder configuration codec string for Opus must be "opus".');
    }
    if (metadata.decoderConfig.description && metadata.decoderConfig.description.byteLength < 18) {
      throw new TypeError("Audio chunk metadata decoder configuration description, when specified, is expected to be an Identification Header as specified in Section 5.1 of RFC 7845.");
    }
  } else if (metadata.decoderConfig.codec.startsWith("vorbis")) {
    if (metadata.decoderConfig.codec !== "vorbis") {
      throw new TypeError('Audio chunk metadata decoder configuration codec string for Vorbis must be "vorbis".');
    }
    if (!metadata.decoderConfig.description) {
      throw new TypeError("Audio chunk metadata decoder configuration for Vorbis must include a description, which is expected to adhere to the format described in https://www.w3.org/TR/webcodecs-vorbis-codec-registration/.");
    }
  } else if (metadata.decoderConfig.codec.startsWith("flac")) {
    if (metadata.decoderConfig.codec !== "flac") {
      throw new TypeError('Audio chunk metadata decoder configuration codec string for FLAC must be "flac".');
    }
    const minDescriptionSize = 4 + 4 + 34;
    if (!metadata.decoderConfig.description || metadata.decoderConfig.description.byteLength < minDescriptionSize) {
      throw new TypeError("Audio chunk metadata decoder configuration for FLAC must include a description, which is expected to adhere to the format described in https://www.w3.org/TR/webcodecs-flac-codec-registration/.");
    }
  } else if (metadata.decoderConfig.codec.startsWith("pcm") || metadata.decoderConfig.codec.startsWith("ulaw") || metadata.decoderConfig.codec.startsWith("alaw")) {
    if (!PCM_AUDIO_CODECS.includes(metadata.decoderConfig.codec)) {
      throw new TypeError(`Audio chunk metadata decoder configuration codec string for PCM must be one of the supported PCM codecs (${PCM_AUDIO_CODECS.join(", ")}).`);
    }
  }
};

// node_modules/mediabunny/dist/modules/src/muxer.js
var Muxer = class {
  constructor(output) {
    this.mutex = new AsyncMutex();
    this.firstMediaStreamTimestamp = null;
    this.trackTimestampInfo = /* @__PURE__ */ new WeakMap();
    this.output = output;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTrackClose(track) {
  }
  validateAndNormalizeTimestamp(track, timestampInSeconds, isKeyFrame) {
    timestampInSeconds += track.source._timestampOffset;
    let timestampInfo = this.trackTimestampInfo.get(track);
    if (!timestampInfo) {
      if (!isKeyFrame) {
        throw new Error("First frame must be a key frame.");
      }
      timestampInfo = {
        maxTimestamp: timestampInSeconds,
        maxTimestampBeforeLastKeyFrame: timestampInSeconds
      };
      this.trackTimestampInfo.set(track, timestampInfo);
    }
    if (timestampInSeconds < 0) {
      throw new Error(`Timestamps must be non-negative (got ${timestampInSeconds}s).`);
    }
    if (isKeyFrame) {
      timestampInfo.maxTimestampBeforeLastKeyFrame = timestampInfo.maxTimestamp;
    }
    if (timestampInSeconds < timestampInfo.maxTimestampBeforeLastKeyFrame) {
      throw new Error(`Timestamps cannot be smaller than the highest timestamp of the previous run (a run begins with a key frame and ends right before the next key frame). Got ${timestampInSeconds}s, but highest timestamp is ${timestampInfo.maxTimestampBeforeLastKeyFrame}s.`);
    }
    timestampInfo.maxTimestamp = Math.max(timestampInfo.maxTimestamp, timestampInSeconds);
    return timestampInSeconds;
  }
};

// node_modules/mediabunny/dist/modules/src/codec-data.js
var parseOpusIdentificationHeader = (bytes) => {
  const view = toDataView(bytes);
  const outputChannelCount = view.getUint8(9);
  const preSkip = view.getUint16(10, true);
  const inputSampleRate = view.getUint32(12, true);
  const outputGain = view.getInt16(16, true);
  const channelMappingFamily = view.getUint8(18);
  let channelMappingTable = null;
  if (channelMappingFamily) {
    channelMappingTable = bytes.subarray(19, 19 + 2 + outputChannelCount);
  }
  return {
    outputChannelCount,
    preSkip,
    inputSampleRate,
    outputGain,
    channelMappingFamily,
    channelMappingTable
  };
};
var OPUS_FRAME_DURATION_TABLE = [
  480,
  960,
  1920,
  2880,
  480,
  960,
  1920,
  2880,
  480,
  960,
  1920,
  2880,
  480,
  960,
  480,
  960,
  120,
  240,
  480,
  960,
  120,
  240,
  480,
  960,
  120,
  240,
  480,
  960,
  120,
  240,
  480,
  960
];
var parseOpusTocByte = (packet) => {
  const config = packet[0] >> 3;
  return {
    durationInSamples: OPUS_FRAME_DURATION_TABLE[config]
  };
};
var parseModesFromVorbisSetupPacket = (setupHeader) => {
  if (setupHeader.length < 7) {
    throw new Error("Setup header is too short.");
  }
  if (setupHeader[0] !== 5) {
    throw new Error("Wrong packet type in Setup header.");
  }
  const signature = String.fromCharCode(...setupHeader.slice(1, 7));
  if (signature !== "vorbis") {
    throw new Error("Invalid packet signature in Setup header.");
  }
  const bufSize = setupHeader.length;
  const revBuffer = new Uint8Array(bufSize);
  for (let i = 0; i < bufSize; i++) {
    revBuffer[i] = setupHeader[bufSize - 1 - i];
  }
  const bitstream = new Bitstream(revBuffer);
  let gotFramingBit = 0;
  while (bitstream.getBitsLeft() > 97) {
    if (bitstream.readBits(1) === 1) {
      gotFramingBit = bitstream.pos;
      break;
    }
  }
  if (gotFramingBit === 0) {
    throw new Error("Invalid Setup header: framing bit not found.");
  }
  let modeCount = 0;
  let gotModeHeader = false;
  let lastModeCount = 0;
  while (bitstream.getBitsLeft() >= 97) {
    const tempPos = bitstream.pos;
    const a = bitstream.readBits(8);
    const b = bitstream.readBits(16);
    const c = bitstream.readBits(16);
    if (a > 63 || b !== 0 || c !== 0) {
      bitstream.pos = tempPos;
      break;
    }
    bitstream.skipBits(1);
    modeCount++;
    if (modeCount > 64) {
      break;
    }
    const bsClone = bitstream.clone();
    const candidate = bsClone.readBits(6) + 1;
    if (candidate === modeCount) {
      gotModeHeader = true;
      lastModeCount = modeCount;
    }
  }
  if (!gotModeHeader) {
    throw new Error("Invalid Setup header: mode header not found.");
  }
  if (lastModeCount > 63) {
    throw new Error(`Unsupported mode count: ${lastModeCount}.`);
  }
  const finalModeCount = lastModeCount;
  bitstream.pos = 0;
  bitstream.skipBits(gotFramingBit);
  const modeBlockflags = Array(finalModeCount).fill(0);
  for (let i = finalModeCount - 1; i >= 0; i--) {
    bitstream.skipBits(40);
    modeBlockflags[i] = bitstream.readBits(1);
  }
  return { modeBlockflags };
};

// node_modules/mediabunny/dist/modules/src/writer.js
var Writer = class {
  constructor() {
    this.ensureMonotonicity = false;
    this.trackedWrites = null;
    this.trackedStart = -1;
    this.trackedEnd = -1;
  }
  start() {
  }
  maybeTrackWrites(data) {
    if (!this.trackedWrites) {
      return;
    }
    let pos = this.getPos();
    if (pos < this.trackedStart) {
      if (pos + data.byteLength <= this.trackedStart) {
        return;
      }
      data = data.subarray(this.trackedStart - pos);
      pos = 0;
    }
    const neededSize = pos + data.byteLength - this.trackedStart;
    let newLength = this.trackedWrites.byteLength;
    while (newLength < neededSize) {
      newLength *= 2;
    }
    if (newLength !== this.trackedWrites.byteLength) {
      const copy = new Uint8Array(newLength);
      copy.set(this.trackedWrites, 0);
      this.trackedWrites = copy;
    }
    this.trackedWrites.set(data, pos - this.trackedStart);
    this.trackedEnd = Math.max(this.trackedEnd, pos + data.byteLength);
  }
  startTrackingWrites() {
    this.trackedWrites = new Uint8Array(2 ** 10);
    this.trackedStart = this.getPos();
    this.trackedEnd = this.trackedStart;
  }
  stopTrackingWrites() {
    if (!this.trackedWrites) {
      throw new Error("Internal error: Can't get tracked writes since nothing was tracked.");
    }
    const slice2 = this.trackedWrites.subarray(0, this.trackedEnd - this.trackedStart);
    const result = {
      data: slice2,
      start: this.trackedStart,
      end: this.trackedEnd
    };
    this.trackedWrites = null;
    return result;
  }
};
var ARRAY_BUFFER_INITIAL_SIZE = 2 ** 16;
var ARRAY_BUFFER_MAX_SIZE = 2 ** 32;
var BufferTargetWriter = class extends Writer {
  constructor(target) {
    super();
    this.pos = 0;
    this.maxPos = 0;
    this.target = target;
    this.supportsResize = "resize" in new ArrayBuffer(0);
    if (this.supportsResize) {
      try {
        this.buffer = new ArrayBuffer(ARRAY_BUFFER_INITIAL_SIZE, { maxByteLength: ARRAY_BUFFER_MAX_SIZE });
      } catch {
        this.buffer = new ArrayBuffer(ARRAY_BUFFER_INITIAL_SIZE);
        this.supportsResize = false;
      }
    } else {
      this.buffer = new ArrayBuffer(ARRAY_BUFFER_INITIAL_SIZE);
    }
    this.bytes = new Uint8Array(this.buffer);
  }
  ensureSize(size) {
    let newLength = this.buffer.byteLength;
    while (newLength < size)
      newLength *= 2;
    if (newLength === this.buffer.byteLength)
      return;
    if (newLength > ARRAY_BUFFER_MAX_SIZE) {
      throw new Error(`ArrayBuffer exceeded maximum size of ${ARRAY_BUFFER_MAX_SIZE} bytes. Please consider using another target.`);
    }
    if (this.supportsResize) {
      this.buffer.resize(newLength);
    } else {
      const newBuffer = new ArrayBuffer(newLength);
      const newBytes = new Uint8Array(newBuffer);
      newBytes.set(this.bytes, 0);
      this.buffer = newBuffer;
      this.bytes = newBytes;
    }
  }
  write(data) {
    this.maybeTrackWrites(data);
    this.ensureSize(this.pos + data.byteLength);
    this.bytes.set(data, this.pos);
    this.target.onwrite?.(this.pos, this.pos + data.byteLength);
    this.pos += data.byteLength;
    this.maxPos = Math.max(this.maxPos, this.pos);
  }
  seek(newPos) {
    this.pos = newPos;
  }
  getPos() {
    return this.pos;
  }
  async flush() {
  }
  async finalize() {
    this.ensureSize(this.pos);
    this.target.buffer = this.buffer.slice(0, Math.max(this.maxPos, this.pos));
  }
  async close() {
  }
  getSlice(start, end) {
    return this.bytes.slice(start, end);
  }
};
var DEFAULT_CHUNK_SIZE = 2 ** 24;

// node_modules/mediabunny/dist/modules/src/target.js
var Target = class {
  constructor() {
    this._output = null;
    this.onwrite = null;
  }
};
var BufferTarget = class extends Target {
  constructor() {
    super(...arguments);
    this.buffer = null;
  }
  /** @internal */
  _createWriter() {
    return new BufferTargetWriter(this);
  }
};

// node_modules/mediabunny/dist/modules/src/ogg/ogg-misc.js
var OGGS = 1399285583;
var OGG_CRC_POLYNOMIAL = 79764919;
var OGG_CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let crc = n << 24;
  for (let k = 0; k < 8; k++) {
    crc = crc & 2147483648 ? crc << 1 ^ OGG_CRC_POLYNOMIAL : crc << 1;
  }
  OGG_CRC_TABLE[n] = crc >>> 0 & 4294967295;
}
var computeOggPageCrc = (bytes) => {
  const view = toDataView(bytes);
  const originalChecksum = view.getUint32(22, true);
  view.setUint32(22, 0, true);
  let crc = 0;
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    crc = (crc << 8 ^ OGG_CRC_TABLE[crc >>> 24 ^ byte]) >>> 0;
  }
  view.setUint32(22, originalChecksum, true);
  return crc;
};
var extractSampleMetadata = (data, codecInfo, vorbisLastBlocksize) => {
  let durationInSamples = 0;
  let currentBlocksize = null;
  if (data.length > 0) {
    if (codecInfo.codec === "vorbis") {
      assert(codecInfo.vorbisInfo);
      const vorbisModeCount = codecInfo.vorbisInfo.modeBlockflags.length;
      const bitCount = ilog(vorbisModeCount - 1);
      const modeMask = (1 << bitCount) - 1 << 1;
      const modeNumber = (data[0] & modeMask) >> 1;
      if (modeNumber >= codecInfo.vorbisInfo.modeBlockflags.length) {
        throw new Error("Invalid mode number.");
      }
      let prevBlocksize = vorbisLastBlocksize;
      const blockflag = codecInfo.vorbisInfo.modeBlockflags[modeNumber];
      currentBlocksize = codecInfo.vorbisInfo.blocksizes[blockflag];
      if (blockflag === 1) {
        const prevMask = (modeMask | 1) + 1;
        const flag = data[0] & prevMask ? 1 : 0;
        prevBlocksize = codecInfo.vorbisInfo.blocksizes[flag];
      }
      durationInSamples = prevBlocksize !== null ? prevBlocksize + currentBlocksize >> 2 : 0;
    } else if (codecInfo.codec === "opus") {
      const toc = parseOpusTocByte(data);
      durationInSamples = toc.durationInSamples;
    }
  }
  return {
    durationInSamples,
    vorbisBlockSize: currentBlocksize
  };
};
var buildOggMimeType = (info) => {
  let string = "audio/ogg";
  if (info.codecStrings) {
    const uniqueCodecMimeTypes = [...new Set(info.codecStrings)];
    string += `; codecs="${uniqueCodecMimeTypes.join(", ")}"`;
  }
  return string;
};

// node_modules/mediabunny/dist/modules/src/ogg/ogg-reader.js
var MAX_PAGE_HEADER_SIZE = 27 + 255;
var MAX_PAGE_SIZE = MAX_PAGE_HEADER_SIZE + 255 * 255;

// node_modules/mediabunny/dist/modules/src/ogg/ogg-muxer.js
var PAGE_SIZE_TARGET = 8192;
var OggMuxer = class extends Muxer {
  constructor(output, format) {
    super(output);
    this.trackDatas = [];
    this.bosPagesWritten = false;
    this.allTracksKnown = promiseWithResolvers();
    this.pageBytes = new Uint8Array(MAX_PAGE_SIZE);
    this.pageView = new DataView(this.pageBytes.buffer);
    this.format = format;
    this.writer = output._writer;
    this.writer.ensureMonotonicity = true;
  }
  async start() {
  }
  async getMimeType() {
    await this.allTracksKnown.promise;
    return buildOggMimeType({
      codecStrings: this.trackDatas.map((x2) => x2.codecInfo.codec)
    });
  }
  addEncodedVideoPacket() {
    throw new Error("Video tracks are not supported.");
  }
  getTrackData(track, meta) {
    const existingTrackData = this.trackDatas.find((td) => td.track === track);
    if (existingTrackData) {
      return existingTrackData;
    }
    let serialNumber;
    do {
      serialNumber = Math.floor(2 ** 32 * Math.random());
    } while (this.trackDatas.some((td) => td.serialNumber === serialNumber));
    assert(track.source._codec === "vorbis" || track.source._codec === "opus");
    validateAudioChunkMetadata(meta);
    assert(meta);
    assert(meta.decoderConfig);
    const newTrackData = {
      track,
      serialNumber,
      internalSampleRate: track.source._codec === "opus" ? OPUS_INTERNAL_SAMPLE_RATE : meta.decoderConfig.sampleRate,
      codecInfo: {
        codec: track.source._codec,
        vorbisInfo: null,
        opusInfo: null
      },
      vorbisLastBlocksize: null,
      packetQueue: [],
      currentTimestampInSamples: 0,
      pagesWritten: 0,
      currentGranulePosition: 0,
      currentLacingValues: [],
      currentPageData: [],
      currentPageSize: 27,
      currentPageStartsWithFreshPacket: true
    };
    this.queueHeaderPackets(newTrackData, meta);
    this.trackDatas.push(newTrackData);
    if (this.allTracksAreKnown()) {
      this.allTracksKnown.resolve();
    }
    return newTrackData;
  }
  queueHeaderPackets(trackData, meta) {
    assert(meta.decoderConfig);
    if (trackData.track.source._codec === "vorbis") {
      assert(meta.decoderConfig.description);
      const bytes = toUint8Array(meta.decoderConfig.description);
      if (bytes[0] !== 2) {
        throw new TypeError("First byte of Vorbis decoder description must be 2.");
      }
      let pos = 1;
      const readPacketLength = () => {
        let length = 0;
        while (true) {
          const value = bytes[pos++];
          if (value === void 0) {
            throw new TypeError("Vorbis decoder description is too short.");
          }
          length += value;
          if (value < 255) {
            return length;
          }
        }
      };
      const identificationHeaderLength = readPacketLength();
      const commentHeaderLength = readPacketLength();
      const setupHeaderLength = bytes.length - pos;
      if (setupHeaderLength <= 0) {
        throw new TypeError("Vorbis decoder description is too short.");
      }
      const identificationHeader = bytes.subarray(pos, pos += identificationHeaderLength);
      pos += commentHeaderLength;
      const setupHeader = bytes.subarray(pos);
      const commentHeaderHeader = new Uint8Array(7);
      commentHeaderHeader[0] = 3;
      commentHeaderHeader[1] = 118;
      commentHeaderHeader[2] = 111;
      commentHeaderHeader[3] = 114;
      commentHeaderHeader[4] = 98;
      commentHeaderHeader[5] = 105;
      commentHeaderHeader[6] = 115;
      const commentHeader = this.createVorbisComments(commentHeaderHeader);
      trackData.packetQueue.push({
        data: identificationHeader,
        endGranulePosition: 0,
        timestamp: 0,
        forcePageFlush: true
      }, {
        data: commentHeader,
        endGranulePosition: 0,
        timestamp: 0,
        forcePageFlush: false
      }, {
        data: setupHeader,
        endGranulePosition: 0,
        timestamp: 0,
        forcePageFlush: true
        // The last header packet must flush the page
      });
      const view = toDataView(identificationHeader);
      const blockSizeByte = view.getUint8(28);
      trackData.codecInfo.vorbisInfo = {
        blocksizes: [
          1 << (blockSizeByte & 15),
          1 << (blockSizeByte >> 4)
        ],
        modeBlockflags: parseModesFromVorbisSetupPacket(setupHeader).modeBlockflags
      };
    } else if (trackData.track.source._codec === "opus") {
      if (!meta.decoderConfig.description) {
        throw new TypeError("For Ogg, Opus decoder description is required.");
      }
      const identificationHeader = toUint8Array(meta.decoderConfig.description);
      const commentHeaderHeader = new Uint8Array(8);
      const commentHeaderHeaderView = toDataView(commentHeaderHeader);
      commentHeaderHeaderView.setUint32(0, 1332770163, false);
      commentHeaderHeaderView.setUint32(4, 1415669619, false);
      const commentHeader = this.createVorbisComments(commentHeaderHeader);
      trackData.packetQueue.push({
        data: identificationHeader,
        endGranulePosition: 0,
        timestamp: 0,
        forcePageFlush: true
      }, {
        data: commentHeader,
        endGranulePosition: 0,
        timestamp: 0,
        forcePageFlush: true
        // The last header packet must flush the page
      });
      trackData.codecInfo.opusInfo = {
        preSkip: parseOpusIdentificationHeader(identificationHeader).preSkip
      };
    }
  }
  createVorbisComments(headerBytes) {
    const tags = this.output._metadataTags;
    const commentHeaderParts = [
      headerBytes
    ];
    let vendorString = "";
    if (typeof tags.raw?.["vendor"] === "string") {
      vendorString = tags.raw?.["vendor"];
    }
    const encodedVendorString = textEncoder.encode(vendorString);
    let currentBuffer = new Uint8Array(4 + encodedVendorString.length);
    let currentView = new DataView(currentBuffer.buffer);
    currentView.setUint32(0, encodedVendorString.length, true);
    currentBuffer.set(encodedVendorString, 4);
    commentHeaderParts.push(currentBuffer);
    const writtenTags = /* @__PURE__ */ new Set();
    const addCommentTag = (key, value) => {
      const joined = `${key}=${value}`;
      const encoded = textEncoder.encode(joined);
      currentBuffer = new Uint8Array(4 + encoded.length);
      currentView = new DataView(currentBuffer.buffer);
      currentView.setUint32(0, encoded.length, true);
      currentBuffer.set(encoded, 4);
      commentHeaderParts.push(currentBuffer);
      writtenTags.add(key);
    };
    for (const { key, value } of keyValueIterator(tags)) {
      switch (key) {
        case "title":
          {
            addCommentTag("TITLE", value);
          }
          ;
          break;
        case "description":
          {
            addCommentTag("DESCRIPTION", value);
          }
          ;
          break;
        case "artist":
          {
            addCommentTag("ARTIST", value);
          }
          ;
          break;
        case "album":
          {
            addCommentTag("ALBUM", value);
          }
          ;
          break;
        case "albumArtist":
          {
            addCommentTag("ALBUMARTIST", value);
          }
          ;
          break;
        case "genre":
          {
            addCommentTag("GENRE", value);
          }
          ;
          break;
        case "date":
          {
            addCommentTag("DATE", value.toISOString().slice(0, 10));
          }
          ;
          break;
        case "comment":
          {
            addCommentTag("COMMENT", value);
          }
          ;
          break;
        case "lyrics":
          {
            addCommentTag("LYRICS", value);
          }
          ;
          break;
        case "trackNumber":
          {
            addCommentTag("TRACKNUMBER", value.toString());
          }
          ;
          break;
        case "tracksTotal":
          {
            addCommentTag("TRACKTOTAL", value.toString());
          }
          ;
          break;
        case "discNumber":
          {
            addCommentTag("DISCNUMBER", value.toString());
          }
          ;
          break;
        case "discsTotal":
          {
            addCommentTag("DISCTOTAL", value.toString());
          }
          ;
          break;
        case "images":
          {
            for (const image of value) {
              const pictureType = image.kind === "coverFront" ? 3 : image.kind === "coverBack" ? 4 : 0;
              const encodedMediaType = new Uint8Array(image.mimeType.length);
              for (let i = 0; i < image.mimeType.length; i++) {
                encodedMediaType[i] = image.mimeType.charCodeAt(i);
              }
              const encodedDescription = textEncoder.encode(image.description ?? "");
              const buffer = new Uint8Array(4 + 4 + encodedMediaType.length + 4 + encodedDescription.length + 16 + 4 + image.data.length);
              const view = toDataView(buffer);
              view.setUint32(0, pictureType, false);
              view.setUint32(4, encodedMediaType.length, false);
              buffer.set(encodedMediaType, 8);
              view.setUint32(8 + encodedMediaType.length, encodedDescription.length, false);
              buffer.set(encodedDescription, 12 + encodedMediaType.length);
              view.setUint32(28 + encodedMediaType.length + encodedDescription.length, image.data.length, false);
              buffer.set(image.data, 32 + encodedMediaType.length + encodedDescription.length);
              const encoded = bytesToBase64(buffer);
              addCommentTag("METADATA_BLOCK_PICTURE", encoded);
            }
          }
          ;
          break;
        case "raw":
          {
          }
          ;
          break;
        default:
          assertNever(key);
      }
    }
    if (tags.raw) {
      for (const key in tags.raw) {
        const value = tags.raw[key];
        if (key === "vendor" || value == null || writtenTags.has(key)) {
          continue;
        }
        if (typeof value === "string") {
          addCommentTag(key, value);
        }
      }
    }
    const listLengthBuffer = new Uint8Array(4);
    toDataView(listLengthBuffer).setUint32(0, writtenTags.size, true);
    commentHeaderParts.splice(2, 0, listLengthBuffer);
    const commentHeaderLength = commentHeaderParts.reduce((a, b) => a + b.length, 0);
    const commentHeader = new Uint8Array(commentHeaderLength);
    let pos = 0;
    for (const part of commentHeaderParts) {
      commentHeader.set(part, pos);
      pos += part.length;
    }
    return commentHeader;
  }
  async addEncodedAudioPacket(track, packet, meta) {
    const release = await this.mutex.acquire();
    try {
      const trackData = this.getTrackData(track, meta);
      this.validateAndNormalizeTimestamp(trackData.track, packet.timestamp, packet.type === "key");
      const currentTimestampInSamples = trackData.currentTimestampInSamples;
      const { durationInSamples, vorbisBlockSize } = extractSampleMetadata(packet.data, trackData.codecInfo, trackData.vorbisLastBlocksize);
      trackData.currentTimestampInSamples += durationInSamples;
      trackData.vorbisLastBlocksize = vorbisBlockSize;
      trackData.packetQueue.push({
        data: packet.data,
        endGranulePosition: trackData.currentTimestampInSamples,
        timestamp: currentTimestampInSamples / trackData.internalSampleRate,
        forcePageFlush: false
      });
      await this.interleavePages();
    } finally {
      release();
    }
  }
  addSubtitleCue() {
    throw new Error("Subtitle tracks are not supported.");
  }
  allTracksAreKnown() {
    for (const track of this.output._tracks) {
      if (!track.source._closed && !this.trackDatas.some((x2) => x2.track === track)) {
        return false;
      }
    }
    return true;
  }
  async interleavePages(isFinalCall = false) {
    if (!this.bosPagesWritten) {
      if (!this.allTracksAreKnown()) {
        return;
      }
      for (const trackData of this.trackDatas) {
        while (trackData.packetQueue.length > 0) {
          const packet = trackData.packetQueue.shift();
          this.writePacket(trackData, packet, false);
          if (packet.forcePageFlush) {
            break;
          }
        }
      }
      this.bosPagesWritten = true;
    }
    outer: while (true) {
      let trackWithMinTimestamp = null;
      let minTimestamp = Infinity;
      for (const trackData of this.trackDatas) {
        if (!isFinalCall && trackData.packetQueue.length <= 1 && !trackData.track.source._closed) {
          break outer;
        }
        if (trackData.packetQueue.length > 0 && trackData.packetQueue[0].timestamp < minTimestamp) {
          trackWithMinTimestamp = trackData;
          minTimestamp = trackData.packetQueue[0].timestamp;
        }
      }
      if (!trackWithMinTimestamp) {
        break;
      }
      const packet = trackWithMinTimestamp.packetQueue.shift();
      const isFinalPacket = trackWithMinTimestamp.packetQueue.length === 0;
      this.writePacket(trackWithMinTimestamp, packet, isFinalPacket);
    }
    if (!isFinalCall) {
      await this.writer.flush();
    }
  }
  writePacket(trackData, packet, isFinalPacket) {
    let remainingLength = packet.data.length;
    let dataStartOffset = 0;
    let dataOffset = 0;
    while (true) {
      if (trackData.currentLacingValues.length === 0 && dataStartOffset > 0) {
        trackData.currentPageStartsWithFreshPacket = false;
      }
      const segmentSize = Math.min(255, remainingLength);
      trackData.currentLacingValues.push(segmentSize);
      trackData.currentPageSize++;
      dataOffset += segmentSize;
      const segmentIsLastOfPacket = remainingLength < 255;
      if (trackData.currentLacingValues.length === 255) {
        const slice3 = packet.data.subarray(dataStartOffset, dataOffset);
        dataStartOffset = dataOffset;
        trackData.currentPageData.push(slice3);
        trackData.currentPageSize += slice3.length;
        this.writePage(trackData, isFinalPacket && segmentIsLastOfPacket);
        if (segmentIsLastOfPacket) {
          return;
        }
      }
      if (segmentIsLastOfPacket) {
        break;
      }
      remainingLength -= 255;
    }
    const slice2 = packet.data.subarray(dataStartOffset);
    trackData.currentPageData.push(slice2);
    trackData.currentPageSize += slice2.length;
    trackData.currentGranulePosition = packet.endGranulePosition;
    if (trackData.currentPageSize >= PAGE_SIZE_TARGET || packet.forcePageFlush) {
      this.writePage(trackData, isFinalPacket);
    }
  }
  writePage(trackData, isEos) {
    this.pageView.setUint32(0, OGGS, true);
    this.pageView.setUint8(4, 0);
    let headerType = 0;
    if (!trackData.currentPageStartsWithFreshPacket) {
      headerType |= 1;
    }
    if (trackData.pagesWritten === 0) {
      headerType |= 2;
    }
    if (isEos) {
      headerType |= 4;
    }
    this.pageView.setUint8(5, headerType);
    const granulePosition = trackData.currentLacingValues.every((x2) => x2 === 255) ? -1 : trackData.currentGranulePosition;
    setInt64(this.pageView, 6, granulePosition, true);
    this.pageView.setUint32(14, trackData.serialNumber, true);
    this.pageView.setUint32(18, trackData.pagesWritten, true);
    this.pageView.setUint32(22, 0, true);
    this.pageView.setUint8(26, trackData.currentLacingValues.length);
    this.pageBytes.set(trackData.currentLacingValues, 27);
    let pos = 27 + trackData.currentLacingValues.length;
    for (const data of trackData.currentPageData) {
      this.pageBytes.set(data, pos);
      pos += data.length;
    }
    const slice2 = this.pageBytes.subarray(0, pos);
    const crc = computeOggPageCrc(slice2);
    this.pageView.setUint32(22, crc, true);
    trackData.pagesWritten++;
    trackData.currentLacingValues.length = 0;
    trackData.currentPageData.length = 0;
    trackData.currentPageSize = 27;
    trackData.currentPageStartsWithFreshPacket = true;
    if (this.format._options.onPage) {
      this.writer.startTrackingWrites();
    }
    this.writer.write(slice2);
    if (this.format._options.onPage) {
      const { data, start } = this.writer.stopTrackingWrites();
      this.format._options.onPage(data, start, trackData.track.source);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async onTrackClose() {
    const release = await this.mutex.acquire();
    if (this.allTracksAreKnown()) {
      this.allTracksKnown.resolve();
    }
    await this.interleavePages();
    release();
  }
  async finalize() {
    const release = await this.mutex.acquire();
    this.allTracksKnown.resolve();
    await this.interleavePages(true);
    for (const trackData of this.trackDatas) {
      if (trackData.currentLacingValues.length > 0) {
        this.writePage(trackData, true);
      }
    }
    release();
  }
};

// node_modules/mediabunny/dist/modules/src/custom-coder.js
var customAudioEncoders = [];

// node_modules/mediabunny/dist/modules/src/packet.js
var PLACEHOLDER_DATA = new Uint8Array(0);
var EncodedPacket = class _EncodedPacket {
  /** Creates a new {@link EncodedPacket} from raw bytes and timing information. */
  constructor(data, type, timestamp, duration, sequenceNumber = -1, byteLength) {
    this.data = data;
    this.type = type;
    this.timestamp = timestamp;
    this.duration = duration;
    this.sequenceNumber = sequenceNumber;
    if (data === PLACEHOLDER_DATA && byteLength === void 0) {
      throw new Error("Internal error: byteLength must be explicitly provided when constructing metadata-only packets.");
    }
    if (byteLength === void 0) {
      byteLength = data.byteLength;
    }
    if (!(data instanceof Uint8Array)) {
      throw new TypeError("data must be a Uint8Array.");
    }
    if (type !== "key" && type !== "delta") {
      throw new TypeError('type must be either "key" or "delta".');
    }
    if (!Number.isFinite(timestamp)) {
      throw new TypeError("timestamp must be a number.");
    }
    if (!Number.isFinite(duration) || duration < 0) {
      throw new TypeError("duration must be a non-negative number.");
    }
    if (!Number.isFinite(sequenceNumber)) {
      throw new TypeError("sequenceNumber must be a number.");
    }
    if (!Number.isInteger(byteLength) || byteLength < 0) {
      throw new TypeError("byteLength must be a non-negative integer.");
    }
    this.byteLength = byteLength;
  }
  /** If this packet is a metadata-only packet. Metadata-only packets don't contain their packet data. */
  get isMetadataOnly() {
    return this.data === PLACEHOLDER_DATA;
  }
  /** The timestamp of this packet in microseconds. */
  get microsecondTimestamp() {
    return Math.trunc(SECOND_TO_MICROSECOND_FACTOR * this.timestamp);
  }
  /** The duration of this packet in microseconds. */
  get microsecondDuration() {
    return Math.trunc(SECOND_TO_MICROSECOND_FACTOR * this.duration);
  }
  /** Converts this packet to an EncodedVideoChunk for use with the WebCodecs API. */
  toEncodedVideoChunk() {
    if (this.isMetadataOnly) {
      throw new TypeError("Metadata-only packets cannot be converted to a video chunk.");
    }
    if (typeof EncodedVideoChunk === "undefined") {
      throw new Error("Your browser does not support EncodedVideoChunk.");
    }
    return new EncodedVideoChunk({
      data: this.data,
      type: this.type,
      timestamp: this.microsecondTimestamp,
      duration: this.microsecondDuration
    });
  }
  /** Converts this packet to an EncodedAudioChunk for use with the WebCodecs API. */
  toEncodedAudioChunk() {
    if (this.isMetadataOnly) {
      throw new TypeError("Metadata-only packets cannot be converted to an audio chunk.");
    }
    if (typeof EncodedAudioChunk === "undefined") {
      throw new Error("Your browser does not support EncodedAudioChunk.");
    }
    return new EncodedAudioChunk({
      data: this.data,
      type: this.type,
      timestamp: this.microsecondTimestamp,
      duration: this.microsecondDuration
    });
  }
  /**
   * Creates an EncodedPacket from an EncodedVideoChunk or EncodedAudioChunk. This method is useful for converting
   * chunks from the WebCodecs API to EncodedPackets.
   */
  static fromEncodedChunk(chunk) {
    if (!(chunk instanceof EncodedVideoChunk || chunk instanceof EncodedAudioChunk)) {
      throw new TypeError("chunk must be an EncodedVideoChunk or EncodedAudioChunk.");
    }
    const data = new Uint8Array(chunk.byteLength);
    chunk.copyTo(data);
    return new _EncodedPacket(data, chunk.type, chunk.timestamp / 1e6, (chunk.duration ?? 0) / 1e6);
  }
  /** Clones this packet while optionally updating timing information. */
  clone(options) {
    if (options !== void 0 && (typeof options !== "object" || options === null)) {
      throw new TypeError("options, when provided, must be an object.");
    }
    if (options?.timestamp !== void 0 && !Number.isFinite(options.timestamp)) {
      throw new TypeError("options.timestamp, when provided, must be a number.");
    }
    if (options?.duration !== void 0 && !Number.isFinite(options.duration)) {
      throw new TypeError("options.duration, when provided, must be a number.");
    }
    return new _EncodedPacket(this.data, this.type, options?.timestamp ?? this.timestamp, options?.duration ?? this.duration, this.sequenceNumber, this.byteLength);
  }
};

// node_modules/mediabunny/dist/modules/src/pcm.js
var toUlaw = (s16) => {
  const MULAW_MAX = 8191;
  const MULAW_BIAS = 33;
  let number = s16;
  let mask = 4096;
  let sign = 0;
  let position = 12;
  let lsb = 0;
  if (number < 0) {
    number = -number;
    sign = 128;
  }
  number += MULAW_BIAS;
  if (number > MULAW_MAX) {
    number = MULAW_MAX;
  }
  while ((number & mask) !== mask && position >= 5) {
    mask >>= 1;
    position--;
  }
  lsb = number >> position - 4 & 15;
  return ~(sign | position - 5 << 4 | lsb) & 255;
};
var toAlaw = (s16) => {
  const ALAW_MAX = 4095;
  let mask = 2048;
  let sign = 0;
  let position = 11;
  let lsb = 0;
  let number = s16;
  if (number < 0) {
    number = -number;
    sign = 128;
  }
  if (number > ALAW_MAX) {
    number = ALAW_MAX;
  }
  while ((number & mask) !== mask && position >= 5) {
    mask >>= 1;
    position--;
  }
  lsb = number >> (position === 4 ? 1 : position - 4) & 15;
  return (sign | position - 4 << 4 | lsb) ^ 85;
};

// node_modules/mediabunny/dist/modules/src/sample.js
var AUDIO_SAMPLE_FORMATS = /* @__PURE__ */ new Set(["f32", "f32-planar", "s16", "s16-planar", "s32", "s32-planar", "u8", "u8-planar"]);
var AudioSample = class _AudioSample {
  /** The presentation timestamp of the sample in microseconds. */
  get microsecondTimestamp() {
    return Math.trunc(SECOND_TO_MICROSECOND_FACTOR * this.timestamp);
  }
  /** The duration of the sample in microseconds. */
  get microsecondDuration() {
    return Math.trunc(SECOND_TO_MICROSECOND_FACTOR * this.duration);
  }
  /**
   * Creates a new {@link AudioSample}, either from an existing
   * [`AudioData`](https://developer.mozilla.org/en-US/docs/Web/API/AudioData) or from raw bytes specified in
   * {@link AudioSampleInit}.
   */
  constructor(init) {
    this._closed = false;
    if (isAudioData(init)) {
      if (init.format === null) {
        throw new TypeError("AudioData with null format is not supported.");
      }
      this._data = init;
      this.format = init.format;
      this.sampleRate = init.sampleRate;
      this.numberOfFrames = init.numberOfFrames;
      this.numberOfChannels = init.numberOfChannels;
      this.timestamp = init.timestamp / 1e6;
      this.duration = init.numberOfFrames / init.sampleRate;
    } else {
      if (!init || typeof init !== "object") {
        throw new TypeError("Invalid AudioDataInit: must be an object.");
      }
      if (!AUDIO_SAMPLE_FORMATS.has(init.format)) {
        throw new TypeError("Invalid AudioDataInit: invalid format.");
      }
      if (!Number.isFinite(init.sampleRate) || init.sampleRate <= 0) {
        throw new TypeError("Invalid AudioDataInit: sampleRate must be > 0.");
      }
      if (!Number.isInteger(init.numberOfChannels) || init.numberOfChannels === 0) {
        throw new TypeError("Invalid AudioDataInit: numberOfChannels must be an integer > 0.");
      }
      if (!Number.isFinite(init?.timestamp)) {
        throw new TypeError("init.timestamp must be a number.");
      }
      const numberOfFrames = init.data.byteLength / (getBytesPerSample(init.format) * init.numberOfChannels);
      if (!Number.isInteger(numberOfFrames)) {
        throw new TypeError("Invalid AudioDataInit: data size is not a multiple of frame size.");
      }
      this.format = init.format;
      this.sampleRate = init.sampleRate;
      this.numberOfFrames = numberOfFrames;
      this.numberOfChannels = init.numberOfChannels;
      this.timestamp = init.timestamp;
      this.duration = numberOfFrames / init.sampleRate;
      let dataBuffer;
      if (init.data instanceof ArrayBuffer) {
        dataBuffer = new Uint8Array(init.data);
      } else if (ArrayBuffer.isView(init.data)) {
        dataBuffer = new Uint8Array(init.data.buffer, init.data.byteOffset, init.data.byteLength);
      } else {
        throw new TypeError("Invalid AudioDataInit: data is not a BufferSource.");
      }
      const expectedSize = this.numberOfFrames * this.numberOfChannels * getBytesPerSample(this.format);
      if (dataBuffer.byteLength < expectedSize) {
        throw new TypeError("Invalid AudioDataInit: insufficient data size.");
      }
      this._data = dataBuffer;
    }
  }
  /** Returns the number of bytes required to hold the audio sample's data as specified by the given options. */
  allocationSize(options) {
    if (!options || typeof options !== "object") {
      throw new TypeError("options must be an object.");
    }
    if (!Number.isInteger(options.planeIndex) || options.planeIndex < 0) {
      throw new TypeError("planeIndex must be a non-negative integer.");
    }
    if (options.format !== void 0 && !AUDIO_SAMPLE_FORMATS.has(options.format)) {
      throw new TypeError("Invalid format.");
    }
    if (options.frameOffset !== void 0 && (!Number.isInteger(options.frameOffset) || options.frameOffset < 0)) {
      throw new TypeError("frameOffset must be a non-negative integer.");
    }
    if (options.frameCount !== void 0 && (!Number.isInteger(options.frameCount) || options.frameCount < 0)) {
      throw new TypeError("frameCount must be a non-negative integer.");
    }
    if (this._closed) {
      throw new Error("AudioSample is closed.");
    }
    const destFormat = options.format ?? this.format;
    const frameOffset = options.frameOffset ?? 0;
    if (frameOffset >= this.numberOfFrames) {
      throw new RangeError("frameOffset out of range");
    }
    const copyFrameCount = options.frameCount !== void 0 ? options.frameCount : this.numberOfFrames - frameOffset;
    if (copyFrameCount > this.numberOfFrames - frameOffset) {
      throw new RangeError("frameCount out of range");
    }
    const bytesPerSample = getBytesPerSample(destFormat);
    const isPlanar = formatIsPlanar(destFormat);
    if (isPlanar && options.planeIndex >= this.numberOfChannels) {
      throw new RangeError("planeIndex out of range");
    }
    if (!isPlanar && options.planeIndex !== 0) {
      throw new RangeError("planeIndex out of range");
    }
    const elementCount = isPlanar ? copyFrameCount : copyFrameCount * this.numberOfChannels;
    return elementCount * bytesPerSample;
  }
  /** Copies the audio sample's data to an ArrayBuffer or ArrayBufferView as specified by the given options. */
  copyTo(destination, options) {
    if (!isAllowSharedBufferSource(destination)) {
      throw new TypeError("destination must be an ArrayBuffer or an ArrayBuffer view.");
    }
    if (!options || typeof options !== "object") {
      throw new TypeError("options must be an object.");
    }
    if (!Number.isInteger(options.planeIndex) || options.planeIndex < 0) {
      throw new TypeError("planeIndex must be a non-negative integer.");
    }
    if (options.format !== void 0 && !AUDIO_SAMPLE_FORMATS.has(options.format)) {
      throw new TypeError("Invalid format.");
    }
    if (options.frameOffset !== void 0 && (!Number.isInteger(options.frameOffset) || options.frameOffset < 0)) {
      throw new TypeError("frameOffset must be a non-negative integer.");
    }
    if (options.frameCount !== void 0 && (!Number.isInteger(options.frameCount) || options.frameCount < 0)) {
      throw new TypeError("frameCount must be a non-negative integer.");
    }
    if (this._closed) {
      throw new Error("AudioSample is closed.");
    }
    const { planeIndex, format, frameCount: optFrameCount, frameOffset: optFrameOffset } = options;
    const destFormat = format ?? this.format;
    if (!destFormat)
      throw new Error("Destination format not determined");
    const numFrames = this.numberOfFrames;
    const numChannels = this.numberOfChannels;
    const frameOffset = optFrameOffset ?? 0;
    if (frameOffset >= numFrames) {
      throw new RangeError("frameOffset out of range");
    }
    const copyFrameCount = optFrameCount !== void 0 ? optFrameCount : numFrames - frameOffset;
    if (copyFrameCount > numFrames - frameOffset) {
      throw new RangeError("frameCount out of range");
    }
    const destBytesPerSample = getBytesPerSample(destFormat);
    const destIsPlanar = formatIsPlanar(destFormat);
    if (destIsPlanar && planeIndex >= numChannels) {
      throw new RangeError("planeIndex out of range");
    }
    if (!destIsPlanar && planeIndex !== 0) {
      throw new RangeError("planeIndex out of range");
    }
    const destElementCount = destIsPlanar ? copyFrameCount : copyFrameCount * numChannels;
    const requiredSize = destElementCount * destBytesPerSample;
    if (destination.byteLength < requiredSize) {
      throw new RangeError("Destination buffer is too small");
    }
    const destView = toDataView(destination);
    const writeFn = getWriteFunction(destFormat);
    if (isAudioData(this._data)) {
      if (destIsPlanar) {
        if (destFormat === "f32-planar") {
          this._data.copyTo(destination, {
            planeIndex,
            frameOffset,
            frameCount: copyFrameCount,
            format: "f32-planar"
          });
        } else {
          const tempBuffer = new ArrayBuffer(copyFrameCount * 4);
          const tempArray = new Float32Array(tempBuffer);
          this._data.copyTo(tempArray, {
            planeIndex,
            frameOffset,
            frameCount: copyFrameCount,
            format: "f32-planar"
          });
          const tempView = new DataView(tempBuffer);
          for (let i = 0; i < copyFrameCount; i++) {
            const destOffset = i * destBytesPerSample;
            const sample = tempView.getFloat32(i * 4, true);
            writeFn(destView, destOffset, sample);
          }
        }
      } else {
        const numCh = numChannels;
        const temp = new Float32Array(copyFrameCount);
        for (let ch = 0; ch < numCh; ch++) {
          this._data.copyTo(temp, {
            planeIndex: ch,
            frameOffset,
            frameCount: copyFrameCount,
            format: "f32-planar"
          });
          for (let i = 0; i < copyFrameCount; i++) {
            const destIndex = i * numCh + ch;
            const destOffset = destIndex * destBytesPerSample;
            writeFn(destView, destOffset, temp[i]);
          }
        }
      }
    } else {
      const uint8Data = this._data;
      const srcView = new DataView(uint8Data.buffer, uint8Data.byteOffset, uint8Data.byteLength);
      const srcFormat = this.format;
      const readFn = getReadFunction(srcFormat);
      const srcBytesPerSample = getBytesPerSample(srcFormat);
      const srcIsPlanar = formatIsPlanar(srcFormat);
      for (let i = 0; i < copyFrameCount; i++) {
        if (destIsPlanar) {
          const destOffset = i * destBytesPerSample;
          let srcOffset;
          if (srcIsPlanar) {
            srcOffset = (planeIndex * numFrames + (i + frameOffset)) * srcBytesPerSample;
          } else {
            srcOffset = ((i + frameOffset) * numChannels + planeIndex) * srcBytesPerSample;
          }
          const normalized = readFn(srcView, srcOffset);
          writeFn(destView, destOffset, normalized);
        } else {
          for (let ch = 0; ch < numChannels; ch++) {
            const destIndex = i * numChannels + ch;
            const destOffset = destIndex * destBytesPerSample;
            let srcOffset;
            if (srcIsPlanar) {
              srcOffset = (ch * numFrames + (i + frameOffset)) * srcBytesPerSample;
            } else {
              srcOffset = ((i + frameOffset) * numChannels + ch) * srcBytesPerSample;
            }
            const normalized = readFn(srcView, srcOffset);
            writeFn(destView, destOffset, normalized);
          }
        }
      }
    }
  }
  /** Clones this audio sample. */
  clone() {
    if (this._closed) {
      throw new Error("AudioSample is closed.");
    }
    if (isAudioData(this._data)) {
      const sample = new _AudioSample(this._data.clone());
      sample.setTimestamp(this.timestamp);
      return sample;
    } else {
      return new _AudioSample({
        format: this.format,
        sampleRate: this.sampleRate,
        numberOfFrames: this.numberOfFrames,
        numberOfChannels: this.numberOfChannels,
        timestamp: this.timestamp,
        data: this._data
      });
    }
  }
  /**
   * Closes this audio sample, releasing held resources. Audio samples should be closed as soon as they are not
   * needed anymore.
   */
  close() {
    if (this._closed) {
      return;
    }
    if (isAudioData(this._data)) {
      this._data.close();
    } else {
      this._data = new Uint8Array(0);
    }
    this._closed = true;
  }
  /**
   * Converts this audio sample to an AudioData for use with the WebCodecs API. The AudioData returned by this
   * method *must* be closed separately from this audio sample.
   */
  toAudioData() {
    if (this._closed) {
      throw new Error("AudioSample is closed.");
    }
    if (isAudioData(this._data)) {
      if (this._data.timestamp === this.microsecondTimestamp) {
        return this._data.clone();
      } else {
        if (formatIsPlanar(this.format)) {
          const size = this.allocationSize({ planeIndex: 0, format: this.format });
          const data = new ArrayBuffer(size * this.numberOfChannels);
          for (let i = 0; i < this.numberOfChannels; i++) {
            this.copyTo(new Uint8Array(data, i * size, size), { planeIndex: i, format: this.format });
          }
          return new AudioData({
            format: this.format,
            sampleRate: this.sampleRate,
            numberOfFrames: this.numberOfFrames,
            numberOfChannels: this.numberOfChannels,
            timestamp: this.microsecondTimestamp,
            data
          });
        } else {
          const data = new ArrayBuffer(this.allocationSize({ planeIndex: 0, format: this.format }));
          this.copyTo(data, { planeIndex: 0, format: this.format });
          return new AudioData({
            format: this.format,
            sampleRate: this.sampleRate,
            numberOfFrames: this.numberOfFrames,
            numberOfChannels: this.numberOfChannels,
            timestamp: this.microsecondTimestamp,
            data
          });
        }
      }
    } else {
      return new AudioData({
        format: this.format,
        sampleRate: this.sampleRate,
        numberOfFrames: this.numberOfFrames,
        numberOfChannels: this.numberOfChannels,
        timestamp: this.microsecondTimestamp,
        data: this._data
      });
    }
  }
  /** Convert this audio sample to an AudioBuffer for use with the Web Audio API. */
  toAudioBuffer() {
    if (this._closed) {
      throw new Error("AudioSample is closed.");
    }
    const audioBuffer = new AudioBuffer({
      numberOfChannels: this.numberOfChannels,
      length: this.numberOfFrames,
      sampleRate: this.sampleRate
    });
    const dataBytes = new Float32Array(this.allocationSize({ planeIndex: 0, format: "f32-planar" }) / 4);
    for (let i = 0; i < this.numberOfChannels; i++) {
      this.copyTo(dataBytes, { planeIndex: i, format: "f32-planar" });
      audioBuffer.copyToChannel(dataBytes, i);
    }
    return audioBuffer;
  }
  /** Sets the presentation timestamp of this audio sample, in seconds. */
  setTimestamp(newTimestamp) {
    if (!Number.isFinite(newTimestamp)) {
      throw new TypeError("newTimestamp must be a number.");
    }
    this.timestamp = newTimestamp;
  }
  /** @internal */
  static *_fromAudioBuffer(audioBuffer, timestamp) {
    if (!(audioBuffer instanceof AudioBuffer)) {
      throw new TypeError("audioBuffer must be an AudioBuffer.");
    }
    const MAX_FLOAT_COUNT = 48e3 * 5;
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const totalFrames = audioBuffer.length;
    const maxFramesPerChunk = Math.floor(MAX_FLOAT_COUNT / numberOfChannels);
    let currentRelativeFrame = 0;
    let remainingFrames = totalFrames;
    while (remainingFrames > 0) {
      const framesToCopy = Math.min(maxFramesPerChunk, remainingFrames);
      const chunkData = new Float32Array(numberOfChannels * framesToCopy);
      for (let channel = 0; channel < numberOfChannels; channel++) {
        audioBuffer.copyFromChannel(chunkData.subarray(channel * framesToCopy, (channel + 1) * framesToCopy), channel, currentRelativeFrame);
      }
      yield new _AudioSample({
        format: "f32-planar",
        sampleRate,
        numberOfFrames: framesToCopy,
        numberOfChannels,
        timestamp: timestamp + currentRelativeFrame / sampleRate,
        data: chunkData
      });
      currentRelativeFrame += framesToCopy;
      remainingFrames -= framesToCopy;
    }
  }
  /**
   * Creates AudioSamples from an AudioBuffer, starting at the given timestamp in seconds. Typically creates exactly
   * one sample, but may create multiple if the AudioBuffer is exceedingly large.
   */
  static fromAudioBuffer(audioBuffer, timestamp) {
    if (!(audioBuffer instanceof AudioBuffer)) {
      throw new TypeError("audioBuffer must be an AudioBuffer.");
    }
    const MAX_FLOAT_COUNT = 48e3 * 5;
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const totalFrames = audioBuffer.length;
    const maxFramesPerChunk = Math.floor(MAX_FLOAT_COUNT / numberOfChannels);
    let currentRelativeFrame = 0;
    let remainingFrames = totalFrames;
    const result = [];
    while (remainingFrames > 0) {
      const framesToCopy = Math.min(maxFramesPerChunk, remainingFrames);
      const chunkData = new Float32Array(numberOfChannels * framesToCopy);
      for (let channel = 0; channel < numberOfChannels; channel++) {
        audioBuffer.copyFromChannel(chunkData.subarray(channel * framesToCopy, (channel + 1) * framesToCopy), channel, currentRelativeFrame);
      }
      const audioSample = new _AudioSample({
        format: "f32-planar",
        sampleRate,
        numberOfFrames: framesToCopy,
        numberOfChannels,
        timestamp: timestamp + currentRelativeFrame / sampleRate,
        data: chunkData
      });
      result.push(audioSample);
      currentRelativeFrame += framesToCopy;
      remainingFrames -= framesToCopy;
    }
    return result;
  }
};
var getBytesPerSample = (format) => {
  switch (format) {
    case "u8":
    case "u8-planar":
      return 1;
    case "s16":
    case "s16-planar":
      return 2;
    case "s32":
    case "s32-planar":
      return 4;
    case "f32":
    case "f32-planar":
      return 4;
    default:
      throw new Error("Unknown AudioSampleFormat");
  }
};
var formatIsPlanar = (format) => {
  switch (format) {
    case "u8-planar":
    case "s16-planar":
    case "s32-planar":
    case "f32-planar":
      return true;
    default:
      return false;
  }
};
var getReadFunction = (format) => {
  switch (format) {
    case "u8":
    case "u8-planar":
      return (view, offset) => (view.getUint8(offset) - 128) / 128;
    case "s16":
    case "s16-planar":
      return (view, offset) => view.getInt16(offset, true) / 32768;
    case "s32":
    case "s32-planar":
      return (view, offset) => view.getInt32(offset, true) / 2147483648;
    case "f32":
    case "f32-planar":
      return (view, offset) => view.getFloat32(offset, true);
  }
};
var getWriteFunction = (format) => {
  switch (format) {
    case "u8":
    case "u8-planar":
      return (view, offset, value) => view.setUint8(offset, clamp2((value + 1) * 127.5, 0, 255));
    case "s16":
    case "s16-planar":
      return (view, offset, value) => view.setInt16(offset, clamp2(Math.round(value * 32767), -32768, 32767), true);
    case "s32":
    case "s32-planar":
      return (view, offset, value) => view.setInt32(offset, clamp2(Math.round(value * 2147483647), -2147483648, 2147483647), true);
    case "f32":
    case "f32-planar":
      return (view, offset, value) => view.setFloat32(offset, value, true);
  }
};
var isAudioData = (x2) => {
  return typeof AudioData !== "undefined" && x2 instanceof AudioData;
};

// node_modules/mediabunny/dist/modules/src/output-format.js
var OutputFormat = class {
  /** Returns a list of video codecs that this output format can contain. */
  getSupportedVideoCodecs() {
    return this.getSupportedCodecs().filter((codec) => VIDEO_CODECS.includes(codec));
  }
  /** Returns a list of audio codecs that this output format can contain. */
  getSupportedAudioCodecs() {
    return this.getSupportedCodecs().filter((codec) => AUDIO_CODECS.includes(codec));
  }
  /** Returns a list of subtitle codecs that this output format can contain. */
  getSupportedSubtitleCodecs() {
    return this.getSupportedCodecs().filter((codec) => SUBTITLE_CODECS.includes(codec));
  }
  /** @internal */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _codecUnsupportedHint(codec) {
    return "";
  }
};
var OggOutputFormat = class extends OutputFormat {
  /** Creates a new {@link OggOutputFormat} configured with the specified `options`. */
  constructor(options = {}) {
    if (!options || typeof options !== "object") {
      throw new TypeError("options must be an object.");
    }
    if (options.onPage !== void 0 && typeof options.onPage !== "function") {
      throw new TypeError("options.onPage, when provided, must be a function.");
    }
    super();
    this._options = options;
  }
  /** @internal */
  _createMuxer(output) {
    return new OggMuxer(output, this);
  }
  /** @internal */
  get _name() {
    return "Ogg";
  }
  getSupportedTrackCounts() {
    return {
      video: { min: 0, max: 0 },
      audio: { min: 0, max: Infinity },
      subtitle: { min: 0, max: 0 },
      total: { min: 1, max: 2 ** 32 }
    };
  }
  get fileExtension() {
    return ".ogg";
  }
  get mimeType() {
    return "application/ogg";
  }
  getSupportedCodecs() {
    return [
      ...AUDIO_CODECS.filter((codec) => ["vorbis", "opus"].includes(codec))
    ];
  }
  get supportsVideoRotationMetadata() {
    return false;
  }
};

// node_modules/mediabunny/dist/modules/src/encode.js
var validateAudioEncodingConfig = (config) => {
  if (!config || typeof config !== "object") {
    throw new TypeError("Encoding config must be an object.");
  }
  if (!AUDIO_CODECS.includes(config.codec)) {
    throw new TypeError(`Invalid audio codec '${config.codec}'. Must be one of: ${AUDIO_CODECS.join(", ")}.`);
  }
  if (config.bitrate === void 0 && (!PCM_AUDIO_CODECS.includes(config.codec) || config.codec === "flac")) {
    throw new TypeError("config.bitrate must be provided for compressed audio codecs.");
  }
  if (config.bitrate !== void 0 && !(config.bitrate instanceof Quality) && (!Number.isInteger(config.bitrate) || config.bitrate <= 0)) {
    throw new TypeError("config.bitrate, when provided, must be a positive integer or a quality.");
  }
  if (config.onEncodedPacket !== void 0 && typeof config.onEncodedPacket !== "function") {
    throw new TypeError("config.onEncodedChunk, when provided, must be a function.");
  }
  if (config.onEncoderConfig !== void 0 && typeof config.onEncoderConfig !== "function") {
    throw new TypeError("config.onEncoderConfig, when provided, must be a function.");
  }
  validateAudioEncodingAdditionalOptions(config.codec, config);
};
var validateAudioEncodingAdditionalOptions = (codec, options) => {
  if (!options || typeof options !== "object") {
    throw new TypeError("Encoding options must be an object.");
  }
  if (options.bitrateMode !== void 0 && !["constant", "variable"].includes(options.bitrateMode)) {
    throw new TypeError("bitrateMode, when provided, must be 'constant' or 'variable'.");
  }
  if (options.fullCodecString !== void 0 && typeof options.fullCodecString !== "string") {
    throw new TypeError("fullCodecString, when provided, must be a string.");
  }
  if (options.fullCodecString !== void 0 && inferCodecFromCodecString(options.fullCodecString) !== codec) {
    throw new TypeError(`fullCodecString, when provided, must be a string that matches the specified codec (${codec}).`);
  }
};
var buildAudioEncoderConfig = (options) => {
  const resolvedBitrate = options.bitrate instanceof Quality ? options.bitrate._toAudioBitrate(options.codec) : options.bitrate;
  return {
    codec: options.fullCodecString ?? buildAudioCodecString(options.codec, options.numberOfChannels, options.sampleRate),
    numberOfChannels: options.numberOfChannels,
    sampleRate: options.sampleRate,
    bitrate: resolvedBitrate,
    bitrateMode: options.bitrateMode,
    ...getAudioEncoderConfigExtension(options.codec)
  };
};
var Quality = class {
  /** @internal */
  constructor(factor) {
    this._factor = factor;
  }
  /** @internal */
  _toVideoBitrate(codec, width, height) {
    const pixels = width * height;
    const codecEfficiencyFactors = {
      avc: 1,
      // H.264/AVC (baseline)
      hevc: 0.6,
      // H.265/HEVC (~40% more efficient than AVC)
      vp9: 0.6,
      // Similar to HEVC
      av1: 0.4,
      // ~60% more efficient than AVC
      vp8: 1.2
      // Slightly less efficient than AVC
    };
    const referencePixels = 1920 * 1080;
    const referenceBitrate = 3e6;
    const scaleFactor = Math.pow(pixels / referencePixels, 0.95);
    const baseBitrate = referenceBitrate * scaleFactor;
    const codecAdjustedBitrate = baseBitrate * codecEfficiencyFactors[codec];
    const finalBitrate = codecAdjustedBitrate * this._factor;
    return Math.ceil(finalBitrate / 1e3) * 1e3;
  }
  /** @internal */
  _toAudioBitrate(codec) {
    if (PCM_AUDIO_CODECS.includes(codec) || codec === "flac") {
      return void 0;
    }
    const baseRates = {
      aac: 128e3,
      // 128kbps base for AAC
      opus: 64e3,
      // 64kbps base for Opus
      mp3: 16e4,
      // 160kbps base for MP3
      vorbis: 64e3
      // 64kbps base for Vorbis
    };
    const baseBitrate = baseRates[codec];
    if (!baseBitrate) {
      throw new Error(`Unhandled codec: ${codec}`);
    }
    let finalBitrate = baseBitrate * this._factor;
    if (codec === "aac") {
      const validRates = [96e3, 128e3, 16e4, 192e3];
      finalBitrate = validRates.reduce((prev, curr) => Math.abs(curr - finalBitrate) < Math.abs(prev - finalBitrate) ? curr : prev);
    } else if (codec === "opus" || codec === "vorbis") {
      finalBitrate = Math.max(6e3, finalBitrate);
    } else if (codec === "mp3") {
      const validRates = [
        8e3,
        16e3,
        24e3,
        32e3,
        4e4,
        48e3,
        64e3,
        8e4,
        96e3,
        112e3,
        128e3,
        16e4,
        192e3,
        224e3,
        256e3,
        32e4
      ];
      finalBitrate = validRates.reduce((prev, curr) => Math.abs(curr - finalBitrate) < Math.abs(prev - finalBitrate) ? curr : prev);
    }
    return Math.round(finalBitrate / 1e3) * 1e3;
  }
};
var QUALITY_VERY_LOW = new Quality(0.3);
var QUALITY_LOW = new Quality(0.6);
var QUALITY_MEDIUM = new Quality(1);
var QUALITY_HIGH = new Quality(2);
var QUALITY_VERY_HIGH = new Quality(4);

// node_modules/mediabunny/dist/modules/src/media-source.js
var MediaSource = class {
  constructor() {
    this._connectedTrack = null;
    this._closingPromise = null;
    this._closed = false;
    this._timestampOffset = 0;
  }
  /** @internal */
  _ensureValidAdd() {
    if (!this._connectedTrack) {
      throw new Error("Source is not connected to an output track.");
    }
    if (this._connectedTrack.output.state === "canceled") {
      throw new Error("Output has been canceled.");
    }
    if (this._connectedTrack.output.state === "finalizing" || this._connectedTrack.output.state === "finalized") {
      throw new Error("Output has been finalized.");
    }
    if (this._connectedTrack.output.state === "pending") {
      throw new Error("Output has not started.");
    }
    if (this._closed) {
      throw new Error("Source is closed.");
    }
  }
  /** @internal */
  async _start() {
  }
  /** @internal */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async _flushAndClose(forceClose) {
  }
  /**
   * Closes this source. This prevents future samples from being added and signals to the output file that no further
   * samples will come in for this track. Calling `.close()` is optional but recommended after adding the
   * last sample - for improved performance and reduced memory usage.
   */
  close() {
    if (this._closingPromise) {
      return;
    }
    const connectedTrack = this._connectedTrack;
    if (!connectedTrack) {
      throw new Error("Cannot call close without connecting the source to an output track.");
    }
    if (connectedTrack.output.state === "pending") {
      throw new Error("Cannot call close before output has been started.");
    }
    this._closingPromise = (async () => {
      await this._flushAndClose(false);
      this._closed = true;
      if (connectedTrack.output.state === "finalizing" || connectedTrack.output.state === "finalized") {
        return;
      }
      connectedTrack.output._muxer.onTrackClose(connectedTrack);
    })();
  }
  /** @internal */
  async _flushOrWaitForOngoingClose(forceClose) {
    if (this._closingPromise) {
      return this._closingPromise;
    } else {
      return this._flushAndClose(forceClose);
    }
  }
};
var VideoSource = class extends MediaSource {
  /** Internal constructor. */
  constructor(codec) {
    super();
    this._connectedTrack = null;
    if (!VIDEO_CODECS.includes(codec)) {
      throw new TypeError(`Invalid video codec '${codec}'. Must be one of: ${VIDEO_CODECS.join(", ")}.`);
    }
    this._codec = codec;
  }
};
var AudioSource = class extends MediaSource {
  /** Internal constructor. */
  constructor(codec) {
    super();
    this._connectedTrack = null;
    if (!AUDIO_CODECS.includes(codec)) {
      throw new TypeError(`Invalid audio codec '${codec}'. Must be one of: ${AUDIO_CODECS.join(", ")}.`);
    }
    this._codec = codec;
  }
};
var AudioEncoderWrapper = class {
  constructor(source, encodingConfig) {
    this.source = source;
    this.encodingConfig = encodingConfig;
    this.ensureEncoderPromise = null;
    this.encoderInitialized = false;
    this.encoder = null;
    this.muxer = null;
    this.lastNumberOfChannels = null;
    this.lastSampleRate = null;
    this.isPcmEncoder = false;
    this.outputSampleSize = null;
    this.writeOutputValue = null;
    this.customEncoder = null;
    this.customEncoderCallSerializer = new CallSerializer();
    this.customEncoderQueueSize = 0;
    this.encoderError = null;
  }
  async add(audioSample, shouldClose) {
    try {
      this.checkForEncoderError();
      this.source._ensureValidAdd();
      if (this.lastNumberOfChannels !== null && this.lastSampleRate !== null) {
        if (audioSample.numberOfChannels !== this.lastNumberOfChannels || audioSample.sampleRate !== this.lastSampleRate) {
          throw new Error(`Audio parameters must remain constant. Expected ${this.lastNumberOfChannels} channels at ${this.lastSampleRate} Hz, got ${audioSample.numberOfChannels} channels at ${audioSample.sampleRate} Hz.`);
        }
      } else {
        this.lastNumberOfChannels = audioSample.numberOfChannels;
        this.lastSampleRate = audioSample.sampleRate;
      }
      if (!this.encoderInitialized) {
        if (!this.ensureEncoderPromise) {
          void this.ensureEncoder(audioSample);
        }
        if (!this.encoderInitialized) {
          await this.ensureEncoderPromise;
        }
      }
      assert(this.encoderInitialized);
      if (this.customEncoder) {
        this.customEncoderQueueSize++;
        const clonedSample = audioSample.clone();
        const promise = this.customEncoderCallSerializer.call(() => this.customEncoder.encode(clonedSample)).then(() => this.customEncoderQueueSize--).catch((error) => this.encoderError ??= error).finally(() => {
          clonedSample.close();
        });
        if (this.customEncoderQueueSize >= 4) {
          await promise;
        }
        await this.muxer.mutex.currentPromise;
      } else if (this.isPcmEncoder) {
        await this.doPcmEncoding(audioSample, shouldClose);
      } else {
        assert(this.encoder);
        const audioData = audioSample.toAudioData();
        this.encoder.encode(audioData);
        audioData.close();
        if (shouldClose) {
          audioSample.close();
        }
        if (this.encoder.encodeQueueSize >= 4) {
          await new Promise((resolve) => this.encoder.addEventListener("dequeue", resolve, { once: true }));
        }
        await this.muxer.mutex.currentPromise;
      }
    } finally {
      if (shouldClose) {
        audioSample.close();
      }
    }
  }
  async doPcmEncoding(audioSample, shouldClose) {
    assert(this.outputSampleSize);
    assert(this.writeOutputValue);
    const { numberOfChannels, numberOfFrames, sampleRate, timestamp } = audioSample;
    const CHUNK_SIZE = 2048;
    const outputs = [];
    for (let frame = 0; frame < numberOfFrames; frame += CHUNK_SIZE) {
      const frameCount = Math.min(CHUNK_SIZE, audioSample.numberOfFrames - frame);
      const outputSize = frameCount * numberOfChannels * this.outputSampleSize;
      const outputBuffer = new ArrayBuffer(outputSize);
      const outputView = new DataView(outputBuffer);
      outputs.push({ frameCount, view: outputView });
    }
    const allocationSize = audioSample.allocationSize({ planeIndex: 0, format: "f32-planar" });
    const floats = new Float32Array(allocationSize / Float32Array.BYTES_PER_ELEMENT);
    for (let i = 0; i < numberOfChannels; i++) {
      audioSample.copyTo(floats, { planeIndex: i, format: "f32-planar" });
      for (let j = 0; j < outputs.length; j++) {
        const { frameCount, view } = outputs[j];
        for (let k = 0; k < frameCount; k++) {
          this.writeOutputValue(view, (k * numberOfChannels + i) * this.outputSampleSize, floats[j * CHUNK_SIZE + k]);
        }
      }
    }
    if (shouldClose) {
      audioSample.close();
    }
    const meta = {
      decoderConfig: {
        codec: this.encodingConfig.codec,
        numberOfChannels,
        sampleRate
      }
    };
    for (let i = 0; i < outputs.length; i++) {
      const { frameCount, view } = outputs[i];
      const outputBuffer = view.buffer;
      const startFrame = i * CHUNK_SIZE;
      const packet = new EncodedPacket(new Uint8Array(outputBuffer), "key", timestamp + startFrame / sampleRate, frameCount / sampleRate);
      this.encodingConfig.onEncodedPacket?.(packet, meta);
      await this.muxer.addEncodedAudioPacket(this.source._connectedTrack, packet, meta);
    }
  }
  ensureEncoder(audioSample) {
    if (this.encoderInitialized) {
      return;
    }
    const encoderError = new Error();
    return this.ensureEncoderPromise = (async () => {
      const { numberOfChannels, sampleRate } = audioSample;
      const encoderConfig = buildAudioEncoderConfig({
        numberOfChannels,
        sampleRate,
        ...this.encodingConfig
      });
      this.encodingConfig.onEncoderConfig?.(encoderConfig);
      const MatchingCustomEncoder = customAudioEncoders.find((x2) => x2.supports(this.encodingConfig.codec, encoderConfig));
      if (MatchingCustomEncoder) {
        this.customEncoder = new MatchingCustomEncoder();
        this.customEncoder.codec = this.encodingConfig.codec;
        this.customEncoder.config = encoderConfig;
        this.customEncoder.onPacket = (packet, meta) => {
          if (!(packet instanceof EncodedPacket)) {
            throw new TypeError("The first argument passed to onPacket must be an EncodedPacket.");
          }
          if (meta !== void 0 && (!meta || typeof meta !== "object")) {
            throw new TypeError("The second argument passed to onPacket must be an object or undefined.");
          }
          this.encodingConfig.onEncodedPacket?.(packet, meta);
          void this.muxer.addEncodedAudioPacket(this.source._connectedTrack, packet, meta);
        };
        await this.customEncoder.init();
      } else if (PCM_AUDIO_CODECS.includes(this.encodingConfig.codec)) {
        this.initPcmEncoder();
      } else {
        if (typeof AudioEncoder === "undefined") {
          throw new Error("AudioEncoder is not supported by this browser.");
        }
        const support = await AudioEncoder.isConfigSupported(encoderConfig);
        if (!support.supported) {
          throw new Error(`This specific encoder configuration (${encoderConfig.codec}, ${encoderConfig.bitrate} bps, ${encoderConfig.numberOfChannels} channels, ${encoderConfig.sampleRate} Hz) is not supported by this browser. Consider using another codec or changing your audio parameters.`);
        }
        this.encoder = new AudioEncoder({
          output: (chunk, meta) => {
            const packet = EncodedPacket.fromEncodedChunk(chunk);
            this.encodingConfig.onEncodedPacket?.(packet, meta);
            void this.muxer.addEncodedAudioPacket(this.source._connectedTrack, packet, meta);
          },
          error: (error) => {
            error.stack = encoderError.stack;
            this.encoderError ??= error;
          }
        });
        this.encoder.configure(encoderConfig);
      }
      assert(this.source._connectedTrack);
      this.muxer = this.source._connectedTrack.output._muxer;
      this.encoderInitialized = true;
    })();
  }
  initPcmEncoder() {
    this.isPcmEncoder = true;
    const codec = this.encodingConfig.codec;
    const { dataType, sampleSize, littleEndian } = parsePcmCodec(codec);
    this.outputSampleSize = sampleSize;
    switch (sampleSize) {
      case 1:
        {
          if (dataType === "unsigned") {
            this.writeOutputValue = (view, byteOffset, value) => view.setUint8(byteOffset, clamp2((value + 1) * 127.5, 0, 255));
          } else if (dataType === "signed") {
            this.writeOutputValue = (view, byteOffset, value) => {
              view.setInt8(byteOffset, clamp2(Math.round(value * 128), -128, 127));
            };
          } else if (dataType === "ulaw") {
            this.writeOutputValue = (view, byteOffset, value) => {
              const int16 = clamp2(Math.floor(value * 32767), -32768, 32767);
              view.setUint8(byteOffset, toUlaw(int16));
            };
          } else if (dataType === "alaw") {
            this.writeOutputValue = (view, byteOffset, value) => {
              const int16 = clamp2(Math.floor(value * 32767), -32768, 32767);
              view.setUint8(byteOffset, toAlaw(int16));
            };
          } else {
            assert(false);
          }
        }
        ;
        break;
      case 2:
        {
          if (dataType === "unsigned") {
            this.writeOutputValue = (view, byteOffset, value) => view.setUint16(byteOffset, clamp2((value + 1) * 32767.5, 0, 65535), littleEndian);
          } else if (dataType === "signed") {
            this.writeOutputValue = (view, byteOffset, value) => view.setInt16(byteOffset, clamp2(Math.round(value * 32767), -32768, 32767), littleEndian);
          } else {
            assert(false);
          }
        }
        ;
        break;
      case 3:
        {
          if (dataType === "unsigned") {
            this.writeOutputValue = (view, byteOffset, value) => setUint24(view, byteOffset, clamp2((value + 1) * 83886075e-1, 0, 16777215), littleEndian);
          } else if (dataType === "signed") {
            this.writeOutputValue = (view, byteOffset, value) => setInt24(view, byteOffset, clamp2(Math.round(value * 8388607), -8388608, 8388607), littleEndian);
          } else {
            assert(false);
          }
        }
        ;
        break;
      case 4:
        {
          if (dataType === "unsigned") {
            this.writeOutputValue = (view, byteOffset, value) => view.setUint32(byteOffset, clamp2((value + 1) * 21474836475e-1, 0, 4294967295), littleEndian);
          } else if (dataType === "signed") {
            this.writeOutputValue = (view, byteOffset, value) => view.setInt32(byteOffset, clamp2(Math.round(value * 2147483647), -2147483648, 2147483647), littleEndian);
          } else if (dataType === "float") {
            this.writeOutputValue = (view, byteOffset, value) => view.setFloat32(byteOffset, value, littleEndian);
          } else {
            assert(false);
          }
        }
        ;
        break;
      case 8:
        {
          if (dataType === "float") {
            this.writeOutputValue = (view, byteOffset, value) => view.setFloat64(byteOffset, value, littleEndian);
          } else {
            assert(false);
          }
        }
        ;
        break;
      default:
        {
          assertNever(sampleSize);
          assert(false);
        }
        ;
    }
  }
  async flushAndClose(forceClose) {
    if (!forceClose)
      this.checkForEncoderError();
    if (this.customEncoder) {
      if (!forceClose) {
        void this.customEncoderCallSerializer.call(() => this.customEncoder.flush());
      }
      await this.customEncoderCallSerializer.call(() => this.customEncoder.close());
    } else if (this.encoder) {
      if (!forceClose) {
        await this.encoder.flush();
      }
      if (this.encoder.state !== "closed") {
        this.encoder.close();
      }
    }
    if (!forceClose)
      this.checkForEncoderError();
  }
  getQueueSize() {
    if (this.customEncoder) {
      return this.customEncoderQueueSize;
    } else if (this.isPcmEncoder) {
      return 0;
    } else {
      return this.encoder?.encodeQueueSize ?? 0;
    }
  }
  checkForEncoderError() {
    if (this.encoderError) {
      this.encoderError.stack = new Error().stack;
      throw this.encoderError;
    }
  }
};
var AudioSampleSource = class extends AudioSource {
  /**
   * Creates a new {@link AudioSampleSource} whose samples are encoded according to the specified
   * {@link AudioEncodingConfig}.
   */
  constructor(encodingConfig) {
    validateAudioEncodingConfig(encodingConfig);
    super(encodingConfig.codec);
    this._encoder = new AudioEncoderWrapper(this, encodingConfig);
  }
  /**
   * Encodes an audio sample and then adds it to the output.
   *
   * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
   * to respect writer and encoder backpressure.
   */
  add(audioSample) {
    if (!(audioSample instanceof AudioSample)) {
      throw new TypeError("audioSample must be an AudioSample.");
    }
    return this._encoder.add(audioSample, false);
  }
  /** @internal */
  _flushAndClose(forceClose) {
    return this._encoder.flushAndClose(forceClose);
  }
};
var SubtitleSource = class extends MediaSource {
  /** Internal constructor. */
  constructor(codec) {
    super();
    this._connectedTrack = null;
    if (!SUBTITLE_CODECS.includes(codec)) {
      throw new TypeError(`Invalid subtitle codec '${codec}'. Must be one of: ${SUBTITLE_CODECS.join(", ")}.`);
    }
    this._codec = codec;
  }
};

// node_modules/mediabunny/dist/modules/src/output.js
var ALL_TRACK_TYPES = ["video", "audio", "subtitle"];
var validateBaseTrackMetadata = (metadata) => {
  if (!metadata || typeof metadata !== "object") {
    throw new TypeError("metadata must be an object.");
  }
  if (metadata.languageCode !== void 0 && !isIso639Dash2LanguageCode(metadata.languageCode)) {
    throw new TypeError("metadata.languageCode, when provided, must be a three-letter, ISO 639-2/T language code.");
  }
  if (metadata.name !== void 0 && typeof metadata.name !== "string") {
    throw new TypeError("metadata.name, when provided, must be a string.");
  }
};
var Output = class {
  /**
   * Creates a new instance of {@link Output} which can then be used to create a new media file according to the
   * specified {@link OutputOptions}.
   */
  constructor(options) {
    this.state = "pending";
    this._tracks = [];
    this._startPromise = null;
    this._cancelPromise = null;
    this._finalizePromise = null;
    this._mutex = new AsyncMutex();
    this._metadataTags = {};
    if (!options || typeof options !== "object") {
      throw new TypeError("options must be an object.");
    }
    if (!(options.format instanceof OutputFormat)) {
      throw new TypeError("options.format must be an OutputFormat.");
    }
    if (!(options.target instanceof Target)) {
      throw new TypeError("options.target must be a Target.");
    }
    if (options.target._output) {
      throw new Error("Target is already used for another output.");
    }
    options.target._output = this;
    this.format = options.format;
    this.target = options.target;
    this._writer = options.target._createWriter();
    this._muxer = options.format._createMuxer(this);
  }
  /** Adds a video track to the output with the given source. Must be called before output is started. */
  addVideoTrack(source, metadata = {}) {
    if (!(source instanceof VideoSource)) {
      throw new TypeError("source must be a VideoSource.");
    }
    validateBaseTrackMetadata(metadata);
    if (metadata.rotation !== void 0 && ![0, 90, 180, 270].includes(metadata.rotation)) {
      throw new TypeError(`Invalid video rotation: ${metadata.rotation}. Has to be 0, 90, 180 or 270.`);
    }
    if (!this.format.supportsVideoRotationMetadata && metadata.rotation) {
      throw new Error(`${this.format._name} does not support video rotation metadata.`);
    }
    if (metadata.frameRate !== void 0 && (!Number.isFinite(metadata.frameRate) || metadata.frameRate <= 0)) {
      throw new TypeError(`Invalid video frame rate: ${metadata.frameRate}. Must be a positive number.`);
    }
    this._addTrack("video", source, metadata);
  }
  /** Adds an audio track to the output with the given source. Must be called before output is started. */
  addAudioTrack(source, metadata = {}) {
    if (!(source instanceof AudioSource)) {
      throw new TypeError("source must be an AudioSource.");
    }
    validateBaseTrackMetadata(metadata);
    this._addTrack("audio", source, metadata);
  }
  /** Adds a subtitle track to the output with the given source. Must be called before output is started. */
  addSubtitleTrack(source, metadata = {}) {
    if (!(source instanceof SubtitleSource)) {
      throw new TypeError("source must be a SubtitleSource.");
    }
    validateBaseTrackMetadata(metadata);
    this._addTrack("subtitle", source, metadata);
  }
  /**
   * Sets descriptive metadata tags about the media file, such as title, author, date, or cover art. When called
   * multiple times, only the metadata from the last call will be used.
   *
   * Must be called before output is started.
   */
  setMetadataTags(tags) {
    validateMetadataTags(tags);
    if (this.state !== "pending") {
      throw new Error("Cannot set metadata tags after output has been started or canceled.");
    }
    this._metadataTags = tags;
  }
  /** @internal */
  _addTrack(type, source, metadata) {
    if (this.state !== "pending") {
      throw new Error("Cannot add track after output has been started or canceled.");
    }
    if (source._connectedTrack) {
      throw new Error("Source is already used for a track.");
    }
    const supportedTrackCounts = this.format.getSupportedTrackCounts();
    const presentTracksOfThisType = this._tracks.reduce((count, track2) => count + (track2.type === type ? 1 : 0), 0);
    const maxCount = supportedTrackCounts[type].max;
    if (presentTracksOfThisType === maxCount) {
      throw new Error(maxCount === 0 ? `${this.format._name} does not support ${type} tracks.` : `${this.format._name} does not support more than ${maxCount} ${type} track${maxCount === 1 ? "" : "s"}.`);
    }
    const maxTotalCount = supportedTrackCounts.total.max;
    if (this._tracks.length === maxTotalCount) {
      throw new Error(`${this.format._name} does not support more than ${maxTotalCount} tracks${maxTotalCount === 1 ? "" : "s"} in total.`);
    }
    const track = {
      id: this._tracks.length + 1,
      output: this,
      type,
      source,
      metadata
    };
    if (track.type === "video") {
      const supportedVideoCodecs = this.format.getSupportedVideoCodecs();
      if (supportedVideoCodecs.length === 0) {
        throw new Error(`${this.format._name} does not support video tracks.` + this.format._codecUnsupportedHint(track.source._codec));
      } else if (!supportedVideoCodecs.includes(track.source._codec)) {
        throw new Error(`Codec '${track.source._codec}' cannot be contained within ${this.format._name}. Supported video codecs are: ${supportedVideoCodecs.map((codec) => `'${codec}'`).join(", ")}.` + this.format._codecUnsupportedHint(track.source._codec));
      }
    } else if (track.type === "audio") {
      const supportedAudioCodecs = this.format.getSupportedAudioCodecs();
      if (supportedAudioCodecs.length === 0) {
        throw new Error(`${this.format._name} does not support audio tracks.` + this.format._codecUnsupportedHint(track.source._codec));
      } else if (!supportedAudioCodecs.includes(track.source._codec)) {
        throw new Error(`Codec '${track.source._codec}' cannot be contained within ${this.format._name}. Supported audio codecs are: ${supportedAudioCodecs.map((codec) => `'${codec}'`).join(", ")}.` + this.format._codecUnsupportedHint(track.source._codec));
      }
    } else if (track.type === "subtitle") {
      const supportedSubtitleCodecs = this.format.getSupportedSubtitleCodecs();
      if (supportedSubtitleCodecs.length === 0) {
        throw new Error(`${this.format._name} does not support subtitle tracks.` + this.format._codecUnsupportedHint(track.source._codec));
      } else if (!supportedSubtitleCodecs.includes(track.source._codec)) {
        throw new Error(`Codec '${track.source._codec}' cannot be contained within ${this.format._name}. Supported subtitle codecs are: ${supportedSubtitleCodecs.map((codec) => `'${codec}'`).join(", ")}.` + this.format._codecUnsupportedHint(track.source._codec));
      }
    }
    this._tracks.push(track);
    source._connectedTrack = track;
  }
  /**
   * Starts the creation of the output file. This method should be called after all tracks have been added. Only after
   * the output has started can media samples be added to the tracks.
   *
   * @returns A promise that resolves when the output has successfully started and is ready to receive media samples.
   */
  async start() {
    const supportedTrackCounts = this.format.getSupportedTrackCounts();
    for (const trackType of ALL_TRACK_TYPES) {
      const presentTracksOfThisType = this._tracks.reduce((count, track) => count + (track.type === trackType ? 1 : 0), 0);
      const minCount = supportedTrackCounts[trackType].min;
      if (presentTracksOfThisType < minCount) {
        throw new Error(minCount === supportedTrackCounts[trackType].max ? `${this.format._name} requires exactly ${minCount} ${trackType} track${minCount === 1 ? "" : "s"}.` : `${this.format._name} requires at least ${minCount} ${trackType} track${minCount === 1 ? "" : "s"}.`);
      }
    }
    const totalMinCount = supportedTrackCounts.total.min;
    if (this._tracks.length < totalMinCount) {
      throw new Error(totalMinCount === supportedTrackCounts.total.max ? `${this.format._name} requires exactly ${totalMinCount} track${totalMinCount === 1 ? "" : "s"}.` : `${this.format._name} requires at least ${totalMinCount} track${totalMinCount === 1 ? "" : "s"}.`);
    }
    if (this.state === "canceled") {
      throw new Error("Output has been canceled.");
    }
    if (this._startPromise) {
      console.warn("Output has already been started.");
      return this._startPromise;
    }
    return this._startPromise = (async () => {
      this.state = "started";
      this._writer.start();
      const release = await this._mutex.acquire();
      await this._muxer.start();
      const promises = this._tracks.map((track) => track.source._start());
      await Promise.all(promises);
      release();
    })();
  }
  /**
   * Resolves with the full MIME type of the output file, including track codecs.
   *
   * The returned promise will resolve only once the precise codec strings of all tracks are known.
   */
  getMimeType() {
    return this._muxer.getMimeType();
  }
  /**
   * Cancels the creation of the output file, releasing internal resources like encoders and preventing further
   * samples from being added.
   *
   * @returns A promise that resolves once all internal resources have been released.
   */
  async cancel() {
    if (this._cancelPromise) {
      console.warn("Output has already been canceled.");
      return this._cancelPromise;
    } else if (this.state === "finalizing" || this.state === "finalized") {
      console.warn("Output has already been finalized.");
      return;
    }
    return this._cancelPromise = (async () => {
      this.state = "canceled";
      const release = await this._mutex.acquire();
      const promises = this._tracks.map((x2) => x2.source._flushOrWaitForOngoingClose(true));
      await Promise.all(promises);
      await this._writer.close();
      release();
    })();
  }
  /**
   * Finalizes the output file. This method must be called after all media samples across all tracks have been added.
   * Once the Promise returned by this method completes, the output file is ready.
   */
  async finalize() {
    if (this.state === "pending") {
      throw new Error("Cannot finalize before starting.");
    }
    if (this.state === "canceled") {
      throw new Error("Cannot finalize after canceling.");
    }
    if (this._finalizePromise) {
      console.warn("Output has already been finalized.");
      return this._finalizePromise;
    }
    return this._finalizePromise = (async () => {
      this.state = "finalizing";
      const release = await this._mutex.acquire();
      const promises = this._tracks.map((x2) => x2.source._flushOrWaitForOngoingClose(false));
      await Promise.all(promises);
      await this._muxer.finalize();
      await this._writer.flush();
      await this._writer.finalize();
      this.state = "finalized";
      release();
    })();
  }
};

// src/audio/audio.ts
function monoToStereo(mono) {
  return {
    sampleRate: mono.sampleRate,
    channels: [mono.channels[0], new Float32Array(mono.channels[0])]
  };
}
function signal(duration, f, sampleRate = 44100) {
  const data = new Float32Array(
    range(duration * sampleRate).map((x2) => f(x2 / sampleRate, x2))
  );
  return {
    sampleRate,
    channels: [data, new Float32Array(data)]
  };
}
function envelope(duration, f, sampleRate = 44100) {
  return signal(duration, (x2) => f(x2 / duration), sampleRate);
}
function sine(duration, freq, amp, phase = 0, sampleRate = 44100) {
  return signal(
    duration,
    (x2) => Math.sin((x2 - phase) * Math.PI * 2 * freq) * amp
  );
}
function square(duration, freq, amp, phase = 0, sampleRate = 44100) {
  return signal(
    duration,
    (x2) => (x2 + 1 - phase % 1) % (1 / freq) * 2 * freq > 1 ? -amp : amp
  );
}
function saw(duration, freq, amp, phase = 0, sampleRate = 44100) {
  return signal(
    duration,
    (x2) => ((x2 + 1 - phase % 1) % (1 / freq) * freq * 2 - 1) * amp
  );
}
function silence(duration, sampleRate = 44100) {
  return constant(duration, 0, sampleRate);
}
function constant(duration, c, sampleRate = 44100) {
  const data = new Float32Array(range(duration * sampleRate).map(() => c));
  return {
    sampleRate,
    channels: [data, new Float32Array(data)]
  };
}
function play(audio, audioContext) {
  const actx = audioContext ?? new AudioContext();
  const buf = actx.createBuffer(
    audio.channels.length,
    audio.channels[0].length,
    audio.sampleRate
  );
  for (let i = 0; i < audio.channels.length; i++) {
    buf.copyToChannel(audio.channels[i], i, 0);
  }
  const source = actx.createBufferSource();
  source.buffer = buf;
  source.connect(actx.destination);
  source.start();
}
function resample(audio, newSampleRate) {
  let newSampleCount = audio.channels[0].length / audio.sampleRate * newSampleRate;
  let channels = [];
  for (const c of audio.channels) {
    channels.push(
      new Float32Array(
        range(newSampleCount).map((i) => {
          const oldIndex = clamp(
            i / newSampleRate * audio.sampleRate,
            0,
            audio.channels[0].length
          );
          const lo = Math.floor(oldIndex);
          const hi = Math.ceil(oldIndex);
          const frac = oldIndex % 1;
          return c[lo] * (1 - frac) + c[hi] * frac;
        })
      )
    );
  }
  return {
    sampleRate: newSampleRate,
    channels
  };
}
function modulateSampleTime(a, b) {
  if (b.sampleRate !== a.sampleRate) {
    b = resample(b, a.sampleRate);
  }
  for (let ci = 0; ci < a.channels.length; ci++) {
    const newChannel = new Float32Array(a.channels[ci].length);
    for (let i = 0; i < b.channels[ci].length; i++) {
      const index = Math.floor(b.channels[ci][i] * a.sampleRate);
      newChannel[i] = a.channels[ci][Math.min(Math.max(index, 0), a.channels[ci].length - 1)];
    }
    a.channels[ci] = newChannel;
  }
  return a;
}
function add(a, b, offsetB = 0) {
  if (b.sampleRate !== a.sampleRate) {
    b = resample(b, a.sampleRate);
  }
  const offsetSamples = Math.floor(offsetB * a.sampleRate);
  for (let ci = 0; ci < a.channels.length; ci++) {
    for (let i = 0; i < b.channels[ci].length; i++) {
      a.channels[ci][i + offsetSamples] += b.channels[ci][i];
    }
  }
  return a;
}
function modulateGain(a, envelope2, offsetB = 0) {
  if (envelope2.sampleRate !== a.sampleRate) {
    envelope2 = resample(envelope2, a.sampleRate);
  }
  const offsetSamples = Math.floor(offsetB * a.sampleRate);
  for (let ci = 0; ci < a.channels.length; ci++) {
    for (let i = 0; i < envelope2.channels[ci].length; i++) {
      a.channels[ci][i + offsetSamples] *= envelope2.channels[ci][i];
    }
  }
  return a;
}
function adsr(a, d, s, r, ag = 1, dg = 0.5, sg = 0.5, rg = 0, sampleRate = 44100) {
  const duration = a + d + s + r;
  return signal(
    duration,
    (x2) => {
      if (x2 < a) {
        return rescale(x2, 0, a, 0, ag);
      }
      if (x2 < a + d) {
        return rescale(x2, a, a + d, ag, dg);
      }
      if (x2 < a + d + s) {
        return rescale(x2, a + d, a + d + s, dg, sg);
      }
      return rescale(x2, a + d + s, a + d + s + r, sg, rg);
    },
    sampleRate
  );
}
function scaleDuration(a, duration, newSampleRate = 44100) {
  const sampleCount = duration * newSampleRate;
  const channels = [];
  for (const c of a.channels) {
    channels.push(
      new Float32Array(
        range(sampleCount).map((i) => {
          const idx = i / newSampleRate / duration * c.length;
          const lo = Math.floor(idx);
          const hi = Math.ceil(idx);
          return lerp(idx % 1, c[lo], c[hi]);
        })
      )
    );
  }
  return { channels, sampleRate: newSampleRate };
}
function slice(a, start, end) {
  const lo = Math.floor(
    clamp((start ?? 0) / a.sampleRate, 0, a.channels[0].length - 1)
  );
  const hi = Math.ceil(
    clamp(
      (end ?? a.channels[0].length) / a.sampleRate,
      0,
      a.channels[0].length - 1
    )
  );
  return {
    sampleRate: a.sampleRate,
    channels: a.channels.map((c) => c.slice(lo, hi))
  };
}
function convolve(a, kernel) {
  return {
    channels: range(a.channels.length).map(
      (i) => new Float32Array(
        fftConvolution(
          a.channels[i],
          kernel.channels[i].length % 2 == 0 ? [...kernel.channels[i], 0] : kernel.channels[i]
        )
      )
    ),
    sampleRate: a.sampleRate
  };
}
function graphAudio(a, width, height) {
  const canvas = document.createElement("canvas");
  const channelWidth = width;
  const channelHeight = height / a.channels.length;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  let ci = 0;
  for (const c of a.channels) {
    ctx?.beginPath();
    let miny = channelHeight * ci;
    let maxy = channelHeight * (ci + 1);
    for (let i = 0; i < c.length; i++) {
      let x2 = i / c.length * width;
      let y2 = rescale(c[i], 1, -1, miny, maxy);
      ctx?.lineTo(x2, y2);
    }
    ctx?.stroke();
    ci++;
  }
  return canvas;
}
async function getOgg(a) {
  const output = new Output({
    format: new OggOutputFormat(),
    target: new BufferTarget()
  });
  const sample = new AudioSample({
    data: new Float32Array(a.channels.map((ch) => [...ch]).flat(1)),
    format: "f32-planar",
    numberOfChannels: 2,
    sampleRate: a.sampleRate,
    timestamp: 0
  });
  const src = new AudioSampleSource({
    codec: "opus",
    bitrate: 128e3
  });
  output.addAudioTrack(src);
  await output.start();
  await src.add(sample);
  await output.finalize();
  return new Blob([output.target.buffer], { type: "audio/ogg" });
}

// src/webgl/shader.ts
function source2shader(gl, type, source) {
  const shader = gl.createShader(
    type === "v" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER
  );
  if (!shader) return err(void 0);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return err(void 0);
  }
  return ok(shader);
}
function shaders2program(gl, v, f) {
  const program = gl.createProgram();
  gl.attachShader(program, v);
  gl.attachShader(program, f);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return err(void 0);
  }
  return ok(program);
}
function sources2program(gl, vs, fs) {
  const v = source2shader(gl, "v", vs);
  const f = source2shader(gl, "f", fs);
  if (!v.ok || !f.ok) return err(void 0);
  return shaders2program(gl, v.data, f.data);
}
function fullscreenQuadBuffer(gl) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1,
      -1,
      1,
      -1,
      -1,
      1,
      1,
      1,
      -1,
      1,
      1,
      -1
    ]),
    gl.STATIC_DRAW
  );
  return ok(buffer);
}
function glRenderToQuad(options) {
  const canvas = document.createElement("canvas");
  canvas.width = options.width;
  canvas.height = options.height;
  const gl = canvas.getContext(options.version ?? "webgl2");
  gl.viewport(0, 0, options.width, options.height);
  if (!gl) return err(void 0);
  const buf = fullscreenQuadBuffer(gl);
  const prog = sources2program(
    gl,
    `#version 300 es
precision highp float;

in vec2 in_vpos;
out vec2 pos;

void main() {
  pos = in_vpos * 0.5 + 0.5;
  gl_Position = vec4(in_vpos, 0.5, 1.0);
}`,
    (options.noheader ? "" : `#version 300 es
precision highp float;
in vec2 pos;
out vec4 col;
`) + (options.noAutoUniforms ? "" : [
      [options.uniforms, "", "float"],
      [options.intUniforms, "i", "int"],
      [options.uintUniforms, "u", "uint"]
    ].map(
      ([uniforms, vecprefix, scalar]) => Object.entries(uniforms ?? {})?.map(([n, u]) => {
        return `uniform ${Array.isArray(u) ? vecprefix + "vec" + u.length : scalar} ${n};`;
      }).join("\n")
    ).join("\n")) + options.fragsource
  );
  if (!prog.data) return err(void 0);
  gl.useProgram(prog.data);
  const attrloc = gl.getAttribLocation(prog.data, "in_vpos");
  gl.vertexAttribPointer(attrloc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attrloc);
  for (const [uniforms, type] of [
    [options.uniforms, "i"],
    [options.intUniforms, "i"],
    [options.uintUniforms, "ui"]
  ]) {
    for (const [k, v] of Object.entries(uniforms ?? {})) {
      const v2 = Array.isArray(v) ? v : [v];
      gl[`uniform${v2.length}${type}v`](
        gl.getUniformLocation(prog.data, k),
        v2
      );
    }
  }
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  return ok(canvas);
}

// src/webgl/scene.ts
function applyUniform(gl, prog, name, spec) {
  const [t, d] = spec;
  const l = gl.getUniformLocation(prog, name);
  if (l === null) {
    throw new Error(
      `Uniform '${name}' does not exist, or some other error occurred (program didn't compile).`
    );
  }
  if (t === "float") gl.uniform1f(l, d);
  if (t === "vec2") gl.uniform2f(l, ...d);
  if (t === "vec3") gl.uniform3f(l, ...d);
  if (t === "vec4") gl.uniform4f(l, ...d);
  if (t === "int") gl.uniform1i(l, d);
  if (t === "ivec2") gl.uniform2i(l, ...d);
  if (t === "ivec3") gl.uniform3i(l, ...d);
  if (t === "ivec4") gl.uniform4i(l, ...d);
  if (t === "mat2") gl.uniformMatrix2fv(l, false, d);
  if (t === "mat3") gl.uniformMatrix3fv(l, false, d);
  if (t === "mat4") gl.uniformMatrix4fv(l, false, d);
  if (t === "float[]") gl.uniform1fv(l, d);
  if (t === "vec2[]") gl.uniform2fv(l, d.flat());
  if (t === "vec3[]") gl.uniform3fv(l, d.flat());
  if (t === "vec4[]") gl.uniform4fv(l, d.flat());
  if (t === "int[]") gl.uniform1iv(l, d);
  if (t === "ivec2[]") gl.uniform2iv(l, d.flat());
  if (t === "ivec3[]") gl.uniform3iv(l, d.flat());
  if (t === "ivec4[]") gl.uniform4iv(l, d.flat());
  if (t === "mat2[]") gl.uniformMatrix2fv(l, false, d.flat());
  if (t === "mat3[]") gl.uniformMatrix3fv(l, false, d.flat());
  if (t === "mat4[]") gl.uniformMatrix4fv(l, false, d.flat());
}
function applyUniforms(gl, prog, uniforms) {
  for (const [k, v] of Object.entries(uniforms)) {
    applyUniform(gl, prog, k, v);
  }
}
function createScene(sceneSpec) {
  const gl = sceneSpec.gl;
  const combineUniforms = sceneSpec.combineUniforms ?? ((s, o) => ({ ...s, ...o }));
  let sceneUniforms = sceneSpec.uniforms ?? {};
  return {
    uniforms() {
      return sceneUniforms;
    },
    resetUniforms(u) {
      sceneUniforms = u;
    },
    updateUniforms(u) {
      sceneUniforms = { ...sceneUniforms, ...u };
    },
    addObject3D(spec) {
      let objectUniforms = spec.uniforms ?? {};
      return {
        gl() {
          return gl;
        },
        draw() {
          gl.useProgram(spec.program);
          spec.buffer.setLayout(spec.program);
          applyUniforms(
            gl,
            spec.program,
            combineUniforms(sceneUniforms, objectUniforms)
          );
          gl.drawArrays(gl.TRIANGLES, 0, spec.buffer.vertexCount);
        },
        uniforms() {
          return objectUniforms;
        },
        resetUniforms(u) {
          objectUniforms = u;
        },
        updateUniforms(u) {
          objectUniforms = { ...objectUniforms, ...u };
        }
      };
    }
  };
}

// src/math/vector.ts
function xxxx(a) {
  return [a[0], a[0], a[0], a[0]];
}
function yxxx(a) {
  return [a[1], a[0], a[0], a[0]];
}
function zxxx(a) {
  return [a[2], a[0], a[0], a[0]];
}
function wxxx(a) {
  return [a[3], a[0], a[0], a[0]];
}
function xyxx(a) {
  return [a[0], a[1], a[0], a[0]];
}
function yyxx(a) {
  return [a[1], a[1], a[0], a[0]];
}
function zyxx(a) {
  return [a[2], a[1], a[0], a[0]];
}
function wyxx(a) {
  return [a[3], a[1], a[0], a[0]];
}
function xzxx(a) {
  return [a[0], a[2], a[0], a[0]];
}
function yzxx(a) {
  return [a[1], a[2], a[0], a[0]];
}
function zzxx(a) {
  return [a[2], a[2], a[0], a[0]];
}
function wzxx(a) {
  return [a[3], a[2], a[0], a[0]];
}
function xwxx(a) {
  return [a[0], a[3], a[0], a[0]];
}
function ywxx(a) {
  return [a[1], a[3], a[0], a[0]];
}
function zwxx(a) {
  return [a[2], a[3], a[0], a[0]];
}
function wwxx(a) {
  return [a[3], a[3], a[0], a[0]];
}
function xxyx(a) {
  return [a[0], a[0], a[1], a[0]];
}
function yxyx(a) {
  return [a[1], a[0], a[1], a[0]];
}
function zxyx(a) {
  return [a[2], a[0], a[1], a[0]];
}
function wxyx(a) {
  return [a[3], a[0], a[1], a[0]];
}
function xyyx(a) {
  return [a[0], a[1], a[1], a[0]];
}
function yyyx(a) {
  return [a[1], a[1], a[1], a[0]];
}
function zyyx(a) {
  return [a[2], a[1], a[1], a[0]];
}
function wyyx(a) {
  return [a[3], a[1], a[1], a[0]];
}
function xzyx(a) {
  return [a[0], a[2], a[1], a[0]];
}
function yzyx(a) {
  return [a[1], a[2], a[1], a[0]];
}
function zzyx(a) {
  return [a[2], a[2], a[1], a[0]];
}
function wzyx(a) {
  return [a[3], a[2], a[1], a[0]];
}
function xwyx(a) {
  return [a[0], a[3], a[1], a[0]];
}
function ywyx(a) {
  return [a[1], a[3], a[1], a[0]];
}
function zwyx(a) {
  return [a[2], a[3], a[1], a[0]];
}
function wwyx(a) {
  return [a[3], a[3], a[1], a[0]];
}
function xxzx(a) {
  return [a[0], a[0], a[2], a[0]];
}
function yxzx(a) {
  return [a[1], a[0], a[2], a[0]];
}
function zxzx(a) {
  return [a[2], a[0], a[2], a[0]];
}
function wxzx(a) {
  return [a[3], a[0], a[2], a[0]];
}
function xyzx(a) {
  return [a[0], a[1], a[2], a[0]];
}
function yyzx(a) {
  return [a[1], a[1], a[2], a[0]];
}
function zyzx(a) {
  return [a[2], a[1], a[2], a[0]];
}
function wyzx(a) {
  return [a[3], a[1], a[2], a[0]];
}
function xzzx(a) {
  return [a[0], a[2], a[2], a[0]];
}
function yzzx(a) {
  return [a[1], a[2], a[2], a[0]];
}
function zzzx(a) {
  return [a[2], a[2], a[2], a[0]];
}
function wzzx(a) {
  return [a[3], a[2], a[2], a[0]];
}
function xwzx(a) {
  return [a[0], a[3], a[2], a[0]];
}
function ywzx(a) {
  return [a[1], a[3], a[2], a[0]];
}
function zwzx(a) {
  return [a[2], a[3], a[2], a[0]];
}
function wwzx(a) {
  return [a[3], a[3], a[2], a[0]];
}
function xxwx(a) {
  return [a[0], a[0], a[3], a[0]];
}
function yxwx(a) {
  return [a[1], a[0], a[3], a[0]];
}
function zxwx(a) {
  return [a[2], a[0], a[3], a[0]];
}
function wxwx(a) {
  return [a[3], a[0], a[3], a[0]];
}
function xywx(a) {
  return [a[0], a[1], a[3], a[0]];
}
function yywx(a) {
  return [a[1], a[1], a[3], a[0]];
}
function zywx(a) {
  return [a[2], a[1], a[3], a[0]];
}
function wywx(a) {
  return [a[3], a[1], a[3], a[0]];
}
function xzwx(a) {
  return [a[0], a[2], a[3], a[0]];
}
function yzwx(a) {
  return [a[1], a[2], a[3], a[0]];
}
function zzwx(a) {
  return [a[2], a[2], a[3], a[0]];
}
function wzwx(a) {
  return [a[3], a[2], a[3], a[0]];
}
function xwwx(a) {
  return [a[0], a[3], a[3], a[0]];
}
function ywwx(a) {
  return [a[1], a[3], a[3], a[0]];
}
function zwwx(a) {
  return [a[2], a[3], a[3], a[0]];
}
function wwwx(a) {
  return [a[3], a[3], a[3], a[0]];
}
function xxxy(a) {
  return [a[0], a[0], a[0], a[1]];
}
function yxxy(a) {
  return [a[1], a[0], a[0], a[1]];
}
function zxxy(a) {
  return [a[2], a[0], a[0], a[1]];
}
function wxxy(a) {
  return [a[3], a[0], a[0], a[1]];
}
function xyxy(a) {
  return [a[0], a[1], a[0], a[1]];
}
function yyxy(a) {
  return [a[1], a[1], a[0], a[1]];
}
function zyxy(a) {
  return [a[2], a[1], a[0], a[1]];
}
function wyxy(a) {
  return [a[3], a[1], a[0], a[1]];
}
function xzxy(a) {
  return [a[0], a[2], a[0], a[1]];
}
function yzxy(a) {
  return [a[1], a[2], a[0], a[1]];
}
function zzxy(a) {
  return [a[2], a[2], a[0], a[1]];
}
function wzxy(a) {
  return [a[3], a[2], a[0], a[1]];
}
function xwxy(a) {
  return [a[0], a[3], a[0], a[1]];
}
function ywxy(a) {
  return [a[1], a[3], a[0], a[1]];
}
function zwxy(a) {
  return [a[2], a[3], a[0], a[1]];
}
function wwxy(a) {
  return [a[3], a[3], a[0], a[1]];
}
function xxyy(a) {
  return [a[0], a[0], a[1], a[1]];
}
function yxyy(a) {
  return [a[1], a[0], a[1], a[1]];
}
function zxyy(a) {
  return [a[2], a[0], a[1], a[1]];
}
function wxyy(a) {
  return [a[3], a[0], a[1], a[1]];
}
function xyyy(a) {
  return [a[0], a[1], a[1], a[1]];
}
function yyyy(a) {
  return [a[1], a[1], a[1], a[1]];
}
function zyyy(a) {
  return [a[2], a[1], a[1], a[1]];
}
function wyyy(a) {
  return [a[3], a[1], a[1], a[1]];
}
function xzyy(a) {
  return [a[0], a[2], a[1], a[1]];
}
function yzyy(a) {
  return [a[1], a[2], a[1], a[1]];
}
function zzyy(a) {
  return [a[2], a[2], a[1], a[1]];
}
function wzyy(a) {
  return [a[3], a[2], a[1], a[1]];
}
function xwyy(a) {
  return [a[0], a[3], a[1], a[1]];
}
function ywyy(a) {
  return [a[1], a[3], a[1], a[1]];
}
function zwyy(a) {
  return [a[2], a[3], a[1], a[1]];
}
function wwyy(a) {
  return [a[3], a[3], a[1], a[1]];
}
function xxzy(a) {
  return [a[0], a[0], a[2], a[1]];
}
function yxzy(a) {
  return [a[1], a[0], a[2], a[1]];
}
function zxzy(a) {
  return [a[2], a[0], a[2], a[1]];
}
function wxzy(a) {
  return [a[3], a[0], a[2], a[1]];
}
function xyzy(a) {
  return [a[0], a[1], a[2], a[1]];
}
function yyzy(a) {
  return [a[1], a[1], a[2], a[1]];
}
function zyzy(a) {
  return [a[2], a[1], a[2], a[1]];
}
function wyzy(a) {
  return [a[3], a[1], a[2], a[1]];
}
function xzzy(a) {
  return [a[0], a[2], a[2], a[1]];
}
function yzzy(a) {
  return [a[1], a[2], a[2], a[1]];
}
function zzzy(a) {
  return [a[2], a[2], a[2], a[1]];
}
function wzzy(a) {
  return [a[3], a[2], a[2], a[1]];
}
function xwzy(a) {
  return [a[0], a[3], a[2], a[1]];
}
function ywzy(a) {
  return [a[1], a[3], a[2], a[1]];
}
function zwzy(a) {
  return [a[2], a[3], a[2], a[1]];
}
function wwzy(a) {
  return [a[3], a[3], a[2], a[1]];
}
function xxwy(a) {
  return [a[0], a[0], a[3], a[1]];
}
function yxwy(a) {
  return [a[1], a[0], a[3], a[1]];
}
function zxwy(a) {
  return [a[2], a[0], a[3], a[1]];
}
function wxwy(a) {
  return [a[3], a[0], a[3], a[1]];
}
function xywy(a) {
  return [a[0], a[1], a[3], a[1]];
}
function yywy(a) {
  return [a[1], a[1], a[3], a[1]];
}
function zywy(a) {
  return [a[2], a[1], a[3], a[1]];
}
function wywy(a) {
  return [a[3], a[1], a[3], a[1]];
}
function xzwy(a) {
  return [a[0], a[2], a[3], a[1]];
}
function yzwy(a) {
  return [a[1], a[2], a[3], a[1]];
}
function zzwy(a) {
  return [a[2], a[2], a[3], a[1]];
}
function wzwy(a) {
  return [a[3], a[2], a[3], a[1]];
}
function xwwy(a) {
  return [a[0], a[3], a[3], a[1]];
}
function ywwy(a) {
  return [a[1], a[3], a[3], a[1]];
}
function zwwy(a) {
  return [a[2], a[3], a[3], a[1]];
}
function wwwy(a) {
  return [a[3], a[3], a[3], a[1]];
}
function xxxz(a) {
  return [a[0], a[0], a[0], a[2]];
}
function yxxz(a) {
  return [a[1], a[0], a[0], a[2]];
}
function zxxz(a) {
  return [a[2], a[0], a[0], a[2]];
}
function wxxz(a) {
  return [a[3], a[0], a[0], a[2]];
}
function xyxz(a) {
  return [a[0], a[1], a[0], a[2]];
}
function yyxz(a) {
  return [a[1], a[1], a[0], a[2]];
}
function zyxz(a) {
  return [a[2], a[1], a[0], a[2]];
}
function wyxz(a) {
  return [a[3], a[1], a[0], a[2]];
}
function xzxz(a) {
  return [a[0], a[2], a[0], a[2]];
}
function yzxz(a) {
  return [a[1], a[2], a[0], a[2]];
}
function zzxz(a) {
  return [a[2], a[2], a[0], a[2]];
}
function wzxz(a) {
  return [a[3], a[2], a[0], a[2]];
}
function xwxz(a) {
  return [a[0], a[3], a[0], a[2]];
}
function ywxz(a) {
  return [a[1], a[3], a[0], a[2]];
}
function zwxz(a) {
  return [a[2], a[3], a[0], a[2]];
}
function wwxz(a) {
  return [a[3], a[3], a[0], a[2]];
}
function xxyz(a) {
  return [a[0], a[0], a[1], a[2]];
}
function yxyz(a) {
  return [a[1], a[0], a[1], a[2]];
}
function zxyz(a) {
  return [a[2], a[0], a[1], a[2]];
}
function wxyz(a) {
  return [a[3], a[0], a[1], a[2]];
}
function xyyz(a) {
  return [a[0], a[1], a[1], a[2]];
}
function yyyz(a) {
  return [a[1], a[1], a[1], a[2]];
}
function zyyz(a) {
  return [a[2], a[1], a[1], a[2]];
}
function wyyz(a) {
  return [a[3], a[1], a[1], a[2]];
}
function xzyz(a) {
  return [a[0], a[2], a[1], a[2]];
}
function yzyz(a) {
  return [a[1], a[2], a[1], a[2]];
}
function zzyz(a) {
  return [a[2], a[2], a[1], a[2]];
}
function wzyz(a) {
  return [a[3], a[2], a[1], a[2]];
}
function xwyz(a) {
  return [a[0], a[3], a[1], a[2]];
}
function ywyz(a) {
  return [a[1], a[3], a[1], a[2]];
}
function zwyz(a) {
  return [a[2], a[3], a[1], a[2]];
}
function wwyz(a) {
  return [a[3], a[3], a[1], a[2]];
}
function xxzz(a) {
  return [a[0], a[0], a[2], a[2]];
}
function yxzz(a) {
  return [a[1], a[0], a[2], a[2]];
}
function zxzz(a) {
  return [a[2], a[0], a[2], a[2]];
}
function wxzz(a) {
  return [a[3], a[0], a[2], a[2]];
}
function xyzz(a) {
  return [a[0], a[1], a[2], a[2]];
}
function yyzz(a) {
  return [a[1], a[1], a[2], a[2]];
}
function zyzz(a) {
  return [a[2], a[1], a[2], a[2]];
}
function wyzz(a) {
  return [a[3], a[1], a[2], a[2]];
}
function xzzz(a) {
  return [a[0], a[2], a[2], a[2]];
}
function yzzz(a) {
  return [a[1], a[2], a[2], a[2]];
}
function zzzz(a) {
  return [a[2], a[2], a[2], a[2]];
}
function wzzz(a) {
  return [a[3], a[2], a[2], a[2]];
}
function xwzz(a) {
  return [a[0], a[3], a[2], a[2]];
}
function ywzz(a) {
  return [a[1], a[3], a[2], a[2]];
}
function zwzz(a) {
  return [a[2], a[3], a[2], a[2]];
}
function wwzz(a) {
  return [a[3], a[3], a[2], a[2]];
}
function xxwz(a) {
  return [a[0], a[0], a[3], a[2]];
}
function yxwz(a) {
  return [a[1], a[0], a[3], a[2]];
}
function zxwz(a) {
  return [a[2], a[0], a[3], a[2]];
}
function wxwz(a) {
  return [a[3], a[0], a[3], a[2]];
}
function xywz(a) {
  return [a[0], a[1], a[3], a[2]];
}
function yywz(a) {
  return [a[1], a[1], a[3], a[2]];
}
function zywz(a) {
  return [a[2], a[1], a[3], a[2]];
}
function wywz(a) {
  return [a[3], a[1], a[3], a[2]];
}
function xzwz(a) {
  return [a[0], a[2], a[3], a[2]];
}
function yzwz(a) {
  return [a[1], a[2], a[3], a[2]];
}
function zzwz(a) {
  return [a[2], a[2], a[3], a[2]];
}
function wzwz(a) {
  return [a[3], a[2], a[3], a[2]];
}
function xwwz(a) {
  return [a[0], a[3], a[3], a[2]];
}
function ywwz(a) {
  return [a[1], a[3], a[3], a[2]];
}
function zwwz(a) {
  return [a[2], a[3], a[3], a[2]];
}
function wwwz(a) {
  return [a[3], a[3], a[3], a[2]];
}
function xxxw(a) {
  return [a[0], a[0], a[0], a[3]];
}
function yxxw(a) {
  return [a[1], a[0], a[0], a[3]];
}
function zxxw(a) {
  return [a[2], a[0], a[0], a[3]];
}
function wxxw(a) {
  return [a[3], a[0], a[0], a[3]];
}
function xyxw(a) {
  return [a[0], a[1], a[0], a[3]];
}
function yyxw(a) {
  return [a[1], a[1], a[0], a[3]];
}
function zyxw(a) {
  return [a[2], a[1], a[0], a[3]];
}
function wyxw(a) {
  return [a[3], a[1], a[0], a[3]];
}
function xzxw(a) {
  return [a[0], a[2], a[0], a[3]];
}
function yzxw(a) {
  return [a[1], a[2], a[0], a[3]];
}
function zzxw(a) {
  return [a[2], a[2], a[0], a[3]];
}
function wzxw(a) {
  return [a[3], a[2], a[0], a[3]];
}
function xwxw(a) {
  return [a[0], a[3], a[0], a[3]];
}
function ywxw(a) {
  return [a[1], a[3], a[0], a[3]];
}
function zwxw(a) {
  return [a[2], a[3], a[0], a[3]];
}
function wwxw(a) {
  return [a[3], a[3], a[0], a[3]];
}
function xxyw(a) {
  return [a[0], a[0], a[1], a[3]];
}
function yxyw(a) {
  return [a[1], a[0], a[1], a[3]];
}
function zxyw(a) {
  return [a[2], a[0], a[1], a[3]];
}
function wxyw(a) {
  return [a[3], a[0], a[1], a[3]];
}
function xyyw(a) {
  return [a[0], a[1], a[1], a[3]];
}
function yyyw(a) {
  return [a[1], a[1], a[1], a[3]];
}
function zyyw(a) {
  return [a[2], a[1], a[1], a[3]];
}
function wyyw(a) {
  return [a[3], a[1], a[1], a[3]];
}
function xzyw(a) {
  return [a[0], a[2], a[1], a[3]];
}
function yzyw(a) {
  return [a[1], a[2], a[1], a[3]];
}
function zzyw(a) {
  return [a[2], a[2], a[1], a[3]];
}
function wzyw(a) {
  return [a[3], a[2], a[1], a[3]];
}
function xwyw(a) {
  return [a[0], a[3], a[1], a[3]];
}
function ywyw(a) {
  return [a[1], a[3], a[1], a[3]];
}
function zwyw(a) {
  return [a[2], a[3], a[1], a[3]];
}
function wwyw(a) {
  return [a[3], a[3], a[1], a[3]];
}
function xxzw(a) {
  return [a[0], a[0], a[2], a[3]];
}
function yxzw(a) {
  return [a[1], a[0], a[2], a[3]];
}
function zxzw(a) {
  return [a[2], a[0], a[2], a[3]];
}
function wxzw(a) {
  return [a[3], a[0], a[2], a[3]];
}
function xyzw(a) {
  return [a[0], a[1], a[2], a[3]];
}
function yyzw(a) {
  return [a[1], a[1], a[2], a[3]];
}
function zyzw(a) {
  return [a[2], a[1], a[2], a[3]];
}
function wyzw(a) {
  return [a[3], a[1], a[2], a[3]];
}
function xzzw(a) {
  return [a[0], a[2], a[2], a[3]];
}
function yzzw(a) {
  return [a[1], a[2], a[2], a[3]];
}
function zzzw(a) {
  return [a[2], a[2], a[2], a[3]];
}
function wzzw(a) {
  return [a[3], a[2], a[2], a[3]];
}
function xwzw(a) {
  return [a[0], a[3], a[2], a[3]];
}
function ywzw(a) {
  return [a[1], a[3], a[2], a[3]];
}
function zwzw(a) {
  return [a[2], a[3], a[2], a[3]];
}
function wwzw(a) {
  return [a[3], a[3], a[2], a[3]];
}
function xxww(a) {
  return [a[0], a[0], a[3], a[3]];
}
function yxww(a) {
  return [a[1], a[0], a[3], a[3]];
}
function zxww(a) {
  return [a[2], a[0], a[3], a[3]];
}
function wxww(a) {
  return [a[3], a[0], a[3], a[3]];
}
function xyww(a) {
  return [a[0], a[1], a[3], a[3]];
}
function yyww(a) {
  return [a[1], a[1], a[3], a[3]];
}
function zyww(a) {
  return [a[2], a[1], a[3], a[3]];
}
function wyww(a) {
  return [a[3], a[1], a[3], a[3]];
}
function xzww(a) {
  return [a[0], a[2], a[3], a[3]];
}
function yzww(a) {
  return [a[1], a[2], a[3], a[3]];
}
function zzww(a) {
  return [a[2], a[2], a[3], a[3]];
}
function wzww(a) {
  return [a[3], a[2], a[3], a[3]];
}
function xwww(a) {
  return [a[0], a[3], a[3], a[3]];
}
function ywww(a) {
  return [a[1], a[3], a[3], a[3]];
}
function zwww(a) {
  return [a[2], a[3], a[3], a[3]];
}
function wwww(a) {
  return [a[3], a[3], a[3], a[3]];
}
function xxx(a) {
  return [a[0], a[0], a[0]];
}
function yxx(a) {
  return [a[1], a[0], a[0]];
}
function zxx(a) {
  return [a[2], a[0], a[0]];
}
function wxx(a) {
  return [a[3], a[0], a[0]];
}
function xyx(a) {
  return [a[0], a[1], a[0]];
}
function yyx(a) {
  return [a[1], a[1], a[0]];
}
function zyx(a) {
  return [a[2], a[1], a[0]];
}
function wyx(a) {
  return [a[3], a[1], a[0]];
}
function xzx(a) {
  return [a[0], a[2], a[0]];
}
function yzx(a) {
  return [a[1], a[2], a[0]];
}
function zzx(a) {
  return [a[2], a[2], a[0]];
}
function wzx(a) {
  return [a[3], a[2], a[0]];
}
function xwx(a) {
  return [a[0], a[3], a[0]];
}
function ywx(a) {
  return [a[1], a[3], a[0]];
}
function zwx(a) {
  return [a[2], a[3], a[0]];
}
function wwx(a) {
  return [a[3], a[3], a[0]];
}
function xxy(a) {
  return [a[0], a[0], a[1]];
}
function yxy(a) {
  return [a[1], a[0], a[1]];
}
function zxy(a) {
  return [a[2], a[0], a[1]];
}
function wxy(a) {
  return [a[3], a[0], a[1]];
}
function xyy(a) {
  return [a[0], a[1], a[1]];
}
function yyy(a) {
  return [a[1], a[1], a[1]];
}
function zyy(a) {
  return [a[2], a[1], a[1]];
}
function wyy(a) {
  return [a[3], a[1], a[1]];
}
function xzy(a) {
  return [a[0], a[2], a[1]];
}
function yzy(a) {
  return [a[1], a[2], a[1]];
}
function zzy(a) {
  return [a[2], a[2], a[1]];
}
function wzy(a) {
  return [a[3], a[2], a[1]];
}
function xwy(a) {
  return [a[0], a[3], a[1]];
}
function ywy(a) {
  return [a[1], a[3], a[1]];
}
function zwy(a) {
  return [a[2], a[3], a[1]];
}
function wwy(a) {
  return [a[3], a[3], a[1]];
}
function xxz(a) {
  return [a[0], a[0], a[2]];
}
function yxz(a) {
  return [a[1], a[0], a[2]];
}
function zxz(a) {
  return [a[2], a[0], a[2]];
}
function wxz(a) {
  return [a[3], a[0], a[2]];
}
function xyz(a) {
  return [a[0], a[1], a[2]];
}
function yyz(a) {
  return [a[1], a[1], a[2]];
}
function zyz(a) {
  return [a[2], a[1], a[2]];
}
function wyz(a) {
  return [a[3], a[1], a[2]];
}
function xzz(a) {
  return [a[0], a[2], a[2]];
}
function yzz(a) {
  return [a[1], a[2], a[2]];
}
function zzz(a) {
  return [a[2], a[2], a[2]];
}
function wzz(a) {
  return [a[3], a[2], a[2]];
}
function xwz(a) {
  return [a[0], a[3], a[2]];
}
function ywz(a) {
  return [a[1], a[3], a[2]];
}
function zwz(a) {
  return [a[2], a[3], a[2]];
}
function wwz(a) {
  return [a[3], a[3], a[2]];
}
function xxw(a) {
  return [a[0], a[0], a[3]];
}
function yxw(a) {
  return [a[1], a[0], a[3]];
}
function zxw(a) {
  return [a[2], a[0], a[3]];
}
function wxw(a) {
  return [a[3], a[0], a[3]];
}
function xyw(a) {
  return [a[0], a[1], a[3]];
}
function yyw(a) {
  return [a[1], a[1], a[3]];
}
function zyw(a) {
  return [a[2], a[1], a[3]];
}
function wyw(a) {
  return [a[3], a[1], a[3]];
}
function xzw(a) {
  return [a[0], a[2], a[3]];
}
function yzw(a) {
  return [a[1], a[2], a[3]];
}
function zzw(a) {
  return [a[2], a[2], a[3]];
}
function wzw(a) {
  return [a[3], a[2], a[3]];
}
function xww(a) {
  return [a[0], a[3], a[3]];
}
function yww(a) {
  return [a[1], a[3], a[3]];
}
function zww(a) {
  return [a[2], a[3], a[3]];
}
function www(a) {
  return [a[3], a[3], a[3]];
}
function xx(a) {
  return [a[0], a[0]];
}
function yx(a) {
  return [a[1], a[0]];
}
function zx(a) {
  return [a[2], a[0]];
}
function wx(a) {
  return [a[3], a[0]];
}
function xy(a) {
  return [a[0], a[1]];
}
function yy(a) {
  return [a[1], a[1]];
}
function zy(a) {
  return [a[2], a[1]];
}
function wy(a) {
  return [a[3], a[1]];
}
function xz(a) {
  return [a[0], a[2]];
}
function yz(a) {
  return [a[1], a[2]];
}
function zz(a) {
  return [a[2], a[2]];
}
function wz(a) {
  return [a[3], a[2]];
}
function xw(a) {
  return [a[0], a[3]];
}
function yw(a) {
  return [a[1], a[3]];
}
function zw(a) {
  return [a[2], a[3]];
}
function ww(a) {
  return [a[3], a[3]];
}
function x(a) {
  return a[0];
}
function y(a) {
  return a[1];
}
function z(a) {
  return a[2];
}
function w(a) {
  return a[3];
}
function mulScalarByVec2(a, b) {
  return [a[0] * b[0], a[0] * b[1]];
}
function mulScalarByVec3(a, b) {
  return [a[0] * b[0], a[0] * b[1], a[0] * b[2]];
}
function mulScalarByVec4(a, b) {
  return [a[0] * b[0], a[0] * b[1], a[0] * b[2], a[0] * b[3]];
}
function mulVec2ByMat2(a, b) {
  return [a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3]];
}
function mulVec2ByMat3x2(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3],
    a[0] * b[1] + a[1] * b[4],
    a[0] * b[2] + a[1] * b[5]
  ];
}
function mulVec2ByMat4x2(a, b) {
  return [
    a[0] * b[0] + a[1] * b[4],
    a[0] * b[1] + a[1] * b[5],
    a[0] * b[2] + a[1] * b[6],
    a[0] * b[3] + a[1] * b[7]
  ];
}
function mulVec3ByMat2x3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2] + a[2] * b[4],
    a[0] * b[1] + a[1] * b[3] + a[2] * b[5]
  ];
}
function mulVec3ByMat3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8]
  ];
}
function mulVec3ByMat4x3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[4] + a[2] * b[8],
    a[0] * b[1] + a[1] * b[5] + a[2] * b[9],
    a[0] * b[2] + a[1] * b[6] + a[2] * b[10],
    a[0] * b[3] + a[1] * b[7] + a[2] * b[11]
  ];
}
function mulVec4ByMat2x4(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2] + a[2] * b[4] + a[3] * b[6],
    a[0] * b[1] + a[1] * b[3] + a[2] * b[5] + a[3] * b[7]
  ];
}
function mulVec4ByMat3x4(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6] + a[3] * b[9],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7] + a[3] * b[10],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8] + a[3] * b[11]
  ];
}
function mulVec4ByMat4(a, b) {
  return [
    a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12],
    a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13],
    a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14],
    a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15]
  ];
}
function mulVec2ByScalar(a, b) {
  return [a[0] * b[0], a[1] * b[0]];
}
function mulVec2ByVec2(a, b) {
  return [a[0] * b[0], a[1] * b[0], a[0] * b[1], a[1] * b[1]];
}
function mulVec2ByVec3(a, b) {
  return [
    a[0] * b[0],
    a[1] * b[0],
    a[0] * b[1],
    a[1] * b[1],
    a[0] * b[2],
    a[1] * b[2]
  ];
}
function mulVec2ByVec4(a, b) {
  return [
    a[0] * b[0],
    a[1] * b[0],
    a[0] * b[1],
    a[1] * b[1],
    a[0] * b[2],
    a[1] * b[2],
    a[0] * b[3],
    a[1] * b[3]
  ];
}
function mulMat2ByVec2(a, b) {
  return [a[0] * b[0] + a[1] * b[1], a[2] * b[0] + a[3] * b[1]];
}
function mulMat2(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[2] * b[0] + a[3] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[1] + a[3] * b[3]
  ];
}
function mulMat2ByMat3x2(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[3],
    a[0] * b[1] + a[1] * b[4],
    a[2] * b[1] + a[3] * b[4],
    a[0] * b[2] + a[1] * b[5],
    a[2] * b[2] + a[3] * b[5]
  ];
}
function mulMat2ByMat4x2(a, b) {
  return [
    a[0] * b[0] + a[1] * b[4],
    a[2] * b[0] + a[3] * b[4],
    a[0] * b[1] + a[1] * b[5],
    a[2] * b[1] + a[3] * b[5],
    a[0] * b[2] + a[1] * b[6],
    a[2] * b[2] + a[3] * b[6],
    a[0] * b[3] + a[1] * b[7],
    a[2] * b[3] + a[3] * b[7]
  ];
}
function mulMat3x2ByVec3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    a[3] * b[0] + a[4] * b[1] + a[5] * b[2]
  ];
}
function mulMat3x2ByMat2x3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2] + a[2] * b[4],
    a[3] * b[0] + a[4] * b[2] + a[5] * b[4],
    a[0] * b[1] + a[1] * b[3] + a[2] * b[5],
    a[3] * b[1] + a[4] * b[3] + a[5] * b[5]
  ];
}
function mulMat3x2ByMat3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8]
  ];
}
function mulMat3x2ByMat4x3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[4] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[4] + a[5] * b[8],
    a[0] * b[1] + a[1] * b[5] + a[2] * b[9],
    a[3] * b[1] + a[4] * b[5] + a[5] * b[9],
    a[0] * b[2] + a[1] * b[6] + a[2] * b[10],
    a[3] * b[2] + a[4] * b[6] + a[5] * b[10],
    a[0] * b[3] + a[1] * b[7] + a[2] * b[11],
    a[3] * b[3] + a[4] * b[7] + a[5] * b[11]
  ];
}
function mulMat4x2ByVec4(a, b) {
  return [
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3],
    a[4] * b[0] + a[5] * b[1] + a[6] * b[2] + a[7] * b[3]
  ];
}
function mulMat4x2ByMat2x4(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2] + a[2] * b[4] + a[3] * b[6],
    a[4] * b[0] + a[5] * b[2] + a[6] * b[4] + a[7] * b[6],
    a[0] * b[1] + a[1] * b[3] + a[2] * b[5] + a[3] * b[7],
    a[4] * b[1] + a[5] * b[3] + a[6] * b[5] + a[7] * b[7]
  ];
}
function mulMat4x2ByMat3x4(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6] + a[3] * b[9],
    a[4] * b[0] + a[5] * b[3] + a[6] * b[6] + a[7] * b[9],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7] + a[3] * b[10],
    a[4] * b[1] + a[5] * b[4] + a[6] * b[7] + a[7] * b[10],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8] + a[3] * b[11],
    a[4] * b[2] + a[5] * b[5] + a[6] * b[8] + a[7] * b[11]
  ];
}
function mulMat4x2ByMat4(a, b) {
  return [
    a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12],
    a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12],
    a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13],
    a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13],
    a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14],
    a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14],
    a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],
    a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15]
  ];
}
function mulVec3ByScalar(a, b) {
  return [a[0] * b[0], a[1] * b[0], a[2] * b[0]];
}
function mulVec3ByVec2(a, b) {
  return [
    a[0] * b[0],
    a[1] * b[0],
    a[2] * b[0],
    a[0] * b[1],
    a[1] * b[1],
    a[2] * b[1]
  ];
}
function mulVec3ByVec3(a, b) {
  return [
    a[0] * b[0],
    a[1] * b[0],
    a[2] * b[0],
    a[0] * b[1],
    a[1] * b[1],
    a[2] * b[1],
    a[0] * b[2],
    a[1] * b[2],
    a[2] * b[2]
  ];
}
function mulVec3ByVec4(a, b) {
  return [
    a[0] * b[0],
    a[1] * b[0],
    a[2] * b[0],
    a[0] * b[1],
    a[1] * b[1],
    a[2] * b[1],
    a[0] * b[2],
    a[1] * b[2],
    a[2] * b[2],
    a[0] * b[3],
    a[1] * b[3],
    a[2] * b[3]
  ];
}
function mulMat2x3ByVec2(a, b) {
  return [
    a[0] * b[0] + a[1] * b[1],
    a[2] * b[0] + a[3] * b[1],
    a[4] * b[0] + a[5] * b[1]
  ];
}
function mulMat2x3ByMat2(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[2] * b[0] + a[3] * b[2],
    a[4] * b[0] + a[5] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[1] + a[3] * b[3],
    a[4] * b[1] + a[5] * b[3]
  ];
}
function mulMat2x3ByMat3x2(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[3],
    a[4] * b[0] + a[5] * b[3],
    a[0] * b[1] + a[1] * b[4],
    a[2] * b[1] + a[3] * b[4],
    a[4] * b[1] + a[5] * b[4],
    a[0] * b[2] + a[1] * b[5],
    a[2] * b[2] + a[3] * b[5],
    a[4] * b[2] + a[5] * b[5]
  ];
}
function mulMat2x3ByMat4x2(a, b) {
  return [
    a[0] * b[0] + a[1] * b[4],
    a[2] * b[0] + a[3] * b[4],
    a[4] * b[0] + a[5] * b[4],
    a[0] * b[1] + a[1] * b[5],
    a[2] * b[1] + a[3] * b[5],
    a[4] * b[1] + a[5] * b[5],
    a[0] * b[2] + a[1] * b[6],
    a[2] * b[2] + a[3] * b[6],
    a[4] * b[2] + a[5] * b[6],
    a[0] * b[3] + a[1] * b[7],
    a[2] * b[3] + a[3] * b[7],
    a[4] * b[3] + a[5] * b[7]
  ];
}
function mulMat3ByVec3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    a[3] * b[0] + a[4] * b[1] + a[5] * b[2],
    a[6] * b[0] + a[7] * b[1] + a[8] * b[2]
  ];
}
function mulMat3ByMat2x3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2] + a[2] * b[4],
    a[3] * b[0] + a[4] * b[2] + a[5] * b[4],
    a[6] * b[0] + a[7] * b[2] + a[8] * b[4],
    a[0] * b[1] + a[1] * b[3] + a[2] * b[5],
    a[3] * b[1] + a[4] * b[3] + a[5] * b[5],
    a[6] * b[1] + a[7] * b[3] + a[8] * b[5]
  ];
}
function mulMat3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8]
  ];
}
function mulMat3ByMat4x3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[4] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[4] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[4] + a[8] * b[8],
    a[0] * b[1] + a[1] * b[5] + a[2] * b[9],
    a[3] * b[1] + a[4] * b[5] + a[5] * b[9],
    a[6] * b[1] + a[7] * b[5] + a[8] * b[9],
    a[0] * b[2] + a[1] * b[6] + a[2] * b[10],
    a[3] * b[2] + a[4] * b[6] + a[5] * b[10],
    a[6] * b[2] + a[7] * b[6] + a[8] * b[10],
    a[0] * b[3] + a[1] * b[7] + a[2] * b[11],
    a[3] * b[3] + a[4] * b[7] + a[5] * b[11],
    a[6] * b[3] + a[7] * b[7] + a[8] * b[11]
  ];
}
function mulMat4x3ByVec4(a, b) {
  return [
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3],
    a[4] * b[0] + a[5] * b[1] + a[6] * b[2] + a[7] * b[3],
    a[8] * b[0] + a[9] * b[1] + a[10] * b[2] + a[11] * b[3]
  ];
}
function mulMat4x3ByMat2x4(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2] + a[2] * b[4] + a[3] * b[6],
    a[4] * b[0] + a[5] * b[2] + a[6] * b[4] + a[7] * b[6],
    a[8] * b[0] + a[9] * b[2] + a[10] * b[4] + a[11] * b[6],
    a[0] * b[1] + a[1] * b[3] + a[2] * b[5] + a[3] * b[7],
    a[4] * b[1] + a[5] * b[3] + a[6] * b[5] + a[7] * b[7],
    a[8] * b[1] + a[9] * b[3] + a[10] * b[5] + a[11] * b[7]
  ];
}
function mulMat4x3ByMat3x4(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6] + a[3] * b[9],
    a[4] * b[0] + a[5] * b[3] + a[6] * b[6] + a[7] * b[9],
    a[8] * b[0] + a[9] * b[3] + a[10] * b[6] + a[11] * b[9],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7] + a[3] * b[10],
    a[4] * b[1] + a[5] * b[4] + a[6] * b[7] + a[7] * b[10],
    a[8] * b[1] + a[9] * b[4] + a[10] * b[7] + a[11] * b[10],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8] + a[3] * b[11],
    a[4] * b[2] + a[5] * b[5] + a[6] * b[8] + a[7] * b[11],
    a[8] * b[2] + a[9] * b[5] + a[10] * b[8] + a[11] * b[11]
  ];
}
function mulMat4x3ByMat4(a, b) {
  return [
    a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12],
    a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12],
    a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12],
    a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13],
    a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13],
    a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13],
    a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14],
    a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14],
    a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14],
    a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],
    a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],
    a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15]
  ];
}
function mulVec4ByScalar(a, b) {
  return [a[0] * b[0], a[1] * b[0], a[2] * b[0], a[3] * b[0]];
}
function mulVec4ByVec2(a, b) {
  return [
    a[0] * b[0],
    a[1] * b[0],
    a[2] * b[0],
    a[3] * b[0],
    a[0] * b[1],
    a[1] * b[1],
    a[2] * b[1],
    a[3] * b[1]
  ];
}
function mulVec4ByVec3(a, b) {
  return [
    a[0] * b[0],
    a[1] * b[0],
    a[2] * b[0],
    a[3] * b[0],
    a[0] * b[1],
    a[1] * b[1],
    a[2] * b[1],
    a[3] * b[1],
    a[0] * b[2],
    a[1] * b[2],
    a[2] * b[2],
    a[3] * b[2]
  ];
}
function mulVec4ByVec4(a, b) {
  return [
    a[0] * b[0],
    a[1] * b[0],
    a[2] * b[0],
    a[3] * b[0],
    a[0] * b[1],
    a[1] * b[1],
    a[2] * b[1],
    a[3] * b[1],
    a[0] * b[2],
    a[1] * b[2],
    a[2] * b[2],
    a[3] * b[2],
    a[0] * b[3],
    a[1] * b[3],
    a[2] * b[3],
    a[3] * b[3]
  ];
}
function mulMat2x4ByVec2(a, b) {
  return [
    a[0] * b[0] + a[1] * b[1],
    a[2] * b[0] + a[3] * b[1],
    a[4] * b[0] + a[5] * b[1],
    a[6] * b[0] + a[7] * b[1]
  ];
}
function mulMat2x4ByMat2(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[2] * b[0] + a[3] * b[2],
    a[4] * b[0] + a[5] * b[2],
    a[6] * b[0] + a[7] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[1] + a[3] * b[3],
    a[4] * b[1] + a[5] * b[3],
    a[6] * b[1] + a[7] * b[3]
  ];
}
function mulMat2x4ByMat3x2(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[3],
    a[4] * b[0] + a[5] * b[3],
    a[6] * b[0] + a[7] * b[3],
    a[0] * b[1] + a[1] * b[4],
    a[2] * b[1] + a[3] * b[4],
    a[4] * b[1] + a[5] * b[4],
    a[6] * b[1] + a[7] * b[4],
    a[0] * b[2] + a[1] * b[5],
    a[2] * b[2] + a[3] * b[5],
    a[4] * b[2] + a[5] * b[5],
    a[6] * b[2] + a[7] * b[5]
  ];
}
function mulMat2x4ByMat4x2(a, b) {
  return [
    a[0] * b[0] + a[1] * b[4],
    a[2] * b[0] + a[3] * b[4],
    a[4] * b[0] + a[5] * b[4],
    a[6] * b[0] + a[7] * b[4],
    a[0] * b[1] + a[1] * b[5],
    a[2] * b[1] + a[3] * b[5],
    a[4] * b[1] + a[5] * b[5],
    a[6] * b[1] + a[7] * b[5],
    a[0] * b[2] + a[1] * b[6],
    a[2] * b[2] + a[3] * b[6],
    a[4] * b[2] + a[5] * b[6],
    a[6] * b[2] + a[7] * b[6],
    a[0] * b[3] + a[1] * b[7],
    a[2] * b[3] + a[3] * b[7],
    a[4] * b[3] + a[5] * b[7],
    a[6] * b[3] + a[7] * b[7]
  ];
}
function mulMat3x4ByVec3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    a[3] * b[0] + a[4] * b[1] + a[5] * b[2],
    a[6] * b[0] + a[7] * b[1] + a[8] * b[2],
    a[9] * b[0] + a[10] * b[1] + a[11] * b[2]
  ];
}
function mulMat3x4ByMat2x3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2] + a[2] * b[4],
    a[3] * b[0] + a[4] * b[2] + a[5] * b[4],
    a[6] * b[0] + a[7] * b[2] + a[8] * b[4],
    a[9] * b[0] + a[10] * b[2] + a[11] * b[4],
    a[0] * b[1] + a[1] * b[3] + a[2] * b[5],
    a[3] * b[1] + a[4] * b[3] + a[5] * b[5],
    a[6] * b[1] + a[7] * b[3] + a[8] * b[5],
    a[9] * b[1] + a[10] * b[3] + a[11] * b[5]
  ];
}
function mulMat3x4ByMat3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[9] * b[0] + a[10] * b[3] + a[11] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[9] * b[1] + a[10] * b[4] + a[11] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
    a[9] * b[2] + a[10] * b[5] + a[11] * b[8]
  ];
}
function mulMat3x4ByMat4x3(a, b) {
  return [
    a[0] * b[0] + a[1] * b[4] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[4] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[4] + a[8] * b[8],
    a[9] * b[0] + a[10] * b[4] + a[11] * b[8],
    a[0] * b[1] + a[1] * b[5] + a[2] * b[9],
    a[3] * b[1] + a[4] * b[5] + a[5] * b[9],
    a[6] * b[1] + a[7] * b[5] + a[8] * b[9],
    a[9] * b[1] + a[10] * b[5] + a[11] * b[9],
    a[0] * b[2] + a[1] * b[6] + a[2] * b[10],
    a[3] * b[2] + a[4] * b[6] + a[5] * b[10],
    a[6] * b[2] + a[7] * b[6] + a[8] * b[10],
    a[9] * b[2] + a[10] * b[6] + a[11] * b[10],
    a[0] * b[3] + a[1] * b[7] + a[2] * b[11],
    a[3] * b[3] + a[4] * b[7] + a[5] * b[11],
    a[6] * b[3] + a[7] * b[7] + a[8] * b[11],
    a[9] * b[3] + a[10] * b[7] + a[11] * b[11]
  ];
}
function mulMat4ByVec4(a, b) {
  return [
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3],
    a[4] * b[0] + a[5] * b[1] + a[6] * b[2] + a[7] * b[3],
    a[8] * b[0] + a[9] * b[1] + a[10] * b[2] + a[11] * b[3],
    a[12] * b[0] + a[13] * b[1] + a[14] * b[2] + a[15] * b[3]
  ];
}
function mulMat4ByMat2x4(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2] + a[2] * b[4] + a[3] * b[6],
    a[4] * b[0] + a[5] * b[2] + a[6] * b[4] + a[7] * b[6],
    a[8] * b[0] + a[9] * b[2] + a[10] * b[4] + a[11] * b[6],
    a[12] * b[0] + a[13] * b[2] + a[14] * b[4] + a[15] * b[6],
    a[0] * b[1] + a[1] * b[3] + a[2] * b[5] + a[3] * b[7],
    a[4] * b[1] + a[5] * b[3] + a[6] * b[5] + a[7] * b[7],
    a[8] * b[1] + a[9] * b[3] + a[10] * b[5] + a[11] * b[7],
    a[12] * b[1] + a[13] * b[3] + a[14] * b[5] + a[15] * b[7]
  ];
}
function mulMat4ByMat3x4(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6] + a[3] * b[9],
    a[4] * b[0] + a[5] * b[3] + a[6] * b[6] + a[7] * b[9],
    a[8] * b[0] + a[9] * b[3] + a[10] * b[6] + a[11] * b[9],
    a[12] * b[0] + a[13] * b[3] + a[14] * b[6] + a[15] * b[9],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7] + a[3] * b[10],
    a[4] * b[1] + a[5] * b[4] + a[6] * b[7] + a[7] * b[10],
    a[8] * b[1] + a[9] * b[4] + a[10] * b[7] + a[11] * b[10],
    a[12] * b[1] + a[13] * b[4] + a[14] * b[7] + a[15] * b[10],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8] + a[3] * b[11],
    a[4] * b[2] + a[5] * b[5] + a[6] * b[8] + a[7] * b[11],
    a[8] * b[2] + a[9] * b[5] + a[10] * b[8] + a[11] * b[11],
    a[12] * b[2] + a[13] * b[5] + a[14] * b[8] + a[15] * b[11]
  ];
}
function mulMat4(a, b) {
  return [
    a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12],
    a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12],
    a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12],
    a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12],
    a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13],
    a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13],
    a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13],
    a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13],
    a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14],
    a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14],
    a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14],
    a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14],
    a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],
    a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],
    a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],
    a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]
  ];
}
function add2(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}
function add3(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function add4(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
}
function mul2(a, b) {
  return [a[0] * b[0], a[1] * b[1]];
}
function mul3(a, b) {
  return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
}
function mul4(a, b) {
  return [a[0] * b[0], a[1] * b[1], a[2] * b[2], a[3] * b[3]];
}
function div2(a, b) {
  return [a[0] / b[0], a[1] / b[1]];
}
function div3(a, b) {
  return [a[0] / b[0], a[1] / b[1], a[2] / b[2]];
}
function div4(a, b) {
  return [a[0] / b[0], a[1] / b[1], a[2] / b[2], a[3] / b[3]];
}
function sub2(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}
function sub3(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function sub4(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3]];
}
function neg2(a) {
  return [-a[0], -a[1]];
}
function neg3(a) {
  return [-a[0], -a[1], -a[2]];
}
function neg4(a) {
  return [-a[0], -a[1], -a[2], -a[3]];
}
function normalize2(a) {
  return scale2(a, 1 / Math.sqrt(dot2(a, a)));
}
function normalize3(a) {
  return scale3(a, 1 / Math.sqrt(dot3(a, a)));
}
function normalize4(a) {
  return scale4(a, 1 / Math.sqrt(dot4(a, a)));
}
function sum2(a) {
  return a[0] + a[1];
}
function sum3(a) {
  return a[0] + a[1] + a[2];
}
function sum4(a) {
  return a[0] + a[1] + a[2] + a[3];
}
function dot2(a, b) {
  return sum2(mul2(a, b));
}
function dot3(a, b) {
  return sum3(mul3(a, b));
}
function dot4(a, b) {
  return sum4(mul4(a, b));
}
function scale2(a, b) {
  return [a[0] * b, a[1] * b];
}
function scale3(a, b) {
  return [a[0] * b, a[1] * b, a[2] * b];
}
function scale4(a, b) {
  return [a[0] * b, a[1] * b, a[2] * b, a[3] * b];
}

// src/webgl/mesh.ts
function parametric2D(x2, y2, attr, getPoint) {
  const data = [];
  for (let j = 0; j < y2; j++) {
    for (let i = 0; i < x2; i++) {
      const a = getPoint(i, j);
      const b = getPoint(i + 1, j);
      const c = getPoint(i, j + 1);
      const d = getPoint(i + 1, j + 1);
      data.push({ [attr]: a });
      data.push({ [attr]: c });
      data.push({ [attr]: b });
      data.push({ [attr]: c });
      data.push({ [attr]: d });
      data.push({ [attr]: b });
    }
  }
  return data;
}
function uvSphere(x2, y2, rad, attr) {
  return parametric2D(x2, y2, attr, (i, j) => {
    const a = (i + x2) % x2 / x2 * Math.PI * 2;
    const b = (j + y2) % y2 / y2 * Math.PI - Math.PI / 2;
    let px = Math.cos(a) * Math.cos(b) * rad;
    let pz = Math.sin(a) * Math.cos(b) * rad;
    let py = Math.sin(b) * rad;
    return [px, py, pz];
  });
}
function ring(x2, rad, height, attr) {
  return parametric2D(x2, 1, attr, (i, j) => {
    const a = (i + x2) % x2 / x2 * Math.PI * 2;
    const px = Math.cos(a) * rad;
    const pz = Math.sin(a) * rad;
    const py = j === 1 ? height / 2 : -height / 2;
    return [px, py, pz];
  });
}
function torus(x2, y2, R, r, attr) {
  return parametric2D(x2, y2, attr, (i, j) => {
    const a = (i + x2) % x2 / x2 * Math.PI * 2;
    const b = (j + y2) % y2 / y2 * Math.PI * 2;
    let px = Math.cos(a);
    let pz = Math.sin(a);
    let py = Math.sin(b) * r;
    px *= R + Math.cos(b) * r;
    pz *= R + Math.cos(b) * r;
    return [px, py, pz];
  });
}
function move(mesh, attr, offset) {
  return mesh.map((m) => ({
    ...m,
    [attr]: m[attr].map((e, i) => e + offset[i])
  }));
}
function perspective(fieldOfViewInRadians, aspectRatio, near, far) {
  const f = 1 / Math.tan(fieldOfViewInRadians / 2);
  const rangeInv = 1 / (near - far);
  return [
    f / aspectRatio,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (near + far) * rangeInv,
    -1,
    0,
    0,
    near * far * rangeInv * 2,
    0
  ];
}
function ortho(left, right, top, bottom, near, far) {
  return [
    2 / (right - left),
    0,
    0,
    -(right + left) / (right - left),
    0,
    2 / (top - bottom),
    0,
    -(top + bottom) / (top - bottom),
    0,
    0,
    -2 / (far - near),
    -(far + near) / (far - near),
    0,
    0,
    0,
    1
  ];
}
function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}
function normalize(v) {
  const len = Math.hypot(...v);
  return scale3(v, 1 / len);
}
function rodrigues(v, k, theta) {
  k = normalize(k);
  return add3(
    add3(scale3(v, Math.cos(theta)), scale3(cross(k, v), Math.sin(theta))),
    scale3(k, dot3(k, v) * (1 - Math.cos(theta)))
  );
}
function rotate(axis, angle) {
  return [
    ...rodrigues([1, 0, 0], axis, angle),
    0,
    ...rodrigues([0, 1, 0], axis, angle),
    0,
    ...rodrigues([0, 0, 1], axis, angle),
    0,
    0,
    0,
    0,
    1
  ];
}
function scale(axes) {
  return [axes[0], 0, 0, 0, 0, axes[1], 0, 0, 0, 0, axes[2], 0, 0, 0, 0, 1];
}
function translate(v) {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ...v, 1];
}

// src/webgl/buffer.ts
function getDatatypeSize(gl, datatype) {
  return {
    [gl.BYTE]: 1,
    [gl.SHORT]: 2,
    [gl.UNSIGNED_BYTE]: 1,
    [gl.UNSIGNED_SHORT]: 2,
    [gl.FLOAT]: 4,
    [gl.HALF_FLOAT]: 2,
    [gl.INT]: 4,
    [gl.UNSIGNED_INT]: 4,
    [gl.INT_2_10_10_10_REV]: 4,
    [gl.UNSIGNED_INT_2_10_10_10_REV]: 4
  }[datatype];
}
function createBufferWithLayout(gl, layout, data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const layoutEntries = Object.entries(layout);
  let stride = 0;
  const offsets = /* @__PURE__ */ new Map();
  for (const [name, attrs] of layoutEntries) {
    offsets.set(name, stride);
    stride += attrs.size * getDatatypeSize(gl, attrs.type);
  }
  const arraybuf = new ArrayBuffer(stride * data.length);
  const rawdata = new DataView(arraybuf);
  let i = 0;
  for (const d of data) {
    for (const [name, attrs] of layoutEntries) {
      for (let j = 0; j < attrs.size; j++) {
        const val = d[name][j];
        let pos = i * stride + offsets.get(name) + j * getDatatypeSize(gl, attrs.type);
        if (attrs.type === gl.BYTE) {
          rawdata.setInt8(pos, val);
        } else if (attrs.type === gl.UNSIGNED_BYTE) {
          rawdata.setUint8(pos, val);
        } else if (attrs.type === gl.FLOAT) {
          rawdata.setFloat32(pos, val, true);
        } else if (attrs.type === gl.SHORT) {
          rawdata.setInt16(pos, val, true);
        } else if (attrs.type === gl.UNSIGNED_SHORT) {
          rawdata.setUint16(pos, val, true);
        }
      }
    }
    i++;
  }
  gl.bufferData(gl.ARRAY_BUFFER, rawdata, gl.STATIC_DRAW);
  return {
    vertexCount: data.length,
    buffer,
    setLayout(prog) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      for (const [name, attrs] of layoutEntries) {
        const loc = gl.getAttribLocation(prog, name);
        if (attrs.isInt) {
          gl.vertexAttribIPointer(
            loc,
            attrs.size,
            attrs.type,
            stride,
            offsets.get(name)
          );
        } else {
          gl.vertexAttribPointer(
            loc,
            attrs.size,
            attrs.type,
            attrs.normalized ?? false,
            stride,
            offsets.get(name)
          );
        }
        gl.enableVertexAttribArray(loc);
      }
    },
    bindArray(gl2) {
      gl2.bindBuffer(gl2.ARRAY_BUFFER, buffer);
    },
    bindIndex(gl2) {
      gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, buffer);
    }
  };
}

// src/ui/react-string-field.tsx
var import_react = __toESM(require_react());
function StringField(props) {
  if (props.isTextarea) {
    return /* @__PURE__ */ import_react.default.createElement(
      "textarea",
      {
        value: props.value,
        onInput: (e) => {
          props.setValue(e.currentTarget.value);
        }
      }
    );
  }
  return /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      value: props.value,
      onInput: (e) => {
        props.setValue(e.currentTarget.value);
      }
    }
  );
}

// src/ui/react-number-field.tsx
var import_react2 = __toESM(require_react());
function stringifyNumber(x2) {
  return x2.toLocaleString("fullwide", {
    useGrouping: false,
    maximumFractionDigits: 10
  });
}
function roundAndClamp(x2, min, max, step, offset) {
  x2 = Math.max(Math.min(x2, max), min);
  if (step === 0) return x2;
  return Math.round((x2 - offset) / step) * step + offset;
}
function NumberField(propsOpt) {
  const props = {
    scale: "log",
    sensitivity: 0.01,
    min: -Infinity,
    max: Infinity,
    step: 0,
    offset: 0,
    displayPrecision: 3,
    defaultIfNaN: 0,
    ...propsOpt
  };
  const value = isNaN(props.value) ? props.defaultIfNaN : props.value;
  const [valueTemp, _setValueTemp] = (0, import_react2.useState)(stringifyNumber(value));
  const lastNumberRef = (0, import_react2.useRef)(value);
  function constrain(n) {
    return roundAndClamp(n, props.min, props.max, props.step, props.offset);
  }
  function setValueTemp(vt, forceConstrain) {
    if (!forceConstrain) _setValueTemp(vt);
    const num = Number(vt);
    if (!isNaN(num)) {
      const cn = constrain(num);
      props.setValue(cn);
      lastNumberRef.current = cn;
      if (forceConstrain) {
        _setValueTemp(stringifyNumber(cn));
      }
    }
  }
  function setValueTempNum(n, forceConstrain) {
    return setValueTemp(
      stringifyNumber(forceConstrain ? constrain(n) : n),
      forceConstrain
    );
  }
  (0, import_react2.useEffect)(() => {
    if (lastNumberRef.current !== value) {
      lastNumberRef.current = value;
      _setValueTemp(stringifyNumber(value));
    }
  }, [value]);
  return /* @__PURE__ */ import_react2.default.createElement(
    "input",
    {
      value: valueTemp,
      onInput: (e) => {
        setValueTemp(e.currentTarget.value, false);
      },
      ref: (e) => {
        e?.addEventListener("change", () => {
          setValueTemp(e.value, true);
        });
      },
      onMouseDown: async (e) => {
        await e.currentTarget.requestPointerLock();
        let dragnum = value;
        const mousemoveListener = (e2) => {
          const x2 = e2.movementX;
          if (props.scale === "log") {
            dragnum = dragnum * (2 ** props.sensitivity) ** x2;
          } else {
            dragnum += x2 * props.sensitivity;
          }
          setValueTempNum(dragnum, true);
        };
        const mouseupListener = (e2) => {
          document.removeEventListener("mousemove", mousemoveListener);
          document.removeEventListener("mouseup", mouseupListener);
          document.exitPointerLock();
        };
        document.addEventListener("mousemove", mousemoveListener);
        document.addEventListener("mouseup", mouseupListener);
      }
    }
  );
}

// src/ui/pan-and-zoom.tsx
var import_react3 = __toESM(require_react());
function panAndZoomMatrix(rect, containerWidth, containerHeight) {
  const scaleX = 1 / (rect.x2 - rect.x1) * containerWidth;
  const scaleY = 1 / (rect.y2 - rect.y1) * containerHeight;
  const translateX = -rect.x1 * scaleX;
  const translateY = -rect.y1 * scaleY;
  return [scaleX, 0, 0, scaleY, translateX, translateY];
}
function panAndZoomCanvas2d(canvas, ctx, rect) {
  ctx.transform(...panAndZoomMatrix(rect, canvas.width, canvas.height));
}
function PanAndZoom(props) {
  const scrollSensitivity = props.scrollSensitivity ?? 1;
  const scrollDecay = props.scrollDecay ?? 0.01;
  const scrollSnapToZero = props.scrollSnapToZero ?? 1e-3;
  const scrollVel = (0, import_react3.useRef)(0);
  const mouseDown = (0, import_react3.useRef)(false);
  const normalizedMousePos = (0, import_react3.useRef)({ x: 0, y: 0 });
  (0, import_react3.useEffect)(() => {
    let stopped = false;
    let lastTime = performance.now();
    const cb = (time) => {
      if (stopped) return;
      const deltaTime = time - lastTime;
      lastTime = time;
      scrollVel.current *= Math.pow(scrollDecay, deltaTime / 1e3);
      if (Math.abs(scrollVel.current) > scrollSnapToZero) {
        props.setCoords((c) => {
          const targetOriginX = lerp(normalizedMousePos.current.x, c.x1, c.x2);
          const targetOriginY = lerp(normalizedMousePos.current.y, c.y1, c.y2);
          const scrollAmount = scrollVel.current * deltaTime / 1e3;
          return {
            x1: lerp(scrollAmount, c.x1, targetOriginX),
            y1: lerp(scrollAmount, c.y1, targetOriginY),
            x2: lerp(scrollAmount, c.x2, targetOriginX),
            y2: lerp(scrollAmount, c.y2, targetOriginY)
          };
        });
        props.onUpdate?.();
      }
      requestAnimationFrame(cb);
    };
    requestAnimationFrame(cb);
    return () => {
      stopped = true;
    };
  }, []);
  const divref = (0, import_react3.useRef)(null);
  return /* @__PURE__ */ import_react3.default.createElement(
    "div",
    {
      style: {
        width: "fit-content",
        display: "flex"
      },
      ref: divref,
      onWheel: (e) => {
        e.preventDefault();
        scrollVel.current += Math.sign(e.deltaY) * scrollSensitivity * (props.swapScroll ? -1 : 1);
      },
      onMouseDown: (e) => {
        mouseDown.current = true;
      },
      onMouseUp: (e) => {
        mouseDown.current = false;
      },
      onMouseMove: (e) => {
        const rect = divref.current?.getBoundingClientRect();
        if (!rect) return;
        normalizedMousePos.current = {
          x: rescale(e.nativeEvent.offsetX, 0, rect.width, 0, 1),
          y: rescale(e.nativeEvent.offsetY, 0, rect.height, 0, 1)
        };
        if (!mouseDown.current) return;
        props.setCoords((c) => {
          const dx = -rescale(e.movementX, 0, rect.width, 0, c.x2 - c.x1);
          const dy = -rescale(e.movementY, 0, rect.height, 0, c.y2 - c.y1);
          return {
            x1: c.x1 + dx,
            y1: c.y1 + dy,
            x2: c.x2 + dx,
            y2: c.y2 + dy
          };
        });
        props.onUpdate?.();
      }
    },
    props.children
  );
}
export {
  ArrayMap,
  NumberField,
  PanAndZoom,
  StringField,
  add,
  add2,
  add3,
  add4,
  adsr,
  alterElements,
  applyUniform,
  applyUniforms,
  blobToDataURL,
  canvasToBlob,
  cartesianProduct,
  clamp,
  clampToArray,
  constant,
  convolve,
  createBufferWithLayout,
  createEvalbox,
  createRoundRobinThread,
  createRoundRobinThreadpool,
  createScene,
  createWorkerReceiver,
  createWorkerWithInterface,
  cross,
  debounce,
  div2,
  div3,
  div4,
  dot2,
  dot3,
  dot4,
  download,
  downloadText,
  envelope,
  err,
  fullscreenQuadBuffer,
  getClamped,
  getLinesAndCols,
  getOgg,
  glRenderToQuad,
  graphAudio,
  id,
  injectElementsAt,
  injectFunction,
  interleave,
  lazy,
  lens,
  lensInner,
  lerp,
  listenForNoSelector,
  listenForSelector,
  loadImg,
  lookupQuadtree,
  makeQuadtree,
  memo,
  modulateGain,
  modulateSampleTime,
  monoToStereo,
  move,
  mul2,
  mul3,
  mul4,
  mulMat2,
  mulMat2ByMat3x2,
  mulMat2ByMat4x2,
  mulMat2ByVec2,
  mulMat2x3ByMat2,
  mulMat2x3ByMat3x2,
  mulMat2x3ByMat4x2,
  mulMat2x3ByVec2,
  mulMat2x4ByMat2,
  mulMat2x4ByMat3x2,
  mulMat2x4ByMat4x2,
  mulMat2x4ByVec2,
  mulMat3,
  mulMat3ByMat2x3,
  mulMat3ByMat4x3,
  mulMat3ByVec3,
  mulMat3x2ByMat2x3,
  mulMat3x2ByMat3,
  mulMat3x2ByMat4x3,
  mulMat3x2ByVec3,
  mulMat3x4ByMat2x3,
  mulMat3x4ByMat3,
  mulMat3x4ByMat4x3,
  mulMat3x4ByVec3,
  mulMat4,
  mulMat4ByMat2x4,
  mulMat4ByMat3x4,
  mulMat4ByVec4,
  mulMat4x2ByMat2x4,
  mulMat4x2ByMat3x4,
  mulMat4x2ByMat4,
  mulMat4x2ByVec4,
  mulMat4x3ByMat2x4,
  mulMat4x3ByMat3x4,
  mulMat4x3ByMat4,
  mulMat4x3ByVec4,
  mulScalarByVec2,
  mulScalarByVec3,
  mulScalarByVec4,
  mulVec2ByMat2,
  mulVec2ByMat3x2,
  mulVec2ByMat4x2,
  mulVec2ByScalar,
  mulVec2ByVec2,
  mulVec2ByVec3,
  mulVec2ByVec4,
  mulVec3ByMat2x3,
  mulVec3ByMat3,
  mulVec3ByMat4x3,
  mulVec3ByScalar,
  mulVec3ByVec2,
  mulVec3ByVec3,
  mulVec3ByVec4,
  mulVec4ByMat2x4,
  mulVec4ByMat3x4,
  mulVec4ByMat4,
  mulVec4ByScalar,
  mulVec4ByVec2,
  mulVec4ByVec3,
  mulVec4ByVec4,
  multiDelimit,
  neg2,
  neg3,
  neg4,
  normalize2,
  normalize3,
  normalize4,
  ok,
  ortho,
  panAndZoomCanvas2d,
  panAndZoomMatrix,
  parametric2D,
  perspective,
  pickrand,
  play,
  rand,
  randUnicode,
  range,
  rangeFrom,
  rangeIntersects,
  rectIntersects,
  registerStorageItem,
  resample,
  rescale,
  ring,
  rodrigues,
  rotate,
  saw,
  scale,
  scale2,
  scale3,
  scale4,
  scaleDuration,
  shaders2program,
  signal,
  silence,
  sine,
  slice,
  smartAsyncReplaceAll,
  smartRangeMap,
  smartRangeStringMapJoin,
  smoothstep,
  source2shader,
  sources2program,
  splitBy,
  square,
  stringField,
  stringMapJoin,
  stringRangeMapJoin,
  sub2,
  sub3,
  sub4,
  sum2,
  sum3,
  sum4,
  throttle,
  torus,
  translate,
  unclampedSmoothstep,
  unlerp,
  uvSphere,
  w,
  wait,
  waitForCond,
  waitUntil,
  workerifyClient,
  workerifyClientIframe,
  workerifyServer,
  workerifyServerIframe,
  ww,
  www,
  wwww,
  wwwx,
  wwwy,
  wwwz,
  wwx,
  wwxw,
  wwxx,
  wwxy,
  wwxz,
  wwy,
  wwyw,
  wwyx,
  wwyy,
  wwyz,
  wwz,
  wwzw,
  wwzx,
  wwzy,
  wwzz,
  wx,
  wxw,
  wxww,
  wxwx,
  wxwy,
  wxwz,
  wxx,
  wxxw,
  wxxx,
  wxxy,
  wxxz,
  wxy,
  wxyw,
  wxyx,
  wxyy,
  wxyz,
  wxz,
  wxzw,
  wxzx,
  wxzy,
  wxzz,
  wy,
  wyw,
  wyww,
  wywx,
  wywy,
  wywz,
  wyx,
  wyxw,
  wyxx,
  wyxy,
  wyxz,
  wyy,
  wyyw,
  wyyx,
  wyyy,
  wyyz,
  wyz,
  wyzw,
  wyzx,
  wyzy,
  wyzz,
  wz,
  wzw,
  wzww,
  wzwx,
  wzwy,
  wzwz,
  wzx,
  wzxw,
  wzxx,
  wzxy,
  wzxz,
  wzy,
  wzyw,
  wzyx,
  wzyy,
  wzyz,
  wzz,
  wzzw,
  wzzx,
  wzzy,
  wzzz,
  x,
  xw,
  xww,
  xwww,
  xwwx,
  xwwy,
  xwwz,
  xwx,
  xwxw,
  xwxx,
  xwxy,
  xwxz,
  xwy,
  xwyw,
  xwyx,
  xwyy,
  xwyz,
  xwz,
  xwzw,
  xwzx,
  xwzy,
  xwzz,
  xx,
  xxw,
  xxww,
  xxwx,
  xxwy,
  xxwz,
  xxx,
  xxxw,
  xxxx,
  xxxy,
  xxxz,
  xxy,
  xxyw,
  xxyx,
  xxyy,
  xxyz,
  xxz,
  xxzw,
  xxzx,
  xxzy,
  xxzz,
  xy,
  xyw,
  xyww,
  xywx,
  xywy,
  xywz,
  xyx,
  xyxw,
  xyxx,
  xyxy,
  xyxz,
  xyy,
  xyyw,
  xyyx,
  xyyy,
  xyyz,
  xyz,
  xyzw,
  xyzx,
  xyzy,
  xyzz,
  xz,
  xzw,
  xzww,
  xzwx,
  xzwy,
  xzwz,
  xzx,
  xzxw,
  xzxx,
  xzxy,
  xzxz,
  xzy,
  xzyw,
  xzyx,
  xzyy,
  xzyz,
  xzz,
  xzzw,
  xzzx,
  xzzy,
  xzzz,
  y,
  yw,
  yww,
  ywww,
  ywwx,
  ywwy,
  ywwz,
  ywx,
  ywxw,
  ywxx,
  ywxy,
  ywxz,
  ywy,
  ywyw,
  ywyx,
  ywyy,
  ywyz,
  ywz,
  ywzw,
  ywzx,
  ywzy,
  ywzz,
  yx,
  yxw,
  yxww,
  yxwx,
  yxwy,
  yxwz,
  yxx,
  yxxw,
  yxxx,
  yxxy,
  yxxz,
  yxy,
  yxyw,
  yxyx,
  yxyy,
  yxyz,
  yxz,
  yxzw,
  yxzx,
  yxzy,
  yxzz,
  yy,
  yyw,
  yyww,
  yywx,
  yywy,
  yywz,
  yyx,
  yyxw,
  yyxx,
  yyxy,
  yyxz,
  yyy,
  yyyw,
  yyyx,
  yyyy,
  yyyz,
  yyz,
  yyzw,
  yyzx,
  yyzy,
  yyzz,
  yz,
  yzw,
  yzww,
  yzwx,
  yzwy,
  yzwz,
  yzx,
  yzxw,
  yzxx,
  yzxy,
  yzxz,
  yzy,
  yzyw,
  yzyx,
  yzyy,
  yzyz,
  yzz,
  yzzw,
  yzzx,
  yzzy,
  yzzz,
  z,
  zw,
  zww,
  zwww,
  zwwx,
  zwwy,
  zwwz,
  zwx,
  zwxw,
  zwxx,
  zwxy,
  zwxz,
  zwy,
  zwyw,
  zwyx,
  zwyy,
  zwyz,
  zwz,
  zwzw,
  zwzx,
  zwzy,
  zwzz,
  zx,
  zxw,
  zxww,
  zxwx,
  zxwy,
  zxwz,
  zxx,
  zxxw,
  zxxx,
  zxxy,
  zxxz,
  zxy,
  zxyw,
  zxyx,
  zxyy,
  zxyz,
  zxz,
  zxzw,
  zxzx,
  zxzy,
  zxzz,
  zy,
  zyw,
  zyww,
  zywx,
  zywy,
  zywz,
  zyx,
  zyxw,
  zyxx,
  zyxy,
  zyxz,
  zyy,
  zyyw,
  zyyx,
  zyyy,
  zyyz,
  zyz,
  zyzw,
  zyzx,
  zyzy,
  zyzz,
  zz,
  zzw,
  zzww,
  zzwx,
  zzwy,
  zzwz,
  zzx,
  zzxw,
  zzxx,
  zzxy,
  zzxz,
  zzy,
  zzyw,
  zzyx,
  zzyy,
  zzyz,
  zzz,
  zzzw,
  zzzx,
  zzzy,
  zzzz
};
/*! Bundled license information:

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

mediabunny/dist/modules/src/misc.js:
mediabunny/dist/modules/src/tags.js:
mediabunny/dist/modules/src/codec.js:
mediabunny/dist/modules/src/muxer.js:
mediabunny/dist/modules/src/codec-data.js:
mediabunny/dist/modules/src/writer.js:
mediabunny/dist/modules/src/target.js:
mediabunny/dist/modules/src/ogg/ogg-misc.js:
mediabunny/dist/modules/src/ogg/ogg-reader.js:
mediabunny/dist/modules/src/ogg/ogg-muxer.js:
mediabunny/dist/modules/src/custom-coder.js:
mediabunny/dist/modules/src/packet.js:
mediabunny/dist/modules/src/pcm.js:
mediabunny/dist/modules/src/sample.js:
mediabunny/dist/modules/src/output-format.js:
mediabunny/dist/modules/src/encode.js:
mediabunny/dist/modules/src/media-source.js:
mediabunny/dist/modules/src/output.js:
mediabunny/dist/modules/src/index.js:
  (*!
   * Copyright (c) 2025-present, Vanilagy and contributors
   *
   * This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at https://mozilla.org/MPL/2.0/.
   *)
*/
