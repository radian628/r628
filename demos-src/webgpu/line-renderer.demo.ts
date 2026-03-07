import {
  cartesianProduct,
  hookGPUDevice,
  mulMat4,
  perspectiveWebgpu,
  range,
  rangeFrom,
  rotate,
  smartRange,
  struct,
  translate,
  variadify,
  w,
  wrapDevice,
} from "../../src";
import { clearRenderer } from "../../src/webgpu/pipelines/clear";
import { lineRenderer } from "../../src/webgpu/pipelines/line-renderer";

(async () => {
  function fail(msg: string) {
    window.alert(msg);
    throw new Error(msg);
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    fail("No GPU adapter!");
    return;
  }

  const device = hookGPUDevice(await adapter.requestDevice());
  device.addEventListener("uncapturederror", (event) =>
    console.error(event.error),
  );

  if (!device) {
    fail("No GPU device!");
  }

  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("webgpu");
  ctx.configure({
    device: device,
    format: navigator.gpu.getPreferredCanvasFormat(),
  });

  const renderer = await lineRenderer(
    device,
    navigator.gpu.getPreferredCanvasFormat(),
  );

  const clear = await clearRenderer(
    device,
    navigator.gpu.getPreferredCanvasFormat(),
  );

  const depth = renderer.depthTexFormat.instantiate(
    [1024, 1024],
    GPUTextureUsage.RENDER_ATTACHMENT,
  );

  // for (const i of [0, 1]) {
  //   renderer.drawLinesSimple(
  //     ctx.getCurrentTexture(),
  //     depth,
  //     i === 0 ? "clear" : "load",
  //     smartRange(4).map((x) => {
  //       const angle = x.remap(0, Math.PI * 2) + i;
  //       return [Math.cos(angle), Math.sin(angle), x.remap(-4 - i, -4 - i)];
  //     }),
  //     [0, i * 255, 0, 255],
  //     0.1,
  //     mulMat4(
  //       perspectiveWebgpu(Math.PI / 2, 1, 0.1, 100),
  //       rotate([1, 1, 1], (Math.PI / 2) * 0.0)
  //     )
  //   );
  // }

  // const lines = renderer.createLines(
  //   smartRange(46).map((x) => {
  //     if (x.i === 30) return [NaN, NaN, NaN];
  //     const angle = x.remap(0, Math.PI * 7);
  //     return [Math.cos(angle), Math.sin(angle), x.remap(0, 4)];
  //   }),
  //   [0, 255, 0, 255],
  //   0.1,
  //   "clear",
  // );

  const wdevice = wrapDevice(device);

  const lines = renderer.createEmptyLines(64, "clear", 0);

  const staging = device.createBuffer({
    size: 64 * 20,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  const storageBufferFormat = wdevice.uniformBuffer(
    "points",
    struct("Point", {
      x: "f32",
      y: "f32",
      z: "f32",
      size: "f32",
      color: "u32",
    }),
    true,
    {
      usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
      visibility: GPUShaderStage.COMPUTE,
    },
  );

  const lineGeneratorUniformLayout = wdevice.uniformBuffer(
    "uniforms",
    struct("Uniforms", {
      tightness: "f32",
    }),
    false,
    { visibility: GPUShaderStage.COMPUTE },
  );

  const linesStorage = storageBufferFormat.instantiate(64);

  const computeLinesBindGroupLayout = wdevice.bindGroup(
    "perFrame",
    storageBufferFormat,
    lineGeneratorUniformLayout,
  );

  const generateLines = await wdevice.compute({
    bindGroups: [computeLinesBindGroupLayout],
    workgroupSize: [64, 1, 1],
    shader: `
      let i = id.x; 
      let t = f32(i) * 0.5;
      points[i].x = cos(t * uniforms.tightness);
      points[i].y = sin(t * uniforms.tightness);
      points[i].z = t * 0.1;
      points[i].size = 0.1;
      points[i].color = 0xff00ff00; 
    `,
    storageBufferAccess: { points: "read_write" },
  });

  const lineGeneratorUniforms = lineGeneratorUniformLayout.quickCreate({
    tightness: 1,
  });

  const computeLinesBindGroup = computeLinesBindGroupLayout.instantiate({
    points: linesStorage,
    uniforms: lineGeneratorUniforms,
  });

  // enc.copyBufferToBuffer(linesStorage, staging, lines.buffer.size);

  // await staging.mapAsync(GPUMapMode.READ);

  // const range = staging.getMappedRange().slice();

  // staging.unmap();

  // console.log(new Float32Array(range));
  // console.log(new Uint8Array(range));

  function loop(t) {
    lineGeneratorUniformLayout.fill(lineGeneratorUniforms, 0, {
      tightness: 1 + Math.cos(t * 0.0002),
    });

    const enc = device.createCommandEncoder();
    const pass = enc.beginComputePass();
    pass.setPipeline(generateLines);
    pass.setBindGroup(0, computeLinesBindGroup);
    pass.dispatchWorkgroups(1);

    pass.end();

    enc.copyBufferToBuffer(linesStorage, lines.buffer, lines.buffer.size);
    device.queue.submit([enc.finish()]);

    clear.clear(ctx.getCurrentTexture(), [255, 255, 255, 255]);
    lines.draw(
      ctx.getCurrentTexture(),
      depth,
      variadify(mulMat4)(
        perspectiveWebgpu(Math.PI / 2, 1, 0.1, 100),
        translate([0, 0, -4]),
        rotate([1, 1, 1], (Math.PI / 2) * t * 0.0001),
      ),
    );
    requestAnimationFrame(loop);
  }

  loop(0);

  // document.body.appendChild(device.getDebugView());
})();
