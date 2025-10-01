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
export {
  createBufferWithLayout
};
