import { mulMat4 } from "../src/math/vector";
import { createBufferWithLayout } from "../src/webgl/buffer";
import {
  ortho,
  perspective,
  ring,
  rotate,
  translate,
  uvSphere,
} from "../src/webgl/mesh";
import { createScene } from "../src/webgl/scene";
import { sources2program } from "../src/webgl/shader";

const canvas = document.createElement("canvas");
canvas.style =
  "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none;";
document.body.appendChild(canvas);

document.body.style.height = "500vh";

const gl = canvas.getContext("webgl2");

if (!gl) {
  throw window.alert("No webgl2 :(");
}

let ASPECT = 1;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl!.viewport(0, 0, canvas.width, canvas.height);
  ASPECT = canvas.width / canvas.height;
}

resize();
window.addEventListener("resize", resize);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const prog = sources2program(
  gl,
  `#version 300 es
precision highp float;

in vec3 in_pos;
out vec4 pos;

uniform mat4 mvp;

void main() {
  vec4 postemp = mvp * vec4(in_pos, 1.0);
  gl_Position = postemp;
  pos = postemp * 0.5 + 0.5;
}
`,
  `#version 300 es
precision highp float;

in vec4 pos;
out vec4 col;

uniform vec4 color;

void main() {
  col = color;
}
`
).data;

if (!prog) {
  throw window.alert("No shader program :(");
}

const scene = createScene({
  gl,
  uniforms: {
    mvp: ["mat4", mulMat4(perspective(1, 1, 0.1, 100), translate([0, 0, -1]))],
  },
  combineUniforms(sceneUniforms, objectUniforms) {
    let combined = {
      ...sceneUniforms,
      ...objectUniforms,
    };

    if (
      sceneUniforms.mvp &&
      sceneUniforms.mvp[0] === "mat4" &&
      objectUniforms.mvp &&
      objectUniforms.mvp[0] === "mat4"
    ) {
      combined.mvp = [
        "mat4",
        mulMat4(sceneUniforms.mvp[1], objectUniforms.mvp[1]),
      ];
    }

    return combined;
  },
});

gl.enable(gl.DEPTH_TEST);

// const mesh = uvSphere(8, 8, 1.2, "in_pos");

const mesh = ring(32, 2.5, 0.25, "in_pos");

const obj = scene.addObject3D({
  buffer: createBufferWithLayout(
    gl,
    { in_pos: { type: gl.FLOAT, size: 3 } },
    mesh
  ),
  program: prog,
  uniforms: {
    // depthOffset: ["float", 0],
    color: ["vec4", [1.0, 0.0, 0.0, 1.0]],
    mvp: ["mat4", rotate([1, 0, 0], 0)],
  },
});

function loop(t: number) {
  scene.updateUniforms({
    mvp: [
      "mat4",
      mulMat4(
        translate([0, window.scrollY / window.innerHeight - 2.5, 0]),
        perspective(1, ASPECT, 0.1, 100)
      ),
    ],
  });
  t += 1000000000;
  for (let i = 0; i < 100; i++) {
    let scaleFactor = 0.3 + i * 0.01;
    obj.updateUniforms({
      mvp: [
        "mat4",
        mulMat4(rotate([1, 1, 1], (i * t) / 10000000), [
          scaleFactor,
          0,
          0,
          0,
          0,
          scaleFactor,
          0,
          0,
          0,
          0,
          scaleFactor,
          0,
          0,
          0,
          0,
          1,
        ]),
      ],
      color: ["vec4", [i / 100, 0, 0, 1]],
    });
    obj.draw();
  }

  requestAnimationFrame(loop);
}

loop((document.timeline.currentTime as number) ?? 0);
