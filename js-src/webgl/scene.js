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
export {
  applyUniform,
  applyUniforms,
  createScene
};
