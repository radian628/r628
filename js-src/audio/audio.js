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

// src/range.ts
function range(hi) {
  let arr = [];
  for (let i = 0; i < hi && i < 1e7; i++) {
    arr.push(i);
  }
  return arr;
}

// node_modules/mediabunny/dist/modules/src/misc.js
function assert(x) {
  if (!x) {
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
var isAllowSharedBufferSource = (x) => {
  return x instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && x instanceof SharedArrayBuffer || ArrayBuffer.isView(x);
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
var assertNever = (x) => {
  throw new Error(`Unexpected value: ${x}`);
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
var ilog = (x) => {
  let ret = 0;
  while (x) {
    ret++;
    x >>= 1;
  }
  return ret;
};
var ISO_639_2_REGEX = /^[a-z]{3}$/;
var isIso639Dash2LanguageCode = (x) => {
  return ISO_639_2_REGEX.test(x);
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
      codecStrings: this.trackDatas.map((x) => x.codecInfo.codec)
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
      if (!track.source._closed && !this.trackDatas.some((x) => x.track === track)) {
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
    const granulePosition = trackData.currentLacingValues.every((x) => x === 255) ? -1 : trackData.currentGranulePosition;
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
var isAudioData = (x) => {
  return typeof AudioData !== "undefined" && x instanceof AudioData;
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
      const MatchingCustomEncoder = customAudioEncoders.find((x) => x.supports(this.encodingConfig.codec, encoderConfig));
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
      const promises = this._tracks.map((x) => x.source._flushOrWaitForOngoingClose(true));
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
      const promises = this._tracks.map((x) => x.source._flushOrWaitForOngoingClose(false));
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
    range(duration * sampleRate).map((x) => f(x / sampleRate, x))
  );
  return {
    sampleRate,
    channels: [data, new Float32Array(data)]
  };
}
function envelope(duration, f, sampleRate = 44100) {
  return signal(duration, (x) => f(x / duration), sampleRate);
}
function sine(duration, freq, amp, phase = 0, sampleRate = 44100) {
  return signal(
    duration,
    (x) => Math.sin((x - phase) * Math.PI * 2 * freq) * amp
  );
}
function square(duration, freq, amp, phase = 0, sampleRate = 44100) {
  return signal(
    duration,
    (x) => (x + 1 - phase % 1) % (1 / freq) * 2 * freq > 1 ? -amp : amp
  );
}
function saw(duration, freq, amp, phase = 0, sampleRate = 44100) {
  return signal(
    duration,
    (x) => ((x + 1 - phase % 1) % (1 / freq) * freq * 2 - 1) * amp
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
    (x) => {
      if (x < a) {
        return rescale(x, 0, a, 0, ag);
      }
      if (x < a + d) {
        return rescale(x, a, a + d, ag, dg);
      }
      if (x < a + d + s) {
        return rescale(x, a + d, a + d + s, dg, sg);
      }
      return rescale(x, a + d + s, a + d + s + r, sg, rg);
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
      let x = i / c.length * width;
      let y = rescale(c[i], 1, -1, miny, maxy);
      ctx?.lineTo(x, y);
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
export {
  add,
  adsr,
  constant,
  convolve,
  envelope,
  getOgg,
  graphAudio,
  modulateGain,
  modulateSampleTime,
  monoToStereo,
  play,
  resample,
  saw,
  scaleDuration,
  signal,
  silence,
  sine,
  slice,
  square
};
/*! Bundled license information:

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
