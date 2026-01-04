// src/webgpu/converters.ts
var VERTEX_FORMAT_TO_ELEMENT_SIZE = {
  uint8: 1,
  uint8x2: 1,
  uint8x4: 1,
  sint8: 1,
  sint8x2: 1,
  sint8x4: 1,
  unorm8: 1,
  unorm8x2: 1,
  unorm8x4: 1,
  snorm8: 1,
  snorm8x2: 1,
  snorm8x4: 1,
  uint16: 2,
  uint16x2: 2,
  uint16x4: 2,
  sint16: 2,
  sint16x2: 2,
  sint16x4: 2,
  unorm16: 2,
  unorm16x2: 2,
  unorm16x4: 2,
  snorm16: 2,
  snorm16x2: 2,
  snorm16x4: 2,
  float16: 2,
  float16x2: 2,
  float16x4: 2,
  float32: 4,
  float32x2: 4,
  float32x3: 4,
  float32x4: 4,
  uint32: 4,
  uint32x2: 4,
  uint32x3: 4,
  uint32x4: 4,
  sint32: 4,
  sint32x2: 4,
  sint32x3: 4,
  sint32x4: 4,
  "unorm10-10-10-2": 1,
  "unorm8x4-bgra": 1
};
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
function vertexFormatStride(vformat) {
  const elems = VERTEX_FORMAT_TO_ELEMENT_COUNT[vformat];
  const sizePerElem = VERTEX_FORMAT_TO_ELEMENT_SIZE[vformat];
  return elems * sizePerElem;
}

// src/webgpu/partial-pipelines.ts
function wrapDevice(device) {
  return {
    vertexBuffer(...types) {
      let size = 0;
      let attributes = [];
      for (const [name, format] of types) {
        const stride = vertexFormatStride(format);
        attributes.push({
          format,
          name,
          offset: size
        });
        size += stride;
      }
      return {
        type: "vertex-buffer",
        arrayStride: size,
        // @ts-expect-error
        attributes
      };
    },
    bindGroup(...entries) {
      return {
        entries
      };
    },
    texture(name) {
      return {
        name,
        type: "texture"
      };
    },
    shader(code, stages = ["vertex", "fragment"]) {
      const module = device.createShaderModule({
        code
      });
      return { module, stages };
    },
    pipeline(params) {
    }
  };
}
export {
  wrapDevice
};
