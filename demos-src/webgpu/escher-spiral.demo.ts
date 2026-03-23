import { hookGPUDevice, struct } from "../../src";
import { typeDevice } from "../../src/webgpu/easygpu/easygpu";

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

  const device = hookGPUDevice(await adapter.requestDevice({}));
  device.addEventListener("uncapturederror", (event) =>
    console.error(event.error),
  );

  if (!device) {
    fail("No GPU device!");
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("webgpu")!;
  const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
  ctx.configure({
    device,
    format: canvasFormat,
    alphaMode: "opaque",
  });

  const td = typeDevice(device);

  const texFormat = td.textureFormat(
    {
      name: "tex",
      format: "rgba8unorm",
      viewDimension: "2d",
      sampleCount: 1,
      visibility: ["fragment"] as const,
    },
    "copy-dst",
    "texture-binding",
  );

  const geometryBufferFormat = td.vertexBufferFormat("geometry", 12, [
    {
      name: "uv",
      offset: 0,
      format: "float32x2",
    },
  ] as const);

  const samplerFormat = td.sampler("samp", {
    visibility: ["fragment"] as const,
    type: "filtering",
  });

  const uniformsFormat = td.uniformBufferFormat(
    "params",
    struct("Params", {
      angle: "f32",
      mulBy: "vec2f",
    }),
  );

  const bindGroupFormat = td.bindGroupFormat(
    "bg",
    texFormat,
    samplerFormat,
    uniformsFormat,
  );

  const pl = await td.renderPipeline({
    bindGroups: [bindGroupFormat],
    inputs: [geometryBufferFormat],
    outputs: {
      color: canvasFormat,
    },
    vertex: `
    return FragInput(
      vec4f(vertex.uv * 2.0 - 1.0, 0.5, 1.0), 
      vertex.uv
    ); 
    `,
    globals: `
    fn expc(z: vec2f) -> vec2f {
      return vec2f(
        cos(z.y),
        sin(z.y)
      ) * exp(z.x); 
    }

    fn mulc(a: vec2f, b: vec2f) -> vec2f {
      return vec2f(
        a.x * b.x - a.y * b.y,
        a.x * b.y + a.y * b.x  
      );
    }

    fn logc(z: vec2f) -> vec2f {
      return vec2f(
        log(length(z)),
        atan2(z.y, z.x) 
      ); 
    }

    fn smpl(z: vec2f) -> vec2f {
      var dist_from_center = max(
        abs(fract(z.x * 0.5 + 0.5) * 2.0 - 1.0), 
        abs(fract(z.y * 0.5 + 0.5) * 2.0 - 1.0) 
      );
      var z2 = z;
      var i = 0;

      while (dist_from_center < 0.2 && i < 10) {
        z2 *= 5.0; 
        dist_from_center *= 5.0;
        i += 1;
      }
      
      return z2;
    }
    `,
    fragment: {
      struct: `
      @builtin(position) position: vec4f,
      @location(0) uv: vec2f,
      `,
      function: `
      var uv = input.uv * 2.0 - 1.0;
      uv *= 10.0;
      uv = logc(uv);
      uv *= mat2x2f(
        cos(params.angle), -sin(params.angle),
        sin(params.angle), cos(params.angle) 
      );
      uv = expc(uv);

      return FragOutput(
        textureSample(tex, samp, smpl(uv) * 0.5 + 0.5)
      );
      `,
    },
  });

  const uvQuadBuffer = geometryBufferFormat.quickCreate([
    {
      uv: [0, 0],
    },
    {
      uv: [1, 0],
    },
    {
      uv: [0, 1],
    },
    {
      uv: [1, 0],
    },
    {
      uv: [0, 1],
    },
    {
      uv: [1, 1],
    },
  ]);

  console.log("please work");
  const elonmusk = await createImageBitmap(
    await (await fetch("../assets/elonmusk8.png")).blob(),
  );

  const tex = texFormat.new([elonmusk.width, elonmusk.height]);

  // help
  const samp = samplerFormat.new({
    addressModeU: "repeat",
    addressModeV: "repeat",
  });

  device.queue.copyExternalImageToTexture(
    {
      source: elonmusk,
    },
    {
      texture: tex,
    },
    [elonmusk.width, elonmusk.height],
  );

  const params = uniformsFormat.new(1);

  const bindGroup = bindGroupFormat.new({ tex, samp, params });

  let iter = 0;

  function loop() {
    uniformsFormat.fill(params, 0, {
      angle: iter * 0.01,
      mulBy: [Math.cos(iter * 0.01), iter * 0.01],
    });
    const enc = device.createCommandEncoder();
    const pass = enc.beginRenderPass({
      colorAttachments: [
        {
          view: ctx.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    pass.setPipeline(pl);
    pass.setVertexBuffer(0, uvQuadBuffer);
    pass.setBindGroup(0, bindGroup);
    pass.draw(6);
    pass.end();
    device.queue.submit([enc.finish()]);
    iter++;
    setTimeout(loop, 25);
  }

  loop();
})();
