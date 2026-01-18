import {
  createWgslSerializers,
  hookGPUDevice,
  pipelineRenderpass,
  struct,
  textureDisplayer,
  TextureFormat,
  wrapDevice,
} from "../../src";
import { createSimpleFilterPipeline } from "../../src/webgpu/simple-filter";
import { useWgslSnippets } from "../../src/webgpu/wgsl-snippets";

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
    console.error(event.error)
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

  const wdevice = wrapDevice(device);

  const uniformStruct = struct("Params", {
    corner1: "vec2f",
    corner2: "vec2f",
    iters: "u32",
  });

  const uniformBufferFormat = wdevice.uniformBuffer("params", uniformStruct);

  const bindGroupFormat = wdevice.bindGroup("bg", uniformBufferFormat);

  console.log(createWgslSerializers(uniformStruct).code);

  const colorTexture = wdevice.texture("color", {
    format: "rgba8unorm",
  });

  const quadBufferFormat = wdevice.vertexBuffer("vertex", {
    types: [
      {
        name: "position",
        format: "float32x2",
        offset: 0,
      },
    ],
    stride: 8,
    stepMode: "vertex",
  });

  const bufRaw = device.createBuffer({
    size: 4 * 2 * 6,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
  });

  device.queue.writeBuffer(
    bufRaw,
    0,
    new Float32Array([1, 1, 1, -1, -1, -1, 1, 1, -1, -1, -1, 1])
  );

  const quadBuffer = quadBufferFormat.reinterpret(bufRaw);

  const pipeline = await wdevice.pipeline({
    inputs: [quadBufferFormat] as const,
    bindGroups: [bindGroupFormat] as const,
    outputs: { color: colorTexture },
    globals: `${useWgslSnippets("perlinNoise unitQuadUnsigned unitQuadSigned")}`,
    vertex: `
  var output: FragInput;
  output.position = vec4(vertex.position, 0.5, 1.0);
  output.uv = output.position.xy * 0.5 + 0.5;
  return output;
    `,
    fragment: {
      function: `
  let c = 
    mix(params.corner1, params.corner2, input.uv);

  var z = vec2f(0.0);

  var escaped = false;

  for (var i = 0u; i < params.iters; i++) {
    z = vec2f(
      z.x * z.x - z.y * z.y,
      2.0 * z.x * z.y
    ) + c; 

    if (length(z) > 2.0) {
      escaped = true;
      break;
    }
  }

  if (escaped) {
    return vec4f(1.0, 0.0, 1.0, 1.0); 
  } else {
    return vec4f(vec2f(perlinNoise2(input.uv * 10.0)), 0.0, 1.0); 
  }
      `,
      struct: `
@builtin(position) position : vec4f,
@location(0) uv : vec2f,      
      `,
    },
  });

  const uniformBuffer = uniformBufferFormat.instantiate();
  uniformBufferFormat.fill(uniformBuffer, 0, {
    corner1: [-2, -2],
    corner2: [2, 2],
    iters: 32,
  });

  const bindGroup = bindGroupFormat.instantiate({
    params: uniformBuffer,
  });

  const tex = colorTexture.instantiate(
    [1024, 1024],
    GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
  );

  const encoder = device.createCommandEncoder();

  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        clearValue: [1, 0, 0, 1],
        loadOp: "clear",
        storeOp: "store",
        view: tex.createView(),
      },
    ],
  });

  const bind = pipelineRenderpass(pipeline, pass);

  pass.setPipeline(pipeline);

  bind({
    bg: bindGroup,
    vertex: quadBuffer,
  });

  pass.draw(6);

  pass.end();

  const displayer = textureDisplayer(device);
  displayer.displayTexture2d(
    {
      tex: tex.createView(),
      samplerType: "float",
      cornerA: [0, 0],
      cornerB: [1, 1],
      blackEquiv: [0, 0, 0, 0],
      whiteEquiv: [1, 1, 1, 1],
    },
    {
      tex: ctx.getCurrentTexture().createView(),
      format: navigator.gpu.getPreferredCanvasFormat() as TextureFormat,
    },
    encoder
  );

  device.queue.submit([encoder.finish()]);
  document.body.appendChild(device.getDebugView());
})();
