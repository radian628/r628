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

// node_modules/wgsl_reflect/wgsl_reflect.node.js
var require_wgsl_reflect_node = __commonJS({
  "node_modules/wgsl_reflect/wgsl_reflect.node.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var e = class {
      constructor(e2, t2) {
        this.name = e2, this.attributes = t2, this.size = 0;
      }
      get isArray() {
        return false;
      }
      get isStruct() {
        return false;
      }
      get isTemplate() {
        return false;
      }
      get isPointer() {
        return false;
      }
      getTypeName() {
        return this.name;
      }
    };
    var t = class {
      constructor(e2, t2, n2) {
        this.name = e2, this.type = t2, this.attributes = n2, this.offset = 0, this.size = 0;
      }
      get isArray() {
        return this.type.isArray;
      }
      get isStruct() {
        return this.type.isStruct;
      }
      get isTemplate() {
        return this.type.isTemplate;
      }
      get align() {
        return this.type.isStruct ? this.type.align : 0;
      }
      get members() {
        return this.type.isStruct ? this.type.members : null;
      }
      get format() {
        return this.type.isArray || this.type.isTemplate ? this.type.format : null;
      }
      get count() {
        return this.type.isArray ? this.type.count : 0;
      }
      get stride() {
        return this.type.isArray ? this.type.stride : this.size;
      }
    };
    var n = class extends e {
      constructor(e2, t2) {
        super(e2, t2), this.members = [], this.align = 0, this.startLine = -1, this.endLine = -1, this.inUse = false;
      }
      get isStruct() {
        return true;
      }
    };
    var s = class extends e {
      constructor(e2, t2) {
        super(e2, t2), this.count = 0, this.stride = 0;
      }
      get isArray() {
        return true;
      }
      getTypeName() {
        return `array<${this.format.getTypeName()}, ${this.count}>`;
      }
    };
    var r = class extends e {
      constructor(e2, t2, n2) {
        super(e2, n2), this.format = t2;
      }
      get isPointer() {
        return true;
      }
      getTypeName() {
        return `&${this.format.getTypeName()}`;
      }
    };
    var o = class extends e {
      constructor(e2, t2, n2, s2) {
        super(e2, n2), this.format = t2, this.access = s2;
      }
      get isTemplate() {
        return true;
      }
      getTypeName() {
        let e2 = this.name;
        if (null !== this.format) {
          if ("vec2" === e2 || "vec3" === e2 || "vec4" === e2 || "mat2x2" === e2 || "mat2x3" === e2 || "mat2x4" === e2 || "mat3x2" === e2 || "mat3x3" === e2 || "mat3x4" === e2 || "mat4x2" === e2 || "mat4x3" === e2 || "mat4x4" === e2) {
            if ("f32" === this.format.name) return e2 += "f", e2;
            if ("i32" === this.format.name) return e2 += "i", e2;
            if ("u32" === this.format.name) return e2 += "u", e2;
            if ("bool" === this.format.name) return e2 += "b", e2;
            if ("f16" === this.format.name) return e2 += "h", e2;
          }
          e2 += `<${this.format.name}>`;
        } else if ("vec2" === e2 || "vec3" === e2 || "vec4" === e2) return e2;
        return e2;
      }
    };
    var a;
    exports.ResourceType = void 0, (a = exports.ResourceType || (exports.ResourceType = {}))[a.Uniform = 0] = "Uniform", a[a.Storage = 1] = "Storage", a[a.Texture = 2] = "Texture", a[a.Sampler = 3] = "Sampler", a[a.StorageTexture = 4] = "StorageTexture";
    var i = class {
      constructor(e2, t2, n2, s2, r2, o2, a2) {
        this.name = e2, this.type = t2, this.group = n2, this.binding = s2, this.attributes = r2, this.resourceType = o2, this.access = a2;
      }
      get isArray() {
        return this.type.isArray;
      }
      get isStruct() {
        return this.type.isStruct;
      }
      get isTemplate() {
        return this.type.isTemplate;
      }
      get size() {
        return this.type.size;
      }
      get align() {
        return this.type.isStruct ? this.type.align : 0;
      }
      get members() {
        return this.type.isStruct ? this.type.members : null;
      }
      get format() {
        return this.type.isArray || this.type.isTemplate ? this.type.format : null;
      }
      get count() {
        return this.type.isArray ? this.type.count : 0;
      }
      get stride() {
        return this.type.isArray ? this.type.stride : this.size;
      }
    };
    var l = class {
      constructor(e2, t2) {
        this.name = e2, this.type = t2;
      }
    };
    var c = class {
      constructor(e2, t2, n2, s2) {
        this.name = e2, this.type = t2, this.locationType = n2, this.location = s2, this.interpolation = null;
      }
    };
    var u = class {
      constructor(e2, t2, n2, s2) {
        this.name = e2, this.type = t2, this.locationType = n2, this.location = s2;
      }
    };
    var h = class {
      constructor(e2, t2, n2, s2) {
        this.name = e2, this.type = t2, this.attributes = n2, this.id = s2;
      }
    };
    var f = class {
      constructor(e2, t2, n2) {
        this.name = e2, this.type = t2, this.attributes = n2;
      }
    };
    var p = class {
      constructor(e2, t2 = null, n2) {
        this.stage = null, this.inputs = [], this.outputs = [], this.arguments = [], this.returnType = null, this.resources = [], this.overrides = [], this.startLine = -1, this.endLine = -1, this.inUse = false, this.calls = /* @__PURE__ */ new Set(), this.name = e2, this.stage = t2, this.attributes = n2;
      }
    };
    var d = class {
      constructor() {
        this.vertex = [], this.fragment = [], this.compute = [];
      }
    };
    function m(e2) {
      var t2 = (32768 & e2) >> 15, n2 = (31744 & e2) >> 10, s2 = 1023 & e2;
      return 0 == n2 ? (t2 ? -1 : 1) * Math.pow(2, -14) * (s2 / Math.pow(2, 10)) : 31 == n2 ? s2 ? NaN : 1 / 0 * (t2 ? -1 : 1) : (t2 ? -1 : 1) * Math.pow(2, n2 - 15) * (1 + s2 / Math.pow(2, 10));
    }
    var x = new Float32Array(1);
    var g = new Int32Array(x.buffer);
    var _ = new Uint16Array(1);
    function y(e2) {
      x[0] = e2;
      const t2 = g[0], n2 = t2 >> 31 & 1;
      let s2 = t2 >> 23 & 255, r2 = 8388607 & t2;
      if (255 === s2) return _[0] = n2 << 15 | 31744 | (0 !== r2 ? 512 : 0), _[0];
      if (0 === s2) {
        if (0 === r2) return _[0] = n2 << 15, _[0];
        r2 |= 8388608;
        let e3 = 113;
        for (; !(8388608 & r2); ) r2 <<= 1, e3--;
        return s2 = 127 - e3, r2 &= 8388607, s2 > 0 ? (r2 = (r2 >> 126 - s2) + (r2 >> 127 - s2 & 1), _[0] = n2 << 15 | s2 << 10 | r2 >> 13, _[0]) : (_[0] = n2 << 15, _[0]);
      }
      return s2 = s2 - 127 + 15, s2 >= 31 ? (_[0] = n2 << 15 | 31744, _[0]) : s2 <= 0 ? s2 < -10 ? (_[0] = n2 << 15, _[0]) : (r2 = (8388608 | r2) >> 1 - s2, _[0] = n2 << 15 | r2 >> 13, _[0]) : (r2 >>= 13, _[0] = n2 << 15 | s2 << 10 | r2, _[0]);
    }
    var b = new Uint32Array(1);
    var v = new Float32Array(b.buffer, 0, 1);
    function k(e2) {
      const t2 = 112 + (e2 >> 6 & 31) << 23 | (63 & e2) << 17;
      return b[0] = t2, v[0];
    }
    function w(e2, t2, n2, s2, r2, o2, a2, i2, l2) {
      const c2 = s2 * (a2 >>= r2) * (o2 >>= r2) + n2 * a2 + t2 * i2;
      switch (l2) {
        case "r8unorm":
          return [I(e2, c2, "8unorm", 1)[0]];
        case "r8snorm":
          return [I(e2, c2, "8snorm", 1)[0]];
        case "r8uint":
          return [I(e2, c2, "8uint", 1)[0]];
        case "r8sint":
          return [I(e2, c2, "8sint", 1)[0]];
        case "rg8unorm": {
          const t3 = I(e2, c2, "8unorm", 2);
          return [t3[0], t3[1]];
        }
        case "rg8snorm": {
          const t3 = I(e2, c2, "8snorm", 2);
          return [t3[0], t3[1]];
        }
        case "rg8uint": {
          const t3 = I(e2, c2, "8uint", 2);
          return [t3[0], t3[1]];
        }
        case "rg8sint": {
          const t3 = I(e2, c2, "8sint", 2);
          return [t3[0], t3[1]];
        }
        case "rgba8unorm-srgb":
        case "rgba8unorm": {
          const t3 = I(e2, c2, "8unorm", 4);
          return [t3[0], t3[1], t3[2], t3[3]];
        }
        case "rgba8snorm": {
          const t3 = I(e2, c2, "8snorm", 4);
          return [t3[0], t3[1], t3[2], t3[3]];
        }
        case "rgba8uint": {
          const t3 = I(e2, c2, "8uint", 4);
          return [t3[0], t3[1], t3[2], t3[3]];
        }
        case "rgba8sint": {
          const t3 = I(e2, c2, "8sint", 4);
          return [t3[0], t3[1], t3[2], t3[3]];
        }
        case "bgra8unorm-srgb":
        case "bgra8unorm": {
          const t3 = I(e2, c2, "8unorm", 4);
          return [t3[2], t3[1], t3[0], t3[3]];
        }
        case "r16uint":
          return [I(e2, c2, "16uint", 1)[0]];
        case "r16sint":
          return [I(e2, c2, "16sint", 1)[0]];
        case "r16float":
          return [I(e2, c2, "16float", 1)[0]];
        case "rg16uint": {
          const t3 = I(e2, c2, "16uint", 2);
          return [t3[0], t3[1]];
        }
        case "rg16sint": {
          const t3 = I(e2, c2, "16sint", 2);
          return [t3[0], t3[1]];
        }
        case "rg16float": {
          const t3 = I(e2, c2, "16float", 2);
          return [t3[0], t3[1]];
        }
        case "rgba16uint": {
          const t3 = I(e2, c2, "16uint", 4);
          return [t3[0], t3[1], t3[2], t3[3]];
        }
        case "rgba16sint": {
          const t3 = I(e2, c2, "16sint", 4);
          return [t3[0], t3[1], t3[2], t3[3]];
        }
        case "rgba16float": {
          const t3 = I(e2, c2, "16float", 4);
          return [t3[0], t3[1], t3[2], t3[3]];
        }
        case "r32uint":
          return [I(e2, c2, "32uint", 1)[0]];
        case "r32sint":
          return [I(e2, c2, "32sint", 1)[0]];
        case "depth16unorm":
        case "depth24plus":
        case "depth24plus-stencil8":
        case "depth32float":
        case "depth32float-stencil8":
        case "r32float":
          return [I(e2, c2, "32float", 1)[0]];
        case "rg32uint": {
          const t3 = I(e2, c2, "32uint", 2);
          return [t3[0], t3[1]];
        }
        case "rg32sint": {
          const t3 = I(e2, c2, "32sint", 2);
          return [t3[0], t3[1]];
        }
        case "rg32float": {
          const t3 = I(e2, c2, "32float", 2);
          return [t3[0], t3[1]];
        }
        case "rgba32uint": {
          const t3 = I(e2, c2, "32uint", 4);
          return [t3[0], t3[1], t3[2], t3[3]];
        }
        case "rgba32sint": {
          const t3 = I(e2, c2, "32sint", 4);
          return [t3[0], t3[1], t3[2], t3[3]];
        }
        case "rgba32float": {
          const t3 = I(e2, c2, "32float", 4);
          return [t3[0], t3[1], t3[2], t3[3]];
        }
        case "rg11b10ufloat": {
          const t3 = new Uint32Array(e2.buffer, c2, 1)[0], n3 = (4192256 & t3) >> 11, s3 = (4290772992 & t3) >> 22;
          return [k(2047 & t3), k(n3), function(e3) {
            const t4 = 112 + (e3 >> 5 & 31) << 23 | (31 & e3) << 18;
            return b[0] = t4, v[0];
          }(s3), 1];
        }
      }
      return null;
    }
    function I(e2, t2, n2, s2) {
      const r2 = [0, 0, 0, 0];
      for (let o2 = 0; o2 < s2; ++o2) switch (n2) {
        case "8unorm":
          r2[o2] = e2[t2] / 255, t2++;
          break;
        case "8snorm":
          r2[o2] = e2[t2] / 255 * 2 - 1, t2++;
          break;
        case "8uint":
          r2[o2] = e2[t2], t2++;
          break;
        case "8sint":
          r2[o2] = e2[t2] - 127, t2++;
          break;
        case "16uint":
          r2[o2] = e2[t2] | e2[t2 + 1] << 8, t2 += 2;
          break;
        case "16sint":
          r2[o2] = (e2[t2] | e2[t2 + 1] << 8) - 32768, t2 += 2;
          break;
        case "16float":
          r2[o2] = m(e2[t2] | e2[t2 + 1] << 8), t2 += 2;
          break;
        case "32uint":
        case "32sint":
          r2[o2] = e2[t2] | e2[t2 + 1] << 8 | e2[t2 + 2] << 16 | e2[t2 + 3] << 24, t2 += 4;
          break;
        case "32float":
          r2[o2] = new Float32Array(e2.buffer, t2, 1)[0], t2 += 4;
      }
      return r2;
    }
    function T(e2, t2, n2, s2, r2) {
      for (let o2 = 0; o2 < s2; ++o2) switch (n2) {
        case "8unorm":
          e2[t2] = 255 * r2[o2], t2++;
          break;
        case "8snorm":
          e2[t2] = 0.5 * (r2[o2] + 1) * 255, t2++;
          break;
        case "8uint":
          e2[t2] = r2[o2], t2++;
          break;
        case "8sint":
          e2[t2] = r2[o2] + 127, t2++;
          break;
        case "16uint":
          new Uint16Array(e2.buffer, t2, 1)[0] = r2[o2], t2 += 2;
          break;
        case "16sint":
          new Int16Array(e2.buffer, t2, 1)[0] = r2[o2], t2 += 2;
          break;
        case "16float": {
          const n3 = y(r2[o2]);
          new Uint16Array(e2.buffer, t2, 1)[0] = n3, t2 += 2;
          break;
        }
        case "32uint":
          new Uint32Array(e2.buffer, t2, 1)[0] = r2[o2], t2 += 4;
          break;
        case "32sint":
          new Int32Array(e2.buffer, t2, 1)[0] = r2[o2], t2 += 4;
          break;
        case "32float":
          new Float32Array(e2.buffer, t2, 1)[0] = r2[o2], t2 += 4;
      }
      return r2;
    }
    var S = { r8unorm: { bytesPerBlock: 1, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 1 }, r8snorm: { bytesPerBlock: 1, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 1 }, r8uint: { bytesPerBlock: 1, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 1 }, r8sint: { bytesPerBlock: 1, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 1 }, rg8unorm: { bytesPerBlock: 2, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 2 }, rg8snorm: { bytesPerBlock: 2, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 2 }, rg8uint: { bytesPerBlock: 2, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 2 }, rg8sint: { bytesPerBlock: 2, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 2 }, rgba8unorm: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, "rgba8unorm-srgb": { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, rgba8snorm: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, rgba8uint: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, rgba8sint: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, bgra8unorm: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, "bgra8unorm-srgb": { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, r16uint: { bytesPerBlock: 2, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 1 }, r16sint: { bytesPerBlock: 2, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 1 }, r16float: { bytesPerBlock: 2, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 1 }, rg16uint: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 2 }, rg16sint: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 2 }, rg16float: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 2 }, rgba16uint: { bytesPerBlock: 8, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, rgba16sint: { bytesPerBlock: 8, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, rgba16float: { bytesPerBlock: 8, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, r32uint: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 1 }, r32sint: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 1 }, r32float: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 1 }, rg32uint: { bytesPerBlock: 8, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 2 }, rg32sint: { bytesPerBlock: 8, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 2 }, rg32float: { bytesPerBlock: 8, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 2 }, rgba32uint: { bytesPerBlock: 16, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, rgba32sint: { bytesPerBlock: 16, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, rgba32float: { bytesPerBlock: 16, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, rgb10a2uint: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, rgb10a2unorm: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, rg11b10ufloat: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, stencil8: { bytesPerBlock: 1, blockWidth: 1, blockHeight: 1, isCompressed: false, isDepthStencil: true, hasDepth: false, hasStencil: true, channels: 1 }, depth16unorm: { bytesPerBlock: 2, blockWidth: 1, blockHeight: 1, isCompressed: false, isDepthStencil: true, hasDepth: true, hasStencil: false, channels: 1 }, depth24plus: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, isDepthStencil: true, hasDepth: true, hasStencil: false, depthOnlyFormat: "depth32float", channels: 1 }, "depth24plus-stencil8": { bytesPerBlock: 8, blockWidth: 1, blockHeight: 1, isCompressed: false, isDepthStencil: true, hasDepth: true, hasStencil: true, depthOnlyFormat: "depth32float", channels: 1 }, depth32float: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, isDepthStencil: true, hasDepth: true, hasStencil: false, channels: 1 }, "depth32float-stencil8": { bytesPerBlock: 8, blockWidth: 1, blockHeight: 1, isCompressed: false, isDepthStencil: true, hasDepth: true, hasStencil: true, stencilOnlyFormat: "depth32float", channels: 1 }, rgb9e5ufloat: { bytesPerBlock: 4, blockWidth: 1, blockHeight: 1, isCompressed: false, channels: 4 }, "bc1-rgba-unorm": { bytesPerBlock: 8, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "bc1-rgba-unorm-srgb": { bytesPerBlock: 8, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "bc2-rgba-unorm": { bytesPerBlock: 16, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "bc2-rgba-unorm-srgb": { bytesPerBlock: 16, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "bc3-rgba-unorm": { bytesPerBlock: 16, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "bc3-rgba-unorm-srgb": { bytesPerBlock: 16, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "bc4-r-unorm": { bytesPerBlock: 8, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 1 }, "bc4-r-snorm": { bytesPerBlock: 8, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 1 }, "bc5-rg-unorm": { bytesPerBlock: 16, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 2 }, "bc5-rg-snorm": { bytesPerBlock: 16, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 2 }, "bc6h-rgb-ufloat": { bytesPerBlock: 16, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "bc6h-rgb-float": { bytesPerBlock: 16, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "bc7-rgba-unorm": { bytesPerBlock: 16, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "bc7-rgba-unorm-srgb": { bytesPerBlock: 16, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "etc2-rgb8unorm": { bytesPerBlock: 8, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "etc2-rgb8unorm-srgb": { bytesPerBlock: 8, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "etc2-rgb8a1unorm": { bytesPerBlock: 8, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "etc2-rgb8a1unorm-srgb": { bytesPerBlock: 8, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "etc2-rgba8unorm": { bytesPerBlock: 16, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "etc2-rgba8unorm-srgb": { bytesPerBlock: 16, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "eac-r11unorm": { bytesPerBlock: 8, blockWidth: 1, blockHeight: 1, isCompressed: true, channels: 1 }, "eac-r11snorm": { bytesPerBlock: 8, blockWidth: 1, blockHeight: 1, isCompressed: true, channels: 1 }, "eac-rg11unorm": { bytesPerBlock: 16, blockWidth: 1, blockHeight: 1, isCompressed: true, channels: 2 }, "eac-rg11snorm": { bytesPerBlock: 16, blockWidth: 1, blockHeight: 1, isCompressed: true, channels: 2 }, "astc-4x4-unorm": { bytesPerBlock: 16, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "astc-4x4-unorm-srgb": { bytesPerBlock: 16, blockWidth: 4, blockHeight: 4, isCompressed: true, channels: 4 }, "astc-5x4-unorm": { bytesPerBlock: 16, blockWidth: 5, blockHeight: 4, isCompressed: true, channels: 4 }, "astc-5x4-unorm-srgb": { bytesPerBlock: 16, blockWidth: 5, blockHeight: 4, isCompressed: true, channels: 4 }, "astc-5x5-unorm": { bytesPerBlock: 16, blockWidth: 5, blockHeight: 5, isCompressed: true, channels: 4 }, "astc-5x5-unorm-srgb": { bytesPerBlock: 16, blockWidth: 5, blockHeight: 5, isCompressed: true, channels: 4 }, "astc-6x5-unorm": { bytesPerBlock: 16, blockWidth: 6, blockHeight: 5, isCompressed: true, channels: 4 }, "astc-6x5-unorm-srgb": { bytesPerBlock: 16, blockWidth: 6, blockHeight: 5, isCompressed: true, channels: 4 }, "astc-6x6-unorm": { bytesPerBlock: 16, blockWidth: 6, blockHeight: 6, isCompressed: true, channels: 4 }, "astc-6x6-unorm-srgb": { bytesPerBlock: 16, blockWidth: 6, blockHeight: 6, isCompressed: true, channels: 4 }, "astc-8x5-unorm": { bytesPerBlock: 16, blockWidth: 8, blockHeight: 5, isCompressed: true, channels: 4 }, "astc-8x5-unorm-srgb": { bytesPerBlock: 16, blockWidth: 8, blockHeight: 5, isCompressed: true, channels: 4 }, "astc-8x6-unorm": { bytesPerBlock: 16, blockWidth: 8, blockHeight: 6, isCompressed: true, channels: 4 }, "astc-8x6-unorm-srgb": { bytesPerBlock: 16, blockWidth: 8, blockHeight: 6, isCompressed: true, channels: 4 }, "astc-8x8-unorm": { bytesPerBlock: 16, blockWidth: 8, blockHeight: 8, isCompressed: true, channels: 4 }, "astc-8x8-unorm-srgb": { bytesPerBlock: 16, blockWidth: 8, blockHeight: 8, isCompressed: true, channels: 4 }, "astc-10x5-unorm": { bytesPerBlock: 16, blockWidth: 10, blockHeight: 5, isCompressed: true, channels: 4 }, "astc-10x5-unorm-srgb": { bytesPerBlock: 16, blockWidth: 10, blockHeight: 5, isCompressed: true, channels: 4 }, "astc-10x6-unorm": { bytesPerBlock: 16, blockWidth: 10, blockHeight: 6, isCompressed: true, channels: 4 }, "astc-10x6-unorm-srgb": { bytesPerBlock: 16, blockWidth: 10, blockHeight: 6, isCompressed: true, channels: 4 }, "astc-10x8-unorm": { bytesPerBlock: 16, blockWidth: 10, blockHeight: 8, isCompressed: true, channels: 4 }, "astc-10x8-unorm-srgb": { bytesPerBlock: 16, blockWidth: 10, blockHeight: 8, isCompressed: true, channels: 4 }, "astc-10x10-unorm": { bytesPerBlock: 16, blockWidth: 10, blockHeight: 10, isCompressed: true, channels: 4 }, "astc-10x10-unorm-srgb": { bytesPerBlock: 16, blockWidth: 10, blockHeight: 10, isCompressed: true, channels: 4 }, "astc-12x10-unorm": { bytesPerBlock: 16, blockWidth: 12, blockHeight: 10, isCompressed: true, channels: 4 }, "astc-12x10-unorm-srgb": { bytesPerBlock: 16, blockWidth: 12, blockHeight: 10, isCompressed: true, channels: 4 }, "astc-12x12-unorm": { bytesPerBlock: 16, blockWidth: 12, blockHeight: 12, isCompressed: true, channels: 4 }, "astc-12x12-unorm-srgb": { bytesPerBlock: 16, blockWidth: 12, blockHeight: 12, isCompressed: true, channels: 4 } };
    var C = class _C {
      constructor() {
        this.id = _C._id++, this.line = 0;
      }
      get isAstNode() {
        return true;
      }
      get astNodeType() {
        return "";
      }
      search(e2) {
        e2(this);
      }
      searchBlock(e2, t2) {
        if (e2) {
          t2(A.instance);
          for (const n2 of e2) n2 instanceof Array ? this.searchBlock(n2, t2) : n2.search(t2);
          t2(E.instance);
        }
      }
      constEvaluate(e2, t2) {
        throw new Error("Cannot evaluate node");
      }
      constEvaluateString(e2) {
        return this.constEvaluate(e2).toString();
      }
    };
    C._id = 0;
    var A = class extends C {
    };
    A.instance = new A();
    var E = class extends C {
    };
    E.instance = new E();
    var $ = /* @__PURE__ */ new Set(["all", "all", "any", "select", "arrayLength", "abs", "acos", "acosh", "asin", "asinh", "atan", "atanh", "atan2", "ceil", "clamp", "cos", "cosh", "countLeadingZeros", "countOneBits", "countTrailingZeros", "cross", "degrees", "determinant", "distance", "dot", "dot4U8Packed", "dot4I8Packed", "exp", "exp2", "extractBits", "faceForward", "firstLeadingBit", "firstTrailingBit", "floor", "fma", "fract", "frexp", "insertBits", "inverseSqrt", "ldexp", "length", "log", "log2", "max", "min", "mix", "modf", "normalize", "pow", "quantizeToF16", "radians", "reflect", "refract", "reverseBits", "round", "saturate", "sign", "sin", "sinh", "smoothStep", "sqrt", "step", "tan", "tanh", "transpose", "trunc", "dpdx", "dpdxCoarse", "dpdxFine", "dpdy", "dpdyCoarse", "dpdyFine", "fwidth", "fwidthCoarse", "fwidthFine", "textureDimensions", "textureGather", "textureGatherCompare", "textureLoad", "textureNumLayers", "textureNumLevels", "textureNumSamples", "textureSample", "textureSampleBias", "textureSampleCompare", "textureSampleCompareLevel", "textureSampleGrad", "textureSampleLevel", "textureSampleBaseClampToEdge", "textureStore", "atomicLoad", "atomicStore", "atomicAdd", "atomicSub", "atomicMax", "atomicMin", "atomicAnd", "atomicOr", "atomicXor", "atomicExchange", "atomicCompareExchangeWeak", "pack4x8snorm", "pack4x8unorm", "pack4xI8", "pack4xU8", "pack4x8Clamp", "pack4xU8Clamp", "pack2x16snorm", "pack2x16unorm", "pack2x16float", "unpack4x8snorm", "unpack4x8unorm", "unpack4xI8", "unpack4xU8", "unpack2x16snorm", "unpack2x16unorm", "unpack2x16float", "storageBarrier", "textureBarrier", "workgroupBarrier", "workgroupUniformLoad", "subgroupAdd", "subgroupExclusiveAdd", "subgroupInclusiveAdd", "subgroupAll", "subgroupAnd", "subgroupAny", "subgroupBallot", "subgroupBroadcast", "subgroupBroadcastFirst", "subgroupElect", "subgroupMax", "subgroupMin", "subgroupMul", "subgroupExclusiveMul", "subgroupInclusiveMul", "subgroupOr", "subgroupShuffle", "subgroupShuffleDown", "subgroupShuffleUp", "subgroupShuffleXor", "subgroupXor", "quadBroadcast", "quadSwapDiagonal", "quadSwapX", "quadSwapY"]);
    var L = class extends C {
      constructor() {
        super();
      }
    };
    var D = class extends L {
      constructor(e2, t2, n2, s2, r2, o2) {
        super(), this.calls = /* @__PURE__ */ new Set(), this.name = e2, this.args = t2, this.returnType = n2, this.body = s2, this.startLine = r2, this.endLine = o2;
      }
      get astNodeType() {
        return "function";
      }
      search(e2) {
        if (this.attributes) for (const t2 of this.attributes) e2(t2);
        e2(this);
        for (const t2 of this.args) e2(t2);
        this.searchBlock(this.body, e2);
      }
    };
    var O = class extends L {
      constructor(e2) {
        super(), this.expression = e2;
      }
      get astNodeType() {
        return "staticAssert";
      }
      search(e2) {
        this.expression.search(e2);
      }
    };
    var N = class extends L {
      constructor(e2, t2) {
        super(), this.condition = e2, this.body = t2;
      }
      get astNodeType() {
        return "while";
      }
      search(e2) {
        this.condition.search(e2), this.searchBlock(this.body, e2);
      }
    };
    var V = class extends L {
      constructor(e2, t2) {
        super(), this.body = e2, this.loopId = t2;
      }
      get astNodeType() {
        return "continuing";
      }
      search(e2) {
        this.searchBlock(this.body, e2);
      }
    };
    var B = class extends L {
      constructor(e2, t2, n2, s2) {
        super(), this.init = e2, this.condition = t2, this.increment = n2, this.body = s2;
      }
      get astNodeType() {
        return "for";
      }
      search(e2) {
        var t2, n2, s2;
        null === (t2 = this.init) || void 0 === t2 || t2.search(e2), null === (n2 = this.condition) || void 0 === n2 || n2.search(e2), null === (s2 = this.increment) || void 0 === s2 || s2.search(e2), this.searchBlock(this.body, e2);
      }
    };
    var F = class extends L {
      constructor(e2, t2, n2, s2, r2) {
        super(), this.attributes = null, this.name = e2, this.type = t2, this.storage = n2, this.access = s2, this.value = r2;
      }
      get astNodeType() {
        return "var";
      }
      search(e2) {
        var t2;
        e2(this), null === (t2 = this.value) || void 0 === t2 || t2.search(e2);
      }
    };
    var M = class extends L {
      constructor(e2, t2, n2) {
        super(), this.attributes = null, this.name = e2, this.type = t2, this.value = n2;
      }
      get astNodeType() {
        return "override";
      }
      search(e2) {
        var t2;
        null === (t2 = this.value) || void 0 === t2 || t2.search(e2);
      }
    };
    var U = class extends L {
      constructor(e2, t2, n2, s2, r2) {
        super(), this.attributes = null, this.name = e2, this.type = t2, this.storage = n2, this.access = s2, this.value = r2;
      }
      get astNodeType() {
        return "let";
      }
      search(e2) {
        var t2;
        e2(this), null === (t2 = this.value) || void 0 === t2 || t2.search(e2);
      }
    };
    var P = class extends L {
      constructor(e2, t2, n2, s2, r2) {
        super(), this.attributes = null, this.name = e2, this.type = t2, this.storage = n2, this.access = s2, this.value = r2;
      }
      get astNodeType() {
        return "const";
      }
      constEvaluate(e2, t2) {
        return this.value.constEvaluate(e2, t2);
      }
      search(e2) {
        var t2;
        e2(this), null === (t2 = this.value) || void 0 === t2 || t2.search(e2);
      }
    };
    var W;
    var q;
    var H;
    var z;
    exports.IncrementOperator = void 0, (W = exports.IncrementOperator || (exports.IncrementOperator = {})).increment = "++", W.decrement = "--", ((e2) => {
      e2.parse = function(t2) {
        const n2 = t2;
        if ("parse" == n2) throw new Error("Invalid value for IncrementOperator");
        return e2[n2];
      };
    })(exports.IncrementOperator || (exports.IncrementOperator = {}));
    var R = class extends L {
      constructor(e2, t2) {
        super(), this.operator = e2, this.variable = t2;
      }
      get astNodeType() {
        return "increment";
      }
      search(e2) {
        this.variable.search(e2);
      }
    };
    exports.AssignOperator = void 0, (q = exports.AssignOperator || (exports.AssignOperator = {})).assign = "=", q.addAssign = "+=", q.subtractAssin = "-=", q.multiplyAssign = "*=", q.divideAssign = "/=", q.moduloAssign = "%=", q.andAssign = "&=", q.orAssign = "|=", q.xorAssign = "^=", q.shiftLeftAssign = "<<=", q.shiftRightAssign = ">>=", (exports.AssignOperator || (exports.AssignOperator = {})).parse = (e2) => {
      const t2 = e2;
      if ("parse" == t2) throw new Error("Invalid value for AssignOperator");
      return t2;
    };
    var G = class extends L {
      constructor(e2, t2, n2) {
        super(), this.operator = e2, this.variable = t2, this.value = n2;
      }
      get astNodeType() {
        return "assign";
      }
      search(e2) {
        this.variable.search(e2), this.value.search(e2);
      }
    };
    var X = class extends L {
      constructor(e2, t2) {
        super(), this.name = e2, this.args = t2;
      }
      get astNodeType() {
        return "call";
      }
      isBuiltin() {
        return $.has(this.name);
      }
      search(e2) {
        for (const t2 of this.args) t2.search(e2);
        e2(this);
      }
    };
    var j = class extends L {
      constructor(e2, t2) {
        super(), this.body = e2, this.continuing = t2;
      }
      get astNodeType() {
        return "loop";
      }
      search(e2) {
        var t2;
        this.searchBlock(this.body, e2), null === (t2 = this.continuing) || void 0 === t2 || t2.search(e2);
      }
    };
    var Z = class extends L {
      constructor(e2, t2) {
        super(), this.condition = e2, this.cases = t2;
      }
      get astNodeType() {
        return "switch";
      }
      search(e2) {
        e2(this);
        for (const t2 of this.cases) t2.search(e2);
      }
    };
    var Q = class extends L {
      constructor(e2, t2, n2, s2) {
        super(), this.condition = e2, this.body = t2, this.elseif = n2, this.else = s2;
      }
      get astNodeType() {
        return "if";
      }
      search(e2) {
        this.condition.search(e2), this.searchBlock(this.body, e2), this.searchBlock(this.elseif, e2), this.searchBlock(this.else, e2);
      }
    };
    var Y = class extends L {
      constructor(e2) {
        super(), this.value = e2;
      }
      get astNodeType() {
        return "return";
      }
      search(e2) {
        var t2;
        null === (t2 = this.value) || void 0 === t2 || t2.search(e2);
      }
    };
    var K = class extends L {
      constructor(e2) {
        super(), this.name = e2;
      }
      get astNodeType() {
        return "enable";
      }
    };
    var J = class extends L {
      constructor(e2) {
        super(), this.extensions = e2;
      }
      get astNodeType() {
        return "requires";
      }
    };
    var ee = class extends L {
      constructor(e2, t2) {
        super(), this.severity = e2, this.rule = t2;
      }
      get astNodeType() {
        return "diagnostic";
      }
    };
    var te = class extends L {
      constructor(e2, t2) {
        super(), this.name = e2, this.type = t2;
      }
      get astNodeType() {
        return "alias";
      }
    };
    var ne = class extends L {
      constructor() {
        super();
      }
      get astNodeType() {
        return "discard";
      }
    };
    var se = class extends L {
      constructor() {
        super(), this.condition = null, this.loopId = -1;
      }
      get astNodeType() {
        return "break";
      }
    };
    var re = class extends L {
      constructor() {
        super(), this.loopId = -1;
      }
      get astNodeType() {
        return "continue";
      }
    };
    var oe = class _oe extends L {
      constructor(e2) {
        super(), this.attributes = null, this.name = e2;
      }
      get astNodeType() {
        return "type";
      }
      get isStruct() {
        return false;
      }
      get isArray() {
        return false;
      }
      static maxFormatType(e2) {
        let t2 = e2[0];
        if ("f32" === t2.name) return t2;
        for (let n2 = 1; n2 < e2.length; ++n2) {
          const s2 = _oe._priority.get(t2.name);
          _oe._priority.get(e2[n2].name) < s2 && (t2 = e2[n2]);
        }
        return "x32" === t2.name ? _oe.i32 : t2;
      }
      getTypeName() {
        return this.name;
      }
    };
    oe.x32 = new oe("x32"), oe.f32 = new oe("f32"), oe.i32 = new oe("i32"), oe.u32 = new oe("u32"), oe.f16 = new oe("f16"), oe.bool = new oe("bool"), oe.void = new oe("void"), oe._priority = /* @__PURE__ */ new Map([["f32", 0], ["f16", 1], ["u32", 2], ["i32", 3], ["x32", 3]]);
    var ae = class extends oe {
      constructor(e2) {
        super(e2);
      }
    };
    var ie = class extends oe {
      constructor(e2, t2, n2, s2) {
        super(e2), this.members = t2, this.startLine = n2, this.endLine = s2;
      }
      get astNodeType() {
        return "struct";
      }
      get isStruct() {
        return true;
      }
      getMemberIndex(e2) {
        for (let t2 = 0; t2 < this.members.length; t2++) if (this.members[t2].name == e2) return t2;
        return -1;
      }
      search(e2) {
        for (const t2 of this.members) e2(t2);
      }
    };
    var le = class extends oe {
      constructor(e2, t2, n2) {
        super(e2), this.format = t2, this.access = n2;
      }
      get astNodeType() {
        return "template";
      }
      getTypeName() {
        let e2 = this.name;
        if (null !== this.format) {
          if ("vec2" === e2 || "vec3" === e2 || "vec4" === e2 || "mat2x2" === e2 || "mat2x3" === e2 || "mat2x4" === e2 || "mat3x2" === e2 || "mat3x3" === e2 || "mat3x4" === e2 || "mat4x2" === e2 || "mat4x3" === e2 || "mat4x4" === e2) {
            if ("f32" === this.format.name) return e2 += "f", e2;
            if ("i32" === this.format.name) return e2 += "i", e2;
            if ("u32" === this.format.name) return e2 += "u", e2;
            if ("bool" === this.format.name) return e2 += "b", e2;
            if ("f16" === this.format.name) return e2 += "h", e2;
          }
          e2 += `<${this.format.name}>`;
        } else if ("vec2" === e2 || "vec3" === e2 || "vec4" === e2) return e2;
        return e2;
      }
    };
    le.vec2f = new le("vec2", oe.f32, null), le.vec3f = new le("vec3", oe.f32, null), le.vec4f = new le("vec4", oe.f32, null), le.vec2i = new le("vec2", oe.i32, null), le.vec3i = new le("vec3", oe.i32, null), le.vec4i = new le("vec4", oe.i32, null), le.vec2u = new le("vec2", oe.u32, null), le.vec3u = new le("vec3", oe.u32, null), le.vec4u = new le("vec4", oe.u32, null), le.vec2h = new le("vec2", oe.f16, null), le.vec3h = new le("vec3", oe.f16, null), le.vec4h = new le("vec4", oe.f16, null), le.vec2b = new le("vec2", oe.bool, null), le.vec3b = new le("vec3", oe.bool, null), le.vec4b = new le("vec4", oe.bool, null), le.mat2x2f = new le("mat2x2", oe.f32, null), le.mat2x3f = new le("mat2x3", oe.f32, null), le.mat2x4f = new le("mat2x4", oe.f32, null), le.mat3x2f = new le("mat3x2", oe.f32, null), le.mat3x3f = new le("mat3x3", oe.f32, null), le.mat3x4f = new le("mat3x4", oe.f32, null), le.mat4x2f = new le("mat4x2", oe.f32, null), le.mat4x3f = new le("mat4x3", oe.f32, null), le.mat4x4f = new le("mat4x4", oe.f32, null), le.mat2x2h = new le("mat2x2", oe.f16, null), le.mat2x3h = new le("mat2x3", oe.f16, null), le.mat2x4h = new le("mat2x4", oe.f16, null), le.mat3x2h = new le("mat3x2", oe.f16, null), le.mat3x3h = new le("mat3x3", oe.f16, null), le.mat3x4h = new le("mat3x4", oe.f16, null), le.mat4x2h = new le("mat4x2", oe.f16, null), le.mat4x3h = new le("mat4x3", oe.f16, null), le.mat4x4h = new le("mat4x4", oe.f16, null), le.mat2x2i = new le("mat2x2", oe.i32, null), le.mat2x3i = new le("mat2x3", oe.i32, null), le.mat2x4i = new le("mat2x4", oe.i32, null), le.mat3x2i = new le("mat3x2", oe.i32, null), le.mat3x3i = new le("mat3x3", oe.i32, null), le.mat3x4i = new le("mat3x4", oe.i32, null), le.mat4x2i = new le("mat4x2", oe.i32, null), le.mat4x3i = new le("mat4x3", oe.i32, null), le.mat4x4i = new le("mat4x4", oe.i32, null), le.mat2x2u = new le("mat2x2", oe.u32, null), le.mat2x3u = new le("mat2x3", oe.u32, null), le.mat2x4u = new le("mat2x4", oe.u32, null), le.mat3x2u = new le("mat3x2", oe.u32, null), le.mat3x3u = new le("mat3x3", oe.u32, null), le.mat3x4u = new le("mat3x4", oe.u32, null), le.mat4x2u = new le("mat4x2", oe.u32, null), le.mat4x3u = new le("mat4x3", oe.u32, null), le.mat4x4u = new le("mat4x4", oe.u32, null);
    var ce = class extends oe {
      constructor(e2, t2, n2, s2) {
        super(e2), this.storage = t2, this.type = n2, this.access = s2;
      }
      get astNodeType() {
        return "pointer";
      }
    };
    var ue = class extends oe {
      constructor(e2, t2, n2, s2) {
        super(e2), this.attributes = t2, this.format = n2, this.count = s2;
      }
      get astNodeType() {
        return "array";
      }
      get isArray() {
        return true;
      }
    };
    var he = class extends oe {
      constructor(e2, t2, n2) {
        super(e2), this.format = t2, this.access = n2;
      }
      get astNodeType() {
        return "sampler";
      }
    };
    var fe = class extends C {
      constructor() {
        super(), this.postfix = null;
      }
    };
    var pe = class extends fe {
      constructor(e2) {
        super(), this.value = e2;
      }
      get astNodeType() {
        return "stringExpr";
      }
      toString() {
        return this.value;
      }
      constEvaluateString() {
        return this.value;
      }
    };
    var de = class extends fe {
      constructor(e2, t2) {
        super(), this.type = e2, this.args = t2;
      }
      get astNodeType() {
        return "createExpr";
      }
      search(e2) {
        if (e2(this), this.args) for (const t2 of this.args) t2.search(e2);
      }
      constEvaluate(e2, t2) {
        return t2 && (t2[0] = this.type), e2.evalExpression(this, e2.context);
      }
    };
    var me = class extends fe {
      constructor(e2, t2) {
        super(), this.cachedReturnValue = null, this.name = e2, this.args = t2;
      }
      get astNodeType() {
        return "callExpr";
      }
      setCachedReturnValue(e2) {
        this.cachedReturnValue = e2;
      }
      get isBuiltin() {
        return $.has(this.name);
      }
      constEvaluate(e2, t2) {
        return e2.evalExpression(this, e2.context);
      }
      search(e2) {
        for (const t2 of this.args) t2.search(e2);
        e2(this);
      }
    };
    var xe = class extends fe {
      constructor(e2) {
        super(), this.name = e2;
      }
      get astNodeType() {
        return "varExpr";
      }
      search(e2) {
        e2(this), this.postfix && this.postfix.search(e2);
      }
      constEvaluate(e2, t2) {
        return e2.evalExpression(this, e2.context);
      }
    };
    var ge = class extends fe {
      constructor(e2, t2) {
        super(), this.name = e2, this.initializer = t2;
      }
      get astNodeType() {
        return "constExpr";
      }
      constEvaluate(e2, t2) {
        if (this.initializer) {
          const t3 = e2.evalExpression(this.initializer, e2.context);
          return null !== t3 && this.postfix ? t3.getSubData(e2, this.postfix, e2.context) : t3;
        }
        return null;
      }
      search(e2) {
        this.initializer.search(e2);
      }
    };
    var _e = class extends fe {
      constructor(e2, t2) {
        super(), this.value = e2, this.type = t2;
      }
      get astNodeType() {
        return "literalExpr";
      }
      constEvaluate(e2, t2) {
        return void 0 !== t2 && (t2[0] = this.type), this.value;
      }
      get isScalar() {
        return this.value instanceof Ve;
      }
      get isVector() {
        return this.value instanceof Fe || this.value instanceof Me;
      }
      get scalarValue() {
        return this.value instanceof Ve ? this.value.value : (console.error("Value is not scalar."), 0);
      }
      get vectorValue() {
        return this.value instanceof Fe || this.value instanceof Me ? this.value.data : (console.error("Value is not a vector or matrix."), new Float32Array(0));
      }
    };
    var ye = class extends fe {
      constructor(e2, t2) {
        super(), this.type = e2, this.value = t2;
      }
      get astNodeType() {
        return "bitcastExpr";
      }
      search(e2) {
        this.value.search(e2);
      }
    };
    var be = class extends fe {
      constructor(e2) {
        super(), this.index = e2;
      }
      search(e2) {
        this.index.search(e2);
      }
    };
    var ve = class extends fe {
      constructor() {
        super();
      }
    };
    var ke = class extends ve {
      constructor(e2, t2) {
        super(), this.operator = e2, this.right = t2;
      }
      get astNodeType() {
        return "unaryOp";
      }
      constEvaluate(e2, t2) {
        return e2.evalExpression(this, e2.context);
      }
      search(e2) {
        this.right.search(e2);
      }
    };
    var we = class extends ve {
      constructor(e2, t2, n2) {
        super(), this.operator = e2, this.left = t2, this.right = n2;
      }
      get astNodeType() {
        return "binaryOp";
      }
      _getPromotedType(e2, t2) {
        return e2.name === t2.name ? e2 : "f32" === e2.name || "f32" === t2.name ? oe.f32 : "u32" === e2.name || "u32" === t2.name ? oe.u32 : oe.i32;
      }
      constEvaluate(e2, t2) {
        return e2.evalExpression(this, e2.context);
      }
      search(e2) {
        this.left.search(e2), this.right.search(e2);
      }
    };
    var Ie = class extends C {
      constructor(e2) {
        super(), this.body = e2;
      }
      search(e2) {
        e2(this), this.searchBlock(this.body, e2);
      }
    };
    var Te = class extends fe {
      constructor() {
        super();
      }
      get astNodeType() {
        return "default";
      }
    };
    var Se = class extends Ie {
      constructor(e2, t2) {
        super(t2), this.selectors = e2;
      }
      get astNodeType() {
        return "case";
      }
      search(e2) {
        this.searchBlock(this.body, e2);
      }
    };
    var Ce = class extends Ie {
      constructor(e2) {
        super(e2);
      }
      get astNodeType() {
        return "default";
      }
      search(e2) {
        this.searchBlock(this.body, e2);
      }
    };
    var Ae = class extends C {
      constructor(e2, t2, n2) {
        super(), this.name = e2, this.type = t2, this.attributes = n2;
      }
      get astNodeType() {
        return "argument";
      }
    };
    var Ee = class extends C {
      constructor(e2, t2) {
        super(), this.condition = e2, this.body = t2;
      }
      get astNodeType() {
        return "elseif";
      }
      search(e2) {
        this.condition.search(e2), this.searchBlock(this.body, e2);
      }
    };
    var $e = class extends C {
      constructor(e2, t2, n2) {
        super(), this.name = e2, this.type = t2, this.attributes = n2;
      }
      get astNodeType() {
        return "member";
      }
    };
    var Le = class extends C {
      constructor(e2, t2) {
        super(), this.name = e2, this.value = t2;
      }
      get astNodeType() {
        return "attribute";
      }
    };
    var De = class _De {
      constructor(e2, t2) {
        this.parent = null, this.typeInfo = e2, this.parent = t2, this.id = _De._id++;
      }
      clone() {
        throw `Clone: Not implemented for ${this.constructor.name}`;
      }
      setDataValue(e2, t2, n2, s2) {
        console.error(`SetDataValue: Not implemented for ${this.constructor.name}`);
      }
      getSubData(e2, t2, n2) {
        return console.error(`GetDataValue: Not implemented for ${this.constructor.name}`), null;
      }
      toString() {
        return `<${this.typeInfo.getTypeName()}>`;
      }
    };
    De._id = 0;
    var Oe = class extends De {
      constructor() {
        super(new e("void", null), null);
      }
      toString() {
        return "void";
      }
    };
    Oe.void = new Oe();
    var Ne = class extends De {
      constructor(e2) {
        super(new r("pointer", e2.typeInfo, null), null), this.reference = e2;
      }
      clone() {
        return this;
      }
      setDataValue(e2, t2, n2, s2) {
        this.reference.setDataValue(e2, t2, n2, s2);
      }
      getSubData(e2, t2, n2) {
        return t2 ? this.reference.getSubData(e2, t2, n2) : this;
      }
      toString() {
        return `&${this.reference.toString()}`;
      }
    };
    var Ve = class _Ve extends De {
      constructor(e2, t2, n2 = null) {
        super(t2, n2), e2 instanceof Int32Array || e2 instanceof Uint32Array || e2 instanceof Float32Array ? this.data = e2 : "x32" === this.typeInfo.name ? e2 - Math.floor(e2) !== 0 ? this.data = new Float32Array([e2]) : this.data = e2 >= 0 ? new Uint32Array([e2]) : new Int32Array([e2]) : "i32" === this.typeInfo.name || "bool" === this.typeInfo.name ? this.data = new Int32Array([e2]) : "u32" === this.typeInfo.name ? this.data = new Uint32Array([e2]) : "f32" === this.typeInfo.name || "f16" === this.typeInfo.name ? this.data = new Float32Array([e2]) : console.error("ScalarData2: Invalid type", t2);
      }
      clone() {
        if (this.data instanceof Float32Array) return new _Ve(new Float32Array(this.data), this.typeInfo, null);
        if (this.data instanceof Int32Array) return new _Ve(new Int32Array(this.data), this.typeInfo, null);
        if (this.data instanceof Uint32Array) return new _Ve(new Uint32Array(this.data), this.typeInfo, null);
        throw "ScalarData: Invalid data type";
      }
      get value() {
        return this.data[0];
      }
      set value(e2) {
        this.data[0] = e2;
      }
      setDataValue(e2, t2, n2, s2) {
        if (n2) return void console.error("SetDataValue: Scalar data does not support postfix", n2);
        if (!(t2 instanceof _Ve)) return void console.error("SetDataValue: Invalid value", t2);
        let r2 = t2.data[0];
        "i32" === this.typeInfo.name || "u32" === this.typeInfo.name ? r2 = Math.floor(r2) : "bool" === this.typeInfo.name && (r2 = r2 ? 1 : 0), this.data[0] = r2;
      }
      getSubData(e2, t2, n2) {
        return t2 ? (console.error("getSubData: Scalar data does not support postfix", t2), null) : this;
      }
      toString() {
        return `${this.value}`;
      }
    };
    function Be(e2, t2, n2) {
      const s2 = t2.length;
      return 2 === s2 ? "f32" === n2 ? new Fe(new Float32Array(t2), e2.getTypeInfo("vec2f")) : "i32" === n2 || "bool" === n2 ? new Fe(new Int32Array(t2), e2.getTypeInfo("vec2i")) : "u32" === n2 ? new Fe(new Uint32Array(t2), e2.getTypeInfo("vec2u")) : "f16" === n2 ? new Fe(new Float32Array(t2), e2.getTypeInfo("vec2h")) : (console.error(`getSubData: Unknown format ${n2}`), null) : 3 === s2 ? "f32" === n2 ? new Fe(new Float32Array(t2), e2.getTypeInfo("vec3f")) : "i32" === n2 || "bool" === n2 ? new Fe(new Int32Array(t2), e2.getTypeInfo("vec3i")) : "u32" === n2 ? new Fe(new Uint32Array(t2), e2.getTypeInfo("vec3u")) : "f16" === n2 ? new Fe(new Float32Array(t2), e2.getTypeInfo("vec3h")) : (console.error(`getSubData: Unknown format ${n2}`), null) : 4 === s2 ? "f32" === n2 ? new Fe(new Float32Array(t2), e2.getTypeInfo("vec4f")) : "i32" === n2 || "bool" === n2 ? new Fe(new Int32Array(t2), e2.getTypeInfo("vec4i")) : "u32" === n2 ? new Fe(new Uint32Array(t2), e2.getTypeInfo("vec4u")) : "f16" === n2 ? new Fe(new Float32Array(t2), e2.getTypeInfo("vec4h")) : (console.error(`getSubData: Unknown format ${n2}`), null) : (console.error(`getSubData: Invalid vector size ${t2.length}`), null);
    }
    var Fe = class _Fe extends De {
      constructor(e2, t2, n2 = null) {
        if (super(t2, n2), e2 instanceof Float32Array || e2 instanceof Uint32Array || e2 instanceof Int32Array) this.data = e2;
        else {
          const t3 = this.typeInfo.name;
          "vec2f" === t3 || "vec3f" === t3 || "vec4f" === t3 ? this.data = new Float32Array(e2) : "vec2i" === t3 || "vec3i" === t3 || "vec4i" === t3 ? this.data = new Int32Array(e2) : "vec2u" === t3 || "vec3u" === t3 || "vec4u" === t3 ? this.data = new Uint32Array(e2) : "vec2h" === t3 || "vec3h" === t3 || "vec4h" === t3 ? this.data = new Float32Array(e2) : "vec2b" === t3 || "vec3b" === t3 || "vec4b" === t3 ? this.data = new Int32Array(e2) : "vec2" === t3 || "vec3" === t3 || "vec4" === t3 ? this.data = new Float32Array(e2) : console.error(`VectorData: Invalid type ${t3}`);
        }
      }
      clone() {
        if (this.data instanceof Float32Array) return new _Fe(new Float32Array(this.data), this.typeInfo, null);
        if (this.data instanceof Int32Array) return new _Fe(new Int32Array(this.data), this.typeInfo, null);
        if (this.data instanceof Uint32Array) return new _Fe(new Uint32Array(this.data), this.typeInfo, null);
        throw "VectorData: Invalid data type";
      }
      setDataValue(e2, t2, n2, s2) {
        n2 instanceof pe ? console.error("TODO: Set vector postfix") : t2 instanceof _Fe ? this.data = t2.data : console.error("SetDataValue: Invalid value", t2);
      }
      getSubData(e2, t2, n2) {
        if (null === t2) return this;
        let s2 = e2.getTypeInfo("f32");
        if (this.typeInfo instanceof o) s2 = this.typeInfo.format || s2;
        else {
          const t3 = this.typeInfo.name;
          "vec2f" === t3 || "vec3f" === t3 || "vec4f" === t3 ? s2 = e2.getTypeInfo("f32") : "vec2i" === t3 || "vec3i" === t3 || "vec4i" === t3 ? s2 = e2.getTypeInfo("i32") : "vec2b" === t3 || "vec3b" === t3 || "vec4b" === t3 ? s2 = e2.getTypeInfo("bool") : "vec2u" === t3 || "vec3u" === t3 || "vec4u" === t3 ? s2 = e2.getTypeInfo("u32") : "vec2h" === t3 || "vec3h" === t3 || "vec4h" === t3 ? s2 = e2.getTypeInfo("f16") : console.error(`GetSubData: Unknown type ${t3}`);
        }
        let r2 = this;
        for (; null !== t2 && null !== r2; ) {
          if (t2 instanceof be) {
            const o2 = t2.index;
            let a2 = -1;
            if (o2 instanceof _e) {
              if (!(o2.value instanceof Ve)) return console.error(`GetSubData: Invalid array index ${o2.value}`), null;
              a2 = o2.value.value;
            } else {
              const t3 = e2.evalExpression(o2, n2);
              if (!(t3 instanceof Ve)) return console.error("GetSubData: Unknown index type", o2), null;
              a2 = t3.value;
            }
            if (a2 < 0 || a2 >= r2.data.length) return console.error("GetSubData: Index out of range", a2), null;
            if (r2.data instanceof Float32Array) {
              const e3 = new Float32Array(r2.data.buffer, r2.data.byteOffset + 4 * a2, 1);
              return new Ve(e3, s2);
            }
            if (r2.data instanceof Int32Array) {
              const e3 = new Int32Array(r2.data.buffer, r2.data.byteOffset + 4 * a2, 1);
              return new Ve(e3, s2);
            }
            if (r2.data instanceof Uint32Array) {
              const e3 = new Uint32Array(r2.data.buffer, r2.data.byteOffset + 4 * a2, 1);
              return new Ve(e3, s2);
            }
            throw "GetSubData: Invalid data type";
          }
          if (!(t2 instanceof pe)) return console.error("GetSubData: Unknown postfix", t2), null;
          {
            const n3 = t2.value.toLowerCase();
            if (1 === n3.length) {
              let e3 = 0;
              if ("x" === n3 || "r" === n3) e3 = 0;
              else if ("y" === n3 || "g" === n3) e3 = 1;
              else if ("z" === n3 || "b" === n3) e3 = 2;
              else {
                if ("w" !== n3 && "a" !== n3) return console.error(`GetSubData: Unknown member ${n3}`), null;
                e3 = 3;
              }
              if (this.data instanceof Float32Array) {
                let t3 = new Float32Array(this.data.buffer, this.data.byteOffset + 4 * e3, 1);
                return new Ve(t3, s2, this);
              }
              if (this.data instanceof Int32Array) {
                let t3 = new Int32Array(this.data.buffer, this.data.byteOffset + 4 * e3, 1);
                return new Ve(t3, s2, this);
              }
              if (this.data instanceof Uint32Array) {
                let t3 = new Uint32Array(this.data.buffer, this.data.byteOffset + 4 * e3, 1);
                return new Ve(t3, s2, this);
              }
            }
            const o2 = [];
            for (const e3 of n3) "x" === e3 || "r" === e3 ? o2.push(this.data[0]) : "y" === e3 || "g" === e3 ? o2.push(this.data[1]) : "z" === e3 || "b" === e3 ? o2.push(this.data[2]) : "w" === e3 || "a" === e3 ? o2.push(this.data[3]) : console.error(`GetDataValue: Unknown member ${e3}`);
            r2 = Be(e2, o2, s2.name);
          }
          t2 = t2.postfix;
        }
        return r2;
      }
      toString() {
        let e2 = `${this.data[0]}`;
        for (let t2 = 1; t2 < this.data.length; ++t2) e2 += `, ${this.data[t2]}`;
        return e2;
      }
    };
    var Me = class _Me extends De {
      constructor(e2, t2, n2 = null) {
        super(t2, n2), e2 instanceof Float32Array ? this.data = e2 : this.data = new Float32Array(e2);
      }
      clone() {
        return new _Me(new Float32Array(this.data), this.typeInfo, null);
      }
      setDataValue(e2, t2, n2, s2) {
        n2 instanceof pe ? console.error("TODO: Set matrix postfix") : t2 instanceof _Me ? this.data = t2.data : console.error("SetDataValue: Invalid value", t2);
      }
      getSubData(e2, t2, n2) {
        if (null === t2) return this;
        const s2 = this.typeInfo.name;
        if (e2.getTypeInfo("f32"), this.typeInfo instanceof o) this.typeInfo.format;
        else if (s2.endsWith("f")) e2.getTypeInfo("f32");
        else if (s2.endsWith("i")) e2.getTypeInfo("i32");
        else if (s2.endsWith("u")) e2.getTypeInfo("u32");
        else {
          if (!s2.endsWith("h")) return console.error(`GetDataValue: Unknown type ${s2}`), null;
          e2.getTypeInfo("f16");
        }
        if (t2 instanceof be) {
          const r2 = t2.index;
          let o2 = -1;
          if (r2 instanceof _e) {
            if (!(r2.value instanceof Ve)) return console.error(`GetDataValue: Invalid array index ${r2.value}`), null;
            o2 = r2.value.value;
          } else {
            const t3 = e2.evalExpression(r2, n2);
            if (!(t3 instanceof Ve)) return console.error("GetDataValue: Unknown index type", r2), null;
            o2 = t3.value;
          }
          if (o2 < 0 || o2 >= this.data.length) return console.error("GetDataValue: Index out of range", o2), null;
          const a2 = s2.endsWith("h") ? "h" : "f";
          let i2;
          if ("mat2x2" === s2 || "mat2x2f" === s2 || "mat2x2h" === s2 || "mat3x2" === s2 || "mat3x2f" === s2 || "mat3x2h" === s2 || "mat4x2" === s2 || "mat4x2f" === s2 || "mat4x2h" === s2) i2 = new Fe(new Float32Array(this.data.buffer, this.data.byteOffset + 2 * o2 * 4, 2), e2.getTypeInfo(`vec2${a2}`));
          else if ("mat2x3" === s2 || "mat2x3f" === s2 || "mat2x3h" === s2 || "mat3x3" === s2 || "mat3x3f" === s2 || "mat3x3h" === s2 || "mat4x3" === s2 || "mat4x3f" === s2 || "mat4x3h" === s2) i2 = new Fe(new Float32Array(this.data.buffer, this.data.byteOffset + 3 * o2 * 4, 3), e2.getTypeInfo(`vec3${a2}`));
          else {
            if ("mat2x4" !== s2 && "mat2x4f" !== s2 && "mat2x4h" !== s2 && "mat3x4" !== s2 && "mat3x4f" !== s2 && "mat3x4h" !== s2 && "mat4x4" !== s2 && "mat4x4f" !== s2 && "mat4x4h" !== s2) return console.error(`GetDataValue: Unknown type ${s2}`), null;
            i2 = new Fe(new Float32Array(this.data.buffer, this.data.byteOffset + 4 * o2 * 4, 4), e2.getTypeInfo(`vec4${a2}`));
          }
          return t2.postfix ? i2.getSubData(e2, t2.postfix, n2) : i2;
        }
        return console.error("GetDataValue: Invalid postfix", t2), null;
      }
      toString() {
        let e2 = `${this.data[0]}`;
        for (let t2 = 1; t2 < this.data.length; ++t2) e2 += `, ${this.data[t2]}`;
        return e2;
      }
    };
    var Ue = class _Ue extends De {
      constructor(e2, t2, n2 = 0, s2 = null) {
        super(t2, s2), this.buffer = e2 instanceof ArrayBuffer ? e2 : e2.buffer, this.offset = n2;
      }
      clone() {
        const e2 = new Uint8Array(new Uint8Array(this.buffer, this.offset, this.typeInfo.size));
        return new _Ue(e2.buffer, this.typeInfo, 0, null);
      }
      setDataValue(t2, r2, o2, a2) {
        if (null === r2) return void console.log("setDataValue: NULL data.");
        let i2 = this.offset, l2 = this.typeInfo;
        for (; o2; ) {
          if (o2 instanceof be) if (l2 instanceof s) {
            const e2 = o2.index;
            if (e2 instanceof _e) {
              if (!(e2.value instanceof Ve)) return void console.error(`SetDataValue: Invalid index type ${e2.value}`);
              i2 += e2.value.value * l2.stride;
            } else {
              const n2 = t2.evalExpression(e2, a2);
              if (!(n2 instanceof Ve)) return void console.error("SetDataValue: Unknown index type", e2);
              i2 += n2.value * l2.stride;
            }
            l2 = l2.format;
          } else console.error(`SetDataValue: Type ${l2.getTypeName()} is not an array`);
          else {
            if (!(o2 instanceof pe)) return void console.error("SetDataValue: Unknown postfix type", o2);
            {
              const t3 = o2.value;
              if (l2 instanceof n) {
                let e2 = false;
                for (const n2 of l2.members) if (n2.name === t3) {
                  i2 += n2.offset, l2 = n2.type, e2 = true;
                  break;
                }
                if (!e2) return void console.error(`SetDataValue: Member ${t3} not found`);
              } else if (l2 instanceof e) {
                const e2 = l2.getTypeName();
                let n2 = 0;
                if ("x" === t3 || "r" === t3) n2 = 0;
                else if ("y" === t3 || "g" === t3) n2 = 1;
                else if ("z" === t3 || "b" === t3) n2 = 2;
                else {
                  if ("w" !== t3 && "a" !== t3) return void console.error(`SetDataValue: Unknown member ${t3}`);
                  n2 = 3;
                }
                if (!(r2 instanceof Ve)) return void console.error("SetDataValue: Invalid value", r2);
                const s2 = r2.value;
                return "vec2f" === e2 ? void (new Float32Array(this.buffer, i2, 2)[n2] = s2) : "vec3f" === e2 ? void (new Float32Array(this.buffer, i2, 3)[n2] = s2) : "vec4f" === e2 ? void (new Float32Array(this.buffer, i2, 4)[n2] = s2) : "vec2i" === e2 ? void (new Int32Array(this.buffer, i2, 2)[n2] = s2) : "vec3i" === e2 ? void (new Int32Array(this.buffer, i2, 3)[n2] = s2) : "vec4i" === e2 ? void (new Int32Array(this.buffer, i2, 4)[n2] = s2) : "vec2u" === e2 ? void (new Uint32Array(this.buffer, i2, 2)[n2] = s2) : "vec3u" === e2 ? void (new Uint32Array(this.buffer, i2, 3)[n2] = s2) : "vec4u" === e2 ? void (new Uint32Array(this.buffer, i2, 4)[n2] = s2) : void console.error(`SetDataValue: Type ${e2} is not a struct`);
              }
            }
          }
          o2 = o2.postfix;
        }
        this.setData(t2, r2, l2, i2, a2);
      }
      setData(e2, t2, n2, s2, r2) {
        const o2 = n2.getTypeName();
        if ("f32" !== o2 && "f16" !== o2) if ("i32" !== o2 && "atomic<i32>" !== o2 && "x32" !== o2) if ("u32" !== o2 && "atomic<u32>" !== o2) if ("bool" !== o2) {
          if ("vec2f" === o2 || "vec2h" === o2) {
            const e3 = new Float32Array(this.buffer, s2, 2);
            return void (t2 instanceof Fe ? (e3[0] = t2.data[0], e3[1] = t2.data[1]) : (e3[0] = t2[0], e3[1] = t2[1]));
          }
          if ("vec3f" === o2 || "vec3h" === o2) {
            const e3 = new Float32Array(this.buffer, s2, 3);
            return void (t2 instanceof Fe ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2]));
          }
          if ("vec4f" === o2 || "vec4h" === o2) {
            const e3 = new Float32Array(this.buffer, s2, 4);
            return void (t2 instanceof Fe ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2], e3[3] = t2.data[3]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2], e3[3] = t2[3]));
          }
          if ("vec2i" === o2) {
            const e3 = new Int32Array(this.buffer, s2, 2);
            return void (t2 instanceof Fe ? (e3[0] = t2.data[0], e3[1] = t2.data[1]) : (e3[0] = t2[0], e3[1] = t2[1]));
          }
          if ("vec3i" === o2) {
            const e3 = new Int32Array(this.buffer, s2, 3);
            return void (t2 instanceof Fe ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2]));
          }
          if ("vec4i" === o2) {
            const e3 = new Int32Array(this.buffer, s2, 4);
            return void (t2 instanceof Fe ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2], e3[3] = t2.data[3]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2], e3[3] = t2[3]));
          }
          if ("vec2u" === o2) {
            const e3 = new Uint32Array(this.buffer, s2, 2);
            return void (t2 instanceof Fe ? (e3[0] = t2.data[0], e3[1] = t2.data[1]) : (e3[0] = t2[0], e3[1] = t2[1]));
          }
          if ("vec3u" === o2) {
            const e3 = new Uint32Array(this.buffer, s2, 3);
            return void (t2 instanceof Fe ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2]));
          }
          if ("vec4u" === o2) {
            const e3 = new Uint32Array(this.buffer, s2, 4);
            return void (t2 instanceof Fe ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2], e3[3] = t2.data[3]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2], e3[3] = t2[3]));
          }
          if ("vec2b" === o2) {
            const e3 = new Uint32Array(this.buffer, s2, 2);
            return void (t2 instanceof Fe ? (e3[0] = t2.data[0], e3[1] = t2.data[1]) : (e3[0] = t2[0], e3[1] = t2[1]));
          }
          if ("vec3b" === o2) {
            const e3 = new Uint32Array(this.buffer, s2, 3);
            return void (t2 instanceof Fe ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2]));
          }
          if ("vec4b" === o2) {
            const e3 = new Uint32Array(this.buffer, s2, 4);
            return void (t2 instanceof Fe ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2], e3[3] = t2.data[3]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2], e3[3] = t2[3]));
          }
          if ("mat2x2f" === o2 || "mat2x2h" === o2) {
            const e3 = new Float32Array(this.buffer, s2, 4);
            return void (t2 instanceof Me ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2], e3[3] = t2.data[3]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2], e3[3] = t2[3]));
          }
          if ("mat2x3f" === o2 || "mat2x3h" === o2) {
            const e3 = new Float32Array(this.buffer, s2, 6);
            return void (t2 instanceof Me ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2], e3[3] = t2.data[3], e3[4] = t2.data[4], e3[5] = t2.data[5]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2], e3[3] = t2[3], e3[4] = t2[4], e3[5] = t2[5]));
          }
          if ("mat2x4f" === o2 || "mat2x4h" === o2) {
            const e3 = new Float32Array(this.buffer, s2, 8);
            return void (t2 instanceof Me ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2], e3[3] = t2.data[3], e3[4] = t2.data[4], e3[5] = t2.data[5], e3[6] = t2.data[6], e3[7] = t2.data[7]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2], e3[3] = t2[3], e3[4] = t2[4], e3[5] = t2[5], e3[6] = t2[6], e3[7] = t2[7]));
          }
          if ("mat3x2f" === o2 || "mat3x2h" === o2) {
            const e3 = new Float32Array(this.buffer, s2, 6);
            return void (t2 instanceof Me ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2], e3[3] = t2.data[3], e3[4] = t2.data[4], e3[5] = t2.data[5]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2], e3[3] = t2[3], e3[4] = t2[4], e3[5] = t2[5]));
          }
          if ("mat3x3f" === o2 || "mat3x3h" === o2) {
            const e3 = new Float32Array(this.buffer, s2, 9);
            return void (t2 instanceof Me ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2], e3[3] = t2.data[3], e3[4] = t2.data[4], e3[5] = t2.data[5], e3[6] = t2.data[6], e3[7] = t2.data[7], e3[8] = t2.data[8]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2], e3[3] = t2[3], e3[4] = t2[4], e3[5] = t2[5], e3[6] = t2[6], e3[7] = t2[7], e3[8] = t2[8]));
          }
          if ("mat3x4f" === o2 || "mat3x4h" === o2) {
            const e3 = new Float32Array(this.buffer, s2, 12);
            return void (t2 instanceof Me ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2], e3[3] = t2.data[3], e3[4] = t2.data[4], e3[5] = t2.data[5], e3[6] = t2.data[6], e3[7] = t2.data[7], e3[8] = t2.data[8], e3[9] = t2.data[9], e3[10] = t2.data[10], e3[11] = t2.data[11]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2], e3[3] = t2[3], e3[4] = t2[4], e3[5] = t2[5], e3[6] = t2[6], e3[7] = t2[7], e3[8] = t2[8], e3[9] = t2[9], e3[10] = t2[10], e3[11] = t2[11]));
          }
          if ("mat4x2f" === o2 || "mat4x2h" === o2) {
            const e3 = new Float32Array(this.buffer, s2, 8);
            return void (t2 instanceof Me ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2], e3[3] = t2.data[3], e3[4] = t2.data[4], e3[5] = t2.data[5], e3[6] = t2.data[6], e3[7] = t2.data[7]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2], e3[3] = t2[3], e3[4] = t2[4], e3[5] = t2[5], e3[6] = t2[6], e3[7] = t2[7]));
          }
          if ("mat4x3f" === o2 || "mat4x3h" === o2) {
            const e3 = new Float32Array(this.buffer, s2, 12);
            return void (t2 instanceof Me ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2], e3[3] = t2.data[3], e3[4] = t2.data[4], e3[5] = t2.data[5], e3[6] = t2.data[6], e3[7] = t2.data[7], e3[8] = t2.data[8], e3[9] = t2.data[9], e3[10] = t2.data[10], e3[11] = t2.data[11]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2], e3[3] = t2[3], e3[4] = t2[4], e3[5] = t2[5], e3[6] = t2[6], e3[7] = t2[7], e3[8] = t2[8], e3[9] = t2[9], e3[10] = t2[10], e3[11] = t2[11]));
          }
          if ("mat4x4f" === o2 || "mat4x4h" === o2) {
            const e3 = new Float32Array(this.buffer, s2, 16);
            return void (t2 instanceof Me ? (e3[0] = t2.data[0], e3[1] = t2.data[1], e3[2] = t2.data[2], e3[3] = t2.data[3], e3[4] = t2.data[4], e3[5] = t2.data[5], e3[6] = t2.data[6], e3[7] = t2.data[7], e3[8] = t2.data[8], e3[9] = t2.data[9], e3[10] = t2.data[10], e3[11] = t2.data[11], e3[12] = t2.data[12], e3[13] = t2.data[13], e3[14] = t2.data[14], e3[15] = t2.data[15]) : (e3[0] = t2[0], e3[1] = t2[1], e3[2] = t2[2], e3[3] = t2[3], e3[4] = t2[4], e3[5] = t2[5], e3[6] = t2[6], e3[7] = t2[7], e3[8] = t2[8], e3[9] = t2[9], e3[10] = t2[10], e3[11] = t2[11], e3[12] = t2[12], e3[13] = t2[13], e3[14] = t2[14], e3[15] = t2[15]));
          }
          if (t2 instanceof _Ue) {
            if (n2 === t2.typeInfo) {
              return void new Uint8Array(this.buffer, s2, t2.buffer.byteLength).set(new Uint8Array(t2.buffer));
            }
            console.error("SetDataValue: Type mismatch", o2, t2.typeInfo.getTypeName());
          } else console.error(`SetData: Unknown type ${o2}`);
        } else t2 instanceof Ve && (new Int32Array(this.buffer, s2, 1)[0] = t2.value);
        else t2 instanceof Ve && (new Uint32Array(this.buffer, s2, 1)[0] = t2.value);
        else t2 instanceof Ve && (new Int32Array(this.buffer, s2, 1)[0] = t2.value);
        else t2 instanceof Ve && (new Float32Array(this.buffer, s2, 1)[0] = t2.value);
      }
      getSubData(t2, r2, a2) {
        var i2, l2, c2;
        if (null === r2) return this;
        let u2 = this.offset, h2 = this.typeInfo;
        for (; r2; ) {
          if (r2 instanceof be) {
            const e2 = r2.index, n2 = e2 instanceof fe ? t2.evalExpression(e2, a2) : e2;
            let o2 = 0;
            if (n2 instanceof Ve ? o2 = n2.value : "number" == typeof n2 ? o2 = n2 : console.error("GetDataValue: Invalid index type", e2), h2 instanceof s) u2 += o2 * h2.stride, h2 = h2.format;
            else {
              const e3 = h2.getTypeName();
              "mat4x4" === e3 || "mat4x4f" === e3 || "mat4x4h" === e3 ? (u2 += 16 * o2, h2 = t2.getTypeInfo("vec4f")) : console.error(`getDataValue: Type ${h2.getTypeName()} is not an array`);
            }
          } else {
            if (!(r2 instanceof pe)) return console.error("GetDataValue: Unknown postfix type", r2), null;
            {
              const s2 = r2.value;
              if (h2 instanceof n) {
                let e2 = false;
                for (const t3 of h2.members) if (t3.name === s2) {
                  u2 += t3.offset, h2 = t3.type, e2 = true;
                  break;
                }
                if (!e2) return console.error(`GetDataValue: Member ${s2} not found`), null;
              } else if (h2 instanceof e) {
                const e2 = h2.getTypeName();
                if ("vec2f" === e2 || "vec3f" === e2 || "vec4f" === e2 || "vec2i" === e2 || "vec3i" === e2 || "vec4i" === e2 || "vec2u" === e2 || "vec3u" === e2 || "vec4u" === e2 || "vec2b" === e2 || "vec3b" === e2 || "vec4b" === e2 || "vec2h" === e2 || "vec3h" === e2 || "vec4h" === e2 || "vec2" === e2 || "vec3" === e2 || "vec4" === e2) {
                  if (s2.length > 0 && s2.length < 5) {
                    let n2 = "f";
                    const r3 = [];
                    for (let o2 = 0; o2 < s2.length; ++o2) {
                      const a3 = s2[o2].toLowerCase();
                      let i3 = 0;
                      if ("x" === a3 || "r" === a3) i3 = 0;
                      else if ("y" === a3 || "g" === a3) i3 = 1;
                      else if ("z" === a3 || "b" === a3) i3 = 2;
                      else {
                        if ("w" !== a3 && "a" !== a3) return console.error(`Unknown member ${s2}`), null;
                        i3 = 3;
                      }
                      if (1 === s2.length) {
                        if (e2.endsWith("f")) return this.buffer.byteLength < u2 + 4 * i3 + 4 ? (console.log("Insufficient buffer data"), null) : new Ve(new Float32Array(this.buffer, u2 + 4 * i3, 1), t2.getTypeInfo("f32"), this);
                        if (e2.endsWith("h")) return new Ve(new Float32Array(this.buffer, u2 + 4 * i3, 1), t2.getTypeInfo("f16"), this);
                        if (e2.endsWith("i")) return new Ve(new Int32Array(this.buffer, u2 + 4 * i3, 1), t2.getTypeInfo("i32"), this);
                        if (e2.endsWith("b")) return new Ve(new Int32Array(this.buffer, u2 + 4 * i3, 1), t2.getTypeInfo("bool"), this);
                        if (e2.endsWith("u")) return new Ve(new Uint32Array(this.buffer, u2 + 4 * i3, 1), t2.getTypeInfo("i32"), this);
                      }
                      if ("vec2f" === e2) r3.push(new Float32Array(this.buffer, u2, 2)[i3]);
                      else if ("vec3f" === e2) {
                        if (u2 + 12 >= this.buffer.byteLength) return console.log("Insufficient buffer data"), null;
                        const e3 = new Float32Array(this.buffer, u2, 3);
                        r3.push(e3[i3]);
                      } else if ("vec4f" === e2) r3.push(new Float32Array(this.buffer, u2, 4)[i3]);
                      else if ("vec2i" === e2) n2 = "i", r3.push(new Int32Array(this.buffer, u2, 2)[i3]);
                      else if ("vec3i" === e2) n2 = "i", r3.push(new Int32Array(this.buffer, u2, 3)[i3]);
                      else if ("vec4i" === e2) n2 = "i", r3.push(new Int32Array(this.buffer, u2, 4)[i3]);
                      else if ("vec2u" === e2) {
                        n2 = "u";
                        const e3 = new Uint32Array(this.buffer, u2, 2);
                        r3.push(e3[i3]);
                      } else "vec3u" === e2 ? (n2 = "u", r3.push(new Uint32Array(this.buffer, u2, 3)[i3])) : "vec4u" === e2 && (n2 = "u", r3.push(new Uint32Array(this.buffer, u2, 4)[i3]));
                    }
                    return 2 === r3.length ? h2 = t2.getTypeInfo(`vec2${n2}`) : 3 === r3.length ? h2 = t2.getTypeInfo(`vec3${n2}`) : 4 === r3.length ? h2 = t2.getTypeInfo(`vec4${n2}`) : console.error(`GetDataValue: Invalid vector length ${r3.length}`), new Fe(r3, h2, null);
                  }
                  return console.error(`GetDataValue: Unknown member ${s2}`), null;
                }
                return console.error(`GetDataValue: Type ${e2} is not a struct`), null;
              }
            }
          }
          r2 = r2.postfix;
        }
        const f2 = h2.getTypeName();
        return "f32" === f2 ? new Ve(new Float32Array(this.buffer, u2, 1), h2, this) : "i32" === f2 ? new Ve(new Int32Array(this.buffer, u2, 1), h2, this) : "u32" === f2 ? new Ve(new Uint32Array(this.buffer, u2, 1), h2, this) : "vec2f" === f2 ? new Fe(new Float32Array(this.buffer, u2, 2), h2, this) : "vec3f" === f2 ? new Fe(new Float32Array(this.buffer, u2, 3), h2, this) : "vec4f" === f2 ? new Fe(new Float32Array(this.buffer, u2, 4), h2, this) : "vec2i" === f2 ? new Fe(new Int32Array(this.buffer, u2, 2), h2, this) : "vec3i" === f2 ? new Fe(new Int32Array(this.buffer, u2, 3), h2, this) : "vec4i" === f2 ? new Fe(new Int32Array(this.buffer, u2, 4), h2, this) : "vec2u" === f2 ? new Fe(new Uint32Array(this.buffer, u2, 2), h2, this) : "vec3u" === f2 ? new Fe(new Uint32Array(this.buffer, u2, 3), h2, this) : "vec4u" === f2 ? new Fe(new Uint32Array(this.buffer, u2, 4), h2, this) : h2 instanceof o && "atomic" === h2.name ? "u32" === (null === (i2 = h2.format) || void 0 === i2 ? void 0 : i2.name) ? new Ve(new Uint32Array(this.buffer, u2, 1)[0], h2.format, this) : "i32" === (null === (l2 = h2.format) || void 0 === l2 ? void 0 : l2.name) ? new Ve(new Int32Array(this.buffer, u2, 1)[0], h2.format, this) : (console.error(`GetDataValue: Invalid atomic format ${null === (c2 = h2.format) || void 0 === c2 ? void 0 : c2.name}`), null) : new _Ue(this.buffer, h2, u2, this);
      }
      toString() {
        let e2 = "";
        if (this.typeInfo instanceof s) if ("f32" === this.typeInfo.format.name) {
          const t2 = new Float32Array(this.buffer, this.offset);
          e2 = `[${t2[0]}`;
          for (let n2 = 1; n2 < t2.length; ++n2) e2 += `, ${t2[n2]}`;
        } else if ("i32" === this.typeInfo.format.name) {
          const t2 = new Int32Array(this.buffer, this.offset);
          e2 = `[${t2[0]}`;
          for (let n2 = 1; n2 < t2.length; ++n2) e2 += `, ${t2[n2]}`;
        } else if ("u32" === this.typeInfo.format.name) {
          const t2 = new Uint32Array(this.buffer, this.offset);
          e2 = `[${t2[0]}`;
          for (let n2 = 1; n2 < t2.length; ++n2) e2 += `, ${t2[n2]}`;
        } else if ("vec2f" === this.typeInfo.format.name) {
          const t2 = new Float32Array(this.buffer, this.offset);
          e2 = `[${t2[0]}, ${t2[1]}]`;
          for (let n2 = 1; n2 < t2.length / 2; ++n2) e2 += `, [${t2[2 * n2]}, ${t2[2 * n2 + 1]}]`;
        } else if ("vec3f" === this.typeInfo.format.name) {
          const t2 = new Float32Array(this.buffer, this.offset);
          e2 = `[${t2[0]}, ${t2[1]}, ${t2[2]}]`;
          for (let n2 = 4; n2 < t2.length; n2 += 4) e2 += `, [${t2[n2]}, ${t2[n2 + 1]}, ${t2[n2 + 2]}]`;
        } else if ("vec4f" === this.typeInfo.format.name) {
          const t2 = new Float32Array(this.buffer, this.offset);
          e2 = `[${t2[0]}, ${t2[1]}, ${t2[2]}, ${t2[3]}]`;
          for (let n2 = 4; n2 < t2.length; n2 += 4) e2 += `, [${t2[n2]}, ${t2[n2 + 1]}, ${t2[n2 + 2]}, ${t2[n2 + 3]}]`;
        } else e2 = "[...]";
        else this.typeInfo instanceof n ? e2 += "{...}" : e2 = "[...]";
        return e2;
      }
    };
    var Pe = class _Pe extends De {
      constructor(e2, t2, n2, s2) {
        super(t2, null), this.data = e2, this.descriptor = n2, this.view = s2;
      }
      clone() {
        return new _Pe(this.data, this.typeInfo, this.descriptor, this.view);
      }
      get width() {
        var e2, t2;
        const n2 = this.descriptor.size;
        return n2 instanceof Array && n2.length > 0 ? null !== (e2 = n2[0]) && void 0 !== e2 ? e2 : 0 : n2 instanceof Object && null !== (t2 = n2.width) && void 0 !== t2 ? t2 : 0;
      }
      get height() {
        var e2, t2;
        const n2 = this.descriptor.size;
        return n2 instanceof Array && n2.length > 1 ? null !== (e2 = n2[1]) && void 0 !== e2 ? e2 : 0 : n2 instanceof Object && null !== (t2 = n2.height) && void 0 !== t2 ? t2 : 0;
      }
      get depthOrArrayLayers() {
        var e2, t2;
        const n2 = this.descriptor.size;
        return n2 instanceof Array && n2.length > 2 ? null !== (e2 = n2[2]) && void 0 !== e2 ? e2 : 0 : n2 instanceof Object && null !== (t2 = n2.depthOrArrayLayers) && void 0 !== t2 ? t2 : 0;
      }
      get format() {
        var e2;
        return this.descriptor && null !== (e2 = this.descriptor.format) && void 0 !== e2 ? e2 : "rgba8unorm";
      }
      get sampleCount() {
        var e2;
        return this.descriptor && null !== (e2 = this.descriptor.sampleCount) && void 0 !== e2 ? e2 : 1;
      }
      get mipLevelCount() {
        var e2;
        return this.descriptor && null !== (e2 = this.descriptor.mipLevelCount) && void 0 !== e2 ? e2 : 1;
      }
      get dimension() {
        var e2;
        return this.descriptor && null !== (e2 = this.descriptor.dimension) && void 0 !== e2 ? e2 : "2d";
      }
      getMipLevelSize(e2) {
        if (e2 >= this.mipLevelCount) return [0, 0, 0];
        const t2 = [this.width, this.height, this.depthOrArrayLayers];
        for (let n2 = 0; n2 < t2.length; ++n2) t2[n2] = Math.max(1, t2[n2] >> e2);
        return t2;
      }
      get texelByteSize() {
        const e2 = this.format, t2 = S[e2];
        return t2 ? t2.isDepthStencil ? 4 : t2.bytesPerBlock : 0;
      }
      get bytesPerRow() {
        return this.width * this.texelByteSize;
      }
      get isDepthStencil() {
        const e2 = this.format, t2 = S[e2];
        return !!t2 && t2.isDepthStencil;
      }
      getGpuSize() {
        const e2 = this.format, t2 = S[e2], n2 = this.width;
        if (!e2 || n2 <= 0 || !t2) return -1;
        const s2 = this.height, r2 = this.depthOrArrayLayers, o2 = this.dimension;
        return n2 / t2.blockWidth * ("1d" === o2 ? 1 : s2 / t2.blockHeight) * t2.bytesPerBlock * r2;
      }
      getPixel(e2, t2, n2 = 0, s2 = 0) {
        const r2 = this.texelByteSize, o2 = this.bytesPerRow, a2 = this.height, i2 = this.data[s2];
        return w(new Uint8Array(i2), e2, t2, n2, s2, a2, o2, r2, this.format);
      }
      setPixel(e2, t2, n2, s2, r2) {
        const o2 = this.texelByteSize, a2 = this.bytesPerRow, i2 = this.height, l2 = this.data[s2];
        !function(e3, t3, n3, s3, r3, o3, a3, i3, l3, c2) {
          const u2 = s3 * (a3 >>= r3) * (o3 >>= r3) + n3 * a3 + t3 * i3;
          switch (l3) {
            case "r8unorm":
              return void T(e3, u2, "8unorm", 1, c2);
            case "r8snorm":
              return void T(e3, u2, "8snorm", 1, c2);
            case "r8uint":
              return void T(e3, u2, "8uint", 1, c2);
            case "r8sint":
              return void T(e3, u2, "8sint", 1, c2);
            case "rg8unorm":
              return void T(e3, u2, "8unorm", 2, c2);
            case "rg8snorm":
              return void T(e3, u2, "8snorm", 2, c2);
            case "rg8uint":
              return void T(e3, u2, "8uint", 2, c2);
            case "rg8sint":
              return void T(e3, u2, "8sint", 2, c2);
            case "rgba8unorm-srgb":
            case "rgba8unorm":
            case "bgra8unorm-srgb":
            case "bgra8unorm":
              return void T(e3, u2, "8unorm", 4, c2);
            case "rgba8snorm":
              return void T(e3, u2, "8snorm", 4, c2);
            case "rgba8uint":
              return void T(e3, u2, "8uint", 4, c2);
            case "rgba8sint":
              return void T(e3, u2, "8sint", 4, c2);
            case "r16uint":
              return void T(e3, u2, "16uint", 1, c2);
            case "r16sint":
              return void T(e3, u2, "16sint", 1, c2);
            case "r16float":
              return void T(e3, u2, "16float", 1, c2);
            case "rg16uint":
              return void T(e3, u2, "16uint", 2, c2);
            case "rg16sint":
              return void T(e3, u2, "16sint", 2, c2);
            case "rg16float":
              return void T(e3, u2, "16float", 2, c2);
            case "rgba16uint":
              return void T(e3, u2, "16uint", 4, c2);
            case "rgba16sint":
              return void T(e3, u2, "16sint", 4, c2);
            case "rgba16float":
              return void T(e3, u2, "16float", 4, c2);
            case "r32uint":
              return void T(e3, u2, "32uint", 1, c2);
            case "r32sint":
              return void T(e3, u2, "32sint", 1, c2);
            case "depth16unorm":
            case "depth24plus":
            case "depth24plus-stencil8":
            case "depth32float":
            case "depth32float-stencil8":
            case "r32float":
              return void T(e3, u2, "32float", 1, c2);
            case "rg32uint":
              return void T(e3, u2, "32uint", 2, c2);
            case "rg32sint":
              return void T(e3, u2, "32sint", 2, c2);
            case "rg32float":
              return void T(e3, u2, "32float", 2, c2);
            case "rgba32uint":
              return void T(e3, u2, "32uint", 4, c2);
            case "rgba32sint":
              return void T(e3, u2, "32sint", 4, c2);
            case "rgba32float":
              return void T(e3, u2, "32float", 4, c2);
            case "rg11b10ufloat":
              console.error("TODO: rg11b10ufloat not supported for writing");
          }
        }(new Uint8Array(l2), e2, t2, n2, s2, i2, a2, o2, this.format, r2);
      }
    };
    exports.TokenClass = void 0, (z = exports.TokenClass || (exports.TokenClass = {}))[z.token = 0] = "token", z[z.keyword = 1] = "keyword", z[z.reserved = 2] = "reserved";
    var We = class {
      constructor(e2, t2, n2) {
        this.name = e2, this.type = t2, this.rule = n2;
      }
      toString() {
        return this.name;
      }
    };
    var qe = class {
    };
    H = qe, qe.none = new We("", exports.TokenClass.reserved, ""), qe.eof = new We("EOF", exports.TokenClass.token, ""), qe.reserved = { asm: new We("asm", exports.TokenClass.reserved, "asm"), bf16: new We("bf16", exports.TokenClass.reserved, "bf16"), do: new We("do", exports.TokenClass.reserved, "do"), enum: new We("enum", exports.TokenClass.reserved, "enum"), f16: new We("f16", exports.TokenClass.reserved, "f16"), f64: new We("f64", exports.TokenClass.reserved, "f64"), handle: new We("handle", exports.TokenClass.reserved, "handle"), i8: new We("i8", exports.TokenClass.reserved, "i8"), i16: new We("i16", exports.TokenClass.reserved, "i16"), i64: new We("i64", exports.TokenClass.reserved, "i64"), mat: new We("mat", exports.TokenClass.reserved, "mat"), premerge: new We("premerge", exports.TokenClass.reserved, "premerge"), regardless: new We("regardless", exports.TokenClass.reserved, "regardless"), typedef: new We("typedef", exports.TokenClass.reserved, "typedef"), u8: new We("u8", exports.TokenClass.reserved, "u8"), u16: new We("u16", exports.TokenClass.reserved, "u16"), u64: new We("u64", exports.TokenClass.reserved, "u64"), unless: new We("unless", exports.TokenClass.reserved, "unless"), using: new We("using", exports.TokenClass.reserved, "using"), vec: new We("vec", exports.TokenClass.reserved, "vec"), void: new We("void", exports.TokenClass.reserved, "void") }, qe.keywords = { array: new We("array", exports.TokenClass.keyword, "array"), atomic: new We("atomic", exports.TokenClass.keyword, "atomic"), bool: new We("bool", exports.TokenClass.keyword, "bool"), f32: new We("f32", exports.TokenClass.keyword, "f32"), i32: new We("i32", exports.TokenClass.keyword, "i32"), mat2x2: new We("mat2x2", exports.TokenClass.keyword, "mat2x2"), mat2x3: new We("mat2x3", exports.TokenClass.keyword, "mat2x3"), mat2x4: new We("mat2x4", exports.TokenClass.keyword, "mat2x4"), mat3x2: new We("mat3x2", exports.TokenClass.keyword, "mat3x2"), mat3x3: new We("mat3x3", exports.TokenClass.keyword, "mat3x3"), mat3x4: new We("mat3x4", exports.TokenClass.keyword, "mat3x4"), mat4x2: new We("mat4x2", exports.TokenClass.keyword, "mat4x2"), mat4x3: new We("mat4x3", exports.TokenClass.keyword, "mat4x3"), mat4x4: new We("mat4x4", exports.TokenClass.keyword, "mat4x4"), ptr: new We("ptr", exports.TokenClass.keyword, "ptr"), sampler: new We("sampler", exports.TokenClass.keyword, "sampler"), sampler_comparison: new We("sampler_comparison", exports.TokenClass.keyword, "sampler_comparison"), struct: new We("struct", exports.TokenClass.keyword, "struct"), texture_1d: new We("texture_1d", exports.TokenClass.keyword, "texture_1d"), texture_2d: new We("texture_2d", exports.TokenClass.keyword, "texture_2d"), texture_2d_array: new We("texture_2d_array", exports.TokenClass.keyword, "texture_2d_array"), texture_3d: new We("texture_3d", exports.TokenClass.keyword, "texture_3d"), texture_cube: new We("texture_cube", exports.TokenClass.keyword, "texture_cube"), texture_cube_array: new We("texture_cube_array", exports.TokenClass.keyword, "texture_cube_array"), texture_multisampled_2d: new We("texture_multisampled_2d", exports.TokenClass.keyword, "texture_multisampled_2d"), texture_storage_1d: new We("texture_storage_1d", exports.TokenClass.keyword, "texture_storage_1d"), texture_storage_2d: new We("texture_storage_2d", exports.TokenClass.keyword, "texture_storage_2d"), texture_storage_2d_array: new We("texture_storage_2d_array", exports.TokenClass.keyword, "texture_storage_2d_array"), texture_storage_3d: new We("texture_storage_3d", exports.TokenClass.keyword, "texture_storage_3d"), texture_depth_2d: new We("texture_depth_2d", exports.TokenClass.keyword, "texture_depth_2d"), texture_depth_2d_array: new We("texture_depth_2d_array", exports.TokenClass.keyword, "texture_depth_2d_array"), texture_depth_cube: new We("texture_depth_cube", exports.TokenClass.keyword, "texture_depth_cube"), texture_depth_cube_array: new We("texture_depth_cube_array", exports.TokenClass.keyword, "texture_depth_cube_array"), texture_depth_multisampled_2d: new We("texture_depth_multisampled_2d", exports.TokenClass.keyword, "texture_depth_multisampled_2d"), texture_external: new We("texture_external", exports.TokenClass.keyword, "texture_external"), u32: new We("u32", exports.TokenClass.keyword, "u32"), vec2: new We("vec2", exports.TokenClass.keyword, "vec2"), vec3: new We("vec3", exports.TokenClass.keyword, "vec3"), vec4: new We("vec4", exports.TokenClass.keyword, "vec4"), bitcast: new We("bitcast", exports.TokenClass.keyword, "bitcast"), block: new We("block", exports.TokenClass.keyword, "block"), break: new We("break", exports.TokenClass.keyword, "break"), case: new We("case", exports.TokenClass.keyword, "case"), continue: new We("continue", exports.TokenClass.keyword, "continue"), continuing: new We("continuing", exports.TokenClass.keyword, "continuing"), default: new We("default", exports.TokenClass.keyword, "default"), diagnostic: new We("diagnostic", exports.TokenClass.keyword, "diagnostic"), discard: new We("discard", exports.TokenClass.keyword, "discard"), else: new We("else", exports.TokenClass.keyword, "else"), enable: new We("enable", exports.TokenClass.keyword, "enable"), fallthrough: new We("fallthrough", exports.TokenClass.keyword, "fallthrough"), false: new We("false", exports.TokenClass.keyword, "false"), fn: new We("fn", exports.TokenClass.keyword, "fn"), for: new We("for", exports.TokenClass.keyword, "for"), function: new We("function", exports.TokenClass.keyword, "function"), if: new We("if", exports.TokenClass.keyword, "if"), let: new We("let", exports.TokenClass.keyword, "let"), const: new We("const", exports.TokenClass.keyword, "const"), loop: new We("loop", exports.TokenClass.keyword, "loop"), while: new We("while", exports.TokenClass.keyword, "while"), private: new We("private", exports.TokenClass.keyword, "private"), read: new We("read", exports.TokenClass.keyword, "read"), read_write: new We("read_write", exports.TokenClass.keyword, "read_write"), return: new We("return", exports.TokenClass.keyword, "return"), requires: new We("requires", exports.TokenClass.keyword, "requires"), storage: new We("storage", exports.TokenClass.keyword, "storage"), switch: new We("switch", exports.TokenClass.keyword, "switch"), true: new We("true", exports.TokenClass.keyword, "true"), alias: new We("alias", exports.TokenClass.keyword, "alias"), type: new We("type", exports.TokenClass.keyword, "type"), uniform: new We("uniform", exports.TokenClass.keyword, "uniform"), var: new We("var", exports.TokenClass.keyword, "var"), override: new We("override", exports.TokenClass.keyword, "override"), workgroup: new We("workgroup", exports.TokenClass.keyword, "workgroup"), write: new We("write", exports.TokenClass.keyword, "write"), r8unorm: new We("r8unorm", exports.TokenClass.keyword, "r8unorm"), r8snorm: new We("r8snorm", exports.TokenClass.keyword, "r8snorm"), r8uint: new We("r8uint", exports.TokenClass.keyword, "r8uint"), r8sint: new We("r8sint", exports.TokenClass.keyword, "r8sint"), r16uint: new We("r16uint", exports.TokenClass.keyword, "r16uint"), r16sint: new We("r16sint", exports.TokenClass.keyword, "r16sint"), r16float: new We("r16float", exports.TokenClass.keyword, "r16float"), rg8unorm: new We("rg8unorm", exports.TokenClass.keyword, "rg8unorm"), rg8snorm: new We("rg8snorm", exports.TokenClass.keyword, "rg8snorm"), rg8uint: new We("rg8uint", exports.TokenClass.keyword, "rg8uint"), rg8sint: new We("rg8sint", exports.TokenClass.keyword, "rg8sint"), r32uint: new We("r32uint", exports.TokenClass.keyword, "r32uint"), r32sint: new We("r32sint", exports.TokenClass.keyword, "r32sint"), r32float: new We("r32float", exports.TokenClass.keyword, "r32float"), rg16uint: new We("rg16uint", exports.TokenClass.keyword, "rg16uint"), rg16sint: new We("rg16sint", exports.TokenClass.keyword, "rg16sint"), rg16float: new We("rg16float", exports.TokenClass.keyword, "rg16float"), rgba8unorm: new We("rgba8unorm", exports.TokenClass.keyword, "rgba8unorm"), rgba8unorm_srgb: new We("rgba8unorm_srgb", exports.TokenClass.keyword, "rgba8unorm_srgb"), rgba8snorm: new We("rgba8snorm", exports.TokenClass.keyword, "rgba8snorm"), rgba8uint: new We("rgba8uint", exports.TokenClass.keyword, "rgba8uint"), rgba8sint: new We("rgba8sint", exports.TokenClass.keyword, "rgba8sint"), bgra8unorm: new We("bgra8unorm", exports.TokenClass.keyword, "bgra8unorm"), bgra8unorm_srgb: new We("bgra8unorm_srgb", exports.TokenClass.keyword, "bgra8unorm_srgb"), rgb10a2unorm: new We("rgb10a2unorm", exports.TokenClass.keyword, "rgb10a2unorm"), rg11b10float: new We("rg11b10float", exports.TokenClass.keyword, "rg11b10float"), rg32uint: new We("rg32uint", exports.TokenClass.keyword, "rg32uint"), rg32sint: new We("rg32sint", exports.TokenClass.keyword, "rg32sint"), rg32float: new We("rg32float", exports.TokenClass.keyword, "rg32float"), rgba16uint: new We("rgba16uint", exports.TokenClass.keyword, "rgba16uint"), rgba16sint: new We("rgba16sint", exports.TokenClass.keyword, "rgba16sint"), rgba16float: new We("rgba16float", exports.TokenClass.keyword, "rgba16float"), rgba32uint: new We("rgba32uint", exports.TokenClass.keyword, "rgba32uint"), rgba32sint: new We("rgba32sint", exports.TokenClass.keyword, "rgba32sint"), rgba32float: new We("rgba32float", exports.TokenClass.keyword, "rgba32float"), static_assert: new We("static_assert", exports.TokenClass.keyword, "static_assert") }, qe.tokens = { decimal_float_literal: new We("decimal_float_literal", exports.TokenClass.token, /((-?[0-9]*\.[0-9]+|-?[0-9]+\.[0-9]*)((e|E)(\+|-)?[0-9]+)?[fh]?)|(-?[0-9]+(e|E)(\+|-)?[0-9]+[fh]?)|(-?[0-9]+[fh])/), hex_float_literal: new We("hex_float_literal", exports.TokenClass.token, /-?0x((([0-9a-fA-F]*\.[0-9a-fA-F]+|[0-9a-fA-F]+\.[0-9a-fA-F]*)((p|P)(\+|-)?[0-9]+[fh]?)?)|([0-9a-fA-F]+(p|P)(\+|-)?[0-9]+[fh]?))/), int_literal: new We("int_literal", exports.TokenClass.token, /-?0x[0-9a-fA-F]+|0i?|-?[1-9][0-9]*i?/), uint_literal: new We("uint_literal", exports.TokenClass.token, /0x[0-9a-fA-F]+u|0u|[1-9][0-9]*u/), name: new We("name", exports.TokenClass.token, /([_\p{XID_Start}][\p{XID_Continue}]+)|([\p{XID_Start}])/u), ident: new We("ident", exports.TokenClass.token, /[_a-zA-Z][0-9a-zA-Z_]*/), and: new We("and", exports.TokenClass.token, "&"), and_and: new We("and_and", exports.TokenClass.token, "&&"), arrow: new We("arrow ", exports.TokenClass.token, "->"), attr: new We("attr", exports.TokenClass.token, "@"), forward_slash: new We("forward_slash", exports.TokenClass.token, "/"), bang: new We("bang", exports.TokenClass.token, "!"), bracket_left: new We("bracket_left", exports.TokenClass.token, "["), bracket_right: new We("bracket_right", exports.TokenClass.token, "]"), brace_left: new We("brace_left", exports.TokenClass.token, "{"), brace_right: new We("brace_right", exports.TokenClass.token, "}"), colon: new We("colon", exports.TokenClass.token, ":"), comma: new We("comma", exports.TokenClass.token, ","), equal: new We("equal", exports.TokenClass.token, "="), equal_equal: new We("equal_equal", exports.TokenClass.token, "=="), not_equal: new We("not_equal", exports.TokenClass.token, "!="), greater_than: new We("greater_than", exports.TokenClass.token, ">"), greater_than_equal: new We("greater_than_equal", exports.TokenClass.token, ">="), shift_right: new We("shift_right", exports.TokenClass.token, ">>"), less_than: new We("less_than", exports.TokenClass.token, "<"), less_than_equal: new We("less_than_equal", exports.TokenClass.token, "<="), shift_left: new We("shift_left", exports.TokenClass.token, "<<"), modulo: new We("modulo", exports.TokenClass.token, "%"), minus: new We("minus", exports.TokenClass.token, "-"), minus_minus: new We("minus_minus", exports.TokenClass.token, "--"), period: new We("period", exports.TokenClass.token, "."), plus: new We("plus", exports.TokenClass.token, "+"), plus_plus: new We("plus_plus", exports.TokenClass.token, "++"), or: new We("or", exports.TokenClass.token, "|"), or_or: new We("or_or", exports.TokenClass.token, "||"), paren_left: new We("paren_left", exports.TokenClass.token, "("), paren_right: new We("paren_right", exports.TokenClass.token, ")"), semicolon: new We("semicolon", exports.TokenClass.token, ";"), star: new We("star", exports.TokenClass.token, "*"), tilde: new We("tilde", exports.TokenClass.token, "~"), underscore: new We("underscore", exports.TokenClass.token, "_"), xor: new We("xor", exports.TokenClass.token, "^"), plus_equal: new We("plus_equal", exports.TokenClass.token, "+="), minus_equal: new We("minus_equal", exports.TokenClass.token, "-="), times_equal: new We("times_equal", exports.TokenClass.token, "*="), division_equal: new We("division_equal", exports.TokenClass.token, "/="), modulo_equal: new We("modulo_equal", exports.TokenClass.token, "%="), and_equal: new We("and_equal", exports.TokenClass.token, "&="), or_equal: new We("or_equal", exports.TokenClass.token, "|="), xor_equal: new We("xor_equal", exports.TokenClass.token, "^="), shift_right_equal: new We("shift_right_equal", exports.TokenClass.token, ">>="), shift_left_equal: new We("shift_left_equal", exports.TokenClass.token, "<<=") }, qe.simpleTokens = { "@": H.tokens.attr, "{": H.tokens.brace_left, "}": H.tokens.brace_right, ":": H.tokens.colon, ",": H.tokens.comma, "(": H.tokens.paren_left, ")": H.tokens.paren_right, ";": H.tokens.semicolon }, qe.literalTokens = { "&": H.tokens.and, "&&": H.tokens.and_and, "->": H.tokens.arrow, "/": H.tokens.forward_slash, "!": H.tokens.bang, "[": H.tokens.bracket_left, "]": H.tokens.bracket_right, "=": H.tokens.equal, "==": H.tokens.equal_equal, "!=": H.tokens.not_equal, ">": H.tokens.greater_than, ">=": H.tokens.greater_than_equal, ">>": H.tokens.shift_right, "<": H.tokens.less_than, "<=": H.tokens.less_than_equal, "<<": H.tokens.shift_left, "%": H.tokens.modulo, "-": H.tokens.minus, "--": H.tokens.minus_minus, ".": H.tokens.period, "+": H.tokens.plus, "++": H.tokens.plus_plus, "|": H.tokens.or, "||": H.tokens.or_or, "*": H.tokens.star, "~": H.tokens.tilde, _: H.tokens.underscore, "^": H.tokens.xor, "+=": H.tokens.plus_equal, "-=": H.tokens.minus_equal, "*=": H.tokens.times_equal, "/=": H.tokens.division_equal, "%=": H.tokens.modulo_equal, "&=": H.tokens.and_equal, "|=": H.tokens.or_equal, "^=": H.tokens.xor_equal, ">>=": H.tokens.shift_right_equal, "<<=": H.tokens.shift_left_equal }, qe.regexTokens = { decimal_float_literal: H.tokens.decimal_float_literal, hex_float_literal: H.tokens.hex_float_literal, int_literal: H.tokens.int_literal, uint_literal: H.tokens.uint_literal, ident: H.tokens.ident }, qe.storage_class = [H.keywords.function, H.keywords.private, H.keywords.workgroup, H.keywords.uniform, H.keywords.storage], qe.access_mode = [H.keywords.read, H.keywords.write, H.keywords.read_write], qe.sampler_type = [H.keywords.sampler, H.keywords.sampler_comparison], qe.sampled_texture_type = [H.keywords.texture_1d, H.keywords.texture_2d, H.keywords.texture_2d_array, H.keywords.texture_3d, H.keywords.texture_cube, H.keywords.texture_cube_array], qe.multisampled_texture_type = [H.keywords.texture_multisampled_2d], qe.storage_texture_type = [H.keywords.texture_storage_1d, H.keywords.texture_storage_2d, H.keywords.texture_storage_2d_array, H.keywords.texture_storage_3d], qe.depth_texture_type = [H.keywords.texture_depth_2d, H.keywords.texture_depth_2d_array, H.keywords.texture_depth_cube, H.keywords.texture_depth_cube_array, H.keywords.texture_depth_multisampled_2d], qe.texture_external_type = [H.keywords.texture_external], qe.any_texture_type = [...H.sampled_texture_type, ...H.multisampled_texture_type, ...H.storage_texture_type, ...H.depth_texture_type, ...H.texture_external_type], qe.texel_format = [H.keywords.r8unorm, H.keywords.r8snorm, H.keywords.r8uint, H.keywords.r8sint, H.keywords.r16uint, H.keywords.r16sint, H.keywords.r16float, H.keywords.rg8unorm, H.keywords.rg8snorm, H.keywords.rg8uint, H.keywords.rg8sint, H.keywords.r32uint, H.keywords.r32sint, H.keywords.r32float, H.keywords.rg16uint, H.keywords.rg16sint, H.keywords.rg16float, H.keywords.rgba8unorm, H.keywords.rgba8unorm_srgb, H.keywords.rgba8snorm, H.keywords.rgba8uint, H.keywords.rgba8sint, H.keywords.bgra8unorm, H.keywords.bgra8unorm_srgb, H.keywords.rgb10a2unorm, H.keywords.rg11b10float, H.keywords.rg32uint, H.keywords.rg32sint, H.keywords.rg32float, H.keywords.rgba16uint, H.keywords.rgba16sint, H.keywords.rgba16float, H.keywords.rgba32uint, H.keywords.rgba32sint, H.keywords.rgba32float], qe.const_literal = [H.tokens.int_literal, H.tokens.uint_literal, H.tokens.decimal_float_literal, H.tokens.hex_float_literal, H.keywords.true, H.keywords.false], qe.literal_or_ident = [H.tokens.ident, H.tokens.int_literal, H.tokens.uint_literal, H.tokens.decimal_float_literal, H.tokens.hex_float_literal, H.tokens.name], qe.element_count_expression = [H.tokens.int_literal, H.tokens.uint_literal, H.tokens.ident], qe.template_types = [H.keywords.vec2, H.keywords.vec3, H.keywords.vec4, H.keywords.mat2x2, H.keywords.mat2x3, H.keywords.mat2x4, H.keywords.mat3x2, H.keywords.mat3x3, H.keywords.mat3x4, H.keywords.mat4x2, H.keywords.mat4x3, H.keywords.mat4x4, H.keywords.atomic, H.keywords.bitcast, ...H.any_texture_type], qe.attribute_name = [H.tokens.ident, H.keywords.block, H.keywords.diagnostic], qe.assignment_operators = [H.tokens.equal, H.tokens.plus_equal, H.tokens.minus_equal, H.tokens.times_equal, H.tokens.division_equal, H.tokens.modulo_equal, H.tokens.and_equal, H.tokens.or_equal, H.tokens.xor_equal, H.tokens.shift_right_equal, H.tokens.shift_left_equal], qe.increment_operators = [H.tokens.plus_plus, H.tokens.minus_minus];
    var He = class {
      constructor(e2, t2, n2, s2, r2) {
        this.type = e2, this.lexeme = t2, this.line = n2, this.start = s2, this.end = r2;
      }
      toString() {
        return this.lexeme;
      }
      isTemplateType() {
        return -1 != qe.template_types.indexOf(this.type);
      }
      isArrayType() {
        return this.type == qe.keywords.array;
      }
      isArrayOrTemplateType() {
        return this.isArrayType() || this.isTemplateType();
      }
    };
    var ze = class {
      constructor(e2) {
        this._tokens = [], this._start = 0, this._current = 0, this._line = 1, this._source = null != e2 ? e2 : "";
      }
      scanTokens() {
        for (; !this._isAtEnd(); ) if (this._start = this._current, !this.scanToken()) throw `Invalid syntax at line ${this._line}`;
        return this._tokens.push(new He(qe.eof, "", this._line, this._current, this._current)), this._tokens;
      }
      scanToken() {
        let e2 = this._advance();
        if ("\n" == e2) return this._line++, true;
        if (this._isWhitespace(e2)) return true;
        if ("/" == e2) {
          if ("/" == this._peekAhead()) {
            for (; "\n" != e2; ) {
              if (this._isAtEnd()) return true;
              e2 = this._advance();
            }
            return this._line++, true;
          }
          if ("*" == this._peekAhead()) {
            this._advance();
            let t3 = 1;
            for (; t3 > 0; ) {
              if (this._isAtEnd()) return true;
              if (e2 = this._advance(), "\n" == e2) this._line++;
              else if ("*" == e2) {
                if ("/" == this._peekAhead() && (this._advance(), t3--, 0 == t3)) return true;
              } else "/" == e2 && "*" == this._peekAhead() && (this._advance(), t3++);
            }
            return true;
          }
        }
        const t2 = qe.simpleTokens[e2];
        if (t2) return this._addToken(t2), true;
        let n2 = qe.none;
        const s2 = this._isAlpha(e2), r2 = "_" === e2;
        if (this._isAlphaNumeric(e2)) {
          let t3 = this._peekAhead();
          for (; this._isAlphaNumeric(t3); ) e2 += this._advance(), t3 = this._peekAhead();
        }
        if (s2) {
          const t3 = qe.keywords[e2];
          if (t3) return this._addToken(t3), true;
        }
        if (s2 || r2) return this._addToken(qe.tokens.ident), true;
        for (; ; ) {
          let t3 = this._findType(e2);
          const s3 = this._peekAhead();
          if ("-" == e2 && this._tokens.length > 0) {
            if ("=" == s3) return this._current++, e2 += s3, this._addToken(qe.tokens.minus_equal), true;
            if ("-" == s3) return this._current++, e2 += s3, this._addToken(qe.tokens.minus_minus), true;
            const n3 = this._tokens.length - 1;
            if ((-1 != qe.literal_or_ident.indexOf(this._tokens[n3].type) || this._tokens[n3].type == qe.tokens.paren_right) && ">" != s3) return this._addToken(t3), true;
          }
          if (">" == e2 && (">" == s3 || "=" == s3)) {
            let e3 = false, n3 = this._tokens.length - 1;
            for (let t4 = 0; t4 < 5 && n3 >= 0 && -1 === qe.assignment_operators.indexOf(this._tokens[n3].type); ++t4, --n3) if (this._tokens[n3].type === qe.tokens.less_than) {
              n3 > 0 && this._tokens[n3 - 1].isArrayOrTemplateType() && (e3 = true);
              break;
            }
            if (e3) return this._addToken(t3), true;
          }
          if (t3 === qe.none) {
            let s4 = e2, r3 = 0;
            const o2 = 2;
            for (let e3 = 0; e3 < o2; ++e3) if (s4 += this._peekAhead(e3), t3 = this._findType(s4), t3 !== qe.none) {
              r3 = e3;
              break;
            }
            if (t3 === qe.none) return n2 !== qe.none && (this._current--, this._addToken(n2), true);
            e2 = s4, this._current += r3 + 1;
          }
          if (n2 = t3, this._isAtEnd()) break;
          e2 += this._advance();
        }
        return n2 !== qe.none && (this._addToken(n2), true);
      }
      _findType(e2) {
        for (const t3 in qe.regexTokens) {
          const n2 = qe.regexTokens[t3];
          if (this._match(e2, n2.rule)) return n2;
        }
        const t2 = qe.literalTokens[e2];
        return t2 || qe.none;
      }
      _match(e2, t2) {
        const n2 = t2.exec(e2);
        return n2 && 0 == n2.index && n2[0] == e2;
      }
      _isAtEnd() {
        return this._current >= this._source.length;
      }
      _isAlpha(e2) {
        return !this._isNumeric(e2) && !this._isWhitespace(e2) && "_" !== e2 && "." !== e2 && "(" !== e2 && ")" !== e2 && "[" !== e2 && "]" !== e2 && "{" !== e2 && "}" !== e2 && "," !== e2 && ";" !== e2 && ":" !== e2 && "=" !== e2 && "!" !== e2 && "<" !== e2 && ">" !== e2 && "+" !== e2 && "-" !== e2 && "*" !== e2 && "/" !== e2 && "%" !== e2 && "&" !== e2 && "|" !== e2 && "^" !== e2 && "~" !== e2 && "@" !== e2 && "#" !== e2 && "?" !== e2 && "'" !== e2 && "`" !== e2 && '"' !== e2 && "\\" !== e2 && "\n" !== e2 && "\r" !== e2 && "	" !== e2 && "\0" !== e2;
      }
      _isNumeric(e2) {
        return e2 >= "0" && e2 <= "9";
      }
      _isAlphaNumeric(e2) {
        return this._isAlpha(e2) || this._isNumeric(e2) || "_" === e2;
      }
      _isWhitespace(e2) {
        return " " == e2 || "	" == e2 || "\r" == e2;
      }
      _advance(e2 = 0) {
        let t2 = this._source[this._current];
        return e2 = e2 || 0, e2++, this._current += e2, t2;
      }
      _peekAhead(e2 = 0) {
        return e2 = e2 || 0, this._current + e2 >= this._source.length ? "\0" : this._source[this._current + e2];
      }
      _addToken(e2) {
        const t2 = this._source.substring(this._start, this._current);
        this._tokens.push(new He(e2, t2, this._line, this._start, this._current));
      }
    };
    function Re(e2) {
      return Array.isArray(e2) || (null == e2 ? void 0 : e2.buffer) instanceof ArrayBuffer;
    }
    var Ge = new Float32Array(1);
    var Xe = new Uint32Array(Ge.buffer);
    var je = new Uint32Array(Ge.buffer);
    var Ze = new Int32Array(1);
    var Qe = new Float32Array(Ze.buffer);
    var Ye = new Uint32Array(Ze.buffer);
    var Ke = new Uint32Array(1);
    var Je = new Float32Array(Ke.buffer);
    var et = new Int32Array(Ke.buffer);
    function tt(e2, t2, n2) {
      if (t2 === n2) return e2;
      if ("f32" === t2) {
        if ("i32" === n2 || "x32" === n2) return Ge[0] = e2, Xe[0];
        if ("u32" === n2) return Ge[0] = e2, je[0];
      } else if ("i32" === t2 || "x32" === t2) {
        if ("f32" === n2) return Ze[0] = e2, Qe[0];
        if ("u32" === n2) return Ze[0] = e2, Ye[0];
      } else if ("u32" === t2) {
        if ("f32" === n2) return Ke[0] = e2, Je[0];
        if ("i32" === n2 || "x32" === n2) return Ke[0] = e2, et[0];
      }
      return console.error(`Unsupported cast from ${t2} to ${n2}`), e2;
    }
    var nt = class {
      constructor(e2) {
        this.resources = null, this.inUse = false, this.info = null, this.node = e2;
      }
    };
    var st = class {
      constructor(e2, t2) {
        this.align = e2, this.size = t2;
      }
    };
    var rt = class _rt {
      constructor() {
        this.uniforms = [], this.storage = [], this.textures = [], this.samplers = [], this.aliases = [], this.overrides = [], this.structs = [], this.entry = new d(), this.functions = [], this._types = /* @__PURE__ */ new Map(), this._functions = /* @__PURE__ */ new Map();
      }
      _isStorageTexture(e2) {
        return "texture_storage_1d" == e2.name || "texture_storage_2d" == e2.name || "texture_storage_2d_array" == e2.name || "texture_storage_3d" == e2.name;
      }
      updateAST(e2) {
        for (const t2 of e2) t2 instanceof D && this._functions.set(t2.name, new nt(t2));
        for (const t2 of e2) if (t2 instanceof ie) {
          const e3 = this.getTypeInfo(t2, null);
          e3 instanceof n && this.structs.push(e3);
        }
        for (const t2 of e2) if (t2 instanceof te) this.aliases.push(this._getAliasInfo(t2));
        else {
          if (t2 instanceof M) {
            const e3 = t2, n2 = this._getAttributeNum(e3.attributes, "id", 0), s2 = null != e3.type ? this.getTypeInfo(e3.type, e3.attributes) : null;
            this.overrides.push(new h(e3.name, s2, e3.attributes, n2));
            continue;
          }
          if (this._isUniformVar(t2)) {
            const e3 = t2, n2 = this._getAttributeNum(e3.attributes, "group", 0), s2 = this._getAttributeNum(e3.attributes, "binding", 0), r2 = this.getTypeInfo(e3.type, e3.attributes), o2 = new i(e3.name, r2, n2, s2, e3.attributes, exports.ResourceType.Uniform, e3.access);
            o2.access || (o2.access = "read"), this.uniforms.push(o2);
            continue;
          }
          if (this._isStorageVar(t2)) {
            const e3 = t2, n2 = this._getAttributeNum(e3.attributes, "group", 0), s2 = this._getAttributeNum(e3.attributes, "binding", 0), r2 = this.getTypeInfo(e3.type, e3.attributes), o2 = this._isStorageTexture(r2), a2 = new i(e3.name, r2, n2, s2, e3.attributes, o2 ? exports.ResourceType.StorageTexture : exports.ResourceType.Storage, e3.access);
            a2.access || (a2.access = "read"), this.storage.push(a2);
            continue;
          }
          if (this._isTextureVar(t2)) {
            const e3 = t2, n2 = this._getAttributeNum(e3.attributes, "group", 0), s2 = this._getAttributeNum(e3.attributes, "binding", 0), r2 = this.getTypeInfo(e3.type, e3.attributes), o2 = this._isStorageTexture(r2), a2 = new i(e3.name, r2, n2, s2, e3.attributes, o2 ? exports.ResourceType.StorageTexture : exports.ResourceType.Texture, e3.access);
            a2.access || (a2.access = "read"), o2 ? this.storage.push(a2) : this.textures.push(a2);
            continue;
          }
          if (this._isSamplerVar(t2)) {
            const e3 = t2, n2 = this._getAttributeNum(e3.attributes, "group", 0), s2 = this._getAttributeNum(e3.attributes, "binding", 0), r2 = this.getTypeInfo(e3.type, e3.attributes), o2 = new i(e3.name, r2, n2, s2, e3.attributes, exports.ResourceType.Sampler, e3.access);
            this.samplers.push(o2);
            continue;
          }
        }
        for (const t2 of e2) if (t2 instanceof D) {
          const e3 = this._getAttribute(t2, "vertex"), n2 = this._getAttribute(t2, "fragment"), s2 = this._getAttribute(t2, "compute"), r2 = e3 || n2 || s2, o2 = new p(t2.name, null == r2 ? void 0 : r2.name, t2.attributes);
          o2.attributes = t2.attributes, o2.startLine = t2.startLine, o2.endLine = t2.endLine, this.functions.push(o2), this._functions.get(t2.name).info = o2, r2 && (this._functions.get(t2.name).inUse = true, o2.inUse = true, o2.resources = this._findResources(t2, !!r2), o2.inputs = this._getInputs(t2.args), o2.outputs = this._getOutputs(t2.returnType), this.entry[r2.name].push(o2)), o2.arguments = t2.args.map((e4) => new f(e4.name, this.getTypeInfo(e4.type, e4.attributes), e4.attributes)), o2.returnType = t2.returnType ? this.getTypeInfo(t2.returnType, t2.attributes) : null;
          continue;
        }
        for (const e3 of this._functions.values()) e3.info && (e3.info.inUse = e3.inUse, this._addCalls(e3.node, e3.info.calls));
        for (const e3 of this._functions.values()) e3.node.search((t2) => {
          var n2, s2, r2;
          if (t2 instanceof Le) {
            if (t2.value) if (Re(t2.value)) for (const s3 of t2.value) for (const t3 of this.overrides) s3 === t3.name && (null === (n2 = e3.info) || void 0 === n2 || n2.overrides.push(t3));
            else for (const n3 of this.overrides) t2.value === n3.name && (null === (s2 = e3.info) || void 0 === s2 || s2.overrides.push(n3));
          } else if (t2 instanceof xe) for (const n3 of this.overrides) t2.name === n3.name && (null === (r2 = e3.info) || void 0 === r2 || r2.overrides.push(n3));
        });
        for (const e3 of this.uniforms) this._markStructsInUse(e3.type);
        for (const e3 of this.storage) this._markStructsInUse(e3.type);
      }
      getFunctionInfo(e2) {
        for (const t2 of this.functions) if (t2.name == e2) return t2;
        return null;
      }
      getStructInfo(e2) {
        for (const t2 of this.structs) if (t2.name == e2) return t2;
        return null;
      }
      getOverrideInfo(e2) {
        for (const t2 of this.overrides) if (t2.name == e2) return t2;
        return null;
      }
      _markStructsInUse(e2) {
        if (e2) if (e2.isStruct) {
          if (e2.inUse = true, e2.members) for (const t2 of e2.members) this._markStructsInUse(t2.type);
        } else if (e2.isArray) this._markStructsInUse(e2.format);
        else if (e2.isTemplate) e2.format && this._markStructsInUse(e2.format);
        else {
          const t2 = this._getAlias(e2.name);
          t2 && this._markStructsInUse(t2);
        }
      }
      _addCalls(e2, t2) {
        var n2;
        for (const s2 of e2.calls) {
          const e3 = null === (n2 = this._functions.get(s2.name)) || void 0 === n2 ? void 0 : n2.info;
          e3 && t2.add(e3);
        }
      }
      findResource(e2, t2, n2) {
        if (n2) {
          for (const s2 of this.entry.compute) if (s2.name === n2) {
            for (const n3 of s2.resources) if (n3.group == e2 && n3.binding == t2) return n3;
          }
          for (const s2 of this.entry.vertex) if (s2.name === n2) {
            for (const n3 of s2.resources) if (n3.group == e2 && n3.binding == t2) return n3;
          }
          for (const s2 of this.entry.fragment) if (s2.name === n2) {
            for (const n3 of s2.resources) if (n3.group == e2 && n3.binding == t2) return n3;
          }
        }
        for (const n3 of this.uniforms) if (n3.group == e2 && n3.binding == t2) return n3;
        for (const n3 of this.storage) if (n3.group == e2 && n3.binding == t2) return n3;
        for (const n3 of this.textures) if (n3.group == e2 && n3.binding == t2) return n3;
        for (const n3 of this.samplers) if (n3.group == e2 && n3.binding == t2) return n3;
        return null;
      }
      _findResource(e2) {
        for (const t2 of this.uniforms) if (t2.name == e2) return t2;
        for (const t2 of this.storage) if (t2.name == e2) return t2;
        for (const t2 of this.textures) if (t2.name == e2) return t2;
        for (const t2 of this.samplers) if (t2.name == e2) return t2;
        return null;
      }
      _markStructsFromAST(e2) {
        const t2 = this.getTypeInfo(e2, null);
        this._markStructsInUse(t2);
      }
      _findResources(e2, t2) {
        const n2 = [], s2 = this, r2 = [];
        return e2.search((o2) => {
          if (o2 instanceof A) r2.push({});
          else if (o2 instanceof E) r2.pop();
          else if (o2 instanceof F) {
            const e3 = o2;
            t2 && null !== e3.type && this._markStructsFromAST(e3.type), r2.length > 0 && (r2[r2.length - 1][e3.name] = e3);
          } else if (o2 instanceof de) {
            const e3 = o2;
            t2 && null !== e3.type && this._markStructsFromAST(e3.type);
          } else if (o2 instanceof U) {
            const e3 = o2;
            t2 && null !== e3.type && this._markStructsFromAST(e3.type), r2.length > 0 && (r2[r2.length - 1][e3.name] = e3);
          } else if (o2 instanceof xe) {
            const e3 = o2;
            if (r2.length > 0) {
              if (r2[r2.length - 1][e3.name]) return;
            }
            const t3 = s2._findResource(e3.name);
            t3 && n2.push(t3);
          } else if (o2 instanceof me) {
            const r3 = o2, a2 = s2._functions.get(r3.name);
            a2 && (t2 && (a2.inUse = true), e2.calls.add(a2.node), null === a2.resources && (a2.resources = s2._findResources(a2.node, t2)), n2.push(...a2.resources));
          } else if (o2 instanceof X) {
            const r3 = o2, a2 = s2._functions.get(r3.name);
            a2 && (t2 && (a2.inUse = true), e2.calls.add(a2.node), null === a2.resources && (a2.resources = s2._findResources(a2.node, t2)), n2.push(...a2.resources));
          }
        }), [...new Map(n2.map((e3) => [e3.name, e3])).values()];
      }
      getBindGroups() {
        const e2 = [];
        function t2(t3, n2) {
          t3 >= e2.length && (e2.length = t3 + 1), void 0 === e2[t3] && (e2[t3] = []), n2 >= e2[t3].length && (e2[t3].length = n2 + 1);
        }
        for (const n2 of this.uniforms) {
          t2(n2.group, n2.binding);
          e2[n2.group][n2.binding] = n2;
        }
        for (const n2 of this.storage) {
          t2(n2.group, n2.binding);
          e2[n2.group][n2.binding] = n2;
        }
        for (const n2 of this.textures) {
          t2(n2.group, n2.binding);
          e2[n2.group][n2.binding] = n2;
        }
        for (const n2 of this.samplers) {
          t2(n2.group, n2.binding);
          e2[n2.group][n2.binding] = n2;
        }
        return e2;
      }
      _getOutputs(e2, t2 = void 0) {
        if (void 0 === t2 && (t2 = []), e2 instanceof ie) this._getStructOutputs(e2, t2);
        else {
          const n2 = this._getOutputInfo(e2);
          null !== n2 && t2.push(n2);
        }
        return t2;
      }
      _getStructOutputs(e2, t2) {
        for (const n2 of e2.members) if (n2.type instanceof ie) this._getStructOutputs(n2.type, t2);
        else {
          const e3 = this._getAttribute(n2, "location") || this._getAttribute(n2, "builtin");
          if (null !== e3) {
            const s2 = this.getTypeInfo(n2.type, n2.type.attributes), r2 = this._parseInt(e3.value), o2 = new u(n2.name, s2, e3.name, r2);
            t2.push(o2);
          }
        }
      }
      _getOutputInfo(e2) {
        const t2 = this._getAttribute(e2, "location") || this._getAttribute(e2, "builtin");
        if (null !== t2) {
          const n2 = this.getTypeInfo(e2, e2.attributes), s2 = this._parseInt(t2.value);
          return new u("", n2, t2.name, s2);
        }
        return null;
      }
      _getInputs(e2, t2 = void 0) {
        void 0 === t2 && (t2 = []);
        for (const n2 of e2) if (n2.type instanceof ie) this._getStructInputs(n2.type, t2);
        else {
          const e3 = this._getInputInfo(n2);
          null !== e3 && t2.push(e3);
        }
        return t2;
      }
      _getStructInputs(e2, t2) {
        for (const n2 of e2.members) if (n2.type instanceof ie) this._getStructInputs(n2.type, t2);
        else {
          const e3 = this._getInputInfo(n2);
          null !== e3 && t2.push(e3);
        }
      }
      _getInputInfo(e2) {
        const t2 = this._getAttribute(e2, "location") || this._getAttribute(e2, "builtin");
        if (null !== t2) {
          const n2 = this._getAttribute(e2, "interpolation"), s2 = this.getTypeInfo(e2.type, e2.attributes), r2 = this._parseInt(t2.value), o2 = new c(e2.name, s2, t2.name, r2);
          return null !== n2 && (o2.interpolation = this._parseString(n2.value)), o2;
        }
        return null;
      }
      _parseString(e2) {
        return e2 instanceof Array && (e2 = e2[0]), e2;
      }
      _parseInt(e2) {
        e2 instanceof Array && (e2 = e2[0]);
        const t2 = parseInt(e2);
        return isNaN(t2) ? e2 : t2;
      }
      _getAlias(e2) {
        for (const t2 of this.aliases) if (t2.name == e2) return t2.type;
        return null;
      }
      _getAliasInfo(e2) {
        return new l(e2.name, this.getTypeInfo(e2.type, null));
      }
      getTypeInfoByName(e2) {
        for (const t2 of this.structs) if (t2.name == e2) return t2;
        for (const t2 of this.aliases) if (t2.name == e2) return t2.type;
        return null;
      }
      getTypeInfo(a2, i2 = null) {
        if (this._types.has(a2)) return this._types.get(a2);
        if (a2 instanceof ce) {
          const e2 = a2.type ? this.getTypeInfo(a2.type, a2.attributes) : null, t2 = new r(a2.name, e2, i2);
          return this._types.set(a2, t2), this._updateTypeInfo(t2), t2;
        }
        if (a2 instanceof ue) {
          const e2 = a2, t2 = e2.format ? this.getTypeInfo(e2.format, e2.attributes) : null, n2 = new s(e2.name, i2);
          return n2.format = t2, n2.count = e2.count, this._types.set(a2, n2), this._updateTypeInfo(n2), n2;
        }
        if (a2 instanceof ie) {
          const e2 = a2, s2 = new n(e2.name, i2);
          s2.startLine = e2.startLine, s2.endLine = e2.endLine;
          for (const n2 of e2.members) {
            const e3 = this.getTypeInfo(n2.type, n2.attributes);
            s2.members.push(new t(n2.name, e3, n2.attributes));
          }
          return this._types.set(a2, s2), this._updateTypeInfo(s2), s2;
        }
        if (a2 instanceof he) {
          const t2 = a2, n2 = t2.format instanceof oe, s2 = t2.format ? n2 ? this.getTypeInfo(t2.format, null) : new e(t2.format, null) : null, r2 = new o(t2.name, s2, i2, t2.access);
          return this._types.set(a2, r2), this._updateTypeInfo(r2), r2;
        }
        if (a2 instanceof le) {
          const e2 = a2, t2 = e2.format ? this.getTypeInfo(e2.format, null) : null, n2 = new o(e2.name, t2, i2, e2.access);
          return this._types.set(a2, n2), this._updateTypeInfo(n2), n2;
        }
        const l2 = new e(a2.name, i2);
        return this._types.set(a2, l2), this._updateTypeInfo(l2), l2;
      }
      _updateTypeInfo(e2) {
        var t2, o2, a2;
        const i2 = this._getTypeSize(e2);
        if (e2.size = null !== (t2 = null == i2 ? void 0 : i2.size) && void 0 !== t2 ? t2 : 0, e2 instanceof s && e2.format) {
          const t3 = this._getTypeSize(e2.format);
          e2.stride = Math.max(null !== (o2 = null == t3 ? void 0 : t3.size) && void 0 !== o2 ? o2 : 0, null !== (a2 = null == t3 ? void 0 : t3.align) && void 0 !== a2 ? a2 : 0), this._updateTypeInfo(e2.format);
        }
        e2 instanceof r && this._updateTypeInfo(e2.format), e2 instanceof n && this._updateStructInfo(e2);
      }
      _updateStructInfo(e2) {
        var t2;
        let n2 = 0, s2 = 0, r2 = 0, o2 = 0;
        for (let a2 = 0, i2 = e2.members.length; a2 < i2; ++a2) {
          const i3 = e2.members[a2], l2 = this._getTypeSize(i3);
          if (!l2) continue;
          null !== (t2 = this._getAlias(i3.type.name)) && void 0 !== t2 || i3.type;
          const c2 = l2.align, u2 = l2.size;
          n2 = this._roundUp(c2, n2 + s2), s2 = u2, r2 = n2, o2 = Math.max(o2, c2), i3.offset = n2, i3.size = u2, this._updateTypeInfo(i3.type);
        }
        e2.size = this._roundUp(o2, r2 + s2), e2.align = o2;
      }
      _getTypeSize(r2) {
        var o2, a2;
        if (null == r2) return null;
        const i2 = this._getAttributeNum(r2.attributes, "size", 0), l2 = this._getAttributeNum(r2.attributes, "align", 0);
        if (r2 instanceof t && (r2 = r2.type), r2 instanceof e) {
          const e2 = this._getAlias(r2.name);
          null !== e2 && (r2 = e2);
        }
        {
          const e2 = _rt._typeInfo[r2.name];
          if (void 0 !== e2) {
            const t2 = "f16" === (null === (o2 = r2.format) || void 0 === o2 ? void 0 : o2.name) ? 2 : 1;
            return new st(Math.max(l2, e2.align / t2), Math.max(i2, e2.size / t2));
          }
        }
        {
          const e2 = _rt._typeInfo[r2.name.substring(0, r2.name.length - 1)];
          if (e2) {
            const t2 = "h" === r2.name[r2.name.length - 1] ? 2 : 1;
            return new st(Math.max(l2, e2.align / t2), Math.max(i2, e2.size / t2));
          }
        }
        if (r2 instanceof s) {
          let e2 = r2, t2 = 8, n2 = 8;
          const s2 = this._getTypeSize(e2.format);
          null !== s2 && (n2 = s2.size, t2 = s2.align);
          return n2 = e2.count * this._getAttributeNum(null !== (a2 = null == r2 ? void 0 : r2.attributes) && void 0 !== a2 ? a2 : null, "stride", this._roundUp(t2, n2)), i2 && (n2 = i2), new st(Math.max(l2, t2), Math.max(i2, n2));
        }
        if (r2 instanceof n) {
          let e2 = 0, t2 = 0, n2 = 0, s2 = 0, o3 = 0;
          for (const t3 of r2.members) {
            const r3 = this._getTypeSize(t3.type);
            null !== r3 && (e2 = Math.max(r3.align, e2), n2 = this._roundUp(r3.align, n2 + s2), s2 = r3.size, o3 = n2);
          }
          return t2 = this._roundUp(e2, o3 + s2), new st(Math.max(l2, e2), Math.max(i2, t2));
        }
        return null;
      }
      _isUniformVar(e2) {
        return e2 instanceof F && "uniform" == e2.storage;
      }
      _isStorageVar(e2) {
        return e2 instanceof F && "storage" == e2.storage;
      }
      _isTextureVar(e2) {
        return e2 instanceof F && null !== e2.type && -1 != _rt._textureTypes.indexOf(e2.type.name);
      }
      _isSamplerVar(e2) {
        return e2 instanceof F && null !== e2.type && -1 != _rt._samplerTypes.indexOf(e2.type.name);
      }
      _getAttribute(e2, t2) {
        const n2 = e2;
        if (!n2 || !n2.attributes) return null;
        const s2 = n2.attributes;
        for (let e3 of s2) if (e3.name == t2) return e3;
        return null;
      }
      _getAttributeNum(e2, t2, n2) {
        if (null === e2) return n2;
        for (let s2 of e2) if (s2.name == t2) {
          let e3 = null !== s2 && null !== s2.value ? s2.value : n2;
          return e3 instanceof Array && (e3 = e3[0]), "number" == typeof e3 ? e3 : "string" == typeof e3 ? parseInt(e3) : n2;
        }
        return n2;
      }
      _roundUp(e2, t2) {
        return Math.ceil(t2 / e2) * e2;
      }
    };
    rt._typeInfo = { f16: { align: 2, size: 2 }, i32: { align: 4, size: 4 }, u32: { align: 4, size: 4 }, f32: { align: 4, size: 4 }, atomic: { align: 4, size: 4 }, vec2: { align: 8, size: 8 }, vec3: { align: 16, size: 12 }, vec4: { align: 16, size: 16 }, mat2x2: { align: 8, size: 16 }, mat3x2: { align: 8, size: 24 }, mat4x2: { align: 8, size: 32 }, mat2x3: { align: 16, size: 32 }, mat3x3: { align: 16, size: 48 }, mat4x3: { align: 16, size: 64 }, mat2x4: { align: 16, size: 32 }, mat3x4: { align: 16, size: 48 }, mat4x4: { align: 16, size: 64 } }, rt._textureTypes = qe.any_texture_type.map((e2) => e2.name), rt._samplerTypes = qe.sampler_type.map((e2) => e2.name);
    var ot = 0;
    var at = class _at {
      constructor(e2, t2, n2) {
        this.id = ot++, this.name = e2, this.value = t2, this.node = n2;
      }
      clone() {
        return new _at(this.name, this.value, this.node);
      }
    };
    var it = class _it {
      constructor(e2) {
        this.id = ot++, this.name = e2.name, this.node = e2;
      }
      clone() {
        return new _it(this.node);
      }
    };
    var lt = class _lt {
      constructor(e2) {
        this.parent = null, this.variables = /* @__PURE__ */ new Map(), this.functions = /* @__PURE__ */ new Map(), this.currentFunctionName = "", this.id = ot++, e2 && (this.parent = e2, this.currentFunctionName = e2.currentFunctionName);
      }
      getVariable(e2) {
        var t2;
        return this.variables.has(e2) ? null !== (t2 = this.variables.get(e2)) && void 0 !== t2 ? t2 : null : this.parent ? this.parent.getVariable(e2) : null;
      }
      getFunction(e2) {
        var t2;
        return this.functions.has(e2) ? null !== (t2 = this.functions.get(e2)) && void 0 !== t2 ? t2 : null : this.parent ? this.parent.getFunction(e2) : null;
      }
      createVariable(e2, t2, n2) {
        this.variables.set(e2, new at(e2, t2, null != n2 ? n2 : null));
      }
      setVariable(e2, t2, n2) {
        const s2 = this.getVariable(e2);
        null !== s2 ? s2.value = t2 : this.createVariable(e2, t2, n2);
      }
      getVariableValue(e2) {
        var t2;
        const n2 = this.getVariable(e2);
        return null !== (t2 = null == n2 ? void 0 : n2.value) && void 0 !== t2 ? t2 : null;
      }
      clone() {
        return new _lt(this);
      }
    };
    var ct = class {
      evalExpression(e2, t2) {
        return null;
      }
      getTypeInfo(e2) {
        return null;
      }
      getVariableName(e2, t2) {
        return "";
      }
    };
    var ut = class {
      constructor(e2) {
        this.exec = e2;
      }
      getTypeInfo(e2) {
        return this.exec.getTypeInfo(e2);
      }
      All(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        let s2 = true;
        if (n2 instanceof Fe) return n2.data.forEach((e3) => {
          e3 || (s2 = false);
        }), new Ve(s2 ? 1 : 0, this.getTypeInfo("bool"));
        throw new Error(`All() expects a vector argument. Line ${e2.line}`);
      }
      Any(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) {
          const e3 = n2.data.some((e4) => e4);
          return new Ve(e3 ? 1 : 0, this.getTypeInfo("bool"));
        }
        throw new Error(`Any() expects a vector argument. Line ${e2.line}`);
      }
      Select(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[2], t2);
        if (!(n2 instanceof Ve)) throw new Error(`Select() expects a bool condition. Line ${e2.line}`);
        return n2.value ? this.exec.evalExpression(e2.args[1], t2) : this.exec.evalExpression(e2.args[0], t2);
      }
      ArrayLength(e2, t2) {
        let n2 = e2.args[0];
        n2 instanceof ke && (n2 = n2.right);
        const s2 = this.exec.evalExpression(n2, t2);
        if (s2 instanceof Ue && 0 === s2.typeInfo.size) {
          const e3 = s2.typeInfo, t3 = s2.buffer.byteLength / e3.stride;
          return new Ve(t3, this.getTypeInfo("u32"));
        }
        return new Ve(s2.typeInfo.size, this.getTypeInfo("u32"));
      }
      Abs(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.abs(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.abs(s2.value), s2.typeInfo);
      }
      Acos(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.acos(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.acos(s2.value), n2.typeInfo);
      }
      Acosh(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.acosh(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.acosh(s2.value), n2.typeInfo);
      }
      Asin(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.asin(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.asin(s2.value), n2.typeInfo);
      }
      Asinh(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.asinh(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.asinh(s2.value), n2.typeInfo);
      }
      Atan(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.atan(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.atan(s2.value), n2.typeInfo);
      }
      Atanh(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.atanh(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.atanh(s2.value), n2.typeInfo);
      }
      Atan2(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2);
        if (n2 instanceof Fe && s2 instanceof Fe) return new Fe(n2.data.map((e3, t3) => Math.atan2(e3, s2.data[t3])), n2.typeInfo);
        const r2 = n2, o2 = s2;
        return new Ve(Math.atan2(r2.value, o2.value), n2.typeInfo);
      }
      Ceil(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.ceil(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.ceil(s2.value), n2.typeInfo);
      }
      _clamp(e2, t2, n2) {
        return Math.min(Math.max(e2, t2), n2);
      }
      Clamp(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2), r2 = this.exec.evalExpression(e2.args[2], t2);
        if (n2 instanceof Fe && s2 instanceof Fe && r2 instanceof Fe) return new Fe(n2.data.map((e3, t3) => this._clamp(e3, s2.data[t3], r2.data[t3])), n2.typeInfo);
        const o2 = n2, a2 = s2, i2 = r2;
        return new Ve(this._clamp(o2.value, a2.value, i2.value), n2.typeInfo);
      }
      Cos(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.cos(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.cos(s2.value), n2.typeInfo);
      }
      Cosh(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.cosh(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.cos(s2.value), n2.typeInfo);
      }
      CountLeadingZeros(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.clz32(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.clz32(s2.value), n2.typeInfo);
      }
      _countOneBits(e2) {
        let t2 = 0;
        for (; 0 !== e2; ) 1 & e2 && t2++, e2 >>= 1;
        return t2;
      }
      CountOneBits(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => this._countOneBits(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(this._countOneBits(s2.value), n2.typeInfo);
      }
      _countTrailingZeros(e2) {
        if (0 === e2) return 32;
        let t2 = 0;
        for (; !(1 & e2); ) e2 >>= 1, t2++;
        return t2;
      }
      CountTrailingZeros(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => this._countTrailingZeros(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(this._countTrailingZeros(s2.value), n2.typeInfo);
      }
      Cross(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2);
        if (n2 instanceof Fe && s2 instanceof Fe) {
          if (3 !== n2.data.length || 3 !== s2.data.length) return console.error(`Cross() expects 3D vectors. Line ${e2.line}`), null;
          const t3 = n2.data, r2 = s2.data;
          return new Fe([t3[1] * r2[2] - r2[1] * t3[2], t3[2] * r2[0] - r2[2] * t3[0], t3[0] * r2[1] - r2[0] * t3[1]], n2.typeInfo);
        }
        return console.error(`Cross() expects vector arguments. Line ${e2.line}`), null;
      }
      Degrees(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = 180 / Math.PI;
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => e3 * s2), n2.typeInfo);
        return new Ve(n2.value * s2, this.getTypeInfo("f32"));
      }
      Determinant(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Me) {
          const e3 = n2.data, t3 = n2.typeInfo.getTypeName(), s2 = t3.endsWith("h") ? this.getTypeInfo("f16") : this.getTypeInfo("f32");
          if ("mat2x2" === t3 || "mat2x2f" === t3 || "mat2x2h" === t3) return new Ve(e3[0] * e3[3] - e3[1] * e3[2], s2);
          if ("mat2x3" === t3 || "mat2x3f" === t3 || "mat2x3h" === t3) return new Ve(e3[0] * (e3[4] * e3[8] - e3[5] * e3[7]) - e3[1] * (e3[3] * e3[8] - e3[5] * e3[6]) + e3[2] * (e3[3] * e3[7] - e3[4] * e3[6]), s2);
          if ("mat2x4" === t3 || "mat2x4f" === t3 || "mat2x4h" === t3) console.error(`TODO: Determinant for ${t3}`);
          else if ("mat3x2" === t3 || "mat3x2f" === t3 || "mat3x2h" === t3) console.error(`TODO: Determinant for ${t3}`);
          else {
            if ("mat3x3" === t3 || "mat3x3f" === t3 || "mat3x3h" === t3) return new Ve(e3[0] * (e3[4] * e3[8] - e3[5] * e3[7]) - e3[1] * (e3[3] * e3[8] - e3[5] * e3[6]) + e3[2] * (e3[3] * e3[7] - e3[4] * e3[6]), s2);
            "mat3x4" === t3 || "mat3x4f" === t3 || "mat3x4h" === t3 || "mat4x2" === t3 || "mat4x2f" === t3 || "mat4x2h" === t3 || "mat4x3" === t3 || "mat4x3f" === t3 || "mat4x3h" === t3 ? console.error(`TODO: Determinant for ${t3}`) : "mat4x4" !== t3 && "mat4x4f" !== t3 && "mat4x4h" !== t3 || console.error(`TODO: Determinant for ${t3}`);
          }
        }
        return console.error(`Determinant expects a matrix argument. Line ${e2.line}`), null;
      }
      Distance(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2);
        if (n2 instanceof Fe && s2 instanceof Fe) {
          let e3 = 0;
          for (let t3 = 0; t3 < n2.data.length; ++t3) e3 += (n2.data[t3] - s2.data[t3]) * (n2.data[t3] - s2.data[t3]);
          return new Ve(Math.sqrt(e3), this.getTypeInfo("f32"));
        }
        const r2 = n2, o2 = s2;
        return new Ve(Math.abs(r2.value - o2.value), n2.typeInfo);
      }
      _dot(e2, t2) {
        let n2 = 0;
        for (let s2 = 0; s2 < e2.length; ++s2) n2 += t2[s2] * e2[s2];
        return n2;
      }
      Dot(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2);
        return n2 instanceof Fe && s2 instanceof Fe ? new Ve(this._dot(n2.data, s2.data), this.getTypeInfo("f32")) : (console.error(`Dot() expects vector arguments. Line ${e2.line}`), null);
      }
      Dot4U8Packed(e2, t2) {
        return console.error(`TODO: dot4U8Packed. Line ${e2.line}`), null;
      }
      Dot4I8Packed(e2, t2) {
        return console.error(`TODO: dot4I8Packed. Line ${e2.line}`), null;
      }
      Exp(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.exp(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.exp(s2.value), n2.typeInfo);
      }
      Exp2(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.pow(2, e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.pow(2, s2.value), n2.typeInfo);
      }
      ExtractBits(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2), r2 = this.exec.evalExpression(e2.args[2], t2);
        if ("u32" !== s2.typeInfo.name && "x32" !== s2.typeInfo.name) return console.error(`ExtractBits() expects an i32 offset argument. Line ${e2.line}`), null;
        if ("u32" !== r2.typeInfo.name && "x32" !== r2.typeInfo.name) return console.error(`ExtractBits() expects an i32 count argument. Line ${e2.line}`), null;
        const o2 = s2.value, a2 = r2.value;
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => e3 >> o2 & (1 << a2) - 1), n2.typeInfo);
        if ("i32" !== n2.typeInfo.name && "x32" !== n2.typeInfo.name) return console.error(`ExtractBits() expects an i32 argument. Line ${e2.line}`), null;
        const i2 = n2.value;
        return new Ve(i2 >> o2 & (1 << a2) - 1, this.getTypeInfo("i32"));
      }
      FaceForward(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2), r2 = this.exec.evalExpression(e2.args[2], t2);
        if (n2 instanceof Fe && s2 instanceof Fe && r2 instanceof Fe) {
          const e3 = this._dot(s2.data, r2.data);
          return new Fe(e3 < 0 ? Array.from(n2.data) : n2.data.map((e4) => -e4), n2.typeInfo);
        }
        return console.error(`FaceForward() expects vector arguments. Line ${e2.line}`), null;
      }
      _firstLeadingBit(e2) {
        return 0 === e2 ? -1 : 31 - Math.clz32(e2);
      }
      FirstLeadingBit(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => this._firstLeadingBit(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(this._firstLeadingBit(s2.value), n2.typeInfo);
      }
      _firstTrailingBit(e2) {
        return 0 === e2 ? -1 : Math.log2(e2 & -e2);
      }
      FirstTrailingBit(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => this._firstTrailingBit(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(this._firstTrailingBit(s2.value), n2.typeInfo);
      }
      Floor(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.floor(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.floor(s2.value), n2.typeInfo);
      }
      Fma(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2), r2 = this.exec.evalExpression(e2.args[2], t2);
        if (n2 instanceof Fe && s2 instanceof Fe && r2 instanceof Fe) return n2.data.length !== s2.data.length || n2.data.length !== r2.data.length ? (console.error(`Fma() expects vectors of the same length. Line ${e2.line}`), null) : new Fe(n2.data.map((e3, t3) => e3 * s2.data[t3] + r2.data[t3]), n2.typeInfo);
        const o2 = n2, a2 = s2, i2 = r2;
        return new Ve(o2.value * a2.value + i2.value, o2.typeInfo);
      }
      Fract(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => e3 - Math.floor(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(s2.value - Math.floor(s2.value), n2.typeInfo);
      }
      Frexp(e2, t2) {
        return console.error(`TODO: frexp. Line ${e2.line}`), null;
      }
      InsertBits(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2), r2 = this.exec.evalExpression(e2.args[2], t2), o2 = this.exec.evalExpression(e2.args[3], t2);
        if ("u32" !== r2.typeInfo.name && "x32" !== r2.typeInfo.name) return console.error(`InsertBits() expects an i32 offset argument. Line ${e2.line}`), null;
        const a2 = r2.value, i2 = (1 << o2.value) - 1 << a2, l2 = ~i2;
        if (n2 instanceof Fe && s2 instanceof Fe) return new Fe(n2.data.map((e3, t3) => e3 & l2 | s2.data[t3] << a2 & i2), n2.typeInfo);
        const c2 = n2.value, u2 = s2.value;
        return new Ve(c2 & l2 | u2 << a2 & i2, n2.typeInfo);
      }
      InverseSqrt(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => 1 / Math.sqrt(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(1 / Math.sqrt(s2.value), n2.typeInfo);
      }
      Ldexp(e2, t2) {
        return console.error(`TODO: ldexp. Line ${e2.line}`), null;
      }
      Length(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) {
          let e3 = 0;
          return n2.data.forEach((t3) => {
            e3 += t3 * t3;
          }), new Ve(Math.sqrt(e3), this.getTypeInfo("f32"));
        }
        const s2 = n2;
        return new Ve(Math.abs(s2.value), n2.typeInfo);
      }
      Log(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.log(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.log(s2.value), n2.typeInfo);
      }
      Log2(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.log2(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.log2(s2.value), n2.typeInfo);
      }
      Max(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2);
        if (n2 instanceof Fe && s2 instanceof Fe) return new Fe(n2.data.map((e3, t3) => Math.max(e3, s2.data[t3])), n2.typeInfo);
        const r2 = n2, o2 = s2;
        return new Ve(Math.max(r2.value, o2.value), n2.typeInfo);
      }
      Min(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2);
        if (n2 instanceof Fe && s2 instanceof Fe) return new Fe(n2.data.map((e3, t3) => Math.min(e3, s2.data[t3])), n2.typeInfo);
        const r2 = n2, o2 = s2;
        return new Ve(Math.min(r2.value, o2.value), n2.typeInfo);
      }
      Mix(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2), r2 = this.exec.evalExpression(e2.args[2], t2);
        if (n2 instanceof Fe && s2 instanceof Fe && r2 instanceof Fe) return new Fe(n2.data.map((e3, t3) => n2.data[t3] * (1 - r2.data[t3]) + s2.data[t3] * r2.data[t3]), n2.typeInfo);
        const o2 = s2, a2 = r2;
        return new Ve(n2.value * (1 - a2.value) + o2.value * a2.value, n2.typeInfo);
      }
      Modf(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2);
        if (n2 instanceof Fe && s2 instanceof Fe) return new Fe(n2.data.map((e3, t3) => e3 % s2.data[t3]), n2.typeInfo);
        const r2 = s2;
        return new Ve(n2.value % r2.value, n2.typeInfo);
      }
      Normalize(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) {
          const s2 = this.Length(e2, t2).value;
          return new Fe(n2.data.map((e3) => e3 / s2), n2.typeInfo);
        }
        return console.error(`Normalize() expects a vector argument. Line ${e2.line}`), null;
      }
      Pow(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2);
        if (n2 instanceof Fe && s2 instanceof Fe) return new Fe(n2.data.map((e3, t3) => Math.pow(e3, s2.data[t3])), n2.typeInfo);
        const r2 = n2, o2 = s2;
        return new Ve(Math.pow(r2.value, o2.value), n2.typeInfo);
      }
      QuantizeToF16(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => e3), n2.typeInfo);
        return new Ve(n2.value, n2.typeInfo);
      }
      Radians(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => e3 * Math.PI / 180), n2.typeInfo);
        return new Ve(n2.value * Math.PI / 180, this.getTypeInfo("f32"));
      }
      Reflect(e2, t2) {
        let n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2);
        if (n2 instanceof Fe && s2 instanceof Fe) {
          const e3 = this._dot(n2.data, s2.data);
          return new Fe(n2.data.map((t3, n3) => t3 - 2 * e3 * s2.data[n3]), n2.typeInfo);
        }
        return console.error(`Reflect() expects vector arguments. Line ${e2.line}`), null;
      }
      Refract(e2, t2) {
        let n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2), r2 = this.exec.evalExpression(e2.args[2], t2);
        if (n2 instanceof Fe && s2 instanceof Fe && r2 instanceof Ve) {
          const e3 = this._dot(s2.data, n2.data);
          return new Fe(n2.data.map((t3, n3) => {
            const o2 = 1 - r2.value * r2.value * (1 - e3 * e3);
            if (o2 < 0) return 0;
            const a2 = Math.sqrt(o2);
            return r2.value * t3 - (r2.value * e3 + a2) * s2.data[n3];
          }), n2.typeInfo);
        }
        return console.error(`Refract() expects vector arguments and a scalar argument. Line ${e2.line}`), null;
      }
      ReverseBits(e2, t2) {
        return console.error(`TODO: reverseBits. Line ${e2.line}`), null;
      }
      Round(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.round(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.round(s2.value), n2.typeInfo);
      }
      Saturate(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.min(Math.max(e3, 0), 1)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.min(Math.max(s2.value, 0), 1), n2.typeInfo);
      }
      Sign(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.sign(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.sign(s2.value), n2.typeInfo);
      }
      Sin(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.sin(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.sin(s2.value), n2.typeInfo);
      }
      Sinh(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.sinh(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.sinh(s2.value), n2.typeInfo);
      }
      _smoothstep(e2, t2, n2) {
        const s2 = Math.min(Math.max((n2 - e2) / (t2 - e2), 0), 1);
        return s2 * s2 * (3 - 2 * s2);
      }
      SmoothStep(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2), r2 = this.exec.evalExpression(e2.args[2], t2);
        if (r2 instanceof Fe && n2 instanceof Fe && s2 instanceof Fe) return new Fe(r2.data.map((e3, t3) => this._smoothstep(n2.data[t3], s2.data[t3], e3)), r2.typeInfo);
        const o2 = n2, a2 = s2, i2 = r2;
        return new Ve(this._smoothstep(o2.value, a2.value, i2.value), r2.typeInfo);
      }
      Sqrt(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.sqrt(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.sqrt(s2.value), n2.typeInfo);
      }
      Step(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2), s2 = this.exec.evalExpression(e2.args[1], t2);
        if (s2 instanceof Fe && n2 instanceof Fe) return new Fe(s2.data.map((e3, t3) => e3 < n2.data[t3] ? 0 : 1), s2.typeInfo);
        const r2 = n2;
        return new Ve(s2.value < r2.value ? 0 : 1, r2.typeInfo);
      }
      Tan(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.tan(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.tan(s2.value), n2.typeInfo);
      }
      Tanh(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.tanh(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.tanh(s2.value), n2.typeInfo);
      }
      _getTransposeType(e2) {
        const t2 = e2.getTypeName();
        return "mat2x2f" === t2 || "mat2x2h" === t2 ? e2 : "mat2x3f" === t2 ? this.getTypeInfo("mat3x2f") : "mat2x3h" === t2 ? this.getTypeInfo("mat3x2h") : "mat2x4f" === t2 ? this.getTypeInfo("mat4x2f") : "mat2x4h" === t2 ? this.getTypeInfo("mat4x2h") : "mat3x2f" === t2 ? this.getTypeInfo("mat2x3f") : "mat3x2h" === t2 ? this.getTypeInfo("mat2x3h") : "mat3x3f" === t2 || "mat3x3h" === t2 ? e2 : "mat3x4f" === t2 ? this.getTypeInfo("mat4x3f") : "mat3x4h" === t2 ? this.getTypeInfo("mat4x3h") : "mat4x2f" === t2 ? this.getTypeInfo("mat2x4f") : "mat4x2h" === t2 ? this.getTypeInfo("mat2x4h") : "mat4x3f" === t2 ? this.getTypeInfo("mat3x4f") : "mat4x3h" === t2 ? this.getTypeInfo("mat3x4h") : ("mat4x4f" === t2 || "mat4x4h" === t2 || console.error(`Invalid matrix type ${t2}`), e2);
      }
      Transpose(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (!(n2 instanceof Me)) return console.error(`Transpose() expects a matrix argument. Line ${e2.line}`), null;
        const s2 = this._getTransposeType(n2.typeInfo);
        if ("mat2x2" === n2.typeInfo.name || "mat2x2f" === n2.typeInfo.name || "mat2x2h" === n2.typeInfo.name) {
          const e3 = n2.data;
          return new Me([e3[0], e3[2], e3[1], e3[3]], s2);
        }
        if ("mat2x3" === n2.typeInfo.name || "mat2x3f" === n2.typeInfo.name || "mat2x3h" === n2.typeInfo.name) {
          const e3 = n2.data;
          return new Me([e3[0], e3[3], e3[6], e3[1], e3[4], e3[7]], s2);
        }
        if ("mat2x4" === n2.typeInfo.name || "mat2x4f" === n2.typeInfo.name || "mat2x4h" === n2.typeInfo.name) {
          const e3 = n2.data;
          return new Me([e3[0], e3[4], e3[8], e3[12], e3[1], e3[5], e3[9], e3[13]], s2);
        }
        if ("mat3x2" === n2.typeInfo.name || "mat3x2f" === n2.typeInfo.name || "mat3x2h" === n2.typeInfo.name) {
          const e3 = n2.data;
          return new Me([e3[0], e3[3], e3[1], e3[4], e3[2], e3[5]], s2);
        }
        if ("mat3x3" === n2.typeInfo.name || "mat3x3f" === n2.typeInfo.name || "mat3x3h" === n2.typeInfo.name) {
          const e3 = n2.data;
          return new Me([e3[0], e3[3], e3[6], e3[1], e3[4], e3[7], e3[2], e3[5], e3[8]], s2);
        }
        if ("mat3x4" === n2.typeInfo.name || "mat3x4f" === n2.typeInfo.name || "mat3x4h" === n2.typeInfo.name) {
          const e3 = n2.data;
          return new Me([e3[0], e3[4], e3[8], e3[12], e3[1], e3[5], e3[9], e3[13], e3[2], e3[6], e3[10], e3[14]], s2);
        }
        if ("mat4x2" === n2.typeInfo.name || "mat4x2f" === n2.typeInfo.name || "mat4x2h" === n2.typeInfo.name) {
          const e3 = n2.data;
          return new Me([e3[0], e3[4], e3[1], e3[5], e3[2], e3[6]], s2);
        }
        if ("mat4x3" === n2.typeInfo.name || "mat4x3f" === n2.typeInfo.name || "mat4x3h" === n2.typeInfo.name) {
          const e3 = n2.data;
          return new Me([e3[0], e3[4], e3[8], e3[1], e3[5], e3[9], e3[2], e3[6], e3[10]], s2);
        }
        if ("mat4x4" === n2.typeInfo.name || "mat4x4f" === n2.typeInfo.name || "mat4x4h" === n2.typeInfo.name) {
          const e3 = n2.data;
          return new Me([e3[0], e3[4], e3[8], e3[12], e3[1], e3[5], e3[9], e3[13], e3[2], e3[6], e3[10], e3[14], e3[3], e3[7], e3[11], e3[15]], s2);
        }
        return console.error(`Invalid matrix type ${n2.typeInfo.name}`), null;
      }
      Trunc(e2, t2) {
        const n2 = this.exec.evalExpression(e2.args[0], t2);
        if (n2 instanceof Fe) return new Fe(n2.data.map((e3) => Math.trunc(e3)), n2.typeInfo);
        const s2 = n2;
        return new Ve(Math.trunc(s2.value), n2.typeInfo);
      }
      Dpdx(e2, t2) {
        return console.error(`TODO: dpdx. Line ${e2.line}`), null;
      }
      DpdxCoarse(e2, t2) {
        return console.error(`TODO: dpdxCoarse. Line ${e2.line}`), null;
      }
      DpdxFine(e2, t2) {
        return console.error("TODO: dpdxFine"), null;
      }
      Dpdy(e2, t2) {
        return console.error("TODO: dpdy"), null;
      }
      DpdyCoarse(e2, t2) {
        return console.error("TODO: dpdyCoarse"), null;
      }
      DpdyFine(e2, t2) {
        return console.error("TODO: dpdyFine"), null;
      }
      Fwidth(e2, t2) {
        return console.error("TODO: fwidth"), null;
      }
      FwidthCoarse(e2, t2) {
        return console.error("TODO: fwidthCoarse"), null;
      }
      FwidthFine(e2, t2) {
        return console.error("TODO: fwidthFine"), null;
      }
      TextureDimensions(e2, t2) {
        const n2 = e2.args[0], s2 = e2.args.length > 1 ? this.exec.evalExpression(e2.args[1], t2).value : 0;
        if (n2 instanceof xe) {
          const r2 = n2.name, o2 = t2.getVariableValue(r2);
          if (o2 instanceof Pe) {
            if (s2 < 0 || s2 >= o2.mipLevelCount) return console.error(`Invalid mip level for textureDimensions. Line ${e2.line}`), null;
            const t3 = o2.getMipLevelSize(s2), n3 = o2.dimension;
            return "1d" === n3 ? new Ve(t3[0], this.getTypeInfo("u32")) : "3d" === n3 ? new Fe(t3, this.getTypeInfo("vec3u")) : "2d" === n3 ? new Fe(t3.slice(0, 2), this.getTypeInfo("vec2u")) : (console.error(`Invalid texture dimension ${n3} not found. Line ${e2.line}`), null);
          }
          return console.error(`Texture ${r2} not found. Line ${e2.line}`), null;
        }
        return console.error(`Invalid texture argument for textureDimensions. Line ${e2.line}`), null;
      }
      TextureGather(e2, t2) {
        return console.error("TODO: textureGather"), null;
      }
      TextureGatherCompare(e2, t2) {
        return console.error("TODO: textureGatherCompare"), null;
      }
      TextureLoad(e2, t2) {
        const n2 = e2.args[0], s2 = this.exec.evalExpression(e2.args[1], t2), r2 = e2.args.length > 2 ? this.exec.evalExpression(e2.args[2], t2).value : 0;
        if (!(s2 instanceof Fe) || 2 !== s2.data.length) return console.error(`Invalid UV argument for textureLoad. Line ${e2.line}`), null;
        if (n2 instanceof xe) {
          const o2 = n2.name, a2 = t2.getVariableValue(o2);
          if (a2 instanceof Pe) {
            const t3 = Math.floor(s2.data[0]), n3 = Math.floor(s2.data[1]);
            if (t3 < 0 || t3 >= a2.width || n3 < 0 || n3 >= a2.height) return console.error(`Texture ${o2} out of bounds. Line ${e2.line}`), null;
            const i2 = a2.getPixel(t3, n3, 0, r2);
            return null === i2 ? (console.error(`Invalid texture format for textureLoad. Line ${e2.line}`), null) : new Fe(i2, this.getTypeInfo("vec4f"));
          }
          return console.error(`Texture ${o2} not found. Line ${e2.line}`), null;
        }
        return console.error(`Invalid texture argument for textureLoad. Line ${e2.line}`), null;
      }
      TextureNumLayers(e2, t2) {
        const n2 = e2.args[0];
        if (n2 instanceof xe) {
          const s2 = n2.name, r2 = t2.getVariableValue(s2);
          return r2 instanceof Pe ? new Ve(r2.depthOrArrayLayers, this.getTypeInfo("u32")) : (console.error(`Texture ${s2} not found. Line ${e2.line}`), null);
        }
        return console.error(`Invalid texture argument for textureNumLayers. Line ${e2.line}`), null;
      }
      TextureNumLevels(e2, t2) {
        const n2 = e2.args[0];
        if (n2 instanceof xe) {
          const s2 = n2.name, r2 = t2.getVariableValue(s2);
          return r2 instanceof Pe ? new Ve(r2.mipLevelCount, this.getTypeInfo("u32")) : (console.error(`Texture ${s2} not found. Line ${e2.line}`), null);
        }
        return console.error(`Invalid texture argument for textureNumLevels. Line ${e2.line}`), null;
      }
      TextureNumSamples(e2, t2) {
        const n2 = e2.args[0];
        if (n2 instanceof xe) {
          const s2 = n2.name, r2 = t2.getVariableValue(s2);
          return r2 instanceof Pe ? new Ve(r2.sampleCount, this.getTypeInfo("u32")) : (console.error(`Texture ${s2} not found. Line ${e2.line}`), null);
        }
        return console.error(`Invalid texture argument for textureNumSamples. Line ${e2.line}`), null;
      }
      TextureSample(e2, t2) {
        return console.error("TODO: textureSample"), null;
      }
      TextureSampleBias(e2, t2) {
        return console.error("TODO: textureSampleBias"), null;
      }
      TextureSampleCompare(e2, t2) {
        return console.error("TODO: textureSampleCompare"), null;
      }
      TextureSampleCompareLevel(e2, t2) {
        return console.error("TODO: textureSampleCompareLevel"), null;
      }
      TextureSampleGrad(e2, t2) {
        return console.error("TODO: textureSampleGrad"), null;
      }
      TextureSampleLevel(e2, t2) {
        return console.error("TODO: textureSampleLevel"), null;
      }
      TextureSampleBaseClampToEdge(e2, t2) {
        return console.error("TODO: textureSampleBaseClampToEdge"), null;
      }
      TextureStore(e2, t2) {
        const n2 = e2.args[0], s2 = this.exec.evalExpression(e2.args[1], t2), r2 = 4 === e2.args.length ? this.exec.evalExpression(e2.args[2], t2).value : 0, o2 = 4 === e2.args.length ? this.exec.evalExpression(e2.args[3], t2).data : this.exec.evalExpression(e2.args[2], t2).data;
        if (4 !== o2.length) return console.error(`Invalid value argument for textureStore. Line ${e2.line}`), null;
        if (!(s2 instanceof Fe) || 2 !== s2.data.length) return console.error(`Invalid UV argument for textureStore. Line ${e2.line}`), null;
        if (n2 instanceof xe) {
          const a2 = n2.name, i2 = t2.getVariableValue(a2);
          if (i2 instanceof Pe) {
            const t3 = i2.getMipLevelSize(0), n3 = Math.floor(s2.data[0]), l2 = Math.floor(s2.data[1]);
            return n3 < 0 || n3 >= t3[0] || l2 < 0 || l2 >= t3[1] ? (console.error(`Texture ${a2} out of bounds. Line ${e2.line}`), null) : (i2.setPixel(n3, l2, 0, r2, Array.from(o2)), null);
          }
          return console.error(`Texture ${a2} not found. Line ${e2.line}`), null;
        }
        return console.error(`Invalid texture argument for textureStore. Line ${e2.line}`), null;
      }
      AtomicLoad(e2, t2) {
        let n2 = e2.args[0];
        n2 instanceof ke && (n2 = n2.right);
        const s2 = this.exec.getVariableName(n2, t2);
        return t2.getVariable(s2).value.getSubData(this.exec, n2.postfix, t2);
      }
      AtomicStore(e2, t2) {
        let n2 = e2.args[0];
        n2 instanceof ke && (n2 = n2.right);
        const s2 = this.exec.getVariableName(n2, t2), r2 = t2.getVariable(s2);
        let o2 = e2.args[1];
        const a2 = this.exec.evalExpression(o2, t2), i2 = r2.value.getSubData(this.exec, n2.postfix, t2);
        return i2 instanceof Ve && a2 instanceof Ve && (i2.value = a2.value), r2.value instanceof Ue && r2.value.setDataValue(this.exec, i2, n2.postfix, t2), null;
      }
      AtomicAdd(e2, t2) {
        let n2 = e2.args[0];
        n2 instanceof ke && (n2 = n2.right);
        const s2 = this.exec.getVariableName(n2, t2), r2 = t2.getVariable(s2);
        let o2 = e2.args[1];
        const a2 = this.exec.evalExpression(o2, t2), i2 = r2.value.getSubData(this.exec, n2.postfix, t2), l2 = new Ve(i2.value, i2.typeInfo);
        return i2 instanceof Ve && a2 instanceof Ve && (i2.value += a2.value), r2.value instanceof Ue && r2.value.setDataValue(this.exec, i2, n2.postfix, t2), l2;
      }
      AtomicSub(e2, t2) {
        let n2 = e2.args[0];
        n2 instanceof ke && (n2 = n2.right);
        const s2 = this.exec.getVariableName(n2, t2), r2 = t2.getVariable(s2);
        let o2 = e2.args[1];
        const a2 = this.exec.evalExpression(o2, t2), i2 = r2.value.getSubData(this.exec, n2.postfix, t2), l2 = new Ve(i2.value, i2.typeInfo);
        return i2 instanceof Ve && a2 instanceof Ve && (i2.value -= a2.value), r2.value instanceof Ue && r2.value.setDataValue(this.exec, i2, n2.postfix, t2), l2;
      }
      AtomicMax(e2, t2) {
        let n2 = e2.args[0];
        n2 instanceof ke && (n2 = n2.right);
        const s2 = this.exec.getVariableName(n2, t2), r2 = t2.getVariable(s2);
        let o2 = e2.args[1];
        const a2 = this.exec.evalExpression(o2, t2), i2 = r2.value.getSubData(this.exec, n2.postfix, t2), l2 = new Ve(i2.value, i2.typeInfo);
        return i2 instanceof Ve && a2 instanceof Ve && (i2.value = Math.max(i2.value, a2.value)), r2.value instanceof Ue && r2.value.setDataValue(this.exec, i2, n2.postfix, t2), l2;
      }
      AtomicMin(e2, t2) {
        let n2 = e2.args[0];
        n2 instanceof ke && (n2 = n2.right);
        const s2 = this.exec.getVariableName(n2, t2), r2 = t2.getVariable(s2);
        let o2 = e2.args[1];
        const a2 = this.exec.evalExpression(o2, t2), i2 = r2.value.getSubData(this.exec, n2.postfix, t2), l2 = new Ve(i2.value, i2.typeInfo);
        return i2 instanceof Ve && a2 instanceof Ve && (i2.value = Math.min(i2.value, a2.value)), r2.value instanceof Ue && r2.value.setDataValue(this.exec, i2, n2.postfix, t2), l2;
      }
      AtomicAnd(e2, t2) {
        let n2 = e2.args[0];
        n2 instanceof ke && (n2 = n2.right);
        const s2 = this.exec.getVariableName(n2, t2), r2 = t2.getVariable(s2);
        let o2 = e2.args[1];
        const a2 = this.exec.evalExpression(o2, t2), i2 = r2.value.getSubData(this.exec, n2.postfix, t2), l2 = new Ve(i2.value, i2.typeInfo);
        return i2 instanceof Ve && a2 instanceof Ve && (i2.value = i2.value & a2.value), r2.value instanceof Ue && r2.value.setDataValue(this.exec, i2, n2.postfix, t2), l2;
      }
      AtomicOr(e2, t2) {
        let n2 = e2.args[0];
        n2 instanceof ke && (n2 = n2.right);
        const s2 = this.exec.getVariableName(n2, t2), r2 = t2.getVariable(s2);
        let o2 = e2.args[1];
        const a2 = this.exec.evalExpression(o2, t2), i2 = r2.value.getSubData(this.exec, n2.postfix, t2), l2 = new Ve(i2.value, i2.typeInfo);
        return i2 instanceof Ve && a2 instanceof Ve && (i2.value = i2.value | a2.value), r2.value instanceof Ue && r2.value.setDataValue(this.exec, i2, n2.postfix, t2), l2;
      }
      AtomicXor(e2, t2) {
        let n2 = e2.args[0];
        n2 instanceof ke && (n2 = n2.right);
        const s2 = this.exec.getVariableName(n2, t2), r2 = t2.getVariable(s2);
        let o2 = e2.args[1];
        const a2 = this.exec.evalExpression(o2, t2), i2 = r2.value.getSubData(this.exec, n2.postfix, t2), l2 = new Ve(i2.value, i2.typeInfo);
        return i2 instanceof Ve && a2 instanceof Ve && (i2.value = i2.value ^ a2.value), r2.value instanceof Ue && r2.value.setDataValue(this.exec, i2, n2.postfix, t2), l2;
      }
      AtomicExchange(e2, t2) {
        let n2 = e2.args[0];
        n2 instanceof ke && (n2 = n2.right);
        const s2 = this.exec.getVariableName(n2, t2), r2 = t2.getVariable(s2);
        let o2 = e2.args[1];
        const a2 = this.exec.evalExpression(o2, t2), i2 = r2.value.getSubData(this.exec, n2.postfix, t2), l2 = new Ve(i2.value, i2.typeInfo);
        return i2 instanceof Ve && a2 instanceof Ve && (i2.value = a2.value), r2.value instanceof Ue && r2.value.setDataValue(this.exec, i2, n2.postfix, t2), l2;
      }
      AtomicCompareExchangeWeak(e2, t2) {
        return console.error("TODO: atomicCompareExchangeWeak"), null;
      }
      Pack4x8snorm(e2, t2) {
        return console.error("TODO: pack4x8snorm"), null;
      }
      Pack4x8unorm(e2, t2) {
        return console.error("TODO: pack4x8unorm"), null;
      }
      Pack4xI8(e2, t2) {
        return console.error("TODO: pack4xI8"), null;
      }
      Pack4xU8(e2, t2) {
        return console.error("TODO: pack4xU8"), null;
      }
      Pack4x8Clamp(e2, t2) {
        return console.error("TODO: pack4x8Clamp"), null;
      }
      Pack4xU8Clamp(e2, t2) {
        return console.error("TODO: pack4xU8Clamp"), null;
      }
      Pack2x16snorm(e2, t2) {
        return console.error("TODO: pack2x16snorm"), null;
      }
      Pack2x16unorm(e2, t2) {
        return console.error("TODO: pack2x16unorm"), null;
      }
      Pack2x16float(e2, t2) {
        return console.error("TODO: pack2x16float"), null;
      }
      Unpack4x8snorm(e2, t2) {
        return console.error("TODO: unpack4x8snorm"), null;
      }
      Unpack4x8unorm(e2, t2) {
        return console.error("TODO: unpack4x8unorm"), null;
      }
      Unpack4xI8(e2, t2) {
        return console.error("TODO: unpack4xI8"), null;
      }
      Unpack4xU8(e2, t2) {
        return console.error("TODO: unpack4xU8"), null;
      }
      Unpack2x16snorm(e2, t2) {
        return console.error("TODO: unpack2x16snorm"), null;
      }
      Unpack2x16unorm(e2, t2) {
        return console.error("TODO: unpack2x16unorm"), null;
      }
      Unpack2x16float(e2, t2) {
        return console.error("TODO: unpack2x16float"), null;
      }
      StorageBarrier(e2, t2) {
        return null;
      }
      TextureBarrier(e2, t2) {
        return null;
      }
      WorkgroupBarrier(e2, t2) {
        return null;
      }
      WorkgroupUniformLoad(e2, t2) {
        return null;
      }
      SubgroupAdd(e2, t2) {
        return console.error("TODO: subgroupAdd"), null;
      }
      SubgroupExclusiveAdd(e2, t2) {
        return console.error("TODO: subgroupExclusiveAdd"), null;
      }
      SubgroupInclusiveAdd(e2, t2) {
        return console.error("TODO: subgroupInclusiveAdd"), null;
      }
      SubgroupAll(e2, t2) {
        return console.error("TODO: subgroupAll"), null;
      }
      SubgroupAnd(e2, t2) {
        return console.error("TODO: subgroupAnd"), null;
      }
      SubgroupAny(e2, t2) {
        return console.error("TODO: subgroupAny"), null;
      }
      SubgroupBallot(e2, t2) {
        return console.error("TODO: subgroupBallot"), null;
      }
      SubgroupBroadcast(e2, t2) {
        return console.error("TODO: subgroupBroadcast"), null;
      }
      SubgroupBroadcastFirst(e2, t2) {
        return console.error("TODO: subgroupBroadcastFirst"), null;
      }
      SubgroupElect(e2, t2) {
        return console.error("TODO: subgroupElect"), null;
      }
      SubgroupMax(e2, t2) {
        return console.error("TODO: subgroupMax"), null;
      }
      SubgroupMin(e2, t2) {
        return console.error("TODO: subgroupMin"), null;
      }
      SubgroupMul(e2, t2) {
        return console.error("TODO: subgroupMul"), null;
      }
      SubgroupExclusiveMul(e2, t2) {
        return console.error("TODO: subgroupExclusiveMul"), null;
      }
      SubgroupInclusiveMul(e2, t2) {
        return console.error("TODO: subgroupInclusiveMul"), null;
      }
      SubgroupOr(e2, t2) {
        return console.error("TODO: subgroupOr"), null;
      }
      SubgroupShuffle(e2, t2) {
        return console.error("TODO: subgroupShuffle"), null;
      }
      SubgroupShuffleDown(e2, t2) {
        return console.error("TODO: subgroupShuffleDown"), null;
      }
      SubgroupShuffleUp(e2, t2) {
        return console.error("TODO: subgroupShuffleUp"), null;
      }
      SubgroupShuffleXor(e2, t2) {
        return console.error("TODO: subgroupShuffleXor"), null;
      }
      SubgroupXor(e2, t2) {
        return console.error("TODO: subgroupXor"), null;
      }
      QuadBroadcast(e2, t2) {
        return console.error("TODO: quadBroadcast"), null;
      }
      QuadSwapDiagonal(e2, t2) {
        return console.error("TODO: quadSwapDiagonal"), null;
      }
      QuadSwapX(e2, t2) {
        return console.error("TODO: quadSwapX"), null;
      }
      QuadSwapY(e2, t2) {
        return console.error("TODO: quadSwapY"), null;
      }
    };
    var ht = { vec2: 2, vec2f: 2, vec2i: 2, vec2u: 2, vec2b: 2, vec2h: 2, vec3: 3, vec3f: 3, vec3i: 3, vec3u: 3, vec3b: 3, vec3h: 3, vec4: 4, vec4f: 4, vec4i: 4, vec4u: 4, vec4b: 4, vec4h: 4 };
    var ft = { mat2x2: [2, 2, 4], mat2x2f: [2, 2, 4], mat2x2h: [2, 2, 4], mat2x3: [2, 3, 6], mat2x3f: [2, 3, 6], mat2x3h: [2, 3, 6], mat2x4: [2, 4, 8], mat2x4f: [2, 4, 8], mat2x4h: [2, 4, 8], mat3x2: [3, 2, 6], mat3x2f: [3, 2, 6], mat3x2h: [3, 2, 6], mat3x3: [3, 3, 9], mat3x3f: [3, 3, 9], mat3x3h: [3, 3, 9], mat3x4: [3, 4, 12], mat3x4f: [3, 4, 12], mat3x4h: [3, 4, 12], mat4x2: [4, 2, 8], mat4x2f: [4, 2, 8], mat4x2h: [4, 2, 8], mat4x3: [4, 3, 12], mat4x3f: [4, 3, 12], mat4x3h: [4, 3, 12], mat4x4: [4, 4, 16], mat4x4f: [4, 4, 16], mat4x4h: [4, 4, 16] };
    var pt = class _pt extends ct {
      constructor(e2, t2) {
        var n2;
        super(), this.ast = null != e2 ? e2 : [], this.reflection = new rt(), this.reflection.updateAST(this.ast), this.context = null !== (n2 = null == t2 ? void 0 : t2.clone()) && void 0 !== n2 ? n2 : new lt(), this.builtins = new ut(this), this.typeInfo = { bool: this.getTypeInfo(oe.bool), i32: this.getTypeInfo(oe.i32), u32: this.getTypeInfo(oe.u32), f32: this.getTypeInfo(oe.f32), f16: this.getTypeInfo(oe.f16), vec2f: this.getTypeInfo(le.vec2f), vec2u: this.getTypeInfo(le.vec2u), vec2i: this.getTypeInfo(le.vec2i), vec2h: this.getTypeInfo(le.vec2h), vec3f: this.getTypeInfo(le.vec3f), vec3u: this.getTypeInfo(le.vec3u), vec3i: this.getTypeInfo(le.vec3i), vec3h: this.getTypeInfo(le.vec3h), vec4f: this.getTypeInfo(le.vec4f), vec4u: this.getTypeInfo(le.vec4u), vec4i: this.getTypeInfo(le.vec4i), vec4h: this.getTypeInfo(le.vec4h), mat2x2f: this.getTypeInfo(le.mat2x2f), mat2x3f: this.getTypeInfo(le.mat2x3f), mat2x4f: this.getTypeInfo(le.mat2x4f), mat3x2f: this.getTypeInfo(le.mat3x2f), mat3x3f: this.getTypeInfo(le.mat3x3f), mat3x4f: this.getTypeInfo(le.mat3x4f), mat4x2f: this.getTypeInfo(le.mat4x2f), mat4x3f: this.getTypeInfo(le.mat4x3f), mat4x4f: this.getTypeInfo(le.mat4x4f) };
      }
      getVariableValue(e2) {
        var t2, n2;
        const r2 = null !== (n2 = null === (t2 = this.context.getVariable(e2)) || void 0 === t2 ? void 0 : t2.value) && void 0 !== n2 ? n2 : null;
        if (null === r2) return null;
        if (r2 instanceof Ve) return r2.value;
        if (r2 instanceof Fe) return Array.from(r2.data);
        if (r2 instanceof Me) return Array.from(r2.data);
        if (r2 instanceof Ue && r2.typeInfo instanceof s) {
          if ("u32" === r2.typeInfo.format.name) return Array.from(new Uint32Array(r2.buffer, r2.offset, r2.typeInfo.count));
          if ("i32" === r2.typeInfo.format.name) return Array.from(new Int32Array(r2.buffer, r2.offset, r2.typeInfo.count));
          if ("f32" === r2.typeInfo.format.name) return Array.from(new Float32Array(r2.buffer, r2.offset, r2.typeInfo.count));
        }
        return console.error(`Unsupported return variable type ${r2.typeInfo.name}`), null;
      }
      execute(e2) {
        (e2 = null != e2 ? e2 : {}).constants && this._setOverrides(e2.constants, this.context), this._execStatements(this.ast, this.context);
      }
      dispatchWorkgroups(e2, t2, n2, s2) {
        const r2 = this.context.clone();
        (s2 = null != s2 ? s2 : {}).constants && this._setOverrides(s2.constants, r2), this._execStatements(this.ast, r2);
        const o2 = r2.getFunction(e2);
        if (!o2) return void console.error(`Function ${e2} not found`);
        if ("number" == typeof t2) t2 = [t2, 1, 1];
        else {
          if (0 === t2.length) return void console.error("Invalid dispatch count");
          1 === t2.length ? t2 = [t2[0], 1, 1] : 2 === t2.length ? t2 = [t2[0], t2[1], 1] : t2.length > 3 && (t2 = [t2[0], t2[1], t2[2]]);
        }
        const a2 = t2[0], i2 = t2[1], l2 = t2[2], c2 = this.getTypeInfo("vec3u");
        r2.setVariable("@num_workgroups", new Fe(t2, c2));
        const u2 = this.reflection.getFunctionInfo(e2);
        null === u2 && console.error(`Function ${e2} not found in reflection data`);
        for (const e3 in n2) for (const t3 in n2[e3]) {
          const s3 = n2[e3][t3];
          r2.variables.forEach((n3) => {
            var r3;
            const o3 = n3.node;
            if (null == o3 ? void 0 : o3.attributes) {
              let a3 = null, i3 = null;
              for (const e4 of o3.attributes) "binding" === e4.name ? a3 = e4.value : "group" === e4.name && (i3 = e4.value);
              if (t3 == a3 && e3 == i3) {
                let a4 = false;
                for (const s4 of u2.resources) if (s4.name === n3.name && s4.group === parseInt(e3) && s4.binding === parseInt(t3)) {
                  a4 = true;
                  break;
                }
                if (a4) if (void 0 !== s3.texture && void 0 !== s3.descriptor) {
                  const e4 = new Pe(s3.texture, this.getTypeInfo(o3.type), s3.descriptor, null !== (r3 = s3.texture.view) && void 0 !== r3 ? r3 : null);
                  n3.value = e4;
                } else void 0 !== s3.uniform ? n3.value = new Ue(s3.uniform, this.getTypeInfo(o3.type)) : n3.value = new Ue(s3, this.getTypeInfo(o3.type));
              }
            }
          });
        }
        for (let e3 = 0; e3 < l2; ++e3) for (let t3 = 0; t3 < i2; ++t3) for (let n3 = 0; n3 < a2; ++n3) r2.setVariable("@workgroup_id", new Fe([n3, t3, e3], this.getTypeInfo("vec3u"))), this._dispatchWorkgroup(o2, [n3, t3, e3], r2);
      }
      execStatement(e2, t2) {
        if (e2 instanceof Y) return this.evalExpression(e2.value, t2);
        if (e2 instanceof se) {
          if (e2.condition) {
            const n2 = this.evalExpression(e2.condition, t2);
            if (!(n2 instanceof Ve)) throw new Error("Invalid break-if condition");
            if (!n2.value) return null;
          }
          return _pt._breakObj;
        }
        if (e2 instanceof re) return _pt._continueObj;
        if (e2 instanceof U) this._let(e2, t2);
        else if (e2 instanceof F) this._var(e2, t2);
        else if (e2 instanceof P) this._const(e2, t2);
        else if (e2 instanceof D) this._function(e2, t2);
        else {
          if (e2 instanceof Q) return this._if(e2, t2);
          if (e2 instanceof Z) return this._switch(e2, t2);
          if (e2 instanceof B) return this._for(e2, t2);
          if (e2 instanceof N) return this._while(e2, t2);
          if (e2 instanceof j) return this._loop(e2, t2);
          if (e2 instanceof V) {
            const n2 = t2.clone();
            return n2.currentFunctionName = t2.currentFunctionName, this._execStatements(e2.body, n2);
          }
          if (e2 instanceof G) this._assign(e2, t2);
          else if (e2 instanceof R) this._increment(e2, t2);
          else {
            if (e2 instanceof ie) return null;
            if (e2 instanceof M) {
              const n2 = e2.name;
              null === t2.getVariable(n2) && t2.setVariable(n2, new Ve(0, this.getTypeInfo("u32")));
            } else if (e2 instanceof X) this._call(e2, t2);
            else {
              if (e2 instanceof ee) return null;
              if (e2 instanceof te) return null;
              console.error("Invalid statement type.", e2, `Line ${e2.line}`);
            }
          }
        }
        return null;
      }
      evalExpression(e2, t2) {
        return e2 instanceof we ? this._evalBinaryOp(e2, t2) : e2 instanceof _e ? this._evalLiteral(e2, t2) : e2 instanceof xe ? this._evalVariable(e2, t2) : e2 instanceof me ? this._evalCall(e2, t2) : e2 instanceof de ? this._evalCreate(e2, t2) : e2 instanceof ge ? this._evalConst(e2, t2) : e2 instanceof ye ? this._evalBitcast(e2, t2) : e2 instanceof ke ? this._evalUnaryOp(e2, t2) : (console.error("Invalid expression type", e2, `Line ${e2.line}`), null);
      }
      getTypeInfo(e2) {
        var t2;
        if (e2 instanceof oe) {
          const t3 = this.reflection.getTypeInfo(e2);
          if (null !== t3) return t3;
        }
        let n2 = null !== (t2 = this.typeInfo[e2]) && void 0 !== t2 ? t2 : null;
        return null !== n2 || (n2 = this.reflection.getTypeInfoByName(e2)), n2;
      }
      _setOverrides(e2, t2) {
        for (const n2 in e2) {
          const s2 = e2[n2], r2 = this.reflection.getOverrideInfo(n2);
          null !== r2 ? (null === r2.type && (r2.type = this.getTypeInfo("u32")), "u32" === r2.type.name || "i32" === r2.type.name || "f32" === r2.type.name || "f16" === r2.type.name ? t2.setVariable(n2, new Ve(s2, r2.type)) : "bool" === r2.type.name ? t2.setVariable(n2, new Ve(s2 ? 1 : 0, r2.type)) : "vec2" === r2.type.name || "vec3" === r2.type.name || "vec4" === r2.type.name || "vec2f" === r2.type.name || "vec3f" === r2.type.name || "vec4f" === r2.type.name || "vec2i" === r2.type.name || "vec3i" === r2.type.name || "vec4i" === r2.type.name || "vec2u" === r2.type.name || "vec3u" === r2.type.name || "vec4u" === r2.type.name || "vec2h" === r2.type.name || "vec3h" === r2.type.name || "vec4h" === r2.type.name ? t2.setVariable(n2, new Fe(s2, r2.type)) : console.error(`Invalid constant type for ${n2}`)) : console.error(`Override ${n2} does not exist in the shader.`);
        }
      }
      _dispatchWorkgroup(e2, t2, n2) {
        const s2 = [1, 1, 1];
        for (const t3 of e2.node.attributes) if ("workgroup_size" === t3.name) {
          if (t3.value.length > 0) {
            const e3 = n2.getVariableValue(t3.value[0]);
            s2[0] = e3 instanceof Ve ? e3.value : parseInt(t3.value[0]);
          }
          if (t3.value.length > 1) {
            const e3 = n2.getVariableValue(t3.value[1]);
            s2[1] = e3 instanceof Ve ? e3.value : parseInt(t3.value[1]);
          }
          if (t3.value.length > 2) {
            const e3 = n2.getVariableValue(t3.value[2]);
            s2[2] = e3 instanceof Ve ? e3.value : parseInt(t3.value[2]);
          }
        }
        const r2 = this.getTypeInfo("vec3u"), o2 = this.getTypeInfo("u32");
        n2.setVariable("@workgroup_size", new Fe(s2, r2));
        const a2 = s2[0], i2 = s2[1], l2 = s2[2];
        for (let c2 = 0, u2 = 0; c2 < l2; ++c2) for (let l3 = 0; l3 < i2; ++l3) for (let i3 = 0; i3 < a2; ++i3, ++u2) {
          const a3 = [i3, l3, c2], h2 = [i3 + t2[0] * s2[0], l3 + t2[1] * s2[1], c2 + t2[2] * s2[2]];
          n2.setVariable("@local_invocation_id", new Fe(a3, r2)), n2.setVariable("@global_invocation_id", new Fe(h2, r2)), n2.setVariable("@local_invocation_index", new Ve(u2, o2)), this._dispatchExec(e2, n2);
        }
      }
      _dispatchExec(e2, t2) {
        for (const n2 of e2.node.args) for (const e3 of n2.attributes) if ("builtin" === e3.name) {
          const s2 = `@${e3.value}`, r2 = t2.getVariable(s2);
          void 0 !== r2 && t2.variables.set(n2.name, r2);
        }
        this._execStatements(e2.node.body, t2);
      }
      getVariableName(e2, t2) {
        for (; e2 instanceof ke; ) e2 = e2.right;
        return e2 instanceof xe ? e2.name : (console.error("Unknown variable type", e2, "Line", e2.line), null);
      }
      _execStatements(e2, t2) {
        for (const n2 of e2) {
          if (n2 instanceof Array) {
            const e4 = t2.clone(), s2 = this._execStatements(n2, e4);
            if (s2) return s2;
            continue;
          }
          const e3 = this.execStatement(n2, t2);
          if (e3) return e3;
        }
        return null;
      }
      _call(e2, t2) {
        const n2 = t2.clone();
        n2.currentFunctionName = e2.name;
        const s2 = t2.getFunction(e2.name);
        if (s2) {
          for (let t3 = 0; t3 < s2.node.args.length; ++t3) {
            const r2 = s2.node.args[t3], o2 = this.evalExpression(e2.args[t3], n2);
            n2.setVariable(r2.name, o2, r2);
          }
          this._execStatements(s2.node.body, n2);
        } else if (e2.isBuiltin) this._callBuiltinFunction(e2, n2);
        else {
          this.getTypeInfo(e2.name) && this._evalCreate(e2, t2);
        }
      }
      _increment(e2, t2) {
        const n2 = this.getVariableName(e2.variable, t2), s2 = t2.getVariable(n2);
        s2 ? "++" === e2.operator ? s2.value instanceof Ve ? s2.value.value++ : console.error(`Variable ${n2} is not a scalar. Line ${e2.line}`) : "--" === e2.operator ? s2.value instanceof Ve ? s2.value.value-- : console.error(`Variable ${n2} is not a scalar. Line ${e2.line}`) : console.error(`Unknown increment operator ${e2.operator}. Line ${e2.line}`) : console.error(`Variable ${n2} not found. Line ${e2.line}`);
      }
      _getVariableData(e2, t2) {
        if (e2 instanceof xe) {
          const n2 = this.getVariableName(e2, t2), s2 = t2.getVariable(n2);
          return null === s2 ? (console.error(`Variable ${n2} not found. Line ${e2.line}`), null) : s2.value.getSubData(this, e2.postfix, t2);
        }
        if (e2 instanceof ke) {
          if ("*" === e2.operator) {
            const n2 = this._getVariableData(e2.right, t2);
            return n2 instanceof Ne ? n2.reference.getSubData(this, e2.postfix, t2) : (console.error(`Variable ${e2.right} is not a pointer. Line ${e2.line}`), null);
          }
          if ("&" === e2.operator) {
            const n2 = this._getVariableData(e2.right, t2);
            return new Ne(n2);
          }
        }
        return null;
      }
      _assign(e2, t2) {
        let n2 = null, s2 = "<var>", r2 = null;
        if (e2.variable instanceof ke) {
          const n3 = this._getVariableData(e2.variable, t2), s3 = this.evalExpression(e2.value, t2), r3 = e2.operator;
          if ("=" === r3) {
            if (n3 instanceof Ve || n3 instanceof Fe || n3 instanceof Me) {
              if (s3 instanceof Ve || s3 instanceof Fe || s3 instanceof Me && n3.data.length === s3.data.length) return void n3.data.set(s3.data);
              console.error(`Invalid assignment. Line ${e2.line}`);
            } else if (n3 instanceof Ue && s3 instanceof Ue && n3.buffer.byteLength - n3.offset >= s3.buffer.byteLength - s3.offset) return void (n3.buffer.byteLength % 4 == 0 ? new Uint32Array(n3.buffer, n3.offset, n3.typeInfo.size / 4).set(new Uint32Array(s3.buffer, s3.offset, s3.typeInfo.size / 4)) : new Uint8Array(n3.buffer, n3.offset, n3.typeInfo.size).set(new Uint8Array(s3.buffer, s3.offset, s3.typeInfo.size)));
            return console.error(`Invalid assignment. Line ${e2.line}`), null;
          }
          if ("+=" === r3) return n3 instanceof Ve || n3 instanceof Fe || n3 instanceof Me ? s3 instanceof Ve || s3 instanceof Fe || s3 instanceof Me ? void n3.data.set(s3.data.map((e3, t3) => n3.data[t3] + e3)) : void console.error(`Invalid assignment . Line ${e2.line}`) : void console.error(`Invalid assignment. Line ${e2.line}`);
          if ("-=" === r3) return (n3 instanceof Ve || n3 instanceof Fe || n3 instanceof Me) && (s3 instanceof Ve || s3 instanceof Fe || s3 instanceof Me) ? void n3.data.set(s3.data.map((e3, t3) => n3.data[t3] - e3)) : void console.error(`Invalid assignment. Line ${e2.line}`);
        }
        if (e2.variable instanceof ke) {
          if ("*" === e2.variable.operator) {
            s2 = this.getVariableName(e2.variable.right, t2);
            const r3 = t2.getVariable(s2);
            if (!(r3 && r3.value instanceof Ne)) return void console.error(`Variable ${s2} is not a pointer. Line ${e2.line}`);
            n2 = r3.value.reference;
            let o3 = e2.variable.postfix;
            if (!o3) {
              let t3 = e2.variable.right;
              for (; t3 instanceof ke; ) {
                if (t3.postfix) {
                  o3 = t3.postfix;
                  break;
                }
                t3 = t3.right;
              }
            }
            o3 && (n2 = n2.getSubData(this, o3, t2));
          }
        } else {
          r2 = e2.variable.postfix, s2 = this.getVariableName(e2.variable, t2);
          const o3 = t2.getVariable(s2);
          if (null === o3) return void console.error(`Variable ${s2} not found. Line ${e2.line}`);
          n2 = o3.value;
        }
        if (n2 instanceof Ne && (n2 = n2.reference), null === n2) return void console.error(`Variable ${s2} not found. Line ${e2.line}`);
        const o2 = this.evalExpression(e2.value, t2), a2 = e2.operator;
        if ("=" !== a2) {
          const s3 = n2.getSubData(this, r2, t2);
          if (s3 instanceof Fe && o2 instanceof Ve) {
            const t3 = s3.data, n3 = o2.value;
            if ("+=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] += n3;
            else if ("-=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] -= n3;
            else if ("*=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] *= n3;
            else if ("/=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] /= n3;
            else if ("%=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] %= n3;
            else if ("&=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] &= n3;
            else if ("|=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] |= n3;
            else if ("^=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] ^= n3;
            else if ("<<=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] <<= n3;
            else if (">>=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] >>= n3;
            else console.error(`Invalid operator ${a2}. Line ${e2.line}`);
          } else if (s3 instanceof Fe && o2 instanceof Fe) {
            const t3 = s3.data, n3 = o2.data;
            if (t3.length !== n3.length) return void console.error(`Vector length mismatch. Line ${e2.line}`);
            if ("+=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] += n3[e3];
            else if ("-=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] -= n3[e3];
            else if ("*=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] *= n3[e3];
            else if ("/=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] /= n3[e3];
            else if ("%=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] %= n3[e3];
            else if ("&=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] &= n3[e3];
            else if ("|=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] |= n3[e3];
            else if ("^=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] ^= n3[e3];
            else if ("<<=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] <<= n3[e3];
            else if (">>=" === a2) for (let e3 = 0; e3 < t3.length; ++e3) t3[e3] >>= n3[e3];
            else console.error(`Invalid operator ${a2}. Line ${e2.line}`);
          } else {
            if (!(s3 instanceof Ve && o2 instanceof Ve)) return void console.error(`Invalid type for ${e2.operator} operator. Line ${e2.line}`);
            "+=" === a2 ? s3.value += o2.value : "-=" === a2 ? s3.value -= o2.value : "*=" === a2 ? s3.value *= o2.value : "/=" === a2 ? s3.value /= o2.value : "%=" === a2 ? s3.value %= o2.value : "&=" === a2 ? s3.value &= o2.value : "|=" === a2 ? s3.value |= o2.value : "^=" === a2 ? s3.value ^= o2.value : "<<=" === a2 ? s3.value <<= o2.value : ">>=" === a2 ? s3.value >>= o2.value : console.error(`Invalid operator ${a2}. Line ${e2.line}`);
          }
          return void (n2 instanceof Ue && n2.setDataValue(this, s3, r2, t2));
        }
        if (n2 instanceof Ue) n2.setDataValue(this, o2, r2, t2);
        else if (r2) {
          if (!(n2 instanceof Fe || n2 instanceof Me)) return void console.error(`Variable ${s2} is not a vector or matrix. Line ${e2.line}`);
          if (r2 instanceof be) {
            const a3 = this.evalExpression(r2.index, t2).value;
            if (n2 instanceof Fe) {
              if (!(o2 instanceof Ve)) return void console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
              n2.data[a3] = o2.value;
            } else {
              if (!(n2 instanceof Me)) return void console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
              {
                const a4 = this.evalExpression(r2.index, t2).value;
                if (a4 < 0) return void console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
                if (!(o2 instanceof Fe)) return void console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
                {
                  const t3 = n2.typeInfo.getTypeName();
                  if ("mat2x2" === t3 || "mat2x2f" === t3 || "mat2x2h" === t3) {
                    if (!(a4 < 2 && 2 === o2.data.length)) return void console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
                    n2.data[2 * a4] = o2.data[0], n2.data[2 * a4 + 1] = o2.data[1];
                  } else if ("mat2x3" === t3 || "mat2x3f" === t3 || "mat2x3h" === t3) {
                    if (!(a4 < 2 && 3 === o2.data.length)) return void console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
                    n2.data[3 * a4] = o2.data[0], n2.data[3 * a4 + 1] = o2.data[1], n2.data[3 * a4 + 2] = o2.data[2];
                  } else if ("mat2x4" === t3 || "mat2x4f" === t3 || "mat2x4h" === t3) {
                    if (!(a4 < 2 && 4 === o2.data.length)) return void console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
                    n2.data[4 * a4] = o2.data[0], n2.data[4 * a4 + 1] = o2.data[1], n2.data[4 * a4 + 2] = o2.data[2], n2.data[4 * a4 + 3] = o2.data[3];
                  } else if ("mat3x2" === t3 || "mat3x2f" === t3 || "mat3x2h" === t3) {
                    if (!(a4 < 3 && 2 === o2.data.length)) return void console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
                    n2.data[2 * a4] = o2.data[0], n2.data[2 * a4 + 1] = o2.data[1];
                  } else if ("mat3x3" === t3 || "mat3x3f" === t3 || "mat3x3h" === t3) {
                    if (!(a4 < 3 && 3 === o2.data.length)) return void console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
                    n2.data[3 * a4] = o2.data[0], n2.data[3 * a4 + 1] = o2.data[1], n2.data[3 * a4 + 2] = o2.data[2];
                  } else if ("mat3x4" === t3 || "mat3x4f" === t3 || "mat3x4h" === t3) {
                    if (!(a4 < 3 && 4 === o2.data.length)) return void console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
                    n2.data[4 * a4] = o2.data[0], n2.data[4 * a4 + 1] = o2.data[1], n2.data[4 * a4 + 2] = o2.data[2], n2.data[4 * a4 + 3] = o2.data[3];
                  } else if ("mat4x2" === t3 || "mat4x2f" === t3 || "mat4x2h" === t3) {
                    if (!(a4 < 4 && 2 === o2.data.length)) return void console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
                    n2.data[2 * a4] = o2.data[0], n2.data[2 * a4 + 1] = o2.data[1];
                  } else if ("mat4x3" === t3 || "mat4x3f" === t3 || "mat4x3h" === t3) {
                    if (!(a4 < 4 && 3 === o2.data.length)) return void console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
                    n2.data[3 * a4] = o2.data[0], n2.data[3 * a4 + 1] = o2.data[1], n2.data[3 * a4 + 2] = o2.data[2];
                  } else {
                    if ("mat4x4" !== t3 && "mat4x4f" !== t3 && "mat4x4h" !== t3) return void console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
                    if (!(a4 < 4 && 4 === o2.data.length)) return void console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
                    n2.data[4 * a4] = o2.data[0], n2.data[4 * a4 + 1] = o2.data[1], n2.data[4 * a4 + 2] = o2.data[2], n2.data[4 * a4 + 3] = o2.data[3];
                  }
                }
              }
            }
          } else if (r2 instanceof pe) {
            const t3 = r2.value;
            if (!(n2 instanceof Fe)) return void console.error(`Invalid assignment to ${t3}. Variable ${s2} is not a vector. Line ${e2.line}`);
            if (o2 instanceof Ve) {
              if (t3.length > 1) return void console.error(`Invalid assignment to ${t3} for variable ${s2}. Line ${e2.line}`);
              if ("x" === t3) n2.data[0] = o2.value;
              else if ("y" === t3) {
                if (n2.data.length < 2) return void console.error(`Invalid assignment to ${t3} for variable ${s2}. Line ${e2.line}`);
                n2.data[1] = o2.value;
              } else if ("z" === t3) {
                if (n2.data.length < 3) return void console.error(`Invalid assignment to ${t3} for variable ${s2}. Line ${e2.line}`);
                n2.data[2] = o2.value;
              } else if ("w" === t3) {
                if (n2.data.length < 4) return void console.error(`Invalid assignment to ${t3} for variable ${s2}. Line ${e2.line}`);
                n2.data[3] = o2.value;
              }
            } else {
              if (!(o2 instanceof Fe)) return void console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
              if (t3.length !== o2.data.length) return void console.error(`Invalid assignment to ${t3} for variable ${s2}. Line ${e2.line}`);
              for (let r3 = 0; r3 < t3.length; ++r3) {
                const a3 = t3[r3];
                if ("x" === a3 || "r" === a3) n2.data[0] = o2.data[r3];
                else if ("y" === a3 || "g" === a3) {
                  if (o2.data.length < 2) return void console.error(`Invalid assignment to ${a3} for variable ${s2}. Line ${e2.line}`);
                  n2.data[1] = o2.data[r3];
                } else if ("z" === a3 || "b" === a3) {
                  if (o2.data.length < 3) return void console.error(`Invalid assignment to ${a3} for variable ${s2}. Line ${e2.line}`);
                  n2.data[2] = o2.data[r3];
                } else {
                  if ("w" !== a3 && "a" !== a3) return void console.error(`Invalid assignment to ${a3} for variable ${s2}. Line ${e2.line}`);
                  if (o2.data.length < 4) return void console.error(`Invalid assignment to ${a3} for variable ${s2}. Line ${e2.line}`);
                  n2.data[3] = o2.data[r3];
                }
              }
            }
          }
        } else n2 instanceof Ve && o2 instanceof Ve ? n2.value = o2.value : n2 instanceof Fe && o2 instanceof Fe || n2 instanceof Me && o2 instanceof Me ? n2.data.set(o2.data) : console.error(`Invalid assignment to ${s2}. Line ${e2.line}`);
      }
      _function(e2, t2) {
        const n2 = new it(e2);
        t2.functions.set(e2.name, n2);
      }
      _const(e2, t2) {
        let n2 = null;
        null !== e2.value && (n2 = this.evalExpression(e2.value, t2)), t2.createVariable(e2.name, n2, e2);
      }
      _let(e2, t2) {
        let n2 = null;
        if (null !== e2.value) {
          if (n2 = this.evalExpression(e2.value, t2), null === n2) return void console.error(`Invalid value for variable ${e2.name}. Line ${e2.line}`);
          e2.value instanceof ke || (n2 = n2.clone());
        } else {
          const s2 = e2.type.name;
          if ("f32" === s2 || "i32" === s2 || "u32" === s2 || "bool" === s2 || "f16" === s2 || "vec2" === s2 || "vec3" === s2 || "vec4" === s2 || "vec2f" === s2 || "vec3f" === s2 || "vec4f" === s2 || "vec2i" === s2 || "vec3i" === s2 || "vec4i" === s2 || "vec2u" === s2 || "vec3u" === s2 || "vec4u" === s2 || "vec2h" === s2 || "vec3h" === s2 || "vec4h" === s2 || "vec2b" === s2 || "vec3b" === s2 || "vec4b" === s2 || "mat2x2" === s2 || "mat2x3" === s2 || "mat2x4" === s2 || "mat3x2" === s2 || "mat3x3" === s2 || "mat3x4" === s2 || "mat4x2" === s2 || "mat4x3" === s2 || "mat4x4" === s2 || "mat2x2f" === s2 || "mat2x3f" === s2 || "mat2x4f" === s2 || "mat3x2f" === s2 || "mat3x3f" === s2 || "mat3x4f" === s2 || "mat4x2f" === s2 || "mat4x3f" === s2 || "mat4x4f" === s2 || "mat2x2h" === s2 || "mat2x3h" === s2 || "mat2x4h" === s2 || "mat3x2h" === s2 || "mat3x3h" === s2 || "mat3x4h" === s2 || "mat4x2h" === s2 || "mat4x3h" === s2 || "mat4x4h" === s2 || "array" === s2) {
            const s3 = new de(e2.type, []);
            n2 = this._evalCreate(s3, t2);
          }
        }
        t2.createVariable(e2.name, n2, e2);
      }
      _var(e2, t2) {
        let n2 = null;
        if (null !== e2.value) {
          if (n2 = this.evalExpression(e2.value, t2), null === n2) return void console.error(`Invalid value for variable ${e2.name}. Line ${e2.line}`);
          e2.value instanceof ke || (n2 = n2.clone());
        } else {
          if (null === e2.type) return void console.error(`Variable ${e2.name} has no type. Line ${e2.line}`);
          const s2 = e2.type.name;
          if ("f32" === s2 || "i32" === s2 || "u32" === s2 || "bool" === s2 || "f16" === s2 || "vec2" === s2 || "vec3" === s2 || "vec4" === s2 || "vec2f" === s2 || "vec3f" === s2 || "vec4f" === s2 || "vec2i" === s2 || "vec3i" === s2 || "vec4i" === s2 || "vec2u" === s2 || "vec3u" === s2 || "vec4u" === s2 || "vec2h" === s2 || "vec3h" === s2 || "vec4h" === s2 || "vec2b" === s2 || "vec3b" === s2 || "vec4b" === s2 || "mat2x2" === s2 || "mat2x3" === s2 || "mat2x4" === s2 || "mat3x2" === s2 || "mat3x3" === s2 || "mat3x4" === s2 || "mat4x2" === s2 || "mat4x3" === s2 || "mat4x4" === s2 || "mat2x2f" === s2 || "mat2x3f" === s2 || "mat2x4f" === s2 || "mat3x2f" === s2 || "mat3x3f" === s2 || "mat3x4f" === s2 || "mat4x2f" === s2 || "mat4x3f" === s2 || "mat4x4f" === s2 || "mat2x2h" === s2 || "mat2x3h" === s2 || "mat2x4h" === s2 || "mat3x2h" === s2 || "mat3x3h" === s2 || "mat3x4h" === s2 || "mat4x2h" === s2 || "mat4x3h" === s2 || "mat4x4h" === s2 || e2.type instanceof ue || e2.type instanceof ie || e2.type instanceof le) {
            const s3 = new de(e2.type, []);
            n2 = this._evalCreate(s3, t2);
          }
        }
        t2.createVariable(e2.name, n2, e2);
      }
      _switch(e2, t2) {
        t2 = t2.clone();
        const n2 = this.evalExpression(e2.condition, t2);
        if (!(n2 instanceof Ve)) return console.error(`Invalid if condition. Line ${e2.line}`), null;
        let s2 = null;
        for (const r2 of e2.cases) if (r2 instanceof Se) for (const o2 of r2.selectors) {
          if (o2 instanceof Te) {
            s2 = r2;
            continue;
          }
          const a2 = this.evalExpression(o2, t2);
          if (!(a2 instanceof Ve)) return console.error(`Invalid case selector. Line ${e2.line}`), null;
          if (a2.value === n2.value) return this._execStatements(r2.body, t2);
        }
        else r2 instanceof Ce && (s2 = r2);
        return s2 ? this._execStatements(s2.body, t2) : null;
      }
      _if(e2, t2) {
        t2 = t2.clone();
        const n2 = this.evalExpression(e2.condition, t2);
        if (!(n2 instanceof Ve)) return console.error(`Invalid if condition. Line ${e2.line}`), null;
        if (n2.value) return this._execStatements(e2.body, t2);
        for (const n3 of e2.elseif) {
          const s2 = this.evalExpression(n3.condition, t2);
          if (!(s2 instanceof Ve)) return console.error(`Invalid if condition. Line ${e2.line}`), null;
          if (s2.value) return this._execStatements(n3.body, t2);
        }
        return e2.else ? this._execStatements(e2.else, t2) : null;
      }
      _getScalarValue(e2) {
        return e2 instanceof Ve ? e2.value : (console.error("Expected scalar value.", e2), 0);
      }
      _for(e2, t2) {
        for (t2 = t2.clone(), this.execStatement(e2.init, t2); this._getScalarValue(this.evalExpression(e2.condition, t2)); ) {
          const n2 = this._execStatements(e2.body, t2);
          if (n2 === _pt._breakObj) break;
          if (null !== n2 && n2 !== _pt._continueObj) return n2;
          this.execStatement(e2.increment, t2);
        }
        return null;
      }
      _loop(e2, t2) {
        for (t2 = t2.clone(); ; ) {
          const n2 = this._execStatements(e2.body, t2);
          if (n2 === _pt._breakObj) break;
          if (n2 === _pt._continueObj) {
            if (e2.continuing) {
              if (this._execStatements(e2.continuing.body, t2) === _pt._breakObj) break;
            }
          } else if (null !== n2) return n2;
        }
        return null;
      }
      _while(e2, t2) {
        for (t2 = t2.clone(); this._getScalarValue(this.evalExpression(e2.condition, t2)); ) {
          const n2 = this._execStatements(e2.body, t2);
          if (n2 === _pt._breakObj) break;
          if (n2 !== _pt._continueObj && null !== n2) return n2;
        }
        return null;
      }
      _evalBitcast(e2, t2) {
        const n2 = this.evalExpression(e2.value, t2), s2 = e2.type;
        if (n2 instanceof Ve) {
          const e3 = tt(n2.value, n2.typeInfo.name, s2.name);
          return new Ve(e3, this.getTypeInfo(s2));
        }
        if (n2 instanceof Fe) {
          const t3 = n2.typeInfo.getTypeName();
          let r2 = "";
          if (t3.endsWith("f")) r2 = "f32";
          else if (t3.endsWith("i")) r2 = "i32";
          else if (t3.endsWith("u")) r2 = "u32";
          else if (t3.endsWith("b")) r2 = "bool";
          else {
            if (!t3.endsWith("h")) return console.error(`Unknown vector type ${t3}. Line ${e2.line}`), null;
            r2 = "f16";
          }
          const o2 = s2.getTypeName();
          let a2 = "";
          if (o2.endsWith("f")) a2 = "f32";
          else if (o2.endsWith("i")) a2 = "i32";
          else if (o2.endsWith("u")) a2 = "u32";
          else if (o2.endsWith("b")) a2 = "bool";
          else {
            if (!o2.endsWith("h")) return console.error(`Unknown vector type ${a2}. Line ${e2.line}`), null;
            a2 = "f16";
          }
          const i2 = function(e3, t4, n3) {
            if (t4 === n3) return e3;
            const s3 = new Array(e3.length);
            for (let r3 = 0; r3 < e3.length; r3++) s3[r3] = tt(e3[r3], t4, n3);
            return s3;
          }(Array.from(n2.data), r2, a2);
          return new Fe(i2, this.getTypeInfo(s2));
        }
        return console.error(`TODO: bitcast for ${n2.typeInfo.name}. Line ${e2.line}`), null;
      }
      _evalConst(e2, t2) {
        return t2.getVariableValue(e2.name).clone().getSubData(this, e2.postfix, t2);
      }
      _evalCreate(e2, t2) {
        var r2;
        if (e2 instanceof de) {
          if (null === e2.type) return Oe.void;
          switch (e2.type.getTypeName()) {
            case "bool":
            case "i32":
            case "u32":
            case "f32":
            case "f16":
              return this._callConstructorValue(e2, t2);
            case "vec2":
            case "vec3":
            case "vec4":
            case "vec2f":
            case "vec3f":
            case "vec4f":
            case "vec2h":
            case "vec3h":
            case "vec4h":
            case "vec2i":
            case "vec3i":
            case "vec4i":
            case "vec2u":
            case "vec3u":
            case "vec4u":
            case "vec2b":
            case "vec3b":
            case "vec4b":
              return this._callConstructorVec(e2, t2);
            case "mat2x2":
            case "mat2x2f":
            case "mat2x2h":
            case "mat2x3":
            case "mat2x3f":
            case "mat2x3h":
            case "mat2x4":
            case "mat2x4f":
            case "mat2x4h":
            case "mat3x2":
            case "mat3x2f":
            case "mat3x2h":
            case "mat3x3":
            case "mat3x3f":
            case "mat3x3h":
            case "mat3x4":
            case "mat3x4f":
            case "mat3x4h":
            case "mat4x2":
            case "mat4x2f":
            case "mat4x2h":
            case "mat4x3":
            case "mat4x3f":
            case "mat4x3h":
            case "mat4x4":
            case "mat4x4f":
            case "mat4x4h":
              return this._callConstructorMatrix(e2, t2);
          }
        }
        const o2 = e2 instanceof de ? e2.type.name : e2.name, a2 = e2 instanceof de ? this.getTypeInfo(e2.type) : this.getTypeInfo(e2.name);
        if (null === a2) return console.error(`Unknown type ${o2}. Line ${e2.line}`), null;
        if (0 === a2.size) return null;
        const i2 = new Ue(new ArrayBuffer(a2.size), a2, 0);
        if (a2 instanceof n) {
          if (e2.args) for (let n2 = 0; n2 < e2.args.length; ++n2) {
            const s2 = a2.members[n2], r3 = e2.args[n2], o3 = this.evalExpression(r3, t2);
            i2.setData(this, o3, s2.type, s2.offset, t2);
          }
        } else if (a2 instanceof s) {
          let n2 = 0;
          if (e2.args) for (let s2 = 0; s2 < e2.args.length; ++s2) {
            const o3 = e2.args[s2], l2 = this.evalExpression(o3, t2);
            null === a2.format && ("x32" === (null === (r2 = l2.typeInfo) || void 0 === r2 ? void 0 : r2.name) ? a2.format = this.getTypeInfo("i32") : a2.format = l2.typeInfo), i2.setData(this, l2, a2.format, n2, t2), n2 += a2.stride;
          }
        } else console.error(`Unknown type "${o2}". Line ${e2.line}`);
        return e2 instanceof de ? i2.getSubData(this, e2.postfix, t2) : i2;
      }
      _evalLiteral(e2, t2) {
        const n2 = this.getTypeInfo(e2.type), s2 = n2.name;
        if ("x32" === s2 || "u32" === s2 || "f32" === s2 || "f16" === s2 || "i32" === s2 || "bool" === s2) {
          return new Ve(e2.scalarValue, n2);
        }
        return "vec2" === s2 || "vec3" === s2 || "vec4" === s2 || "vec2f" === s2 || "vec3f" === s2 || "vec4f" === s2 || "vec2h" === s2 || "vec3h" === s2 || "vec4h" === s2 || "vec2i" === s2 || "vec3i" === s2 || "vec4i" === s2 || "vec2u" === s2 || "vec3u" === s2 || "vec4u" === s2 ? this._callConstructorVec(e2, t2) : "mat2x2" === s2 || "mat2x3" === s2 || "mat2x4" === s2 || "mat3x2" === s2 || "mat3x3" === s2 || "mat3x4" === s2 || "mat4x2" === s2 || "mat4x3" === s2 || "mat4x4" === s2 || "mat2x2f" === s2 || "mat2x3f" === s2 || "mat2x4f" === s2 || "mat3x2f" === s2 || "mat3x3f" === s2 || "mat3x4f" === s2 || "mat4x2f" === s2 || "mat4x3f" === s2 || "mat4x4f" === s2 || "mat2x2h" === s2 || "mat2x3h" === s2 || "mat2x4h" === s2 || "mat3x2h" === s2 || "mat3x3h" === s2 || "mat3x4h" === s2 || "mat4x2h" === s2 || "mat4x3h" === s2 || "mat4x4h" === s2 ? this._callConstructorMatrix(e2, t2) : e2.value;
      }
      _evalVariable(e2, t2) {
        const n2 = t2.getVariableValue(e2.name);
        return null === n2 ? n2 : n2.getSubData(this, e2.postfix, t2);
      }
      _maxFormatTypeInfo(e2) {
        let t2 = e2[0];
        if ("f32" === t2.name) return t2;
        for (let n2 = 1; n2 < e2.length; ++n2) {
          const s2 = _pt._priority.get(t2.name);
          _pt._priority.get(e2[n2].name) < s2 && (t2 = e2[n2]);
        }
        return "x32" === t2.name ? this.getTypeInfo("i32") : t2;
      }
      _evalUnaryOp(e2, t2) {
        const n2 = this.evalExpression(e2.right, t2);
        if ("&" === e2.operator) return new Ne(n2);
        if ("*" === e2.operator) return n2 instanceof Ne ? n2.reference.getSubData(this, e2.postfix, t2) : (console.error(`Invalid dereference. Line ${e2.line}`), null);
        const s2 = n2 instanceof Ve ? n2.value : n2 instanceof Fe ? Array.from(n2.data) : null;
        switch (e2.operator) {
          case "+": {
            if (Re(s2)) {
              const e4 = s2.map((e5, t4) => +e5);
              return new Fe(e4, n2.typeInfo);
            }
            const e3 = s2, t3 = this._maxFormatTypeInfo([n2.typeInfo, n2.typeInfo]);
            return new Ve(+e3, t3);
          }
          case "-": {
            if (Re(s2)) {
              const e4 = s2.map((e5, t4) => -e5);
              return new Fe(e4, n2.typeInfo);
            }
            const e3 = s2, t3 = this._maxFormatTypeInfo([n2.typeInfo, n2.typeInfo]);
            return new Ve(-e3, t3);
          }
          case "!": {
            if (Re(s2)) {
              const e4 = s2.map((e5, t4) => e5 ? 0 : 1);
              return new Fe(e4, n2.typeInfo);
            }
            const e3 = s2, t3 = this._maxFormatTypeInfo([n2.typeInfo, n2.typeInfo]);
            return new Ve(e3 ? 0 : 1, t3);
          }
          case "~": {
            if (Re(s2)) {
              const e4 = s2.map((e5, t4) => ~e5);
              return new Fe(e4, n2.typeInfo);
            }
            const e3 = s2, t3 = this._maxFormatTypeInfo([n2.typeInfo, n2.typeInfo]);
            return new Ve(~e3, t3);
          }
        }
        return console.error(`Invalid unary operator ${e2.operator}. Line ${e2.line}`), null;
      }
      _evalBinaryOp(e2, t2) {
        const n2 = this.evalExpression(e2.left, t2), s2 = this.evalExpression(e2.right, t2), r2 = n2 instanceof Ve ? n2.value : n2 instanceof Fe || n2 instanceof Me ? Array.from(n2.data) : null, o2 = s2 instanceof Ve ? s2.value : s2 instanceof Fe || s2 instanceof Me ? Array.from(s2.data) : null;
        switch (e2.operator) {
          case "+": {
            if (Re(r2) && Re(o2)) {
              const t4 = r2, s3 = o2;
              if (t4.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a3 = t4.map((e3, t5) => e3 + s3[t5]);
              return new Fe(a3, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t4 = r2.map((t5, n3) => t5 + e3);
              return new Fe(t4, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t4 = o2.map((t5, n3) => e3 + t5);
              return new Fe(t4, s2.typeInfo);
            }
            const t3 = r2, a2 = o2, i2 = this._maxFormatTypeInfo([n2.typeInfo, s2.typeInfo]);
            return new Ve(t3 + a2, i2);
          }
          case "-": {
            if (Re(r2) && Re(o2)) {
              const t4 = r2, s3 = o2;
              if (t4.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a3 = t4.map((e3, t5) => e3 - s3[t5]);
              return new Fe(a3, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t4 = r2.map((t5, n3) => t5 - e3);
              return new Fe(t4, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t4 = o2.map((t5, n3) => e3 - t5);
              return new Fe(t4, s2.typeInfo);
            }
            const t3 = r2, a2 = o2, i2 = this._maxFormatTypeInfo([n2.typeInfo, s2.typeInfo]);
            return new Ve(t3 - a2, i2);
          }
          case "*": {
            if (Re(r2) && Re(o2)) {
              const t4 = r2, a3 = o2;
              if (n2 instanceof Me && s2 instanceof Me) {
                const r3 = function(e3, t5, n3, s3) {
                  if (void 0 === ft[t5.name] || void 0 === ft[s3.name]) return null;
                  const r4 = ft[t5.name][0], o4 = ft[t5.name][1], a4 = ft[s3.name][0];
                  if (r4 !== ft[s3.name][1]) return null;
                  const i4 = new Array(a4 * o4);
                  for (let t6 = 0; t6 < o4; t6++) for (let s4 = 0; s4 < a4; s4++) {
                    let l3 = 0;
                    for (let a5 = 0; a5 < r4; a5++) l3 += e3[a5 * o4 + t6] * n3[s4 * r4 + a5];
                    i4[t6 * a4 + s4] = l3;
                  }
                  return i4;
                }(t4, n2.typeInfo, a3, s2.typeInfo);
                if (null === r3) return console.error(`Matrix multiplication failed. Line ${e2.line}.`), null;
                const o3 = ft[s2.typeInfo.name][0], i3 = ft[n2.typeInfo.name][1], l2 = this.getTypeInfo(`mat${o3}x${i3}f`);
                return new Me(r3, l2);
              }
              if (n2 instanceof Me && s2 instanceof Fe) {
                const r3 = function(e3, t5, n3, s3) {
                  if (void 0 === ft[t5.name] || void 0 === ht[s3.name]) return null;
                  const r4 = ft[t5.name][0], o3 = ft[t5.name][1];
                  if (r4 !== n3.length) return null;
                  const a4 = new Array(o3);
                  for (let t6 = 0; t6 < o3; t6++) {
                    let s4 = 0;
                    for (let a5 = 0; a5 < r4; a5++) s4 += e3[a5 * o3 + t6] * n3[a5];
                    a4[t6] = s4;
                  }
                  return a4;
                }(t4, n2.typeInfo, a3, s2.typeInfo);
                return null === r3 ? (console.error(`Matrix vector multiplication failed. Line ${e2.line}.`), null) : new Fe(r3, s2.typeInfo);
              }
              if (n2 instanceof Fe && s2 instanceof Me) {
                const r3 = function(e3, t5, n3, s3) {
                  if (void 0 === ht[t5.name] || void 0 === ft[s3.name]) return null;
                  const r4 = ft[s3.name][0], o3 = ft[s3.name][1];
                  if (o3 !== e3.length) return null;
                  const a4 = [];
                  for (let t6 = 0; t6 < r4; t6++) {
                    let s4 = 0;
                    for (let a5 = 0; a5 < o3; a5++) s4 += e3[a5] * n3[a5 * r4 + t6];
                    a4[t6] = s4;
                  }
                  return a4;
                }(t4, n2.typeInfo, a3, s2.typeInfo);
                return null === r3 ? (console.error(`Matrix vector multiplication failed. Line ${e2.line}.`), null) : new Fe(r3, n2.typeInfo);
              }
              {
                if (t4.length !== a3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
                const s3 = t4.map((e3, t5) => e3 * a3[t5]);
                return new Fe(s3, n2.typeInfo);
              }
            }
            if (Re(r2)) {
              const e3 = o2, t4 = r2.map((t5, n3) => t5 * e3);
              return n2 instanceof Me ? new Me(t4, n2.typeInfo) : new Fe(t4, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t4 = o2.map((t5, n3) => e3 * t5);
              return s2 instanceof Me ? new Me(t4, s2.typeInfo) : new Fe(t4, s2.typeInfo);
            }
            const t3 = r2, a2 = o2, i2 = this._maxFormatTypeInfo([n2.typeInfo, s2.typeInfo]);
            return new Ve(t3 * a2, i2);
          }
          case "%": {
            if (Re(r2) && Re(o2)) {
              const t4 = r2, s3 = o2;
              if (t4.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a3 = t4.map((e3, t5) => e3 % s3[t5]);
              return new Fe(a3, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t4 = r2.map((t5, n3) => t5 % e3);
              return new Fe(t4, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t4 = o2.map((t5, n3) => e3 % t5);
              return new Fe(t4, s2.typeInfo);
            }
            const t3 = r2, a2 = o2, i2 = this._maxFormatTypeInfo([n2.typeInfo, s2.typeInfo]);
            return new Ve(t3 % a2, i2);
          }
          case "/": {
            if (Re(r2) && Re(o2)) {
              const t4 = r2, s3 = o2;
              if (t4.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a3 = t4.map((e3, t5) => e3 / s3[t5]);
              return new Fe(a3, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t4 = r2.map((t5, n3) => t5 / e3);
              return new Fe(t4, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t4 = o2.map((t5, n3) => e3 / t5);
              return new Fe(t4, s2.typeInfo);
            }
            const t3 = r2, a2 = o2, i2 = this._maxFormatTypeInfo([n2.typeInfo, s2.typeInfo]);
            return new Ve(t3 / a2, i2);
          }
          case "&": {
            if (Re(r2) && Re(o2)) {
              const t4 = r2, s3 = o2;
              if (t4.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a3 = t4.map((e3, t5) => e3 & s3[t5]);
              return new Fe(a3, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t4 = r2.map((t5, n3) => t5 & e3);
              return new Fe(t4, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t4 = o2.map((t5, n3) => e3 & t5);
              return new Fe(t4, s2.typeInfo);
            }
            const t3 = r2, a2 = o2, i2 = this._maxFormatTypeInfo([n2.typeInfo, s2.typeInfo]);
            return new Ve(t3 & a2, i2);
          }
          case "|": {
            if (Re(r2) && Re(o2)) {
              const t4 = r2, s3 = o2;
              if (t4.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a3 = t4.map((e3, t5) => e3 | s3[t5]);
              return new Fe(a3, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t4 = r2.map((t5, n3) => t5 | e3);
              return new Fe(t4, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t4 = o2.map((t5, n3) => e3 | t5);
              return new Fe(t4, s2.typeInfo);
            }
            const t3 = r2, a2 = o2, i2 = this._maxFormatTypeInfo([n2.typeInfo, s2.typeInfo]);
            return new Ve(t3 | a2, i2);
          }
          case "^": {
            if (Re(r2) && Re(o2)) {
              const t4 = r2, s3 = o2;
              if (t4.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a3 = t4.map((e3, t5) => e3 ^ s3[t5]);
              return new Fe(a3, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t4 = r2.map((t5, n3) => t5 ^ e3);
              return new Fe(t4, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t4 = o2.map((t5, n3) => e3 ^ t5);
              return new Fe(t4, s2.typeInfo);
            }
            const t3 = r2, a2 = o2, i2 = this._maxFormatTypeInfo([n2.typeInfo, s2.typeInfo]);
            return new Ve(t3 ^ a2, i2);
          }
          case "<<": {
            if (Re(r2) && Re(o2)) {
              const t4 = r2, s3 = o2;
              if (t4.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a3 = t4.map((e3, t5) => e3 << s3[t5]);
              return new Fe(a3, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t4 = r2.map((t5, n3) => t5 << e3);
              return new Fe(t4, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t4 = o2.map((t5, n3) => e3 << t5);
              return new Fe(t4, s2.typeInfo);
            }
            const t3 = r2, a2 = o2, i2 = this._maxFormatTypeInfo([n2.typeInfo, s2.typeInfo]);
            return new Ve(t3 << a2, i2);
          }
          case ">>": {
            if (Re(r2) && Re(o2)) {
              const t4 = r2, s3 = o2;
              if (t4.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a3 = t4.map((e3, t5) => e3 >> s3[t5]);
              return new Fe(a3, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t4 = r2.map((t5, n3) => t5 >> e3);
              return new Fe(t4, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t4 = o2.map((t5, n3) => e3 >> t5);
              return new Fe(t4, s2.typeInfo);
            }
            const t3 = r2, a2 = o2, i2 = this._maxFormatTypeInfo([n2.typeInfo, s2.typeInfo]);
            return new Ve(t3 >> a2, i2);
          }
          case ">":
            if (Re(r2) && Re(o2)) {
              const t3 = r2, s3 = o2;
              if (t3.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a2 = t3.map((e3, t4) => e3 > s3[t4] ? 1 : 0);
              return new Fe(a2, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t3 = r2.map((t4, n3) => t4 > e3 ? 1 : 0);
              return new Fe(t3, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t3 = o2.map((t4, n3) => e3 > t4 ? 1 : 0);
              return new Fe(t3, s2.typeInfo);
            }
            return new Ve(r2 > o2 ? 1 : 0, this.getTypeInfo("bool"));
          case "<":
            if (Re(r2) && Re(o2)) {
              const t3 = r2, s3 = o2;
              if (t3.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a2 = t3.map((e3, t4) => e3 < s3[t4] ? 1 : 0);
              return new Fe(a2, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t3 = r2.map((t4, n3) => t4 < e3 ? 1 : 0);
              return new Fe(t3, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t3 = o2.map((t4, n3) => e3 < t4 ? 1 : 0);
              return new Fe(t3, s2.typeInfo);
            }
            return new Ve(r2 < o2 ? 1 : 0, this.getTypeInfo("bool"));
          case "==":
            if (Re(r2) && Re(o2)) {
              const t3 = r2, s3 = o2;
              if (t3.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a2 = t3.map((e3, t4) => e3 === s3[t4] ? 1 : 0);
              return new Fe(a2, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t3 = r2.map((t4, n3) => t4 == e3 ? 1 : 0);
              return new Fe(t3, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t3 = o2.map((t4, n3) => e3 == t4 ? 1 : 0);
              return new Fe(t3, s2.typeInfo);
            }
            return new Ve(r2 === o2 ? 1 : 0, this.getTypeInfo("bool"));
          case "!=":
            if (Re(r2) && Re(o2)) {
              const t3 = r2, s3 = o2;
              if (t3.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a2 = t3.map((e3, t4) => e3 !== s3[t4] ? 1 : 0);
              return new Fe(a2, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t3 = r2.map((t4, n3) => t4 !== e3 ? 1 : 0);
              return new Fe(t3, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t3 = o2.map((t4, n3) => e3 !== t4 ? 1 : 0);
              return new Fe(t3, s2.typeInfo);
            }
            return new Ve(r2 !== o2 ? 1 : 0, this.getTypeInfo("bool"));
          case ">=":
            if (Re(r2) && Re(o2)) {
              const t3 = r2, s3 = o2;
              if (t3.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a2 = t3.map((e3, t4) => e3 >= s3[t4] ? 1 : 0);
              return new Fe(a2, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t3 = r2.map((t4, n3) => t4 >= e3 ? 1 : 0);
              return new Fe(t3, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t3 = o2.map((t4, n3) => e3 >= t4 ? 1 : 0);
              return new Fe(t3, s2.typeInfo);
            }
            return new Ve(r2 >= o2 ? 1 : 0, this.getTypeInfo("bool"));
          case "<=":
            if (Re(r2) && Re(o2)) {
              const t3 = r2, s3 = o2;
              if (t3.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a2 = t3.map((e3, t4) => e3 <= s3[t4] ? 1 : 0);
              return new Fe(a2, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t3 = r2.map((t4, n3) => t4 <= e3 ? 1 : 0);
              return new Fe(t3, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t3 = o2.map((t4, n3) => e3 <= t4 ? 1 : 0);
              return new Fe(t3, s2.typeInfo);
            }
            return new Ve(r2 <= o2 ? 1 : 0, this.getTypeInfo("bool"));
          case "&&":
            if (Re(r2) && Re(o2)) {
              const t3 = r2, s3 = o2;
              if (t3.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a2 = t3.map((e3, t4) => e3 && s3[t4] ? 1 : 0);
              return new Fe(a2, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t3 = r2.map((t4, n3) => t4 && e3 ? 1 : 0);
              return new Fe(t3, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t3 = o2.map((t4, n3) => e3 && t4 ? 1 : 0);
              return new Fe(t3, s2.typeInfo);
            }
            return new Ve(r2 && o2 ? 1 : 0, this.getTypeInfo("bool"));
          case "||":
            if (Re(r2) && Re(o2)) {
              const t3 = r2, s3 = o2;
              if (t3.length !== s3.length) return console.error(`Vector length mismatch. Line ${e2.line}.`), null;
              const a2 = t3.map((e3, t4) => e3 || s3[t4] ? 1 : 0);
              return new Fe(a2, n2.typeInfo);
            }
            if (Re(r2)) {
              const e3 = o2, t3 = r2.map((t4, n3) => t4 || e3 ? 1 : 0);
              return new Fe(t3, n2.typeInfo);
            }
            if (Re(o2)) {
              const e3 = r2, t3 = o2.map((t4, n3) => e3 || t4 ? 1 : 0);
              return new Fe(t3, s2.typeInfo);
            }
            return new Ve(r2 || o2 ? 1 : 0, this.getTypeInfo("bool"));
        }
        return console.error(`Unknown operator ${e2.operator}. Line ${e2.line}`), null;
      }
      _evalCall(e2, t2) {
        if (null !== e2.cachedReturnValue) return e2.cachedReturnValue;
        const n2 = t2.clone();
        n2.currentFunctionName = e2.name;
        const s2 = t2.getFunction(e2.name);
        if (!s2) {
          if (e2.isBuiltin) return this._callBuiltinFunction(e2, n2);
          return this.getTypeInfo(e2.name) ? this._evalCreate(e2, t2) : (console.error(`Unknown function "${e2.name}". Line ${e2.line}`), null);
        }
        for (let t3 = 0; t3 < s2.node.args.length; ++t3) {
          const r2 = s2.node.args[t3], o2 = this.evalExpression(e2.args[t3], n2);
          n2.createVariable(r2.name, o2, r2);
        }
        return this._execStatements(s2.node.body, n2);
      }
      _callBuiltinFunction(e2, t2) {
        switch (e2.name) {
          case "all":
            return this.builtins.All(e2, t2);
          case "any":
            return this.builtins.Any(e2, t2);
          case "select":
            return this.builtins.Select(e2, t2);
          case "arrayLength":
            return this.builtins.ArrayLength(e2, t2);
          case "abs":
            return this.builtins.Abs(e2, t2);
          case "acos":
            return this.builtins.Acos(e2, t2);
          case "acosh":
            return this.builtins.Acosh(e2, t2);
          case "asin":
            return this.builtins.Asin(e2, t2);
          case "asinh":
            return this.builtins.Asinh(e2, t2);
          case "atan":
            return this.builtins.Atan(e2, t2);
          case "atanh":
            return this.builtins.Atanh(e2, t2);
          case "atan2":
            return this.builtins.Atan2(e2, t2);
          case "ceil":
            return this.builtins.Ceil(e2, t2);
          case "clamp":
            return this.builtins.Clamp(e2, t2);
          case "cos":
            return this.builtins.Cos(e2, t2);
          case "cosh":
            return this.builtins.Cosh(e2, t2);
          case "countLeadingZeros":
            return this.builtins.CountLeadingZeros(e2, t2);
          case "countOneBits":
            return this.builtins.CountOneBits(e2, t2);
          case "countTrailingZeros":
            return this.builtins.CountTrailingZeros(e2, t2);
          case "cross":
            return this.builtins.Cross(e2, t2);
          case "degrees":
            return this.builtins.Degrees(e2, t2);
          case "determinant":
            return this.builtins.Determinant(e2, t2);
          case "distance":
            return this.builtins.Distance(e2, t2);
          case "dot":
            return this.builtins.Dot(e2, t2);
          case "dot4U8Packed":
            return this.builtins.Dot4U8Packed(e2, t2);
          case "dot4I8Packed":
            return this.builtins.Dot4I8Packed(e2, t2);
          case "exp":
            return this.builtins.Exp(e2, t2);
          case "exp2":
            return this.builtins.Exp2(e2, t2);
          case "extractBits":
            return this.builtins.ExtractBits(e2, t2);
          case "faceForward":
            return this.builtins.FaceForward(e2, t2);
          case "firstLeadingBit":
            return this.builtins.FirstLeadingBit(e2, t2);
          case "firstTrailingBit":
            return this.builtins.FirstTrailingBit(e2, t2);
          case "floor":
            return this.builtins.Floor(e2, t2);
          case "fma":
            return this.builtins.Fma(e2, t2);
          case "fract":
            return this.builtins.Fract(e2, t2);
          case "frexp":
            return this.builtins.Frexp(e2, t2);
          case "insertBits":
            return this.builtins.InsertBits(e2, t2);
          case "inverseSqrt":
            return this.builtins.InverseSqrt(e2, t2);
          case "ldexp":
            return this.builtins.Ldexp(e2, t2);
          case "length":
            return this.builtins.Length(e2, t2);
          case "log":
            return this.builtins.Log(e2, t2);
          case "log2":
            return this.builtins.Log2(e2, t2);
          case "max":
            return this.builtins.Max(e2, t2);
          case "min":
            return this.builtins.Min(e2, t2);
          case "mix":
            return this.builtins.Mix(e2, t2);
          case "modf":
            return this.builtins.Modf(e2, t2);
          case "normalize":
            return this.builtins.Normalize(e2, t2);
          case "pow":
            return this.builtins.Pow(e2, t2);
          case "quantizeToF16":
            return this.builtins.QuantizeToF16(e2, t2);
          case "radians":
            return this.builtins.Radians(e2, t2);
          case "reflect":
            return this.builtins.Reflect(e2, t2);
          case "refract":
            return this.builtins.Refract(e2, t2);
          case "reverseBits":
            return this.builtins.ReverseBits(e2, t2);
          case "round":
            return this.builtins.Round(e2, t2);
          case "saturate":
            return this.builtins.Saturate(e2, t2);
          case "sign":
            return this.builtins.Sign(e2, t2);
          case "sin":
            return this.builtins.Sin(e2, t2);
          case "sinh":
            return this.builtins.Sinh(e2, t2);
          case "smoothstep":
            return this.builtins.SmoothStep(e2, t2);
          case "sqrt":
            return this.builtins.Sqrt(e2, t2);
          case "step":
            return this.builtins.Step(e2, t2);
          case "tan":
            return this.builtins.Tan(e2, t2);
          case "tanh":
            return this.builtins.Tanh(e2, t2);
          case "transpose":
            return this.builtins.Transpose(e2, t2);
          case "trunc":
            return this.builtins.Trunc(e2, t2);
          case "dpdx":
            return this.builtins.Dpdx(e2, t2);
          case "dpdxCoarse":
            return this.builtins.DpdxCoarse(e2, t2);
          case "dpdxFine":
            return this.builtins.DpdxFine(e2, t2);
          case "dpdy":
            return this.builtins.Dpdy(e2, t2);
          case "dpdyCoarse":
            return this.builtins.DpdyCoarse(e2, t2);
          case "dpdyFine":
            return this.builtins.DpdyFine(e2, t2);
          case "fwidth":
            return this.builtins.Fwidth(e2, t2);
          case "fwidthCoarse":
            return this.builtins.FwidthCoarse(e2, t2);
          case "fwidthFine":
            return this.builtins.FwidthFine(e2, t2);
          case "textureDimensions":
            return this.builtins.TextureDimensions(e2, t2);
          case "textureGather":
            return this.builtins.TextureGather(e2, t2);
          case "textureGatherCompare":
            return this.builtins.TextureGatherCompare(e2, t2);
          case "textureLoad":
            return this.builtins.TextureLoad(e2, t2);
          case "textureNumLayers":
            return this.builtins.TextureNumLayers(e2, t2);
          case "textureNumLevels":
            return this.builtins.TextureNumLevels(e2, t2);
          case "textureNumSamples":
            return this.builtins.TextureNumSamples(e2, t2);
          case "textureSample":
            return this.builtins.TextureSample(e2, t2);
          case "textureSampleBias":
            return this.builtins.TextureSampleBias(e2, t2);
          case "textureSampleCompare":
            return this.builtins.TextureSampleCompare(e2, t2);
          case "textureSampleCompareLevel":
            return this.builtins.TextureSampleCompareLevel(e2, t2);
          case "textureSampleGrad":
            return this.builtins.TextureSampleGrad(e2, t2);
          case "textureSampleLevel":
            return this.builtins.TextureSampleLevel(e2, t2);
          case "textureSampleBaseClampToEdge":
            return this.builtins.TextureSampleBaseClampToEdge(e2, t2);
          case "textureStore":
            return this.builtins.TextureStore(e2, t2);
          case "atomicLoad":
            return this.builtins.AtomicLoad(e2, t2);
          case "atomicStore":
            return this.builtins.AtomicStore(e2, t2);
          case "atomicAdd":
            return this.builtins.AtomicAdd(e2, t2);
          case "atomicSub":
            return this.builtins.AtomicSub(e2, t2);
          case "atomicMax":
            return this.builtins.AtomicMax(e2, t2);
          case "atomicMin":
            return this.builtins.AtomicMin(e2, t2);
          case "atomicAnd":
            return this.builtins.AtomicAnd(e2, t2);
          case "atomicOr":
            return this.builtins.AtomicOr(e2, t2);
          case "atomicXor":
            return this.builtins.AtomicXor(e2, t2);
          case "atomicExchange":
            return this.builtins.AtomicExchange(e2, t2);
          case "atomicCompareExchangeWeak":
            return this.builtins.AtomicCompareExchangeWeak(e2, t2);
          case "pack4x8snorm":
            return this.builtins.Pack4x8snorm(e2, t2);
          case "pack4x8unorm":
            return this.builtins.Pack4x8unorm(e2, t2);
          case "pack4xI8":
            return this.builtins.Pack4xI8(e2, t2);
          case "pack4xU8":
            return this.builtins.Pack4xU8(e2, t2);
          case "pack4x8Clamp":
            return this.builtins.Pack4x8Clamp(e2, t2);
          case "pack4xU8Clamp":
            return this.builtins.Pack4xU8Clamp(e2, t2);
          case "pack2x16snorm":
            return this.builtins.Pack2x16snorm(e2, t2);
          case "pack2x16unorm":
            return this.builtins.Pack2x16unorm(e2, t2);
          case "pack2x16float":
            return this.builtins.Pack2x16float(e2, t2);
          case "unpack4x8snorm":
            return this.builtins.Unpack4x8snorm(e2, t2);
          case "unpack4x8unorm":
            return this.builtins.Unpack4x8unorm(e2, t2);
          case "unpack4xI8":
            return this.builtins.Unpack4xI8(e2, t2);
          case "unpack4xU8":
            return this.builtins.Unpack4xU8(e2, t2);
          case "unpack2x16snorm":
            return this.builtins.Unpack2x16snorm(e2, t2);
          case "unpack2x16unorm":
            return this.builtins.Unpack2x16unorm(e2, t2);
          case "unpack2x16float":
            return this.builtins.Unpack2x16float(e2, t2);
          case "storageBarrier":
            return this.builtins.StorageBarrier(e2, t2);
          case "textureBarrier":
            return this.builtins.TextureBarrier(e2, t2);
          case "workgroupBarrier":
            return this.builtins.WorkgroupBarrier(e2, t2);
          case "workgroupUniformLoad":
            return this.builtins.WorkgroupUniformLoad(e2, t2);
          case "subgroupAdd":
            return this.builtins.SubgroupAdd(e2, t2);
          case "subgroupExclusiveAdd":
            return this.builtins.SubgroupExclusiveAdd(e2, t2);
          case "subgroupInclusiveAdd":
            return this.builtins.SubgroupInclusiveAdd(e2, t2);
          case "subgroupAll":
            return this.builtins.SubgroupAll(e2, t2);
          case "subgroupAnd":
            return this.builtins.SubgroupAnd(e2, t2);
          case "subgroupAny":
            return this.builtins.SubgroupAny(e2, t2);
          case "subgroupBallot":
            return this.builtins.SubgroupBallot(e2, t2);
          case "subgroupBroadcast":
            return this.builtins.SubgroupBroadcast(e2, t2);
          case "subgroupBroadcastFirst":
            return this.builtins.SubgroupBroadcastFirst(e2, t2);
          case "subgroupElect":
            return this.builtins.SubgroupElect(e2, t2);
          case "subgroupMax":
            return this.builtins.SubgroupMax(e2, t2);
          case "subgroupMin":
            return this.builtins.SubgroupMin(e2, t2);
          case "subgroupMul":
            return this.builtins.SubgroupMul(e2, t2);
          case "subgroupExclusiveMul":
            return this.builtins.SubgroupExclusiveMul(e2, t2);
          case "subgroupInclusiveMul":
            return this.builtins.SubgroupInclusiveMul(e2, t2);
          case "subgroupOr":
            return this.builtins.SubgroupOr(e2, t2);
          case "subgroupShuffle":
            return this.builtins.SubgroupShuffle(e2, t2);
          case "subgroupShuffleDown":
            return this.builtins.SubgroupShuffleDown(e2, t2);
          case "subgroupShuffleUp":
            return this.builtins.SubgroupShuffleUp(e2, t2);
          case "subgroupShuffleXor":
            return this.builtins.SubgroupShuffleXor(e2, t2);
          case "subgroupXor":
            return this.builtins.SubgroupXor(e2, t2);
          case "quadBroadcast":
            return this.builtins.QuadBroadcast(e2, t2);
          case "quadSwapDiagonal":
            return this.builtins.QuadSwapDiagonal(e2, t2);
          case "quadSwapX":
            return this.builtins.QuadSwapX(e2, t2);
          case "quadSwapY":
            return this.builtins.QuadSwapY(e2, t2);
        }
        const n2 = t2.getFunction(e2.name);
        if (n2) {
          const s2 = t2.clone();
          for (let t3 = 0; t3 < n2.node.args.length; ++t3) {
            const r2 = n2.node.args[t3], o2 = this.evalExpression(e2.args[t3], s2);
            s2.setVariable(r2.name, o2, r2);
          }
          return this._execStatements(n2.node.body, s2);
        }
        return null;
      }
      _callConstructorValue(e2, t2) {
        if (!e2.args || 0 === e2.args.length) return new Ve(0, this.getTypeInfo(e2.type));
        const n2 = this.evalExpression(e2.args[0], t2);
        return n2.typeInfo = this.getTypeInfo(e2.type), n2.getSubData(this, e2.postfix, t2).clone();
      }
      _callConstructorVec(e2, t2) {
        const n2 = this.getTypeInfo(e2.type), s2 = e2.type.getTypeName(), r2 = ht[s2];
        if (void 0 === r2) return console.error(`Invalid vec constructor ${s2}. Line ${e2.line}`), null;
        const o2 = [];
        if (e2 instanceof _e) if (e2.isVector) {
          const t3 = e2.vectorValue;
          for (const e3 of t3) o2.push(e3);
        } else o2.push(e2.scalarValue);
        else if (e2.args) for (const n3 of e2.args) {
          const e3 = this.evalExpression(n3, t2);
          if (e3 instanceof Fe) {
            const t3 = e3.data;
            for (let e4 = 0; e4 < t3.length; ++e4) {
              let n4 = t3[e4];
              o2.push(n4);
            }
          } else if (e3 instanceof Ve) {
            let t3 = e3.value;
            o2.push(t3);
          }
        }
        if (e2.type instanceof le && null === e2.type.format && (e2.type.format = le.f32), 0 === o2.length) {
          const s3 = new Array(r2).fill(0);
          return new Fe(s3, n2).getSubData(this, e2.postfix, t2);
        }
        if (1 === o2.length) for (; o2.length < r2; ) o2.push(o2[0]);
        if (o2.length < r2) return console.error(`Invalid vec constructor. Line ${e2.line}`), null;
        return new Fe(o2.length > r2 ? o2.slice(0, r2) : o2, n2).getSubData(this, e2.postfix, t2);
      }
      _callConstructorMatrix(e2, t2) {
        const n2 = this.getTypeInfo(e2.type), s2 = e2.type.getTypeName(), r2 = ft[s2];
        if (void 0 === r2) return console.error(`Invalid matrix constructor ${s2}. Line ${e2.line}`), null;
        const a2 = [];
        if (e2 instanceof _e) if (e2.isVector) {
          const t3 = e2.vectorValue;
          for (const e3 of t3) a2.push(e3);
        } else a2.push(e2.scalarValue);
        else if (e2.args) for (const n3 of e2.args) {
          const e3 = this.evalExpression(n3, t2);
          e3 instanceof Fe ? a2.push(...e3.data) : e3 instanceof Ve ? a2.push(e3.value) : e3 instanceof Me && a2.push(...e3.data);
        }
        if (n2 instanceof o && null === n2.format && (n2.format = this.getTypeInfo("f32")), 0 === a2.length) {
          const s3 = new Array(r2[2]).fill(0);
          return new Me(s3, n2).getSubData(this, e2.postfix, t2);
        }
        return a2.length !== r2[2] ? (console.error(`Invalid matrix constructor. Line ${e2.line}`), null) : new Me(a2, n2).getSubData(this, e2.postfix, t2);
      }
    };
    pt._breakObj = new De(new e("BREAK", null), null), pt._continueObj = new De(new e("CONTINUE", null), null), pt._priority = /* @__PURE__ */ new Map([["f32", 0], ["f16", 1], ["u32", 2], ["i32", 3], ["x32", 3]]);
    var dt = class {
      constructor() {
        this.constants = /* @__PURE__ */ new Map(), this.aliases = /* @__PURE__ */ new Map(), this.structs = /* @__PURE__ */ new Map();
      }
    };
    var mt = class {
      constructor() {
        this._tokens = [], this._current = 0, this._currentLine = 1, this._deferArrayCountEval = [], this._currentLoop = [], this._context = new dt(), this._exec = new pt(), this._forwardTypeCount = 0;
      }
      parse(e2) {
        this._initialize(e2), this._deferArrayCountEval.length = 0;
        const t2 = [];
        for (; !this._isAtEnd(); ) {
          const e3 = this._global_decl_or_directive();
          if (!e3) break;
          t2.push(e3);
        }
        if (this._deferArrayCountEval.length > 0) {
          for (const e3 of this._deferArrayCountEval) {
            const t3 = e3.arrayType, n2 = e3.countNode;
            if (n2 instanceof xe) {
              const e4 = n2.name, s2 = this._context.constants.get(e4);
              if (s2) try {
                const e5 = s2.constEvaluate(this._exec);
                t3.count = e5;
              } catch (e5) {
              }
            }
          }
          this._deferArrayCountEval.length = 0;
        }
        if (this._forwardTypeCount > 0) for (const e3 of t2) e3.search((e4) => {
          e4 instanceof $e || e4 instanceof ce ? e4.type = this._forwardType(e4.type) : e4 instanceof ue ? e4.format = this._forwardType(e4.format) : e4 instanceof F || e4 instanceof U || e4 instanceof P ? e4.type = this._forwardType(e4.type) : e4 instanceof D ? e4.returnType = this._forwardType(e4.returnType) : e4 instanceof Ae && (e4.type = this._forwardType(e4.type));
        });
        return t2;
      }
      _forwardType(e2) {
        if (e2 instanceof ae) {
          const t2 = this._getType(e2.name);
          if (t2) return t2;
        } else e2 instanceof ce ? e2.type = this._forwardType(e2.type) : e2 instanceof ue && (e2.format = this._forwardType(e2.format));
        return e2;
      }
      _initialize(e2) {
        if (e2) if ("string" == typeof e2) {
          const t2 = new ze(e2);
          this._tokens = t2.scanTokens();
        } else this._tokens = e2;
        else this._tokens = [];
        this._current = 0;
      }
      _updateNode(e2, t2) {
        return e2.line = null != t2 ? t2 : this._currentLine, e2;
      }
      _error(e2, t2) {
        return { token: e2, message: t2, toString: () => `${t2}` };
      }
      _isAtEnd() {
        return this._current >= this._tokens.length || this._peek().type == qe.eof;
      }
      _match(e2) {
        if (e2 instanceof We) return !!this._check(e2) && (this._advance(), true);
        for (let t2 = 0, n2 = e2.length; t2 < n2; ++t2) {
          const n3 = e2[t2];
          if (this._check(n3)) return this._advance(), true;
        }
        return false;
      }
      _consume(e2, t2) {
        if (this._check(e2)) return this._advance();
        throw this._error(this._peek(), `${t2}. Line:${this._currentLine}`);
      }
      _check(e2) {
        if (this._isAtEnd()) return false;
        const t2 = this._peek();
        if (e2 instanceof Array) {
          const n2 = t2.type;
          let s2 = false;
          for (const t3 of e2) {
            if (n2 === t3) return true;
            t3 === qe.tokens.name && (s2 = true);
          }
          if (s2) {
            const e3 = qe.tokens.name.rule.exec(t2.lexeme);
            if (e3 && 0 == e3.index && e3[0] == t2.lexeme) return true;
          }
          return false;
        }
        if (t2.type === e2) return true;
        if (e2 === qe.tokens.name) {
          const e3 = qe.tokens.name.rule.exec(t2.lexeme);
          return e3 && 0 == e3.index && e3[0] == t2.lexeme;
        }
        return false;
      }
      _advance() {
        var e2, t2;
        return this._currentLine = null !== (t2 = null === (e2 = this._peek()) || void 0 === e2 ? void 0 : e2.line) && void 0 !== t2 ? t2 : -1, this._isAtEnd() || this._current++, this._previous();
      }
      _peek() {
        return this._tokens[this._current];
      }
      _previous() {
        return this._tokens[this._current - 1];
      }
      _global_decl_or_directive() {
        for (; this._match(qe.tokens.semicolon) && !this._isAtEnd(); ) ;
        if (this._match(qe.keywords.alias)) {
          const e3 = this._type_alias();
          return this._consume(qe.tokens.semicolon, "Expected ';'"), this._exec.reflection.updateAST([e3]), e3;
        }
        if (this._match(qe.keywords.diagnostic)) {
          const e3 = this._diagnostic();
          return this._consume(qe.tokens.semicolon, "Expected ';'"), this._exec.reflection.updateAST([e3]), e3;
        }
        if (this._match(qe.keywords.requires)) {
          const e3 = this._requires_directive();
          return this._consume(qe.tokens.semicolon, "Expected ';'"), this._exec.reflection.updateAST([e3]), e3;
        }
        if (this._match(qe.keywords.enable)) {
          const e3 = this._enable_directive();
          return this._consume(qe.tokens.semicolon, "Expected ';'"), this._exec.reflection.updateAST([e3]), e3;
        }
        const e2 = this._attribute();
        if (this._check(qe.keywords.var)) {
          const t2 = this._global_variable_decl();
          return null != t2 && (t2.attributes = e2), this._consume(qe.tokens.semicolon, "Expected ';'."), this._exec.reflection.updateAST([t2]), t2;
        }
        if (this._check(qe.keywords.override)) {
          const t2 = this._override_variable_decl();
          return null != t2 && (t2.attributes = e2), this._consume(qe.tokens.semicolon, "Expected ';'."), this._exec.reflection.updateAST([t2]), t2;
        }
        if (this._check(qe.keywords.let)) {
          const t2 = this._global_let_decl();
          return null != t2 && (t2.attributes = e2), this._consume(qe.tokens.semicolon, "Expected ';'."), this._exec.reflection.updateAST([t2]), t2;
        }
        if (this._check(qe.keywords.const)) {
          const t2 = this._global_const_decl();
          return null != t2 && (t2.attributes = e2), this._consume(qe.tokens.semicolon, "Expected ';'."), this._exec.reflection.updateAST([t2]), t2;
        }
        if (this._check(qe.keywords.struct)) {
          const t2 = this._struct_decl();
          return null != t2 && (t2.attributes = e2), this._exec.reflection.updateAST([t2]), t2;
        }
        if (this._check(qe.keywords.fn)) {
          const t2 = this._function_decl();
          return null != t2 && (t2.attributes = e2), this._exec.reflection.updateAST([t2]), t2;
        }
        return null;
      }
      _function_decl() {
        if (!this._match(qe.keywords.fn)) return null;
        const e2 = this._currentLine, t2 = this._consume(qe.tokens.ident, "Expected function name.").toString();
        this._consume(qe.tokens.paren_left, "Expected '(' for function arguments.");
        const n2 = [];
        if (!this._check(qe.tokens.paren_right)) do {
          if (this._check(qe.tokens.paren_right)) break;
          const e3 = this._attribute(), t3 = this._consume(qe.tokens.name, "Expected argument name.").toString();
          this._consume(qe.tokens.colon, "Expected ':' for argument type.");
          const s3 = this._attribute(), r3 = this._type_decl();
          null != r3 && (r3.attributes = s3, n2.push(this._updateNode(new Ae(t3, r3, e3))));
        } while (this._match(qe.tokens.comma));
        this._consume(qe.tokens.paren_right, "Expected ')' after function arguments.");
        let s2 = null;
        if (this._match(qe.tokens.arrow)) {
          const e3 = this._attribute();
          s2 = this._type_decl(), null != s2 && (s2.attributes = e3);
        }
        const r2 = this._compound_statement(), o2 = this._currentLine;
        return this._updateNode(new D(t2, n2, s2, r2, e2, o2), e2);
      }
      _compound_statement() {
        const e2 = [];
        for (this._consume(qe.tokens.brace_left, "Expected '{' for block."); !this._check(qe.tokens.brace_right); ) {
          const t2 = this._statement();
          null !== t2 && e2.push(t2);
        }
        return this._consume(qe.tokens.brace_right, "Expected '}' for block."), e2;
      }
      _statement() {
        for (; this._match(qe.tokens.semicolon) && !this._isAtEnd(); ) ;
        if (this._check(qe.tokens.attr) && this._attribute(), this._check(qe.keywords.if)) return this._if_statement();
        if (this._check(qe.keywords.switch)) return this._switch_statement();
        if (this._check(qe.keywords.loop)) return this._loop_statement();
        if (this._check(qe.keywords.for)) return this._for_statement();
        if (this._check(qe.keywords.while)) return this._while_statement();
        if (this._check(qe.keywords.continuing)) return this._continuing_statement();
        if (this._check(qe.keywords.static_assert)) return this._static_assert_statement();
        if (this._check(qe.tokens.brace_left)) return this._compound_statement();
        let e2 = null;
        if (this._check(qe.keywords.return)) e2 = this._return_statement();
        else if (this._check([qe.keywords.var, qe.keywords.let, qe.keywords.const])) e2 = this._variable_statement();
        else if (this._match(qe.keywords.discard)) e2 = this._updateNode(new ne());
        else if (this._match(qe.keywords.break)) {
          const t2 = this._updateNode(new se());
          if (this._currentLoop.length > 0) {
            const e3 = this._currentLoop[this._currentLoop.length - 1];
            t2.loopId = e3.id;
          }
          e2 = t2, this._check(qe.keywords.if) && (this._advance(), t2.condition = this._optional_paren_expression());
        } else if (this._match(qe.keywords.continue)) {
          const t2 = this._updateNode(new re());
          if (!(this._currentLoop.length > 0)) throw this._error(this._peek(), `Continue statement must be inside a loop. Line: ${t2.line}`);
          {
            const e3 = this._currentLoop[this._currentLoop.length - 1];
            t2.loopId = e3.id;
          }
          e2 = t2;
        } else e2 = this._increment_decrement_statement() || this._func_call_statement() || this._assignment_statement();
        return null != e2 && this._consume(qe.tokens.semicolon, "Expected ';' after statement."), e2;
      }
      _static_assert_statement() {
        if (!this._match(qe.keywords.static_assert)) return null;
        const e2 = this._currentLine, t2 = this._optional_paren_expression();
        return this._updateNode(new O(t2), e2);
      }
      _while_statement() {
        if (!this._match(qe.keywords.while)) return null;
        const e2 = this._updateNode(new N(null, null));
        return this._currentLoop.push(e2), e2.condition = this._optional_paren_expression(), this._check(qe.tokens.attr) && this._attribute(), e2.body = this._compound_statement(), this._currentLoop.pop(), e2;
      }
      _continuing_statement() {
        const e2 = this._currentLoop.length > 0 ? this._currentLoop[this._currentLoop.length - 1].id : -1;
        if (!this._match(qe.keywords.continuing)) return null;
        const t2 = this._currentLine, n2 = this._compound_statement();
        return this._updateNode(new V(n2, e2), t2);
      }
      _for_statement() {
        if (!this._match(qe.keywords.for)) return null;
        this._consume(qe.tokens.paren_left, "Expected '('.");
        const e2 = this._updateNode(new B(null, null, null, null));
        return this._currentLoop.push(e2), e2.init = this._check(qe.tokens.semicolon) ? null : this._for_init(), this._consume(qe.tokens.semicolon, "Expected ';'."), e2.condition = this._check(qe.tokens.semicolon) ? null : this._short_circuit_or_expression(), this._consume(qe.tokens.semicolon, "Expected ';'."), e2.increment = this._check(qe.tokens.paren_right) ? null : this._for_increment(), this._consume(qe.tokens.paren_right, "Expected ')'."), this._check(qe.tokens.attr) && this._attribute(), e2.body = this._compound_statement(), this._currentLoop.pop(), e2;
      }
      _for_init() {
        return this._variable_statement() || this._func_call_statement() || this._assignment_statement();
      }
      _for_increment() {
        return this._func_call_statement() || this._increment_decrement_statement() || this._assignment_statement();
      }
      _variable_statement() {
        if (this._check(qe.keywords.var)) {
          const e2 = this._variable_decl();
          if (null === e2) throw this._error(this._peek(), "Variable declaration expected.");
          let t2 = null;
          return this._match(qe.tokens.equal) && (t2 = this._short_circuit_or_expression()), this._updateNode(new F(e2.name, e2.type, e2.storage, e2.access, t2), e2.line);
        }
        if (this._match(qe.keywords.let)) {
          const e2 = this._currentLine, t2 = this._consume(qe.tokens.name, "Expected name for let.").toString();
          let n2 = null;
          if (this._match(qe.tokens.colon)) {
            const e3 = this._attribute();
            n2 = this._type_decl(), null != n2 && (n2.attributes = e3);
          }
          this._consume(qe.tokens.equal, "Expected '=' for let.");
          const s2 = this._short_circuit_or_expression();
          return this._updateNode(new U(t2, n2, null, null, s2), e2);
        }
        if (this._match(qe.keywords.const)) {
          const e2 = this._currentLine, t2 = this._consume(qe.tokens.name, "Expected name for const.").toString();
          let n2 = null;
          if (this._match(qe.tokens.colon)) {
            const e3 = this._attribute();
            n2 = this._type_decl(), null != n2 && (n2.attributes = e3);
          }
          this._consume(qe.tokens.equal, "Expected '=' for const.");
          const s2 = this._short_circuit_or_expression();
          return null === n2 && s2 instanceof _e && (n2 = s2.type), this._updateNode(new P(t2, n2, null, null, s2), e2);
        }
        return null;
      }
      _increment_decrement_statement() {
        const e2 = this._current, t2 = this._unary_expression();
        if (null == t2) return null;
        if (!this._check(qe.increment_operators)) return this._current = e2, null;
        const n2 = this._consume(qe.increment_operators, "Expected increment operator");
        return this._updateNode(new R(n2.type === qe.tokens.plus_plus ? exports.IncrementOperator.increment : exports.IncrementOperator.decrement, t2));
      }
      _assignment_statement() {
        let e2 = null;
        const t2 = this._currentLine;
        if (this._check(qe.tokens.brace_right)) return null;
        let n2 = this._match(qe.tokens.underscore);
        if (n2 || (e2 = this._unary_expression()), !n2 && null == e2) return null;
        const s2 = this._consume(qe.assignment_operators, "Expected assignment operator."), r2 = this._short_circuit_or_expression();
        return this._updateNode(new G(exports.AssignOperator.parse(s2.lexeme), e2, r2), t2);
      }
      _func_call_statement() {
        if (!this._check(qe.tokens.ident)) return null;
        const e2 = this._currentLine, t2 = this._current, n2 = this._consume(qe.tokens.ident, "Expected function name."), s2 = this._argument_expression_list();
        return null === s2 ? (this._current = t2, null) : this._updateNode(new X(n2.lexeme, s2), e2);
      }
      _loop_statement() {
        if (!this._match(qe.keywords.loop)) return null;
        this._check(qe.tokens.attr) && this._attribute(), this._consume(qe.tokens.brace_left, "Expected '{' for loop.");
        const e2 = this._updateNode(new j([], null));
        this._currentLoop.push(e2);
        let t2 = this._statement();
        for (; null !== t2; ) {
          if (Array.isArray(t2)) for (let n2 of t2) e2.body.push(n2);
          else e2.body.push(t2);
          if (t2 instanceof V) {
            e2.continuing = t2;
            break;
          }
          t2 = this._statement();
        }
        return this._currentLoop.pop(), this._consume(qe.tokens.brace_right, "Expected '}' for loop."), e2;
      }
      _switch_statement() {
        if (!this._match(qe.keywords.switch)) return null;
        const e2 = this._updateNode(new Z(null, []));
        if (this._currentLoop.push(e2), e2.condition = this._optional_paren_expression(), this._check(qe.tokens.attr) && this._attribute(), this._consume(qe.tokens.brace_left, "Expected '{' for switch."), e2.cases = this._switch_body(), null == e2.cases || 0 == e2.cases.length) throw this._error(this._previous(), "Expected 'case' or 'default'.");
        return this._consume(qe.tokens.brace_right, "Expected '}' for switch."), this._currentLoop.pop(), e2;
      }
      _switch_body() {
        const e2 = [];
        let t2 = false;
        for (; this._check([qe.keywords.default, qe.keywords.case]); ) {
          if (this._match(qe.keywords.case)) {
            const n2 = this._case_selectors();
            for (const e3 of n2) if (e3 instanceof Te) {
              if (t2) throw this._error(this._previous(), "Multiple default cases in switch statement.");
              t2 = true;
              break;
            }
            this._match(qe.tokens.colon), this._check(qe.tokens.attr) && this._attribute(), this._consume(qe.tokens.brace_left, "Exected '{' for switch case.");
            const s2 = this._case_body();
            this._consume(qe.tokens.brace_right, "Exected '}' for switch case."), e2.push(this._updateNode(new Se(n2, s2)));
          }
          if (this._match(qe.keywords.default)) {
            if (t2) throw this._error(this._previous(), "Multiple default cases in switch statement.");
            this._match(qe.tokens.colon), this._check(qe.tokens.attr) && this._attribute(), this._consume(qe.tokens.brace_left, "Exected '{' for switch default.");
            const n2 = this._case_body();
            this._consume(qe.tokens.brace_right, "Exected '}' for switch default."), e2.push(this._updateNode(new Ce(n2)));
          }
        }
        return e2;
      }
      _case_selectors() {
        const e2 = [];
        for (this._match(qe.keywords.default) ? e2.push(this._updateNode(new Te())) : e2.push(this._shift_expression()); this._match(qe.tokens.comma); ) this._match(qe.keywords.default) ? e2.push(this._updateNode(new Te())) : e2.push(this._shift_expression());
        return e2;
      }
      _case_body() {
        if (this._match(qe.keywords.fallthrough)) return this._consume(qe.tokens.semicolon, "Expected ';'"), [];
        let e2 = this._statement();
        if (null == e2) return [];
        e2 instanceof Array || (e2 = [e2]);
        const t2 = this._case_body();
        return 0 == t2.length ? e2 : [...e2, t2[0]];
      }
      _if_statement() {
        if (!this._match(qe.keywords.if)) return null;
        const e2 = this._currentLine, t2 = this._optional_paren_expression();
        this._check(qe.tokens.attr) && this._attribute();
        const n2 = this._compound_statement();
        let s2 = [];
        this._match_elseif() && (this._check(qe.tokens.attr) && this._attribute(), s2 = this._elseif_statement(s2));
        let r2 = null;
        return this._match(qe.keywords.else) && (this._check(qe.tokens.attr) && this._attribute(), r2 = this._compound_statement()), this._updateNode(new Q(t2, n2, s2, r2), e2);
      }
      _match_elseif() {
        return this._tokens[this._current].type === qe.keywords.else && this._tokens[this._current + 1].type === qe.keywords.if && (this._advance(), this._advance(), true);
      }
      _elseif_statement(e2 = []) {
        const t2 = this._optional_paren_expression(), n2 = this._compound_statement();
        return e2.push(this._updateNode(new Ee(t2, n2))), this._match_elseif() && (this._check(qe.tokens.attr) && this._attribute(), this._elseif_statement(e2)), e2;
      }
      _return_statement() {
        if (!this._match(qe.keywords.return)) return null;
        const e2 = this._short_circuit_or_expression();
        return this._updateNode(new Y(e2));
      }
      _short_circuit_or_expression() {
        let e2 = this._short_circuit_and_expr();
        for (; this._match(qe.tokens.or_or); ) e2 = this._updateNode(new we(this._previous().toString(), e2, this._short_circuit_and_expr()));
        return e2;
      }
      _short_circuit_and_expr() {
        let e2 = this._inclusive_or_expression();
        for (; this._match(qe.tokens.and_and); ) e2 = this._updateNode(new we(this._previous().toString(), e2, this._inclusive_or_expression()));
        return e2;
      }
      _inclusive_or_expression() {
        let e2 = this._exclusive_or_expression();
        for (; this._match(qe.tokens.or); ) e2 = this._updateNode(new we(this._previous().toString(), e2, this._exclusive_or_expression()));
        return e2;
      }
      _exclusive_or_expression() {
        let e2 = this._and_expression();
        for (; this._match(qe.tokens.xor); ) e2 = this._updateNode(new we(this._previous().toString(), e2, this._and_expression()));
        return e2;
      }
      _and_expression() {
        let e2 = this._equality_expression();
        for (; this._match(qe.tokens.and); ) e2 = this._updateNode(new we(this._previous().toString(), e2, this._equality_expression()));
        return e2;
      }
      _equality_expression() {
        const e2 = this._relational_expression();
        return this._match([qe.tokens.equal_equal, qe.tokens.not_equal]) ? this._updateNode(new we(this._previous().toString(), e2, this._relational_expression())) : e2;
      }
      _relational_expression() {
        let e2 = this._shift_expression();
        for (; this._match([qe.tokens.less_than, qe.tokens.greater_than, qe.tokens.less_than_equal, qe.tokens.greater_than_equal]); ) e2 = this._updateNode(new we(this._previous().toString(), e2, this._shift_expression()));
        return e2;
      }
      _shift_expression() {
        let e2 = this._additive_expression();
        for (; this._match([qe.tokens.shift_left, qe.tokens.shift_right]); ) e2 = this._updateNode(new we(this._previous().toString(), e2, this._additive_expression()));
        return e2;
      }
      _additive_expression() {
        let e2 = this._multiplicative_expression();
        for (; this._match([qe.tokens.plus, qe.tokens.minus]); ) e2 = this._updateNode(new we(this._previous().toString(), e2, this._multiplicative_expression()));
        return e2;
      }
      _multiplicative_expression() {
        let e2 = this._unary_expression();
        for (; this._match([qe.tokens.star, qe.tokens.forward_slash, qe.tokens.modulo]); ) e2 = this._updateNode(new we(this._previous().toString(), e2, this._unary_expression()));
        return e2;
      }
      _unary_expression() {
        return this._match([qe.tokens.minus, qe.tokens.bang, qe.tokens.tilde, qe.tokens.star, qe.tokens.and]) ? this._updateNode(new ke(this._previous().toString(), this._unary_expression())) : this._singular_expression();
      }
      _singular_expression() {
        const e2 = this._primary_expression(), t2 = this._postfix_expression();
        return t2 && (e2.postfix = t2), e2;
      }
      _postfix_expression() {
        if (this._match(qe.tokens.bracket_left)) {
          const e2 = this._short_circuit_or_expression();
          this._consume(qe.tokens.bracket_right, "Expected ']'.");
          const t2 = this._updateNode(new be(e2)), n2 = this._postfix_expression();
          return n2 && (t2.postfix = n2), t2;
        }
        if (this._match(qe.tokens.period)) {
          const e2 = this._consume(qe.tokens.name, "Expected member name."), t2 = this._postfix_expression(), n2 = this._updateNode(new pe(e2.lexeme));
          return t2 && (n2.postfix = t2), n2;
        }
        return null;
      }
      _getStruct(e2) {
        if (this._context.aliases.has(e2)) {
          return this._context.aliases.get(e2).type;
        }
        if (this._context.structs.has(e2)) {
          return this._context.structs.get(e2);
        }
        return null;
      }
      _getType(e2) {
        const t2 = this._getStruct(e2);
        if (null !== t2) return t2;
        switch (e2) {
          case "void":
            return oe.void;
          case "bool":
            return oe.bool;
          case "i32":
            return oe.i32;
          case "u32":
            return oe.u32;
          case "f32":
            return oe.f32;
          case "f16":
            return oe.f16;
          case "vec2f":
            return le.vec2f;
          case "vec3f":
            return le.vec3f;
          case "vec4f":
            return le.vec4f;
          case "vec2i":
            return le.vec2i;
          case "vec3i":
            return le.vec3i;
          case "vec4i":
            return le.vec4i;
          case "vec2u":
            return le.vec2u;
          case "vec3u":
            return le.vec3u;
          case "vec4u":
            return le.vec4u;
          case "vec2h":
            return le.vec2h;
          case "vec3h":
            return le.vec3h;
          case "vec4h":
            return le.vec4h;
          case "mat2x2f":
            return le.mat2x2f;
          case "mat2x3f":
            return le.mat2x3f;
          case "mat2x4f":
            return le.mat2x4f;
          case "mat3x2f":
            return le.mat3x2f;
          case "mat3x3f":
            return le.mat3x3f;
          case "mat3x4f":
            return le.mat3x4f;
          case "mat4x2f":
            return le.mat4x2f;
          case "mat4x3f":
            return le.mat4x3f;
          case "mat4x4f":
            return le.mat4x4f;
          case "mat2x2h":
            return le.mat2x2h;
          case "mat2x3h":
            return le.mat2x3h;
          case "mat2x4h":
            return le.mat2x4h;
          case "mat3x2h":
            return le.mat3x2h;
          case "mat3x3h":
            return le.mat3x3h;
          case "mat3x4h":
            return le.mat3x4h;
          case "mat4x2h":
            return le.mat4x2h;
          case "mat4x3h":
            return le.mat4x3h;
          case "mat4x4h":
            return le.mat4x4h;
          case "mat2x2i":
            return le.mat2x2i;
          case "mat2x3i":
            return le.mat2x3i;
          case "mat2x4i":
            return le.mat2x4i;
          case "mat3x2i":
            return le.mat3x2i;
          case "mat3x3i":
            return le.mat3x3i;
          case "mat3x4i":
            return le.mat3x4i;
          case "mat4x2i":
            return le.mat4x2i;
          case "mat4x3i":
            return le.mat4x3i;
          case "mat4x4i":
            return le.mat4x4i;
          case "mat2x2u":
            return le.mat2x2u;
          case "mat2x3u":
            return le.mat2x3u;
          case "mat2x4u":
            return le.mat2x4u;
          case "mat3x2u":
            return le.mat3x2u;
          case "mat3x3u":
            return le.mat3x3u;
          case "mat3x4u":
            return le.mat3x4u;
          case "mat4x2u":
            return le.mat4x2u;
          case "mat4x3u":
            return le.mat4x3u;
          case "mat4x4u":
            return le.mat4x4u;
        }
        return null;
      }
      _validateTypeRange(e2, t2) {
        if ("i32" === t2.name) {
          if (e2 < -2147483648 || e2 > 2147483647) throw this._error(this._previous(), `Value out of range for i32: ${e2}. Line: ${this._currentLine}.`);
        } else if ("u32" === t2.name && (e2 < 0 || e2 > 4294967295)) throw this._error(this._previous(), `Value out of range for u32: ${e2}. Line: ${this._currentLine}.`);
      }
      _primary_expression() {
        if (this._match(qe.tokens.ident)) {
          const e3 = this._previous().toString();
          if (this._check(qe.tokens.paren_left)) {
            const t3 = this._argument_expression_list(), n2 = this._getType(e3);
            return null !== n2 ? this._updateNode(new de(n2, t3)) : this._updateNode(new me(e3, t3));
          }
          if (this._context.constants.has(e3)) {
            const t3 = this._context.constants.get(e3);
            return this._updateNode(new ge(e3, t3.value));
          }
          return this._updateNode(new xe(e3));
        }
        if (this._match(qe.tokens.int_literal)) {
          const e3 = this._previous().toString();
          let t3 = e3.endsWith("i") || e3.endsWith("i") ? oe.i32 : e3.endsWith("u") || e3.endsWith("U") ? oe.u32 : oe.x32;
          const n2 = parseInt(e3);
          return this._validateTypeRange(n2, t3), this._updateNode(new _e(new Ve(n2, this._exec.getTypeInfo(t3)), t3));
        }
        if (this._match(qe.tokens.uint_literal)) {
          const e3 = parseInt(this._previous().toString());
          return this._validateTypeRange(e3, oe.u32), this._updateNode(new _e(new Ve(e3, this._exec.getTypeInfo(oe.u32)), oe.u32));
        }
        if (this._match([qe.tokens.decimal_float_literal, qe.tokens.hex_float_literal])) {
          let e3 = this._previous().toString(), t3 = e3.endsWith("h");
          t3 && (e3 = e3.substring(0, e3.length - 1));
          const n2 = parseFloat(e3);
          this._validateTypeRange(n2, t3 ? oe.f16 : oe.f32);
          const s2 = t3 ? oe.f16 : oe.f32;
          return this._updateNode(new _e(new Ve(n2, this._exec.getTypeInfo(s2)), s2));
        }
        if (this._match([qe.keywords.true, qe.keywords.false])) {
          let e3 = this._previous().toString() === qe.keywords.true.rule;
          return this._updateNode(new _e(new Ve(e3 ? 1 : 0, this._exec.getTypeInfo(oe.bool)), oe.bool));
        }
        if (this._check(qe.tokens.paren_left)) return this._paren_expression();
        if (this._match(qe.keywords.bitcast)) {
          this._consume(qe.tokens.less_than, "Expected '<'.");
          const e3 = this._type_decl();
          this._consume(qe.tokens.greater_than, "Expected '>'.");
          const t3 = this._paren_expression();
          return this._updateNode(new ye(e3, t3));
        }
        const e2 = this._type_decl(), t2 = this._argument_expression_list();
        return this._updateNode(new de(e2, t2));
      }
      _argument_expression_list() {
        if (!this._match(qe.tokens.paren_left)) return null;
        const e2 = [];
        do {
          if (this._check(qe.tokens.paren_right)) break;
          const t2 = this._short_circuit_or_expression();
          e2.push(t2);
        } while (this._match(qe.tokens.comma));
        return this._consume(qe.tokens.paren_right, "Expected ')' for agument list"), e2;
      }
      _optional_paren_expression() {
        this._match(qe.tokens.paren_left);
        const e2 = this._short_circuit_or_expression();
        return this._match(qe.tokens.paren_right), e2;
      }
      _paren_expression() {
        this._consume(qe.tokens.paren_left, "Expected '('.");
        const e2 = this._short_circuit_or_expression();
        return this._consume(qe.tokens.paren_right, "Expected ')'."), e2;
      }
      _struct_decl() {
        if (!this._match(qe.keywords.struct)) return null;
        const e2 = this._currentLine, t2 = this._consume(qe.tokens.ident, "Expected name for struct.").toString();
        this._consume(qe.tokens.brace_left, "Expected '{' for struct body.");
        const n2 = [];
        for (; !this._check(qe.tokens.brace_right); ) {
          const e3 = this._attribute(), t3 = this._consume(qe.tokens.name, "Expected variable name.").toString();
          this._consume(qe.tokens.colon, "Expected ':' for struct member type.");
          const s3 = this._attribute(), r3 = this._type_decl();
          null != r3 && (r3.attributes = s3), this._check(qe.tokens.brace_right) ? this._match(qe.tokens.comma) : this._consume(qe.tokens.comma, "Expected ',' for struct member."), n2.push(this._updateNode(new $e(t3, r3, e3)));
        }
        this._consume(qe.tokens.brace_right, "Expected '}' after struct body.");
        const s2 = this._currentLine, r2 = this._updateNode(new ie(t2, n2, e2, s2), e2);
        return this._context.structs.set(t2, r2), r2;
      }
      _global_variable_decl() {
        const e2 = this._variable_decl();
        if (!e2) return null;
        if (this._match(qe.tokens.equal)) {
          const t2 = this._const_expression();
          e2.value = t2;
        }
        if (null !== e2.type && e2.value instanceof _e) {
          if ("x32" !== e2.value.type.name) {
            if (e2.type.getTypeName() !== e2.value.type.getTypeName()) throw this._error(this._peek(), `Invalid cast from ${e2.value.type.name} to ${e2.type.name}. Line:${this._currentLine}`);
          }
          e2.value.isScalar && this._validateTypeRange(e2.value.scalarValue, e2.type), e2.value.type = e2.type;
        } else null === e2.type && e2.value instanceof _e && (e2.type = "x32" === e2.value.type.name ? oe.i32 : e2.value.type, e2.value.isScalar && this._validateTypeRange(e2.value.scalarValue, e2.type));
        return e2;
      }
      _override_variable_decl() {
        const e2 = this._override_decl();
        return e2 && this._match(qe.tokens.equal) && (e2.value = this._const_expression()), e2;
      }
      _global_const_decl() {
        var e2;
        if (!this._match(qe.keywords.const)) return null;
        const t2 = this._consume(qe.tokens.name, "Expected variable name"), n2 = this._currentLine;
        let s2 = null;
        if (this._match(qe.tokens.colon)) {
          const e3 = this._attribute();
          s2 = this._type_decl(), null != s2 && (s2.attributes = e3);
        }
        let r2 = null;
        this._consume(qe.tokens.equal, "const declarations require an assignment");
        const a2 = this._short_circuit_or_expression();
        try {
          let e3 = [oe.f32], n3 = a2.constEvaluate(this._exec, e3);
          n3 instanceof Ve && this._validateTypeRange(n3.value, e3[0]), e3[0] instanceof le && null === e3[0].format && n3.typeInfo instanceof o && null !== n3.typeInfo.format && ("f16" === n3.typeInfo.format.name ? e3[0].format = oe.f16 : "f32" === n3.typeInfo.format.name ? e3[0].format = oe.f32 : "i32" === n3.typeInfo.format.name ? e3[0].format = oe.i32 : "u32" === n3.typeInfo.format.name ? e3[0].format = oe.u32 : "bool" === n3.typeInfo.format.name ? e3[0].format = oe.bool : console.error(`TODO: impelement template format type ${n3.typeInfo.format.name}`)), r2 = this._updateNode(new _e(n3, e3[0])), this._exec.context.setVariable(t2.toString(), n3);
        } catch (e3) {
          r2 = a2;
        }
        if (null !== s2 && r2 instanceof _e) {
          if ("x32" !== r2.type.name) {
            if (s2.getTypeName() !== r2.type.getTypeName()) throw this._error(this._peek(), `Invalid cast from ${r2.type.name} to ${s2.name}. Line:${this._currentLine}`);
          }
          r2.type = s2, r2.isScalar && this._validateTypeRange(r2.scalarValue, r2.type);
        } else null === s2 && r2 instanceof _e && (s2 = null !== (e2 = null == r2 ? void 0 : r2.type) && void 0 !== e2 ? e2 : oe.f32, s2 === oe.x32 && (s2 = oe.i32));
        const i2 = this._updateNode(new P(t2.toString(), s2, "", "", r2), n2);
        return this._context.constants.set(i2.name, i2), i2;
      }
      _global_let_decl() {
        if (!this._match(qe.keywords.let)) return null;
        const e2 = this._currentLine, t2 = this._consume(qe.tokens.name, "Expected variable name");
        let n2 = null;
        if (this._match(qe.tokens.colon)) {
          const e3 = this._attribute();
          n2 = this._type_decl(), null != n2 && (n2.attributes = e3);
        }
        let s2 = null;
        if (this._match(qe.tokens.equal) && (s2 = this._const_expression()), null !== n2 && s2 instanceof _e) {
          if ("x32" !== s2.type.name) {
            if (n2.getTypeName() !== s2.type.getTypeName()) throw this._error(this._peek(), `Invalid cast from ${s2.type.name} to ${n2.name}. Line:${this._currentLine}`);
          }
          s2.type = n2;
        } else null === n2 && s2 instanceof _e && (n2 = "x32" === s2.type.name ? oe.i32 : s2.type);
        return s2 instanceof _e && s2.isScalar && this._validateTypeRange(s2.scalarValue, n2), this._updateNode(new U(t2.toString(), n2, "", "", s2), e2);
      }
      _const_expression() {
        return this._short_circuit_or_expression();
      }
      _variable_decl() {
        if (!this._match(qe.keywords.var)) return null;
        const e2 = this._currentLine;
        let t2 = "", n2 = "";
        this._match(qe.tokens.less_than) && (t2 = this._consume(qe.storage_class, "Expected storage_class.").toString(), this._match(qe.tokens.comma) && (n2 = this._consume(qe.access_mode, "Expected access_mode.").toString()), this._consume(qe.tokens.greater_than, "Expected '>'."));
        const s2 = this._consume(qe.tokens.name, "Expected variable name");
        let r2 = null;
        if (this._match(qe.tokens.colon)) {
          const e3 = this._attribute();
          r2 = this._type_decl(), null != r2 && (r2.attributes = e3);
        }
        return this._updateNode(new F(s2.toString(), r2, t2, n2, null), e2);
      }
      _override_decl() {
        if (!this._match(qe.keywords.override)) return null;
        const e2 = this._consume(qe.tokens.name, "Expected variable name");
        let t2 = null;
        if (this._match(qe.tokens.colon)) {
          const e3 = this._attribute();
          t2 = this._type_decl(), null != t2 && (t2.attributes = e3);
        }
        return this._updateNode(new M(e2.toString(), t2, null));
      }
      _diagnostic() {
        this._consume(qe.tokens.paren_left, "Expected '('");
        const e2 = this._consume(qe.tokens.ident, "Expected severity control name.");
        this._consume(qe.tokens.comma, "Expected ','");
        let t2 = this._consume(qe.tokens.ident, "Expected diagnostic rule name.").toString();
        if (this._match(qe.tokens.period)) {
          t2 += `.${this._consume(qe.tokens.ident, "Expected diagnostic message.").toString()}`;
        }
        return this._consume(qe.tokens.paren_right, "Expected ')'"), this._updateNode(new ee(e2.toString(), t2));
      }
      _enable_directive() {
        const e2 = this._consume(qe.tokens.ident, "identity expected.");
        return this._updateNode(new K(e2.toString()));
      }
      _requires_directive() {
        const e2 = [this._consume(qe.tokens.ident, "identity expected.").toString()];
        for (; this._match(qe.tokens.comma); ) {
          const t2 = this._consume(qe.tokens.ident, "identity expected.");
          e2.push(t2.toString());
        }
        return this._updateNode(new J(e2));
      }
      _type_alias() {
        const e2 = this._consume(qe.tokens.ident, "identity expected.");
        this._consume(qe.tokens.equal, "Expected '=' for type alias.");
        let t2 = this._type_decl();
        if (null === t2) throw this._error(this._peek(), "Expected Type for Alias.");
        this._context.aliases.has(t2.name) && (t2 = this._context.aliases.get(t2.name).type);
        const n2 = this._updateNode(new te(e2.toString(), t2));
        return this._context.aliases.set(n2.name, n2), n2;
      }
      _type_decl() {
        if (this._check([qe.tokens.ident, ...qe.texel_format, qe.keywords.bool, qe.keywords.f32, qe.keywords.i32, qe.keywords.u32])) {
          const e3 = this._advance().toString();
          if (this._context.structs.has(e3)) return this._context.structs.get(e3);
          if (this._context.aliases.has(e3)) return this._context.aliases.get(e3).type;
          if (!this._getType(e3)) {
            const t3 = this._updateNode(new ae(e3));
            return this._forwardTypeCount++, t3;
          }
          return this._updateNode(new oe(e3));
        }
        let e2 = this._texture_sampler_types();
        if (e2) return e2;
        if (this._check(qe.template_types)) {
          let e3 = this._advance().toString(), t3 = null, n2 = null;
          this._match(qe.tokens.less_than) && (t3 = this._type_decl(), n2 = null, this._match(qe.tokens.comma) && (n2 = this._consume(qe.access_mode, "Expected access_mode for pointer").toString()), this._consume(qe.tokens.greater_than, "Expected '>' for type."));
          return this._updateNode(new le(e3, t3, n2));
        }
        if (this._match(qe.keywords.ptr)) {
          let e3 = this._previous().toString();
          this._consume(qe.tokens.less_than, "Expected '<' for pointer.");
          const t3 = this._consume(qe.storage_class, "Expected storage_class for pointer");
          this._consume(qe.tokens.comma, "Expected ',' for pointer.");
          const n2 = this._type_decl();
          let s2 = null;
          this._match(qe.tokens.comma) && (s2 = this._consume(qe.access_mode, "Expected access_mode for pointer").toString()), this._consume(qe.tokens.greater_than, "Expected '>' for pointer.");
          return this._updateNode(new ce(e3, t3.toString(), n2, s2));
        }
        const t2 = this._attribute();
        if (this._match(qe.keywords.array)) {
          let e3 = null, n2 = -1;
          const s2 = this._previous();
          let r2 = null;
          if (this._match(qe.tokens.less_than)) {
            e3 = this._type_decl(), this._context.aliases.has(e3.name) && (e3 = this._context.aliases.get(e3.name).type);
            let t3 = "";
            if (this._match(qe.tokens.comma)) {
              r2 = this._shift_expression();
              try {
                t3 = r2.constEvaluate(this._exec).toString(), r2 = null;
              } catch (e4) {
                t3 = "1";
              }
            }
            this._consume(qe.tokens.greater_than, "Expected '>' for array."), n2 = t3 ? parseInt(t3) : 0;
          }
          const o2 = this._updateNode(new ue(s2.toString(), t2, e3, n2));
          return r2 && this._deferArrayCountEval.push({ arrayType: o2, countNode: r2 }), o2;
        }
        return null;
      }
      _texture_sampler_types() {
        if (this._match(qe.sampler_type)) return this._updateNode(new he(this._previous().toString(), null, null));
        if (this._match(qe.depth_texture_type)) return this._updateNode(new he(this._previous().toString(), null, null));
        if (this._match(qe.sampled_texture_type) || this._match(qe.multisampled_texture_type)) {
          const e2 = this._previous();
          this._consume(qe.tokens.less_than, "Expected '<' for sampler type.");
          const t2 = this._type_decl();
          return this._consume(qe.tokens.greater_than, "Expected '>' for sampler type."), this._updateNode(new he(e2.toString(), t2, null));
        }
        if (this._match(qe.storage_texture_type)) {
          const e2 = this._previous();
          this._consume(qe.tokens.less_than, "Expected '<' for sampler type.");
          const t2 = this._consume(qe.texel_format, "Invalid texel format.").toString();
          this._consume(qe.tokens.comma, "Expected ',' after texel format.");
          const n2 = this._consume(qe.access_mode, "Expected access mode for storage texture type.").toString();
          return this._consume(qe.tokens.greater_than, "Expected '>' for sampler type."), this._updateNode(new he(e2.toString(), t2, n2));
        }
        return null;
      }
      _attribute() {
        let e2 = [];
        for (; this._match(qe.tokens.attr); ) {
          const t2 = this._consume(qe.attribute_name, "Expected attribute name"), n2 = this._updateNode(new Le(t2.toString(), null));
          if (this._match(qe.tokens.paren_left)) {
            if (n2.value = this._consume(qe.literal_or_ident, "Expected attribute value").toString(), this._check(qe.tokens.comma)) {
              this._advance();
              do {
                const e3 = this._consume(qe.literal_or_ident, "Expected attribute value").toString();
                n2.value instanceof Array || (n2.value = [n2.value]), n2.value.push(e3);
              } while (this._match(qe.tokens.comma));
            }
            this._consume(qe.tokens.paren_right, "Expected ')'");
          }
          e2.push(n2);
        }
        return 0 == e2.length ? null : e2;
      }
    };
    var xt = class {
      get line() {
        return -1;
      }
    };
    var gt = class extends xt {
      constructor(e2) {
        super(), this.node = e2;
      }
      get line() {
        return this.node.line;
      }
    };
    var _t = class extends xt {
      constructor(e2, t2) {
        super(), this.node = e2, this.statement = t2;
      }
      get line() {
        return this.statement.line;
      }
    };
    var yt = class extends xt {
      constructor(e2) {
        super(), this.id = e2;
      }
    };
    var bt = class extends xt {
      constructor(e2) {
        super(), this.id = e2;
      }
    };
    var vt = class extends xt {
      constructor(e2, t2) {
        super(), this.id = e2, this.node = t2;
      }
      get line() {
        return this.node.line;
      }
    };
    var kt = class extends xt {
      constructor(e2, t2, n2) {
        super(), this.id = e2, this.condition = t2, this.node = n2;
      }
      get line() {
        return this.node.line;
      }
    };
    var wt = class extends xt {
      constructor(e2, t2, n2) {
        super(), this.lineNo = -1, this.condition = e2, this.position = t2, this.lineNo = n2;
      }
      get line() {
        var e2, t2;
        return null !== (t2 = null === (e2 = this.condition) || void 0 === e2 ? void 0 : e2.line) && void 0 !== t2 ? t2 : this.lineNo;
      }
    };
    var It = class extends xt {
      constructor(e2) {
        super(), this.statements = [], this.statements = e2;
      }
      get line() {
        return this.statements.length > 0 ? this.statements[0].line : -1;
      }
    };
    var Tt = class {
      constructor(e2, t2) {
        this.parent = null, this.commands = [], this.current = 0, this.parentCallExpr = null, this.context = e2, this.parent = null != t2 ? t2 : null;
      }
      get isAtEnd() {
        return this.current >= this.commands.length;
      }
      getNextCommand() {
        if (this.current >= this.commands.length) return null;
        const e2 = this.commands[this.current];
        return this.current++, e2;
      }
      getCurrentCommand() {
        return this.current >= this.commands.length ? null : this.commands[this.current];
      }
    };
    var St = class {
      constructor() {
        this.states = [];
      }
      get isEmpty() {
        return 0 == this.states.length;
      }
      get last() {
        var e2;
        return null !== (e2 = this.states[this.states.length - 1]) && void 0 !== e2 ? e2 : null;
      }
      pop() {
        this.states.pop();
      }
    };
    exports.Alias = te, exports.AliasInfo = l, exports.Argument = Ae, exports.ArgumentInfo = f, exports.ArrayIndex = be, exports.ArrayInfo = s, exports.ArrayType = ue, exports.Assign = G, exports.Attribute = Le, exports.BinaryOperator = we, exports.BitcastExpr = ye, exports.Break = se, exports.Call = X, exports.CallExpr = me, exports.Case = Se, exports.Const = P, exports.ConstExpr = ge, exports.Continue = re, exports.Continuing = V, exports.CreateExpr = de, exports.Data = De, exports.Default = Ce, exports.DefaultSelector = Te, exports.Diagnostic = ee, exports.Discard = ne, exports.ElseIf = Ee, exports.Enable = K, exports.EntryFunctions = d, exports.Expression = fe, exports.For = B, exports.ForwardType = ae, exports.Function = D, exports.FunctionInfo = p, exports.If = Q, exports.Increment = R, exports.InputInfo = c, exports.Let = U, exports.LiteralExpr = _e, exports.Loop = j, exports.MatrixData = Me, exports.Member = $e, exports.MemberInfo = t, exports.Node = C, exports.Operator = ve, exports.OutputInfo = u, exports.Override = M, exports.OverrideInfo = h, exports.PointerData = Ne, exports.PointerInfo = r, exports.PointerType = ce, exports.Requires = J, exports.Return = Y, exports.SamplerType = he, exports.ScalarData = Ve, exports.Statement = L, exports.StaticAssert = O, exports.StringExpr = pe, exports.Struct = ie, exports.StructInfo = n, exports.Switch = Z, exports.SwitchCase = Ie, exports.TemplateInfo = o, exports.TemplateType = le, exports.TextureData = Pe, exports.Token = He, exports.TokenType = We, exports.TokenTypes = qe, exports.Type = oe, exports.TypeInfo = e, exports.TypecastExpr = class Ct extends fe {
      constructor(e2, t2) {
        super(), this.type = e2, this.args = t2;
      }
      get astNodeType() {
        return "typecastExpr";
      }
      constEvaluate(e2, t2) {
        return e2.evalExpression(this, e2.context);
      }
      search(e2) {
        this.searchBlock(this.args, e2);
      }
    }, exports.TypedData = Ue, exports.UnaryOperator = ke, exports.Var = F, exports.VariableExpr = xe, exports.VariableInfo = i, exports.VectorData = Fe, exports.VoidData = Oe, exports.WgslDebug = class At {
      constructor(e2, t2) {
        this._runTimer = null, this.breakpoints = /* @__PURE__ */ new Set(), this.runStateCallback = null, this._code = e2;
        const n2 = new mt().parse(e2);
        this._exec = new pt(n2), this.runStateCallback = null != t2 ? t2 : null;
      }
      getVariableValue(e2) {
        var t2, n2;
        const s2 = null !== (n2 = null === (t2 = this.context.getVariable(e2)) || void 0 === t2 ? void 0 : t2.value) && void 0 !== n2 ? n2 : null;
        return null === s2 ? null : s2 instanceof Ve ? s2.value : s2 instanceof Fe || s2 instanceof Me ? Array.from(s2.data) : (console.error(`Unsupported return variable type ${s2.typeInfo.name}`), null);
      }
      reset() {
        this._exec = new pt(this._exec.ast), this.startDebug();
      }
      startDebug() {
        this._execStack = new St();
        const e2 = this._createState(this._exec.ast, this._exec.context);
        this._execStack.states.push(e2);
      }
      get context() {
        const e2 = this.currentState;
        return null === e2 ? this._exec.context : e2.context;
      }
      get currentState() {
        for (; ; ) {
          if (this._execStack.isEmpty) return null;
          let e2 = this._execStack.last;
          if (null === e2) return null;
          if (e2.isAtEnd) {
            if (this._execStack.pop(), this._execStack.isEmpty) return null;
            e2 = this._execStack.last;
          }
          return e2;
        }
      }
      get currentCommand() {
        for (; ; ) {
          if (this._execStack.isEmpty) return null;
          let e2 = this._execStack.last;
          if (null === e2) return null;
          if (e2.isAtEnd) {
            if (this._execStack.pop(), this._execStack.isEmpty) return null;
            e2 = this._execStack.last;
          }
          const t2 = e2.getCurrentCommand();
          if (null !== t2) return t2;
        }
      }
      toggleBreakpoint(e2) {
        this.breakpoints.has(e2) ? this.breakpoints.delete(e2) : this.breakpoints.add(e2);
      }
      clearBreakpoints() {
        this.breakpoints.clear();
      }
      get isRunning() {
        return null !== this._runTimer;
      }
      run() {
        this.isRunning || (this._runTimer = setInterval(() => {
          const e2 = this.currentCommand;
          if (e2 && this.breakpoints.has(e2.line)) return clearInterval(this._runTimer), this._runTimer = null, void (null !== this.runStateCallback && this.runStateCallback());
          this.stepNext(true) || (clearInterval(this._runTimer), this._runTimer = null, null !== this.runStateCallback && this.runStateCallback());
        }, 0), null !== this.runStateCallback && this.runStateCallback());
      }
      pause() {
        null !== this._runTimer && (clearInterval(this._runTimer), this._runTimer = null, null !== this.runStateCallback && this.runStateCallback());
      }
      _setOverrides(e2, t2) {
        for (const n2 in e2) {
          const s2 = e2[n2], r2 = this._exec.reflection.getOverrideInfo(n2);
          null !== r2 ? (null === r2.type && (r2.type = this._exec.getTypeInfo("u32")), "u32" === r2.type.name || "i32" === r2.type.name || "f32" === r2.type.name || "f16" === r2.type.name ? t2.setVariable(n2, new Ve(s2, r2.type)) : "bool" === r2.type.name ? t2.setVariable(n2, new Ve(s2 ? 1 : 0, r2.type)) : "vec2" === r2.type.name || "vec3" === r2.type.name || "vec4" === r2.type.name || "vec2f" === r2.type.name || "vec3f" === r2.type.name || "vec4f" === r2.type.name || "vec2i" === r2.type.name || "vec3i" === r2.type.name || "vec4i" === r2.type.name || "vec2u" === r2.type.name || "vec3u" === r2.type.name || "vec4u" === r2.type.name || "vec2h" === r2.type.name || "vec3h" === r2.type.name || "vec4h" === r2.type.name ? t2.setVariable(n2, new Fe(s2, r2.type)) : console.error(`Invalid constant type for ${n2}`)) : console.error(`Override ${n2} does not exist in the shader.`);
        }
      }
      debugWorkgroup(e2, t2, n2, s2, r2) {
        this._execStack = new St();
        const o2 = this._exec.context;
        o2.currentFunctionName = e2, this._dispatchId = t2, (r2 = null != r2 ? r2 : {}).constants && this._setOverrides(r2.constants, o2), this._exec._execStatements(this._exec.ast, o2);
        const a2 = o2.getFunction(e2);
        if (!a2) return console.error(`Function ${e2} not found`), false;
        const i2 = this._exec.reflection.getFunctionInfo(e2);
        if ("number" == typeof n2) n2 = [n2, 1, 1];
        else {
          if (0 === n2.length) return console.error("Invalid dispatch count"), false;
          1 === n2.length ? n2 = [n2[0], 1, 1] : 2 === n2.length ? n2 = [n2[0], n2[1], 1] : n2.length > 3 && (n2 = [n2[0], n2[1], n2[2]]);
        }
        const l2 = n2[2], c2 = n2[1], u2 = n2[0], h2 = this._exec.typeInfo.vec3u;
        o2.setVariable("@num_workgroups", new Fe(n2, h2));
        for (const e3 in s2) for (const t3 in s2[e3]) {
          const n3 = s2[e3][t3];
          o2.variables.forEach((s3) => {
            var r3;
            const o3 = s3.node;
            if (null == o3 ? void 0 : o3.attributes) {
              let a3 = null, l3 = null;
              for (const e4 of o3.attributes) "binding" === e4.name ? a3 = e4.value : "group" === e4.name && (l3 = e4.value);
              if (t3 == a3 && e3 == l3) {
                let a4 = false;
                for (const n4 of i2.resources) if (n4.name === s3.name && n4.group === parseInt(e3) && n4.binding === parseInt(t3)) {
                  a4 = true;
                  break;
                }
                if (a4) if (void 0 !== n3.texture && void 0 !== n3.descriptor) {
                  const e4 = new Pe(n3.texture, this._exec.getTypeInfo(o3.type), n3.descriptor, null !== (r3 = n3.texture.view) && void 0 !== r3 ? r3 : null);
                  s3.value = e4;
                } else void 0 !== n3.uniform ? s3.value = new Ue(n3.uniform, this._exec.getTypeInfo(o3.type)) : s3.value = new Ue(n3, this._exec.getTypeInfo(o3.type));
              }
            }
          });
        }
        let f2 = false;
        for (let e3 = 0; e3 < l2 && !f2; ++e3) for (let t3 = 0; t3 < c2 && !f2; ++t3) for (let n3 = 0; n3 < u2 && !f2; ++n3) if (o2.setVariable("@workgroup_id", new Fe([n3, t3, e3], h2)), this._dispatchWorkgroup(a2, [n3, t3, e3], o2)) {
          f2 = true;
          break;
        }
        return f2;
      }
      _shouldExecuteNextCommand() {
        const e2 = this.currentCommand;
        if (null === e2) return false;
        if (e2 instanceof wt) {
          if (null === e2.condition) return true;
        } else if (e2 instanceof yt || e2 instanceof bt) return true;
        return false;
      }
      stepInto() {
        this.isRunning || this.stepNext(true);
      }
      stepOver() {
        this.isRunning || this.stepNext(false);
      }
      stepOut() {
        const e2 = this.currentState;
        if (null === e2) return;
        const t2 = e2.parent;
        this.isRunning && (clearInterval(this._runTimer), this._runTimer = null), this._runTimer = setInterval(() => {
          const e3 = this.currentCommand;
          if (e3 && this.breakpoints.has(e3.line)) return clearInterval(this._runTimer), this._runTimer = null, void (null !== this.runStateCallback && this.runStateCallback());
          this.stepNext(true) || (clearInterval(this._runTimer), this._runTimer = null, null !== this.runStateCallback && this.runStateCallback());
          this.currentState === t2 && (clearInterval(this._runTimer), this._runTimer = null, null !== this.runStateCallback && this.runStateCallback());
        }, 0), null !== this.runStateCallback && this.runStateCallback();
      }
      stepNext(e2 = true) {
        if (!this._execStack) {
          this._execStack = new St();
          const e3 = this._createState(this._exec.ast, this._exec.context);
          this._execStack.states.push(e3);
        }
        for (; ; ) {
          if (this._execStack.isEmpty) return false;
          let t2 = this._execStack.last;
          if (null === t2) return false;
          if (t2.isAtEnd) {
            if (this._execStack.pop(), this._execStack.isEmpty) return false;
            t2 = this._execStack.last;
          }
          const n2 = t2.getNextCommand();
          if (null !== n2) {
            if (e2 && n2 instanceof _t) {
              const e3 = n2.node, s2 = t2.context.getFunction(e3.name);
              if (!s2) continue;
              const r2 = this._createState(s2.node.body, t2.context.clone(), t2);
              for (let t3 = 0; t3 < s2.node.args.length; ++t3) {
                const n3 = s2.node.args[t3], o2 = this._exec.evalExpression(e3.args[t3], r2.context);
                r2.context.createVariable(n3.name, o2, n3);
              }
              if (r2.parentCallExpr = e3, this._execStack.states.push(r2), r2.context.currentFunctionName = s2.name, this._shouldExecuteNextCommand()) continue;
              return true;
            }
            if (n2 instanceof gt) {
              const s2 = n2.node;
              if (e2 && s2 instanceof X) {
                const e3 = t2.context.getFunction(s2.name);
                if (e3) {
                  const n3 = this._createState(e3.node.body, t2.context.clone(), t2);
                  for (let t3 = 0; t3 < e3.node.args.length; ++t3) {
                    const r3 = e3.node.args[t3], o2 = this._exec.evalExpression(s2.args[t3], n3.context);
                    n3.context.createVariable(r3.name, o2, r3);
                  }
                  if (this._execStack.states.push(n3), n3.context.currentFunctionName = e3.name, this._shouldExecuteNextCommand()) continue;
                  return true;
                }
              }
              const r2 = this._exec.execStatement(s2, t2.context);
              if (null != r2 && !(r2 instanceof Oe)) {
                let e3 = t2;
                for (; e3; ) {
                  if (e3.parentCallExpr) {
                    e3.parentCallExpr.setCachedReturnValue(r2);
                    break;
                  }
                  e3 = e3.parent;
                }
                if (null === e3 && console.error("Could not find CallExpr to store return value in"), this._shouldExecuteNextCommand()) continue;
                return true;
              }
            } else {
              if (n2 instanceof yt) continue;
              if (n2 instanceof bt) continue;
              if (n2 instanceof vt) {
                const e3 = n2.id;
                for (; !this._execStack.isEmpty; ) {
                  t2 = this._execStack.last;
                  for (let n3 = t2.commands.length - 1; n3 >= 0; --n3) {
                    const s2 = t2.commands[n3];
                    if (s2 instanceof yt && s2.id === e3) return t2.current = n3 + 1, true;
                  }
                  this._execStack.pop();
                }
                return console.error("Continue statement used outside of a loop"), false;
              }
              if (n2 instanceof kt) {
                const e3 = n2.id;
                if (n2.condition) {
                  const e4 = this._exec.evalExpression(n2.condition, t2.context);
                  if (!(e4 instanceof Ve)) return console.error("Condition must be a scalar"), false;
                  if (!e4.value) {
                    if (this._shouldExecuteNextCommand()) continue;
                    return true;
                  }
                }
                for (; !this._execStack.isEmpty; ) {
                  t2 = this._execStack.last;
                  for (let n3 = t2.commands.length - 1; n3 >= 0; --n3) {
                    const s2 = t2.commands[n3];
                    if (s2 instanceof bt && s2.id === e3) return t2.current = n3 + 1, true;
                  }
                  this._execStack.pop();
                }
                return console.error("Break statement used outside of a loop"), false;
              }
              if (n2 instanceof wt) {
                if (n2.condition) {
                  const e3 = this._exec.evalExpression(n2.condition, t2.context);
                  if (!(e3 instanceof Ve)) return console.error("Condition must be a scalar"), false;
                  if (e3.value) {
                    if (this._shouldExecuteNextCommand()) continue;
                    return true;
                  }
                }
                if (t2.current = n2.position, this._shouldExecuteNextCommand()) continue;
                return true;
              }
              if (n2 instanceof It) {
                const e3 = this._createState(n2.statements, t2.context.clone(), t2);
                this._execStack.states.push(e3);
                continue;
              }
            }
            if (t2.isAtEnd && (this._execStack.pop(), this._execStack.isEmpty)) return false;
            if (!this._shouldExecuteNextCommand()) return true;
          }
        }
      }
      _dispatchWorkgroup(e2, t2, n2) {
        const s2 = [1, 1, 1];
        for (const t3 of e2.node.attributes) if ("workgroup_size" === t3.name) if (Array.isArray(t3.value)) {
          if (t3.value.length > 0) {
            const e3 = n2.getVariableValue(t3.value[0]);
            s2[0] = e3 instanceof Ve ? e3.value : parseInt(t3.value[0]);
          }
          if (t3.value.length > 1) {
            const e3 = n2.getVariableValue(t3.value[1]);
            s2[1] = e3 instanceof Ve ? e3.value : parseInt(t3.value[1]);
          }
          if (t3.value.length > 2) {
            const e3 = n2.getVariableValue(t3.value[2]);
            s2[2] = e3 instanceof Ve ? e3.value : parseInt(t3.value[2]);
          }
        } else {
          const e3 = n2.getVariableValue(t3.value);
          e3 instanceof Ve ? s2[0] = e3.value : e3 instanceof Fe ? (s2[0] = e3.data[0], s2[1] = e3.data.length > 1 ? e3.data[1] : 1, s2[2] = e3.data.length > 2 ? e3.data[2] : 1) : s2[0] = parseInt(t3.value);
        }
        const r2 = this._exec.typeInfo.vec3u, o2 = this._exec.typeInfo.u32;
        n2.setVariable("@workgroup_size", new Fe(s2, r2));
        const a2 = s2[0], i2 = s2[1], l2 = s2[2];
        let c2 = false;
        for (let e3 = 0, u2 = 0; e3 < l2 && !c2; ++e3) for (let l3 = 0; l3 < i2 && !c2; ++l3) for (let i3 = 0; i3 < a2 && !c2; ++i3, ++u2) {
          const a3 = [i3, l3, e3], h2 = [i3 + t2[0] * s2[0], l3 + t2[1] * s2[1], e3 + t2[2] * s2[2]];
          if (n2.setVariable("@local_invocation_id", new Fe(a3, r2)), n2.setVariable("@global_invocation_id", new Fe(h2, r2)), n2.setVariable("@local_invocation_index", new Ve(u2, o2)), h2[0] === this._dispatchId[0] && h2[1] === this._dispatchId[1] && h2[2] === this._dispatchId[2]) {
            c2 = true;
            break;
          }
        }
        return c2 && this._dispatchExec(e2, n2), c2;
      }
      _dispatchExec(e2, t2) {
        for (const n3 of e2.node.args) for (const e3 of n3.attributes) if ("builtin" === e3.name) {
          const s2 = `@${e3.value}`, r2 = t2.getVariable(s2);
          null !== r2 && t2.variables.set(n3.name, r2);
        }
        const n2 = this._createState(e2.node.body, t2);
        this._execStack.states.push(n2);
      }
      _createState(e2, t2, n2) {
        const s2 = new Tt(t2, null != n2 ? n2 : null);
        for (const t3 of e2) if (t3 instanceof U || t3 instanceof F || t3 instanceof P || t3 instanceof G) {
          const e3 = [];
          this._collectFunctionCalls(t3.value, e3);
          for (const n3 of e3) s2.commands.push(new _t(n3, t3));
          s2.commands.push(new gt(t3));
        } else if (t3 instanceof X) {
          const e3 = [];
          for (const n3 of t3.args) this._collectFunctionCalls(n3, e3);
          for (const n3 of e3) s2.commands.push(new _t(n3, t3));
          s2.commands.push(new gt(t3));
        } else if (t3 instanceof Y) {
          const e3 = [];
          this._collectFunctionCalls(t3.value, e3);
          for (const n3 of e3) s2.commands.push(new _t(n3, t3));
          s2.commands.push(new gt(t3));
        } else if (t3 instanceof R) s2.commands.push(new gt(t3));
        else {
          if (t3 instanceof D) {
            const e3 = new it(t3);
            s2.context.functions.set(t3.name, e3);
            continue;
          }
          if (t3 instanceof Q) {
            const e3 = [];
            this._collectFunctionCalls(t3.condition, e3);
            for (const n4 of e3) s2.commands.push(new _t(n4, t3));
            let n3 = new wt(t3.condition, 0, t3.line);
            s2.commands.push(n3), t3.body.length > 0 && s2.commands.push(new It(t3.body));
            const r2 = new wt(null, 0, t3.line);
            s2.commands.push(r2);
            for (const e4 of t3.elseif) {
              n3.position = s2.commands.length;
              const o2 = [];
              this._collectFunctionCalls(e4.condition, o2);
              for (const e5 of o2) s2.commands.push(new _t(e5, t3));
              n3 = new wt(e4.condition, 0, e4.line), s2.commands.push(n3), e4.body.length > 0 && s2.commands.push(new It(e4.body)), s2.commands.push(r2);
            }
            n3.position = s2.commands.length, t3.else && s2.commands.push(new It(t3.else)), r2.position = s2.commands.length;
          } else if (t3 instanceof Z) {
            const e3 = [];
            this._collectFunctionCalls(t3.condition, e3);
            for (const n4 of e3) s2.commands.push(new _t(n4, t3));
            let n3 = null;
            for (const e4 of t3.cases) {
              if (e4 instanceof Ce) {
                n3 = e4;
                break;
              }
              if (e4 instanceof Se) {
                for (const t4 of e4.selectors) if (t4 instanceof Te) {
                  n3 = e4;
                  break;
                }
              }
            }
            const r2 = [];
            for (const e4 of t3.cases) {
              if (e4 === n3) continue;
              if (!(e4 instanceof Se)) continue;
              let o3 = null;
              for (const n4 of e4.selectors) {
                let e5 = new we("==", t3.condition, n4);
                o3 && (e5 = new we("||", o3, e5)), o3 = e5;
              }
              const a2 = new wt(o3, 0, e4.line);
              s2.commands.push(a2), e4.body.length > 0 && s2.commands.push(new It(e4.body));
              const i2 = new wt(null, 0, e4.line);
              r2.push(i2), s2.commands.push(i2), a2.position = s2.commands.length;
            }
            n3 && s2.commands.push(new It(n3.body)), s2.commands.push(new bt(t3.id));
            const o2 = s2.commands.length;
            for (let e4 = 0; e4 < r2.length; ++e4) r2[e4].position = o2;
          } else if (t3 instanceof N) {
            const e3 = [];
            s2.commands.push(new yt(t3.id)), this._collectFunctionCalls(t3.condition, e3);
            for (const n4 of e3) s2.commands.push(new _t(n4, t3));
            const n3 = new wt(t3.condition, 0, t3.line);
            s2.commands.push(n3);
            let r2 = t3.line;
            t3.body.length > 0 && (s2.commands.push(new It(t3.body)), r2 = t3.body[t3.body.length - 1].line), s2.commands.push(new wt(t3.condition, 0, r2)), s2.commands.push(new bt(t3.id)), n3.position = s2.commands.length;
          } else if (t3 instanceof B) {
            t3.init && s2.commands.push(new gt(t3.init));
            let e3 = s2.commands.length;
            null === t3.increment && s2.commands.push(new yt(t3.id));
            let n3 = null;
            if (t3.condition) {
              const e4 = [];
              this._collectFunctionCalls(t3.condition, e4);
              for (const n4 of e4) s2.commands.push(new _t(n4, t3));
              n3 = new wt(t3.condition, 0, t3.line), s2.commands.push(n3);
            }
            let r2 = t3.line;
            t3.body.length > 0 && (s2.commands.push(new It(t3.body)), r2 = t3.body[t3.body.length - 1].line), t3.increment && (s2.commands.push(new yt(t3.id)), s2.commands.push(new gt(t3.increment))), s2.commands.push(new wt(null, e3, r2)), s2.commands.push(new bt(t3.id)), n3.position = s2.commands.length;
          } else if (t3 instanceof j) {
            let e3 = s2.commands.length;
            t3.continuing || s2.commands.push(new yt(t3.id));
            let n3 = t3.line;
            t3.body.length > 0 && (s2.commands.push(new It(t3.body)), n3 = t3.body[t3.body.length - 1].line), s2.commands.push(new wt(null, e3, n3)), s2.commands.push(new bt(t3.id));
          } else t3 instanceof V ? (s2.commands.push(new yt(t3.loopId)), s2.commands.push(new It(t3.body))) : t3 instanceof re ? s2.commands.push(new vt(t3.loopId, t3)) : t3 instanceof se ? s2.commands.push(new kt(t3.loopId, t3.condition, t3)) : t3 instanceof O ? s2.commands.push(new gt(t3)) : t3 instanceof ie || console.error(`TODO: statement type ${t3.constructor.name}`);
        }
        return s2;
      }
      _collectFunctionCalls(e2, t2) {
        if (e2 instanceof me) {
          if (e2.args) for (const n2 of e2.args) this._collectFunctionCalls(n2, t2);
          e2.isBuiltin || t2.push(e2);
        } else if (e2 instanceof we) this._collectFunctionCalls(e2.left, t2), this._collectFunctionCalls(e2.right, t2);
        else if (e2 instanceof ke) this._collectFunctionCalls(e2.right, t2);
        else if (e2 instanceof de) {
          if (e2.args) for (const n2 of e2.args) this._collectFunctionCalls(n2, t2);
        } else e2 instanceof ye ? this._collectFunctionCalls(e2.value, t2) : e2 instanceof be ? this._collectFunctionCalls(e2.index, t2) : _e || console.error(`TODO: expression type ${e2.constructor.name}`);
      }
    }, exports.WgslExec = pt, exports.WgslParser = mt, exports.WgslReflect = class Et extends rt {
      constructor(e2) {
        super(), e2 && this.update(e2);
      }
      update(e2) {
        const t2 = new mt().parse(e2);
        this.updateAST(t2);
      }
    }, exports.WgslScanner = ze, exports.While = N, exports._BlockEnd = E, exports._BlockStart = A;
  }
});

// src-node/esbuild-wgsl-plugin.ts
var import_wgsl_reflect = __toESM(require_wgsl_reflect_node());
import * as fs from "node:fs/promises";
import * as path from "node:path";
function wgslPlugin() {
  return {
    name: "wgsl",
    setup(build) {
      build.onResolve({ filter: /\.wgsl$/ }, (args) => {
        return {
          path: path.join(args.resolveDir, args.path),
          namespace: "wgsl",
          pluginData: {
            originalPath: args.path
          }
        };
      });
      build.onLoad({ filter: /.*/, namespace: "wgsl" }, async (args) => {
        const file = (await fs.readFile(args.path)).toString();
        const reflect = new import_wgsl_reflect.WgslReflect(file);
        const json = {
          bindGroups: reflect.getBindGroups()
        };
        fs.writeFile(
          args.path + ".d.ts",
          `declare module "${args.pluginData.originalPath}" {
  const data: ${JSON.stringify(
            json,
            void 0,
            2
          )};
 export default data; 
}`
        );
        return {
          loader: "json",
          contents: JSON.stringify(json),
          watchFiles: [args.path]
        };
      });
    }
  };
}
export {
  wgslPlugin
};
