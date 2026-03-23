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
    "render-attachment",
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
      scale: "f32",
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
    let factor = 25.0;

      var dist_from_center = max(
        abs(fract(z.x * 0.5 + 0.5) * 2.0 - 1.0), 
        abs(fract(z.y * 0.5 + 0.5) * 2.0 - 1.0) 
      );
      var z2 = z;
      var i = 0;

      while (dist_from_center < 1.0 / factor && i < 10) {
        z2 *= factor; 
        dist_from_center *= factor;
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
      uv *= 0.4;
      // uv *= 3.141592;
      // uv.x -= 4.0;
      uv = logc(uv);
      uv *= mat2x2f(
        cos(params.angle), -sin(params.angle),
        sin(params.angle), cos(params.angle) 
      );
      uv *= params.scale;
      uv = expc(uv);

      return FragOutput(
        textureSample(tex, samp, smpl(uv) * 0.5 + 0.5) * 3.0
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

  let mousedown = false;

  document.addEventListener("mousedown", () => {
    mousedown = true;
  });
  document.addEventListener("mouseup", () => {
    mousedown = false;
  });

  let angle = 0.5;
  let scale = 0.5;

  document.addEventListener("mousemove", (e) => {
    if (mousedown) {
      angle = e.clientX / window.innerWidth;
      scale = (e.clientY / window.innerHeight) * 2.0;
    }
  });

  function loop() {
    uniformsFormat.fill(params, 0, {
      angle,
      scale,
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
