import { hookGPUDevice, textureDisplayer, TextureFormat } from "../../src";
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

  const tex = device.createTexture({
    label: "Test Texture",
    size: [1024, 1024],
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
    format: "rgba8unorm",
  });

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

  const mandelbrotPipeline = createSimpleFilterPipeline(device, {
    inputs: {},
    outputs: {
      color: "rgba8unorm",
    },
    uniforms: {
      corner1: "vec2f",
      corner2: "vec2f",
      iters: "u32",
    },
    globals: `
${useWgslSnippets("perlinNoise")}    
    `,
    source: `
let c = 
  mix(params.corner1, params.corner2, uv);

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
  color = vec4f(1.0, 1.0, 1.0, 1.0); 
} else {
  color = vec4f(vec2f(perlinNoise2(uv * 10.0)), 0.0, 1.0); 
}
    `,
  });

  const encoder = device.createCommandEncoder();

  mandelbrotPipeline
    .withInputs({})
    .withUniforms(
      mandelbrotPipeline
        .makeUniformBuffer()
        .setBuffer({ corner1: [-2, -2], corner2: [2, 2], iters: 64 })
    )
    .run(encoder, { color: tex.createView() });

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
