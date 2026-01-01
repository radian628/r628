// src/webgpu/bind-group-generator.ts
function getWgslPrimitiveDatatype(typename, formatname) {
  if (formatname) return formatname;
  if (typename === "f32" || typename === "i32" || typename === "u32" || typename === "f16")
    return typename;
  if (typename.startsWith("vec") || typename.startsWith("mat")) {
    if (typename.endsWith("i")) {
      return "i32";
    } else if (typename.endsWith("u")) {
      return "u32";
    } else if (typename.endsWith("h")) {
      return "f16";
    }
  }
  return "f32";
}
function getWgslPrimitiveSize(typename) {
  if (typename.startsWith("vec2")) return 2;
  if (typename.startsWith("vec3")) return 3;
  if (typename.startsWith("vec4")) return 4;
  if (typename.startsWith("mat2x3")) return 6;
  if (typename.startsWith("mat3x2")) return 6;
  if (typename.startsWith("mat2x4")) return 8;
  if (typename.startsWith("mat4x2")) return 8;
  if (typename.startsWith("mat3x4")) return 12;
  if (typename.startsWith("mat4x3")) return 12;
  if (typename.startsWith("mat2")) return 4;
  if (typename.startsWith("mat3")) return 9;
  if (typename.startsWith("mat4")) return 16;
  return 1;
}
function setWgslPrimitive(typename, formatname, view, offset, data) {
  const datatype = getWgslPrimitiveDatatype(typename, formatname);
  const size = getWgslPrimitiveSize(typename);
  let stride = {
    i32: 4,
    f32: 4,
    u32: 4,
    f16: 2
  }[datatype];
  let method = {
    i32: "setInt32",
    f32: "setFloat32",
    u32: "setUint32",
    f16: "setFloat16"
  }[datatype];
  for (let i = 0; i < size; i++) {
    view[method](offset + stride * i, data[i], true);
  }
}
function generateUniformBufferInner(spec, values, view, offset) {
  if (spec.members) {
    for (const m of spec.members)
      generateUniformBufferInner(
        m.type,
        values[m.name],
        view,
        offset + m.offset
      );
    return;
  }
  const typename = spec.name;
  if (typename === "array") {
    for (let i = 0; i < spec.count; i++) {
      generateUniformBufferInner(
        spec.format,
        values[i],
        view,
        offset + spec.stride * i
      );
    }
  } else {
    setWgslPrimitive(
      spec.name,
      spec.format?.name,
      view,
      offset,
      Array.isArray(values) ? values : [values]
    );
  }
}
function generateUniformBuffer(spec, values, buffer, byteOffset) {
  const buf = buffer ?? new ArrayBuffer(spec.size);
  const view = new DataView(buf, byteOffset);
  generateUniformBufferInner(spec, values, view, 0);
  return buf;
}
function getUniformBufferSize(spec, group, binding) {
  return spec.bindGroups[group][binding].type.size;
}
function makeUniformBuffer(spec, group, binding, data, buffer, byteOffset) {
  return generateUniformBuffer(
    spec.bindGroups[group][binding].type,
    data,
    buffer,
    byteOffset
  );
}
export {
  generateUniformBuffer,
  getUniformBufferSize,
  makeUniformBuffer
};
