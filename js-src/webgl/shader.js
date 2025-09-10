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
export {
  fullscreenQuadBuffer,
  glRenderToQuad,
  shaders2program,
  source2shader,
  sources2program
};
