import { primitive, quickMapWithFormat, runtimeArray, struct } from "../../src";
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

  const device = await adapter.requestDevice({
    requiredFeatures: [
      //  "timestamp-query"
    ],
  });

  device.addEventListener("uncapturederror", (event) =>
    console.error(event.error),
  );

  if (!device) {
    fail("No GPU device!");
  }

  const td = typeDevice(device);

  await testRuntimeArray(td);
  await testRuntimeArrayStruct(td);
  await testSingleStruct(td);
  await testTriangle(td);
})();

type Td = ReturnType<typeof typeDevice>;

async function testRuntimeArray(td: Td) {
  const fBuf = td
    .storageBufferFormat("floats", runtimeArray("f32"))
    .usage("copy-dst", "copy-src", "storage");

  const fBindGroup = td.bindGroupFormat("bg", fBuf);

  const ppln = await td.computePipeline({
    bindGroups: [fBindGroup] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= arrayLength(&floats)) { return; }
    floats[id.x] += 1.0; 
    `,
  });

  const buf = fBuf.quickCreate([1, 2, 3, 4, 5]);

  const bindGroup = fBindGroup.new({
    floats: buf,
  });

  const enc = td.device.createCommandEncoder();
  const pass = enc.beginComputePass();
  pass.setPipeline(ppln);
  ppln.bind(pass, {
    bg: bindGroup,
  });
  pass.dispatchWorkgroups(1, 1, 1);
  pass.end();
  td.device.queue.submit([enc.finish()]);

  console.log(await quickMapWithFormat(fBuf.desc.format.spec, td.device, buf));
}

async function testRuntimeArrayStruct(td: Td) {
  const fBuf = td
    .storageBufferFormat(
      "struct_test",
      struct("StructTest", {
        a: "f32",
        b: runtimeArray("f32"),
      }),
    )
    .usage("copy-dst", "copy-src", "storage");

  const fBindGroup = td.bindGroupFormat("bg", fBuf);

  const ppln = await td.computePipeline({
    bindGroups: [fBindGroup] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= arrayLength(&struct_test.b)) { return; }
    struct_test.b[id.x] += struct_test.a; 
    `,
  });

  const buf = fBuf.quickCreate({
    a: 69,
    b: [1, 2, 3, 4],
  });

  const bindGroup = fBindGroup.new({
    struct_test: buf,
  });

  const enc = td.device.createCommandEncoder();
  const pass = enc.beginComputePass();
  pass.setPipeline(ppln);
  ppln.bind(pass, {
    bg: bindGroup,
  });
  pass.dispatchWorkgroups(1, 1, 1);
  pass.end();
  td.device.queue.submit([enc.finish()]);

  console.log(await quickMapWithFormat(fBuf.desc.format.spec, td.device, buf));
}

async function testSingleStruct(td: Td) {
  const fBuf = td
    .storageBufferFormat("counter", primitive("atomic<u32>"))
    .usage("copy-dst", "copy-src", "storage");

  const fBindGroup = td.bindGroupFormat("bg", fBuf);

  const ppln = await td.computePipeline({
    bindGroups: [fBindGroup] as const,
    workgroupSize: [32, 1, 1],
    shader: `
      atomicAdd(&counter, 1u);
    `,
  });

  const buf = fBuf.quickCreate(5);

  const bindGroup = fBindGroup.new({
    counter: buf,
  });

  const enc = td.device.createCommandEncoder();
  const pass = enc.beginComputePass();
  pass.setPipeline(ppln);
  ppln.bind(pass, {
    bg: bindGroup,
  });
  pass.dispatchWorkgroups(1, 1, 1);
  pass.end();
  td.device.queue.submit([enc.finish()]);

  console.log(await quickMapWithFormat(fBuf.desc.format.spec, td.device, buf));
}

async function testTriangle(td: Td) {
  const fVertBuf = td.vertexBufferFormat("vertices", 16, [
    {
      name: "pos",
      format: "float32x3",
      offset: 0,
    },
    {
      name: "color",
      format: "unorm8x4",
      offset: 12,
    },
  ] as const);

  const canvasFmt = navigator.gpu.getPreferredCanvasFormat();
  const pl = await td.renderPipeline({
    bindGroups: [],
    inputs: [fVertBuf] as const,
    outputs: {
      color: canvasFmt,
    },

    vertex: `
    var v: FragInput;
    v.position = vec4f(vertex.pos, 1.0); 
    v.color = vertex.color;
    return v;
    `,
    fragment: {
      function: `
      var f: FragOutput;
      f.color = input.color;
      return f;
      `,
      struct: `
      @builtin(position) position: vec4f,
      @location(0) color: vec4f,`,
    },
  });

  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = 512;
  canvas.height = 512;

  const ctx = canvas.getContext("webgpu")!;
  ctx.configure({
    device: td.device,
    format: canvasFmt,
  });

  const vertBuf = fVertBuf.quickCreate([
    {
      pos: [0, 1, 0.5],
      color: [255, 0, 0, 255],
    },
    {
      pos: [-1, -1, 0.5],
      color: [0, 255, 0, 255],
    },
    {
      pos: [1, -1, 0.5],
      color: [0, 0, 255, 255],
    },
  ]);

  const enc = td.device.createCommandEncoder();
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
  pl.bind(pass, {
    vertices: vertBuf,
  });

  pass.draw(3);
  pass.end();
  td.device.queue.submit([enc.finish()]);
}
