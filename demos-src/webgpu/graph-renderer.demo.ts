import Matrix, { inverse } from "ml-matrix";
import {
  add3,
  addEdge,
  addVertex,
  clamp,
  clearRenderer,
  createGraph,
  distance3,
  getDepthFirstTraversalOrder,
  Graph,
  hookGPUDevice,
  lerp,
  lineRenderer,
  Mat4,
  mix3,
  mix4,
  mul3,
  mulMat4,
  mulMat4ByVec4,
  mulVec4ByMat4,
  perspectiveWebgpu,
  pickrand,
  pipelineRenderpass,
  range,
  rescale,
  rotate,
  scale3,
  scale4,
  spatialHashTable,
  splitBy,
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
import stringHash from "string-hash";


type Node = { position: Vec3; color: Vec4, initialized: boolean,label: string  };

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
  const graphData = (await ( await fetch("../assets/graph_fixed.json")).json());

  console.log("bust cache")

  console.log(graphData);
  // const n1: Node = { position: [1, 1, 1] };
  // const n2: Node = { position: [2, 1, 1] };
  // const n3: Node = { position: [1, 2, 1] };
  // const n4: Node = { position: [1, 1, 2] };


  const graph: Graph<Node, Vec4> = createGraph();

  let nodeMap = new Map<string, Vertex<Node, Vec4>>();

  for (const n of graphData.nodes) {
    const hash = stringHash(n.canon);

    const r = (hash % 256) * 0.5 + 127;
    const g = ((hash >> 8) % 256) * 0.5 + 127;
    const b = ((hash >> 16) % 256) * 0.5 + 127;

    nodeMap.set(
      n.id,
      addVertex(graph, {
      position: scale3(mul3([n.x, n.y, Math.log(n.z)], [0.001, 0.001, 70]), 0.2) as Vec3,
        color: [r, g, b, 255],
        initialized: false,
        label: n.id
      }),
    );
  }

  const vertsArray = [...graph.vertices ]

  const vertGroups = splitBy(vertsArray, 500); 

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
      [0, Math.random() * 55 + 200, 0, 255],
    );
  }

  const order = getDepthFirstTraversalOrder(graph);

  let r = 0;
  let g = 255;
  let b = 0;

  // for (const o of order) {
  //   o.data.color = [r,g,b, 255];

  //   r = clamp(r + Math.random() * 10 - 5, 127, 255)
  //   g = clamp(g + Math.random() * 10 - 5, 127, 255)
  //   b = clamp(b + Math.random() * 10 - 5, 127, 255)
  // }

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

  document.body.style = "width: 100vw; height: 100vh; overflow: hidden;"

  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.style = "position: absolute; top: 0; left: 0; width: 100vw; height: 100vh;"
  const ctx = canvas.getContext("webgpu");
  ctx.configure({
    device: device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    // alphaMode: "premultiplied",
    alphaMode: "opaque",
  });

  function handleResize() {
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  depthTex = lines.depthTexFormat.instantiate(
    [canvas.width, canvas.height],
    GPUTextureUsage.RENDER_ATTACHMENT,
  );
  }

  const lines = await lineRenderer(
    device,
    navigator.gpu.getPreferredCanvasFormat(),
  );

  let depthTex: ReturnType<typeof lines.depthTexFormat.instantiate>;

  const clear = await clearRenderer(
    device,
    navigator.gpu.getPreferredCanvasFormat(),
  );

 handleResize();
 window.addEventListener("resize", handleResize); 

  const vertices = lines.pointInstanceBufferFormat.quickCreate(
    [...graph.vertices].map((v) => ({
      position: v.data.position,
      color: v.data.color,
      size: 0.5,
    })),
  );

  const edgeThickness = 0.2;

  const edges = lines.pointInstanceBufferFormat.quickCreate(
    [...graph.edges].flatMap((v) => {
      let len = distance3(
        v.endpoints[0].data.position,
        v.endpoints[1].data.position,
      );

          const distFromEdge = 0.8 / len;

      const across = x => mix3(
            lerp(x, distFromEdge, 1 - distFromEdge),
            v.endpoints[0].data.position,
            v.endpoints[1].data.position,
          )

    let colorMul = Math.random() * 0.2 + 0.4

     const lerpColor = x => scale4(mix4(
      x,
      v.endpoints[0].data.color,
      v.endpoints[1].data.color,
     ), colorMul);


      return [
        {
          position: across(0),
          color: lerpColor(0),
          size: edgeThickness,
        },
        {
          position: across(0.1),
          color: lerpColor(0.1) ,
          size: edgeThickness * 0.25,
        },
        {
          position: across(0.33),
          color: lerpColor(0.33),
          size: edgeThickness * 0.1,
        },
        {
          position: across(0.67),
          color: lerpColor(0.67),
          size: edgeThickness * 0.1,
        },
        {
          position: across(0.9),
          color: lerpColor(0.9),
          size: edgeThickness * 0.25,
        },
        {
          position: across(1),
          color: lerpColor(1),
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

  const graphUniforms = lines.uniforms.instantiate(1);

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
    if (e.target instanceof HTMLElement && e.target.tagName.toUpperCase() === "A") return;
    document.body.requestPointerLock();
  });

  document.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement !== document.body) return;

    const localXAxis = mulVec4ByMat4([1, 0, 0, 0], rotationMatrix);
    const localYAxis = mulVec4ByMat4([0, -1, 0, 0], rotationMatrix);

    const r1 = rotate(xyz(localYAxis), -e.movementX * 0.003);
    const r2 = rotate(xyz(localXAxis), e.movementY * 0.003);

    rotationMatrix = mulMat4(rotationMatrix, mulMat4(r1, r2));
  });

  let lastT = 0;

  const labels = new Map<string, { elem: HTMLElement, vert: Vertex<Node, Vec4> }>();

  let loopIter = 0;

  function loop(t) {
    const seconds = t / 1000;

    let dt = (t - lastT) / 1000;
    lastT = t;

    viewerPos = add3(viewerPos, scale3(viewerVel, dt));

    const accel = scale4(mulVec4ByMat4(
      [
        keysDown.has("d") ? -1 : keysDown.has("a") ? 1 : 0,
        keysDown.has("shift") ? 1 : keysDown.has(" ") ? -1 : 0,
        keysDown.has("w") ? 1 : keysDown.has("s") ? -1 : 0,
        0,
      ],
      rotationMatrix,
    ), 3.0);

    viewerVel = add3(viewerVel, xyz(accel));
    viewerVel = scale3(viewerVel, 0.1 ** dt);
    if (Math.hypot(...viewerVel) < 0.2) {
      viewerVel = [0, 0, 0];
    }

    let currTransform = mulMat4(rotationMatrix, translate(viewerPos));

    for (const n of  vertGroups[loopIter % vertGroups.length]) {
      const isNearby = 
distance3(n.data.position, scale3(viewerPos, -1)) < 20;

const labelElem = labels.get(n.data.label);

if (isNearby) {
  if (!labelElem) {
    const newLabelElem = document.createElement("a");
    newLabelElem.href = `https://scp-wiki.wikidot.com${n.data.label}`
    newLabelElem.target = "_blank";
  newLabelElem.innerText = n.data.label.slice(1);
  newLabelElem.style = `color: white; background-color: #000b; padding: 5px; transform: translateX(-50%); font-family: sans-serif;`; 
  document.body.appendChild(newLabelElem);
    labels.set(n.data.label, {
      elem: newLabelElem,
      vert: n 
    });
  }
} else {
  if (labelElem) {
    labels.delete(n.data.label);
    labelElem.elem.parentElement.removeChild(labelElem.elem);
  }
}
    }

    for (const [id, { elem, vert}] of labels) {

      const worldSpace: Vec4 = vert.data.position.concat(1) as Vec4;

      const clipSpace = mulMat4ByVec4(currTransform , worldSpace);

      const x = clipSpace[0]/  clipSpace[2];
      const y = clipSpace[1]/  clipSpace[2];

      const aspect = canvas.width / canvas.height; 

      if (clipSpace[2] < 0) {
        elem.style.display = "block";
        elem.style.position = "absolute";
        console.log(x)
        elem.style.left = `${rescale(x, aspect, -aspect, 0, window.innerWidth)}px`;
        elem.style.top = `${rescale(y + 0.5 / clipSpace[2], -1, 1, 0, window.innerHeight)}px`;
      } else {
        elem.style.display = "none";
      }

    }


    // let currTransform = translate(viewerPos);

    lines.uniforms.fill(graphUniforms, 0, {
      mvp: variadify(mulMat4)(
        perspectiveWebgpu(Math.PI / 2, canvas.width / canvas.height, 0.1, 1000),
        currTransform,
      ),
      aspect: canvas.width / canvas.height,
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

    pipelineRenderpass(
      lines.pointPipeline,
      pass,
    )({
      points: edges,
    });
    pass.draw(6, graph.edges.size * 3);

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

    loopIter++;

    requestAnimationFrame(loop);
  }

  loop(0);
})();
