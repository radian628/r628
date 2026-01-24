// src/webgpu/converters.ts
var VERTEX_FORMAT_TO_ELEMENT_COUNT = {
  uint8: 1,
  uint8x2: 2,
  uint8x4: 4,
  sint8: 1,
  sint8x2: 2,
  sint8x4: 4,
  unorm8: 1,
  unorm8x2: 2,
  unorm8x4: 4,
  snorm8: 1,
  snorm8x2: 2,
  snorm8x4: 4,
  uint16: 1,
  uint16x2: 2,
  uint16x4: 4,
  sint16: 1,
  sint16x2: 2,
  sint16x4: 4,
  unorm16: 1,
  unorm16x2: 2,
  unorm16x4: 4,
  snorm16: 1,
  snorm16x2: 2,
  snorm16x4: 4,
  float16: 1,
  float16x2: 2,
  float16x4: 4,
  float32: 1,
  float32x2: 2,
  float32x3: 3,
  float32x4: 4,
  uint32: 1,
  uint32x2: 2,
  uint32x3: 3,
  uint32x4: 4,
  sint32: 1,
  sint32x2: 2,
  sint32x3: 3,
  sint32x4: 4,
  "unorm10-10-10-2": 4,
  "unorm8x4-bgra": 4
};
var VERTEX_FORMAT_TO_TYPEDARRAY_CONSTRUCTOR = {
  uint8: Uint8Array,
  uint8x2: Uint8Array,
  uint8x4: Uint8Array,
  sint8: Int8Array,
  sint8x2: Int8Array,
  sint8x4: Int8Array,
  unorm8: Uint8Array,
  unorm8x2: Uint8Array,
  unorm8x4: Uint8Array,
  snorm8: Int8Array,
  snorm8x2: Int8Array,
  snorm8x4: Int8Array,
  uint16: Uint16Array,
  uint16x2: Uint16Array,
  uint16x4: Uint16Array,
  sint16: Int16Array,
  sint16x2: Int16Array,
  sint16x4: Int16Array,
  unorm16: Uint16Array,
  unorm16x2: Uint16Array,
  unorm16x4: Uint16Array,
  snorm16: Int16Array,
  snorm16x2: Int16Array,
  snorm16x4: Int16Array,
  float16: Float16Array,
  float16x2: Float16Array,
  float16x4: Float16Array,
  float32: Float32Array,
  float32x2: Float32Array,
  float32x3: Float32Array,
  float32x4: Float32Array,
  uint32: Uint32Array,
  uint32x2: Uint32Array,
  uint32x3: Uint32Array,
  uint32x4: Uint32Array,
  sint32: Int32Array,
  sint32x2: Int32Array,
  sint32x3: Int32Array,
  sint32x4: Int32Array,
  "unorm10-10-10-2": Uint8Array,
  "unorm8x4-bgra": Uint8Array
};
var VERTEX_FORMAT_TO_WGSL_BASE_TYPE = {
  uint8: "u32",
  uint8x2: "u32",
  uint8x4: "u32",
  sint8: "i32",
  sint8x2: "i32",
  sint8x4: "i32",
  unorm8: "f32",
  unorm8x2: "f32",
  unorm8x4: "f32",
  snorm8: "f32",
  snorm8x2: "f32",
  snorm8x4: "f32",
  uint16: "u32",
  uint16x2: "u32",
  uint16x4: "u32",
  sint16: "i32",
  sint16x2: "i32",
  sint16x4: "i32",
  unorm16: "f32",
  unorm16x2: "f32",
  unorm16x4: "f32",
  snorm16: "f32",
  snorm16x2: "f32",
  snorm16x4: "f32",
  float16: "f32",
  float16x2: "f32",
  float16x4: "f32",
  float32: "f32",
  float32x2: "f32",
  float32x3: "f32",
  float32x4: "f32",
  uint32: "u32",
  uint32x2: "u32",
  uint32x3: "u32",
  uint32x4: "u32",
  sint32: "i32",
  sint32x2: "i32",
  sint32x3: "i32",
  sint32x4: "i32",
  "unorm10-10-10-2": "f32",
  "unorm8x4-bgra": "f32"
};
var WGSL_DATA_TYPES = {
  f32: {
    1: "f32",
    2: "vec2f",
    3: "vec3f",
    4: "vec4f"
  },
  f16: {
    1: "f16",
    2: "vec2f16",
    3: "vec3f16",
    4: "vec4f16"
  },
  u32: {
    1: "u32",
    2: "vec2u",
    3: "vec3u",
    4: "vec4u"
  },
  i32: {
    1: "i32",
    2: "vec2i",
    3: "vec3i",
    4: "vec4i"
  }
};
function vertexFormatToWgslType(vertexFormat) {
  return WGSL_DATA_TYPES[VERTEX_FORMAT_TO_WGSL_BASE_TYPE[vertexFormat]][VERTEX_FORMAT_TO_ELEMENT_COUNT[vertexFormat]];
}

// src/webgpu/vertex-format-accessors.ts
function vertexFormatGetter(storageBufferName, attribute) {
  const wgslType = vertexFormatToWgslType(attribute.format);
  const signature = `fn ${storageBufferName}_${attribute}_get(index: u32) -> ${wgslType}`;
  return `${signature} {
    return ${storageBufferName}
  }`;
}
export {
  vertexFormatGetter
};
