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

// src/interpolation.ts
function lerp(x, a, b) {
  return a * (1 - x) + b * x;
}
function unlerp(x, a, b) {
  return (x - a) / (b - a);
}
function rescale(x, a1, b1, a2, b2) {
  return lerp(unlerp(x, a1, b1), a2, b2);
}
function clamp(x, lo, hi) {
  return Math.max(Math.min(x, hi), lo);
}
function modulo(a, b) {
  return a - b * Math.floor(a / b);
}

// src/math/intersections.ts
function rangeIntersects(a1, a2, b1, b2) {
  return !(a1 > b2 || b1 > a2);
}

// src/range.ts
function range(hi) {
  let arr = [];
  for (let i = 0; i < hi && i < 1e7; i++) {
    arr.push(i);
  }
  return arr;
}
function smartRangeMap(n, cb) {
  const a = range(n);
  const res1 = a.map((i, index, arr) => {
    return {
      remap(lo, hi, inclEnd) {
        return i / (inclEnd ? n - 1 : n) * (hi - lo) + lo;
      },
      remapCenter(lo, hi) {
        return (i + 1) / (n + 1) * (hi - lo) + lo;
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
      next: i + 1,
      end: () => i === n - 1,
      start: () => i === 0
    };
  });
  const res = res1.map(cb);
  return res;
}
function smartRange(n) {
  return smartRangeMap(n, id);
}
function id(x) {
  return x;
}
function rand(lo, hi, random) {
  if (!random) random = () => Math.random();
  return random() * (hi - lo) + lo;
}

// src/1d-spatial-hash-table.ts
var OneDimensionalSpatialHashTable = class {
  constructor(bucketCount, start, end, getBounds) {
    this.start = start;
    this.end = end;
    this.buckets = range(bucketCount).map(() => /* @__PURE__ */ new Set());
    this.objects = /* @__PURE__ */ new Map();
    this.getBounds = getBounds;
  }
  positionToBucketIndex(pos) {
    return modulo(
      Math.floor(rescale(pos, this.start, this.end, 0, this.buckets.length)),
      this.buckets.length
    );
  }
  rangeToBucketSet(start, end) {
    if (end - start >= this.end - this.start) {
      return this.buckets;
    } else {
      const bucketStart = this.positionToBucketIndex(start);
      const bucketEnd = this.positionToBucketIndex(end);
      if (bucketStart >= bucketEnd) {
        return this.buckets.slice(bucketStart).concat(this.buckets.slice(0, bucketEnd + 1));
      } else {
        return this.buckets.slice(bucketStart, bucketEnd + 1);
      }
    }
  }
  add(t) {
    const bounds = this.getBounds(t);
    const buckets = this.rangeToBucketSet(bounds.start, bounds.end);
    for (const b of buckets) b.add(t);
    this.objects.set(t, { buckets });
  }
  delete(t) {
    const obj = this.objects.get(t);
    for (const bkt of obj.buckets) {
      bkt.delete(t);
    }
  }
  query(start, end) {
    const buckets = this.rangeToBucketSet(start, end);
    return new Set(
      buckets.flatMap((b) => Array.from(b)).filter((e) => {
        const bounds = this.getBounds(e);
        return rangeIntersects(bounds.start, bounds.end, start, end);
      })
    );
  }
};

// src/array-utils.ts
function argmax(arr, f) {
  let maxFound = -Infinity;
  let maxElement = arr[0];
  for (const e of arr) {
    const val = f(e);
    if (val > maxFound) {
      maxElement = e;
      maxFound = val;
    }
  }
  return maxElement;
}
function argmin(arr, f) {
  return argmax(arr, (t) => -f(t));
}

// src/array-map.ts
var ArrayMap = class _ArrayMap {
  constructor() {
    this.maps = /* @__PURE__ */ new Map();
  }
  nthMap(n) {
    let map = this.maps.get(n);
    if (!map) {
      if (n !== 0) {
        map = /* @__PURE__ */ new Map();
        this.maps.set(n, map);
      } else {
        return void 0;
      }
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
    if (path.length === 0) return this.maps.has(0);
    let map = this.nthMap(path.length);
    for (const p of path) {
      map = map.get(p);
      if (!map) return false;
    }
    return true;
  }
  delete(path) {
    if (path.length === 0) {
      const item2 = this.maps.get(0);
      this.maps.delete(0);
      return item2;
    }
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
    if (path.length === 0) {
      this.maps.set(0, cb(this.maps.get(0)));
      return;
    }
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
  if (!serializeParams) serializeParams = (x) => x;
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

// src/object-utils.ts
function arrayToMapKeys(arr, f) {
  return new Map(arr.map((x) => [x, f(x)]));
}
function arrayToObjKeys(arr, f) {
  return map2obj(arrayToMapKeys(arr, f));
}
function mapObjValues(obj, callback) {
  return mapObjEntries(obj, (k, v) => [k, callback(k, v)]);
}
function mapObjEntries(obj, callback) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => callback(k, v))
  );
}
function map2obj(map) {
  return Object.fromEntries(map.entries());
}
var ALL = Symbol("allKeys");
var _ALL = Symbol("all2");

// src/audio/stream-audio.ts
var import_fft = __toESM(require_fft());
function createTrack(channels, sampleRate, constituents) {
  const maxlen = Math.max(
    ...constituents.map((c) => c.start + c.audio.duration)
  );
  const sht = new OneDimensionalSpatialHashTable(constituents.length, 0, maxlen, (a) => ({
    start: a.start,
    end: a.start + a.audio.duration
  }));
  for (const c of constituents) sht.add(c);
  return new AudioStream({
    channels,
    sampleRate,
    duration: maxlen,
    async getRange(start, count) {
      const startTime = start / sampleRate;
      const endTime = (start + count) / sampleRate;
      const audio = sht.query(startTime, endTime);
      const out = {};
      const inputs = await Promise.all(
        [...audio].map(
          (e) => e.audio.getRange(start - Math.ceil(e.start * sampleRate), count)
        )
      );
      for (const ch of channels) {
        const a = new Float32Array(count);
        for (const inp of inputs) {
          for (let i = 0; i < count; i++) {
            a[i] += inp[ch][i] ?? 0;
          }
        }
        out[ch] = a;
      }
      return out;
    }
  });
}
var AudioStream = class _AudioStream {
  constructor(params) {
    this.getRange = async (start, count) => {
      const estimatedLength = Math.ceil(this.sampleRate * this.duration);
      const clampedStart = clamp(start, 0, estimatedLength);
      const clampedEnd = clamp(start + count, 0, estimatedLength);
      const range2 = await params.getRange(
        clampedStart,
        clampedEnd - clampedStart
      );
      if (clampedEnd - clampedStart == count) return range2;
      const out = {};
      const padStart = -Math.min(0, start);
      for (const ch of this.channels) {
        console.log("eeeee", count);
        const o = new Float32Array(count);
        const i = range2[ch];
        for (let idx = 0; idx < i.length; idx++) {
          o[idx + padStart] = i[idx];
        }
        out[ch] = o;
      }
      return out;
    };
    this.duration = params.duration;
    this.sampleRate = params.sampleRate;
    this.channels = params.channels;
  }
  gain(gain) {
    return combineAudio(
      this.channels,
      this.sampleRate,
      [this, gain],
      (time, sample, a, g) => mapObjValues(a, (k, x) => x * g[k]),
      this.duration
    );
  }
  add(stream) {
    return combineAudio(
      this.channels,
      this.sampleRate,
      [this, stream],
      (time, sample, a, b) => mapObjValues(a, (k, x) => x + b[k])
    );
  }
  clip(start, end) {
    return new _AudioStream({
      channels: this.channels,
      duration: end - start,
      sampleRate: this.sampleRate,
      getRange: (start2, count2) => {
        return this.getRange(
          start2 + Math.floor(start * this.sampleRate),
          count2
        );
      }
    });
  }
  convolve(_kernel) {
    const kernel = broadcastTo(this.channels, this.sampleRate, _kernel);
    const kernelSampleCount = Math.ceil(kernel.duration * kernel.sampleRate);
    const kernelData = kernel.getRange(0, kernelSampleCount);
    return new _AudioStream({
      channels: this.channels,
      duration: this.duration,
      sampleRate: this.sampleRate,
      getRange: async (start, count) => {
        const kern = await kernelData;
        return mapObjValues(
          await this.getRange(start, count + kernelSampleCount),
          (ch, v) => overlapSaveConvolve(
            new Float32Array(v),
            new Float32Array(kern[ch])
          ).slice(0, count)
        );
      }
    });
  }
  preload() {
    const bufs = this.getRange(0, Math.ceil(this.duration * this.sampleRate));
    return new _AudioStream({
      channels: this.channels,
      duration: this.duration,
      sampleRate: this.sampleRate,
      getRange: async (start, count) => {
        const bufs2 = await bufs;
        return mapObjValues(bufs2, (k, v) => v.slice(start, start + count));
      }
    });
  }
};
function fft(x) {
  const f = new import_fft.default(x.length);
  const out = f.createComplexArray();
  const data = f.toComplexArray(x);
  f.transform(out, data);
  return new Float32Array(out);
}
function ifft(x) {
  const f = new import_fft.default(x.length / 2);
  const out = f.createComplexArray();
  f.inverseTransform(out, x);
  return new Float32Array(range(out.length / 2).map((i) => out[i * 2]));
}
function fftConvolve(x, h) {
  const arr1 = fft(x);
  const arr2 = fft(h);
  let out = new Float32Array(arr1.length);
  for (let i = 0; i < arr1.length; i += 2) {
    out[i] = arr1[i] * arr2[i] - arr1[i + 1] * arr2[i + 1];
    out[i + 1] = arr1[i] * arr2[i + 1] + arr1[i + 1] * arr2[i];
  }
  return ifft(out);
}
function nextPowerOfTwo(x) {
  return Math.pow(2, Math.ceil(Math.log2(x)));
}
function zeroPad(x, length) {
  if (x.length === length) return x;
  const y = new Float32Array(length);
  for (let i = 0; i < x.length; i++) {
    y[i] = x[i];
  }
  return y;
}
var powersOfTwo = range(31).map((i) => 2 ** (i + 1));
var getOptimumOverlapSaveFilterSize = memo((M) => {
  const cost = (M2, N) => N * Math.log2(N + 1) / (N - M2 + 1);
  return argmin(
    powersOfTwo.filter((N) => cost(M, N) > 0),
    (N) => cost(M, N)
  );
});
function overlapSaveConvolve(x, h) {
  const M = h.length;
  const N = getOptimumOverlapSaveFilterSize(M);
  const kernel = zeroPad(h, N);
  const L = N - M + 1;
  const blockcount = Math.ceil(x.length / L);
  const dst = new Float32Array(L * blockcount);
  for (let i = 0; i < blockcount; i++) {
    const position = L * i;
    const xslice = zeroPad(x.slice(position, position + N), N);
    const convolved = fftConvolve(xslice, kernel);
    for (let j = 0; j < L; j++) {
      dst[position + j] = convolved[M + j - 1];
    }
  }
  return dst.slice(0, x.length);
}
function createSignal(params) {
  const constr = params.constructors;
  const constructors = constr instanceof Function ? arrayToObjKeys(params.channels, (k) => (t, c) => constr(t, c)[k]) : constr;
  return new AudioStream({
    channels: params.channels,
    async getRange(start, count) {
      return mapObjEntries(constructors, (k, v) => [
        k,
        new Float32Array(
          range(count).map((s) => {
            return v((s + start) / this.sampleRate, s + start);
          })
        )
      ]);
    },
    sampleRate: params.sampleRate,
    duration: params.duration
  });
}
function sameSignalOnData(sampleRate, channels, duration, f) {
  return createSignal({
    channels,
    duration,
    sampleRate,
    length: Math.ceil(duration * sampleRate),
    constructors: arrayToObjKeys(channels, () => f)
  });
}
function waveform(sampleRate, channels, seconds, frequency, amplitude, phase, profile) {
  return sameSignalOnData(
    sampleRate,
    channels,
    seconds,
    (t) => amplitude * profile((t * frequency + phase) % 1)
  );
}
async function getRangeAndResample(src2, dstStart, dstCount, dstSampleRate) {
  if (src2.sampleRate === dstSampleRate) {
    return await src2.getRange(dstStart, dstCount);
  }
  const startSeconds = dstStart / dstSampleRate;
  const durationSeconds = dstCount / dstSampleRate;
  const srcStart = Math.floor(startSeconds * src2.sampleRate);
  const srcCount = Math.ceil((startSeconds + durationSeconds) * src2.sampleRate);
  const srcRange = await src2.getRange(srcStart, srcCount - srcStart);
  return mapObjValues(srcRange, (k, v) => {
    return new Float32Array(
      range(dstCount).map((dstIndex) => {
        const time = dstIndex / dstSampleRate;
        const sourceIndex = time * src2.sampleRate;
        const srcSamplePrev = Math.floor(sourceIndex);
        const srcSampleNext = srcSamplePrev + 1;
        return lerp(sourceIndex % 1, v[srcSamplePrev], v[srcSampleNext]);
      })
    );
  });
}
function resample(audio, targetSampleRate) {
  return combineAudio(
    audio.channels,
    targetSampleRate,
    [audio],
    (time, sample, ch) => ch
  );
}
function combineAudio(channels, sampleRate, audio, f, customDuration) {
  const duration = customDuration ? customDuration : Math.max(...audio.map((a) => a.duration));
  const length = Math.ceil(duration * sampleRate);
  const stream = new AudioStream({
    channels,
    duration,
    sampleRate,
    async getRange(start, count) {
      const ranges = await Promise.all(
        audio.map(
          async (a) => mapObjValues(
            await getRangeAndResample(
              a,
              start,
              count,
              sampleRate
            ),
            (k, v) => new Float32Array(v)
          )
        )
      );
      const ch = arrayToObjKeys(
        channels,
        (k) => new Float32Array(count)
      );
      for (const i of range(count)) {
        const samples = ranges.map((r, j) => {
          if (audio[j].channels.length === 1 && audio[j].channels[0] === "center") {
            return arrayToObjKeys(channels, () => r.center[i]);
          }
          return mapObjValues(r, (k, v) => v[i]);
        });
        const res = f(
          (start + i) / sampleRate,
          start + i,
          ...samples
        );
        for (const c of channels) {
          ch[c][i] = res[c];
        }
      }
      return ch;
    }
  });
  return stream;
}
function broadcastTo(channels, sampleRate, mono) {
  return combineAudio(channels, sampleRate, [mono], (_, __, x) => x);
}
function lowPassFilterSample(n, N, m) {
  return 1 / N * range(m * 2 + 1).map((i) => Math.cos(2 * Math.PI * (i - m) / N * n)).reduce((a, b) => a + b, 0);
}
function hannSample(n, N) {
  return Math.sin(Math.PI * (n - N / 2) / N) ** 2;
}
var createLowPassFilter = memo(
  (channels, sampleRate, freq, cycles) => {
    const oneCycleSampleCount = Math.ceil(1 / freq * sampleRate);
    const sampleCount = oneCycleSampleCount * cycles;
    const duration = sampleCount / sampleRate;
    console.log("created lpf");
    const cutoff = cycles;
    return createSignal({
      duration,
      sampleRate,
      channels,
      length: sampleCount,
      constructors: arrayToObjKeys(
        channels,
        () => (t, s) => lowPassFilterSample(s, sampleCount, cutoff) * hannSample(s, sampleCount)
      )
    }).preload();
  }
);
var AudioBuilder = class {
  constructor(channels, sampleRate) {
    this.channels = channels;
    this.sampleRate = sampleRate;
  }
  lpf(freq, cycles = 16) {
    return createLowPassFilter(
      this.channels,
      this.sampleRate,
      freq,
      cycles
    );
  }
  signal(duration, constructors) {
    return createSignal({
      sampleRate: this.sampleRate,
      channels: this.channels,
      constructors,
      duration,
      length: Math.ceil(duration * this.sampleRate)
    });
  }
  waveform(frequency, amplitude, phase, profile) {
    return waveform(
      this.sampleRate,
      this.channels,
      Infinity,
      frequency,
      amplitude,
      phase,
      profile
    );
  }
  constant(x) {
    return createSignal({
      sampleRate: this.sampleRate,
      channels: this.channels,
      duration: Infinity,
      length: Infinity,
      constructors: arrayToObjKeys(this.channels, () => () => x)
    });
  }
  sine(frequency, amplitude = 1, phase = 0) {
    return this.waveform(
      frequency,
      amplitude,
      phase,
      (x) => Math.sin(x * Math.PI * 2)
    );
  }
  square(frequency, amplitude = 1, phase = 0) {
    return this.waveform(
      frequency,
      amplitude,
      phase,
      (x) => x > 0.5 ? -1 : 1
    );
  }
  saw(frequency, amplitude = 1, phase = 0) {
    return this.waveform(frequency, amplitude, phase, (x) => x * 2 - 1);
  }
  noise(amplitude = 1) {
    return createSignal({
      sampleRate: this.sampleRate,
      channels: this.channels,
      duration: Infinity,
      length: Infinity,
      constructors: arrayToObjKeys(
        this.channels,
        () => () => (Math.random() * 2 - 1) * amplitude
      )
    });
  }
  adsrgen(a, d, s, r) {
    return (at, dt, st, rt) => {
      return sameSignalOnData(this.sampleRate, this.channels, rt, (t) => {
        if (t < at) return rescale(t, 0, at, 0, a);
        if (t < dt) return rescale(t, at, dt, a, d);
        if (t < st) return rescale(t, dt, st, d, s);
        if (t < rt) return rescale(t, st, rt, s, r);
        return 0;
      });
    };
  }
  boxcar(length, area = 1) {
    const sampleCount = Math.ceil(length * this.sampleRate);
    return this.constant(area / sampleCount).clip(
      0,
      sampleCount / this.sampleRate
    );
  }
  adsr(a, at, d, dt, s, st, r, rt) {
    return this.adsrgen(a, d, s, r)(at, dt, st, rt);
  }
  broadcast(mono) {
    return broadcastTo(this.channels, this.sampleRate, mono);
  }
  createTrack(constituents) {
    return createTrack(this.channels, this.sampleRate, constituents);
  }
};
async function playStereo(audio) {
  const ctx = new AudioContext();
  const src2 = ctx.createBufferSource();
  const len = Math.ceil(audio.sampleRate * audio.duration);
  const buf = ctx.createBuffer(2, len, audio.sampleRate);
  const range2 = await audio.getRange(0, len);
  buf.copyToChannel(new Float32Array(range2.left), 0);
  buf.copyToChannel(new Float32Array(range2.right), 1);
  src2.buffer = buf;
  src2.connect(ctx.destination);
  src2.start();
}
function isWorklet() {
  return eval("globalThis.registerProcessor") !== void 0;
}
var BLOCKSIZE = 8192;
async function initBufferStreamerWorklet(src) {
  if (isWorklet()) {
    eval("registerProcessor")(
      "buffer-streamer",
      class extends eval("AudioWorkletProcessor") {
        constructor() {
          super();
          this.buffers = [];
          this.offsetIntoCurrentBuffer = 0;
          this.port.onmessage = async (e) => {
            const data = e.data;
            if (data.type === "buffer") {
              this.buffers.push({
                left: new Float32Array(data.buffers.left),
                right: new Float32Array(data.buffers.right)
              });
            }
          };
        }
        process(inputs, outputs, parameters) {
          const output = outputs[0];
          const outputLength = output[0].length;
          for (let i = 0; i < outputLength; i++) {
            if (this.buffers.length > 0) {
              output[0][i] = this.buffers[0].left[this.offsetIntoCurrentBuffer];
              if (output[1]) {
                output[1][i] = this.buffers[0].right[this.offsetIntoCurrentBuffer];
              }
              this.offsetIntoCurrentBuffer++;
              if (this.offsetIntoCurrentBuffer >= this.buffers[0]?.left.length) {
                this.offsetIntoCurrentBuffer = 0;
                this.buffers.shift();
              }
            } else {
              output[0][i] = 0;
              if (output[1]) {
                output[1][i] = 0;
              }
            }
          }
          return true;
        }
      }
    );
  } else {
    return async (ctx) => {
      await ctx.audioWorklet.addModule(src);
      return () => {
        const worklet = new AudioWorkletNode(ctx, "buffer-streamer");
        return {
          worklet,
          pushData(left, right) {
            worklet.port.postMessage(
              {
                type: "buffer",
                buffers: {
                  left: left.buffer,
                  right: right.buffer
                }
              },
              [left.buffer, right.buffer]
            );
          }
        };
      };
    };
  }
}
var CHUNKSIZE = 2048 * 16;
function streamAudioToWorklet(stream, bs) {
  let t = 0;
  const loop = async () => {
    const { left, right } = await stream.getRange(t, CHUNKSIZE);
    bs.pushData(new Float32Array(left), new Float32Array(right));
    t += CHUNKSIZE;
    if (t <= Math.max(stream.duration * stream.sampleRate)) {
      setTimeout(loop);
    }
  };
  loop();
}
function displayAudioSamples(samples, size, amp = 1) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = size[0];
  canvas.height = size[1];
  ctx.beginPath();
  for (const i of smartRange(samples.length)) {
    ctx.lineTo(
      i.remap(0, canvas.width),
      rescale(samples[i.i], -amp, amp, 0, size[1])
    );
  }
  ctx.stroke();
  return canvas;
}
async function displayAudio(stream, amp = 1, res = [1e3, 200], chunks = 1) {
  const len = Math.ceil(stream.duration * stream.sampleRate);
  const left = new Float32Array(len);
  const right = new Float32Array(len);
  let divisions = smartRange(chunks + 1).map(
    (c) => Math.floor(c.remap(0, len, true))
  );
  for (let i of range(chunks)) {
    const audio = await stream.getRange(
      divisions[i],
      divisions[i + 1] - divisions[i]
    );
    const l = new Float32Array(audio.left);
    const r = new Float32Array(audio.right);
    for (let j = 0; j < l.length; j++) {
      left[j + divisions[i]] = l[j];
      right[j + divisions[i]] = r[j];
    }
  }
  return [
    displayAudioSamples(left, res, amp),
    displayAudioSamples(right, res, amp)
  ];
}
export {
  AudioBuilder,
  AudioStream,
  createSignal,
  createTrack,
  displayAudio,
  displayAudioSamples,
  initBufferStreamerWorklet,
  isWorklet,
  playStereo,
  streamAudioToWorklet
};
