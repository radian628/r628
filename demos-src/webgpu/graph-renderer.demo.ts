import Matrix, { inverse } from "ml-matrix";
import {
  add3,
  addEdge,
  addVertex,
  clearRenderer,
  createGraph,
  distance3,
  Graph,
  hookGPUDevice,
  lineRenderer,
  Mat4,
  mix3,
  mul3,
  mulMat4,
  mulVec4ByMat4,
  perspectiveWebgpu,
  pickrand,
  pipelineRenderpass,
  range,
  rotate,
  scale3,
  scale4,
  struct,
  translate,
  variadify,
  Vec3,
  Vec4,
  Vertex,
  w,
  wrapDevice,
  xyz,
} from "../../src";
import GraphData from "./graph_fixed.json?raw";

const graphData = JSON.parse(GraphData);

console.log(graphData);

type Node = { position: Vec3; color: Vec4 };

function inv4(m: Mat4): Mat4 {
  const M = new Matrix([
    m.slice(0, 4),
    m.slice(4, 8),
    m.slice(8, 12),
    m.slice(12, 16),
  ]);
  const invM = inverse(M);
  return invM.to1DArray() as Mat4;
}

(async () => {
  // const n1: Node = { position: [1, 1, 1] };
  // const n2: Node = { position: [2, 1, 1] };
  // const n3: Node = { position: [1, 2, 1] };
  // const n4: Node = { position: [1, 1, 2] };

  const graph: Graph<Node, Vec4> = createGraph();

  let nodeMap = new Map<string, Vertex<Node, Vec4>>();

  for (const n of graphData.nodes) {
    nodeMap.set(
      n.id,
      addVertex(graph, {
      position: scale3(mul3([n.x, n.y, Math.log(n.z)], [0.001, 0.001, 70]), 0.2) as Vec3,
        color: [255, 255, 255, 255],
      }),
    );
  }

  for (const e of graphData.links) {
    const src = nodeMap.get(e.source)
    const dst = nodeMap.get(e.target);

    if (!src) {
      console.warn(`Endpoint '${e.source}' not found.`)
      continue;
    }
    if (!dst) {
      console.warn(`Endpoint '${e.target}' not found.`)
      continue;
    }

    addEdge(
      graph,
      [src, dst],
      [0, 255, 0, 255],
    );
  }

  // const nodes = range(20000).map(
  //   () =>
  //     ({
  //       position: [
  //         Math.random() * 200 - 100,
  //         Math.random() * 200 - 100,
  //         Math.random() * 200 - 100,
  //       ],
  //       color: [
  //         Math.random() * 255,
  //         Math.random() * 255,
  //         Math.random() * 255,
  //         255,
  //       ],
  //     }) as Node,
  // );

  // const verts = nodes.map((n) => addVertex(graph, n));

  // range(400_000).map(() =>
  //   addEdge(
  //     graph,
  //     [pickrand(verts), pickrand(verts)],
  //     scale4(
  //       [Math.random() * 255, Math.random() * 255, Math.random() * 255, 255],
  //       1,
  //     ),
  //   ),
  // );

  // const v1 = addVertex(graph, n1);
  // const v2 = addVertex(graph, n2);
  // const v3 = addVertex(graph, n3);
  // const v4 = addVertex(graph, n4);

  // addEdge(graph, [v1, v2], 0);
  // addEdge(graph, [v1, v3], 0);
  // addEdge(graph, [v1, v4], 0);
  // addEdge(graph, [v2, v3], 0);
  // addEdge(graph, [v2, v4], 0);
  // addEdge(graph, [v3, v4], 0);

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

  const depthTex = lines.depthTexFormat.instantiate(
    [canvas.width, canvas.height],
    GPUTextureUsage.RENDER_ATTACHMENT,
  );

  const vertices = lines.pointInstanceBufferFormat.quickCreate(
    [...graph.vertices].map((v) => ({
      position: v.data.position,
      color: v.data.color,
      size: 0.5,
    })),
  );

  const edgeThickness = 0.008;

  const edges = lines.pointInstanceBufferFormat.quickCreate(
    [...graph.edges].flatMap((v) => {
      let len = distance3(
        v.endpoints[0].data.position,
        v.endpoints[1].data.position,
      );

      return [
        {
          position: mix3(
            0.6 / len,
            v.endpoints[0].data.position,
            v.endpoints[1].data.position,
          ),
          color: v.data,
          size: edgeThickness,
        },
        {
          position: mix3(
            1 - 0.6 / len,
            v.endpoints[0].data.position,
            v.endpoints[1].data.position,
          ),
          color: v.data,
          size: edgeThickness,
        },
        {
          position: [NaN, NaN, NaN],
          color: v.data,
          size: edgeThickness,
        },
      ];
    }),
  );

  const graphUniforms = lines.uniforms.quickCreate({
    mvp: variadify(mulMat4)(
      perspectiveWebgpu(Math.PI / 2, 1, 0.1, 1000),
      translate([0, 0, -4]),
    ),
    viewportSize: canvas.width,
  });

  const graphPerFrameBindGroup = lines.perFrameBindGroup.instantiate({
    params: graphUniforms,
  });

  const wdevice = wrapDevice(device);

  let viewerPos: Vec3 = [0, 0.1, -3];
  let viewerVel: Vec3 = [0, 0, 0];

  let rotationMatrix: Mat4 = rotate([0, 1, 0], 0.1);

  let keysDown = new Set<string>();

  document.addEventListener("keydown", (e) => {
    keysDown.add(e.key.toLowerCase());
  });
  document.addEventListener("keyup", (e) => {
    keysDown.delete(e.key.toLowerCase());
  });

  document.addEventListener("mousedown", (e) => {
    document.body.requestPointerLock();
  });

  document.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement !== document.body) return;

    const localXAxis = mulVec4ByMat4([1, 0, 0, 0], rotationMatrix);
    const localYAxis = mulVec4ByMat4([0, -1, 0, 0], rotationMatrix);

    const r1 = rotate(xyz(localYAxis), -e.movementX * 0.001);
    const r2 = rotate(xyz(localXAxis), e.movementY * 0.001);

    rotationMatrix = mulMat4(rotationMatrix, mulMat4(r1, r2));
  });

  let lastT = 0;

  function loop(t) {
    const seconds = t / 1000;

    let dt = (t - lastT) / 1000;
    lastT = t;

    viewerPos = add3(viewerPos, scale3(viewerVel, dt));

    const accel = mulVec4ByMat4(
      [
        keysDown.has("d") ? -1 : keysDown.has("a") ? 1 : 0,
        keysDown.has("shift") ? 1 : keysDown.has(" ") ? -1 : 0,
        keysDown.has("w") ? 1 : keysDown.has("s") ? -1 : 0,
        0,
      ],
      rotationMatrix,
    );

    viewerVel = add3(viewerVel, xyz(accel));
    viewerVel = scale3(viewerVel, 0.1 ** dt);
    if (Math.hypot(...viewerVel) < 0.2) {
      viewerVel = [0, 0, 0];
    }

    let currTransform = mulMat4(rotationMatrix, translate(viewerPos));

    // let currTransform = translate(viewerPos);

    lines.uniforms.fill(graphUniforms, 0, {
      mvp: variadify(mulMat4)(
        perspectiveWebgpu(Math.PI / 2, 1, 0.1, 1000),
        currTransform,
      ),
      viewportSize: canvas.width,
    });

    const colorTex = ctx.getCurrentTexture();

    clear.clear(colorTex, [0, 0, 0, 255]);

    const enc = device.createCommandEncoder();

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
    });

    pass.setPipeline(lines.pointPipeline);
    pipelineRenderpass(
      lines.pointPipeline,
      pass,
    )({
      points: vertices,
      geometry: lines.quad,
      perFrame: graphPerFrameBindGroup,
    });
    pass.draw(6, graph.vertices.size);

    pass.setPipeline(lines.linePipeline);
    pipelineRenderpass(
      lines.linePipeline,
      pass,
    )({
      lineSegments1: lines.lineSegInstanceBufferFormat1.reinterpret(edges),
      lineSegments2: [
        lines.lineSegInstanceBufferFormat2.reinterpret(edges),
        20,
      ],
      perFrame: graphPerFrameBindGroup,
      geometry: lines.quad,
    });
    pass.draw(6, graph.edges.size * 3 - 1);

    pass.end();

    device.queue.submit([enc.finish()]);

    requestAnimationFrame(loop);
  }

  loop(0);
})();
