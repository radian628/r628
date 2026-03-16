import {
  add3,
  array,
  clearRenderer,
  hookGPUDevice,
  lineRenderer,
  Mat4,
  mulMat4,
  mulVec4ByMat4,
  perspectiveWebgpu,
  pipelineRenderpass,
  quickMapWithFormat,
  range,
  rotate,
  scale3,
  scale4,
  struct,
  translate,
  variadify,
  Vec3,
  WGSLStructValues,
  wrapDevice,
  xyz,
} from "../../src";
import { keyboardInput } from "../../src/ui/keyboard-input";
import { createNBodyOctreeDefs } from "./n-body-octree";

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

  const device = hookGPUDevice(
    await adapter.requestDevice({
      requiredFeatures: ["timestamp-query"],
    }),
  );
  device.addEventListener("uncapturederror", (event) =>
    console.error(event.error),
  );

  if (!device) {
    fail("No GPU device!");
  }

  const wdevice = wrapDevice(device);

  const nBodySim = await createNBodyOctreeDefs(device, {
    extraBodyFields: {
      impulse: "vec3f",
      visit_count: "u32",
    },
    bodyBodyInteraction: `
      let force_mag = mass * bodies[i].mass / pow(max(1.0, dist_to_body), 2.0);
      let force_dir = normalize(center_of_mass - bodies[i].position);
      bodies[i].visit_count += 1u;
      return force_mag * force_dir; 
    `,
    applyForces: `
      bodies[i].velocity += total_impulse / bodies[i].mass * params.timestep;
      bodies[i].position += bodies[i].velocity * params.timestep;
      bodies[i].impulse = total_impulse;
    `,
    extraPhysicsBuffers: [] as [],
  });

  const genericBufferFormat = await wdevice.uniformBuffer(
    "generic",
    struct("Generic", { data: "u32" }),
    true,
    {
      visibility: GPUShaderStage.COMPUTE,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    },
  );

  const transferBodyInfoToPointsBindGroupFormat = wdevice.bindGroup(
    "bg",
    nBodySim.bodiesFormat,
    genericBufferFormat,
  );

  const transferBodyInfoToPointsPipeline = await wdevice.compute({
    bindGroups: [transferBodyInfoToPointsBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    storageBufferAccess: {
      bodies: "read_write",
      generic: "read_write",
    },
    shader: `
      let i = id.x;
      if (i >= arrayLength(&bodies)) { return; }
      generic[i * 5].data = bitcast<u32>(bodies[i].position.x);
      generic[i * 5 + 1].data = bitcast<u32>(bodies[i].position.y);
      generic[i * 5 + 2].data = bitcast<u32>(bodies[i].position.z);
      generic[i * 5 + 3].data = bitcast<u32>(0.05 * pow(bodies[i].mass, 0.2));
      generic[i * 5 + 4].data = 0xffffffff;
    `,
  });

  const bodiesData: WGSLStructValues<typeof nBodySim.bodiesFormat.format>[] = [
    ...range(20000).map(() => {
      return {
        mass:
          Math.pow(Math.random(), 4) * 0.01 +
          0.0001 +
          (Math.random() > 0.999 ? 1 : 0),
        velocity: scale3(
          [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
          0.0,
        ),
        position: scale3(
          [Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2],
          10.0,
        ) as Vec3,
        impulse: [0, 0, 0] as Vec3,
        visit_count: 0,
      };
    }),
  ];

  const bodiesBuffer = nBodySim.bodiesFormat.quickCreateMany(bodiesData);

  const barnesHutUniforms = nBodySim.barnesHutUniformsFormat.quickCreate({
    min_width_over_distance_ratio: 1.2,
    timestep: 0.02,
  });

  const octree = nBodySim.setupOctree({
    bodies: bodiesBuffer,
    bodyCount: bodiesData.length,
    octreeCapacity: 2 ** 19,
    octreeDepth: 20,
  });

  const applyBarnesHutBindGroup =
    nBodySim.applyBarnesHutBindGroupFormat.instantiate({
      bodies: bodiesBuffer,
      octree_metadata: octree.octreeMetadataBuffer,
      octree_nodes: octree.octreeNodeBuffer,
      params: barnesHutUniforms,
    });

  function runPhysicsStep(pass: GPUComputePassEncoder, enc: GPUCommandEncoder) {
    const perBodyWorkgroupCount = Math.ceil(bodiesData.length / 32);

    octree.run(pass);

    pass.setPipeline(nBodySim.applyBarnesHutPipeline);
    pass.setBindGroup(0, applyBarnesHutBindGroup);
    pass.dispatchWorkgroups(perBodyWorkgroupCount, 1, 1);
  }

  function runDebugPhysicsStep() {
    const enc = device.createCommandEncoder();
    octree.clear(enc);
    const pass = enc.beginComputePass();

    runPhysicsStep(pass, enc);

    pass.end();

    device.queue.submit([enc.finish()]);
  }

  async function checkBuffers() {
    console.log(
      "body-to-node assignments",
      await quickMapWithFormat(
        nBodySim.bodyNodeAssignmentsFormat.format,
        device,
        octree.nodeBodyAssignmentsBuffer,
      ),
    );

    console.log(
      "octree nodes",
      await quickMapWithFormat(
        nBodySim.octreeNodeFormat.format,
        device,
        octree.octreeNodeBuffer,
      ),
    );
    console.log(
      "octree metadata",
      await quickMapWithFormat(
        nBodySim.octreeMetadataFormat.format,
        device,
        octree.octreeMetadataBuffer,
      ),
    );
    console.log(
      "bodies",
      await quickMapWithFormat(
        nBodySim.bodiesFormat.format,
        device,
        bodiesBuffer,
      ),
    );
    console.log(
      "nextfrees",
      await quickMapWithFormat(
        nBodySim.nextfreesFormat.format,
        device,
        octree.nextfreesBuffer,
      ),
    );

    // console.log(
    //   "octree counters",
    //   await quickMapWithFormat(
    //     octreeCountersFormat.format,
    //     device,
    //     octreeCountersBuffer,
    //   ),
    // );
    // console.log(
    //   "body order in",
    //   await quickMapWithFormat(
    //     bodyOrderFormat.format,
    //     device,
    //     bodiesOrderBuffer2,
    //   ),
    // );
    // console.log(
    //   "body order ouot",
    //   await quickMapWithFormat(
    //     bodyOrderFormat.format,
    //     device,
    //     bodiesOrderBuffer1,
    //   ),
    // );

    // console.log(
    //   "agg bodies",
    //   await quickMapWithFormat(
    //     aggregatedBodiesFormat.format,
    //     device,
    //     aggPrefixSum.aggBodies,
    //   ),
    // );

    // console.log(
    //   "minmax reduce result",
    //   await quickMapWithFormat(minMaxFormat.format, device, minMaxReduce.minmax),
    // );
  }

  runDebugPhysicsStep();
  await checkBuffers();

  let lastT = 0;

  let viewerPos = [0, 0, 0] as Vec3;
  let viewerVel = [0, 0, 0] as Vec3;
  let rotationMatrix: Mat4 = rotate([0, 1, 0], 0.1);

  const { keysDown } = keyboardInput();
  document.addEventListener("mousedown", (e) => {
    if (
      e.target instanceof HTMLElement &&
      e.target.tagName.toUpperCase() === "A"
    )
      return;
    document.body.requestPointerLock();
  });

  function rotateBy(dx, dy) {
    const localXAxis = mulVec4ByMat4([1, 0, 0, 0], rotationMatrix);
    const localYAxis = mulVec4ByMat4([0, -1, 0, 0], rotationMatrix);

    const r1 = rotate(xyz(localYAxis), dx);
    const r2 = rotate(xyz(localXAxis), dy);

    rotationMatrix = mulMat4(rotationMatrix, mulMat4(r1, r2));
  }

  document.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement !== document.body) return;
    rotateBy(-e.movementX * 0.003, e.movementY * 0.003);
  });

  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.style =
    "position: absolute; top: 0; left: 0; width: 100vw; height: 100vh;";
  const ctx = canvas.getContext("webgpu");
  ctx.configure({
    device: device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    // alphaMode: "premultiplied",
    alphaMode: "opaque",
  });

  const lines = await lineRenderer(
    device,
    navigator.gpu.getPreferredCanvasFormat(),
  );
  const clear = await clearRenderer(
    device,
    navigator.gpu.getPreferredCanvasFormat(),
  );
  const drawUniforms = lines.uniforms.instantiate(1);

  let depthTex: ReturnType<typeof lines.depthTexFormat.instantiate>;
  function handleResize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    depthTex = lines.depthTexFormat.instantiate(
      [canvas.width, canvas.height],
      GPUTextureUsage.RENDER_ATTACHMENT,
    );
  }
  handleResize();

  window.addEventListener("resize", handleResize);

  const multiTransform = variadify(mulMat4);

  const vertices = lines.pointInstanceBufferFormat.instantiate(
    bodiesData.length,
    {
      usage:
        GPUBufferUsage.VERTEX |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.STORAGE,
    },
  );

  const drawPerFrameBindGroup = lines.perFrameBindGroup.instantiate({
    params: drawUniforms,
  });

  let loopIter = 0;

  async function loop(t) {
    const start = performance.now();
    const seconds = t / 1000;

    let dt = (t - lastT) / 1000;
    lastT = t;

    viewerPos = add3(viewerPos, scale3(viewerVel, dt));

    const accel = scale4(
      mulVec4ByMat4(
        [
          keysDown.has("d") ? -1 : keysDown.has("a") ? 1 : 0,
          keysDown.has("shift") ? 1 : keysDown.has(" ") ? -1 : 0,
          keysDown.has("w") ? 1 : keysDown.has("s") ? -1 : 0,
          0,
        ],
        rotationMatrix,
      ),
      0.1,
    );

    viewerVel = add3(viewerVel, xyz(accel));
    viewerVel = scale3(viewerVel, 0.1 ** dt);
    if (Math.hypot(...viewerVel) < 0.002) {
      viewerVel = [0, 0, 0];
    }

    let currTransform = mulMat4(rotationMatrix, translate(viewerPos));

    const queryCount = 2;

    const queryResolveBuffer = device.createBuffer({
      size: queryCount * 8,
      usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
    });

    const stagingBuffer = device.createBuffer({
      size: queryResolveBuffer.size,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    lines.uniforms.fill(drawUniforms, 0, {
      mvp: multiTransform(
        perspectiveWebgpu(Math.PI / 2, canvas.width / canvas.height, 0.1, 1000),
        currTransform,
      ),
      aspect: canvas.width / canvas.height,
    });

    const colorTex = ctx.getCurrentTexture();

    const beforeGpuStuff = performance.now();

    clear.clear(colorTex, [0, 0, 0, 255]);

    const afterClear = performance.now();

    const enc = device.createCommandEncoder();

    const querySet = device.createQuerySet({
      type: "timestamp",
      count: queryCount,
    });

    {
      octree.clear(enc);
      const pass = enc.beginComputePass();

      runPhysicsStep(pass, enc);

      pass.setPipeline(transferBodyInfoToPointsPipeline);
      const transferBodyInfoToPointsBindGroup =
        transferBodyInfoToPointsBindGroupFormat.instantiate({
          bodies: bodiesBuffer,
          generic: genericBufferFormat.reinterpret(vertices),
        });
      pass.setBindGroup(0, transferBodyInfoToPointsBindGroup);
      pass.dispatchWorkgroups(Math.ceil(bodiesData.length / 32));

      pass.end();
    }

    const pass = enc.beginRenderPass({
      colorAttachments: [
        {
          view: colorTex,
          loadOp: "load",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: depthTex,
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
      timestampWrites: {
        querySet,
        beginningOfPassWriteIndex: 0,
        endOfPassWriteIndex: 1,
      },
    });

    pass.setPipeline(lines.pointPipeline);
    pipelineRenderpass(
      lines.pointPipeline,
      pass,
    )({
      points: vertices,
      geometry: lines.quad,
      perFrame: drawPerFrameBindGroup,
    });
    pass.draw(6, bodiesData.length);

    pass.end();

    enc.resolveQuerySet(querySet, 0, querySet.count, queryResolveBuffer, 0);

    enc.copyBufferToBuffer(
      queryResolveBuffer,
      0,
      stagingBuffer,
      0,
      queryResolveBuffer.size,
    );

    device.queue.submit([enc.finish()]);

    const afterQueueSubmit = performance.now();

    const end = performance.now();

    if (stagingBuffer.mapState === "unmapped") {
      stagingBuffer.mapAsync(GPUMapMode.READ).then(() => {
        const range = new BigUint64Array(
          stagingBuffer.getMappedRange().slice(),
        );

        // console.log("GPU:", Number(range[1] - range[0]) / 1_000_000);
        // console.log("CPU:", end - start);
        // console.log("CPU Before GPU Stuff:", beforeGpuStuff - start);
        // console.log("CPU-Side Clear:", afterClear - beforeGpuStuff);
        // console.log(
        //   "CPU-Side after GPU Queue Submit:",
        //   afterQueueSubmit - afterClear,
        // );

        stagingBuffer.unmap();
      });
    }

    loopIter++;

    // @ts-expect-error firefox is slow
    if (window.mozInnerScreenX) {
      setTimeout(() => loop((loopIter * 1000) / 60), 1000 / 60);
    } else {
      requestAnimationFrame(loop);
    }
  }

  loop(0);
})();
