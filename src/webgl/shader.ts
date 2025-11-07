import { err, ok, Result } from "../result";

type GL = WebGL2RenderingContext | WebGLRenderingContext;

export function source2shader(
  gl: GL,
  type: "v" | "f",
  source: string
): Result<WebGLShader, undefined> {
  const shader = gl.createShader(
    type === "v" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER
  );
  if (!shader) return err(undefined);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return err(undefined);
  }
  return ok(shader);
}

export function shaders2program(
  gl: GL,
  v: WebGLShader,
  f: WebGLShader
): Result<WebGLProgram, undefined> {
  const program = gl.createProgram();
  gl.attachShader(program, v);
  gl.attachShader(program, f);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return err(undefined);
  }
  return ok(program);
}

export function sources2program(
  gl: GL,
  vs: string,
  fs: string
): Result<WebGLProgram, undefined> {
  const v = source2shader(gl, "v", vs);
  const f = source2shader(gl, "f", fs);
  if (!v.ok || !f.ok) return err(undefined);
  return shaders2program(gl, v.data, f.data);
}

export function fullscreenQuadBuffer(gl: GL): Result<WebGLBuffer, undefined> {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0,
    ]),
    gl.STATIC_DRAW
  );
  return ok(buffer);
}

export type UVP = number | boolean;
export type UniformValue =
  | UVP
  | [UVP, UVP]
  | [UVP, UVP, UVP]
  | [UVP, UVP, UVP, UVP];

export function glRenderToQuad(options: {
  width: number;
  height: number;
  fragsource: string;
  version?: "webgl" | "webgl2";
  uniforms?: Record<string, UniformValue>;
  intUniforms?: Record<string, UniformValue>;
  uintUniforms?: Record<string, UniformValue>;
  noheader?: boolean;
  noAutoUniforms?: boolean;
}): Result<HTMLCanvasElement, undefined> {
  const canvas = document.createElement("canvas");
  canvas.width = options.width;
  canvas.height = options.height;

  const gl = canvas.getContext(options.version ?? "webgl2") as GL;
  gl.viewport(0, 0, options.width, options.height);
  if (!gl) return err(undefined);

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
    (options.noheader
      ? ""
      : `#version 300 es
precision highp float;
in vec2 pos;
out vec4 col;\n`) +
      (options.noAutoUniforms
        ? ""
        : (
            [
              [options.uniforms, "", "float"],
              [options.intUniforms, "i", "int"],
              [options.uintUniforms, "u", "uint"],
            ] as const
          )
            .map(([uniforms, vecprefix, scalar]) =>
              Object.entries(uniforms ?? {})
                ?.map(([n, u]) => {
                  return `uniform ${
                    Array.isArray(u) ? vecprefix + "vec" + u.length : scalar
                  } ${n};`;
                })
                .join("\n")
            )
            .join("\n")) +
      options.fragsource
  );

  if (!prog.data) return err(undefined);

  gl.useProgram(prog.data);
  const attrloc = gl.getAttribLocation(prog.data, "in_vpos");
  gl.vertexAttribPointer(attrloc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attrloc);

  for (const [uniforms, type] of [
    [options.uniforms, "i"],
    [options.intUniforms, "i"],
    [options.uintUniforms, "ui"],
  ] as const) {
    for (const [k, v] of Object.entries(uniforms ?? {})) {
      const v2 = Array.isArray(v) ? v : [v];
      // @ts-expect-error
      gl[`uniform${v2.length}${type}v`](
        gl.getUniformLocation(prog.data, k),
        v2
      );
    }
  }

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  return ok(canvas);
}
