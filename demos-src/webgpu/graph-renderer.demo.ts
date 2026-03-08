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
  mul4,
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

document.head.innerHTML += `<meta name="viewport" 
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>`;

type Node = {
  position: Vec3;
  color: Vec4;
  initialized: boolean;
  label: string;
};

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
  const graphData = await (
    await fetch("../assets/graph_with_positions.json")
  ).json();

  console.log(graphData);

  const graph: Graph<Node, Vec4> = createGraph();

  let nodeMap = new Map<string, Vertex<Node, Vec4>>();

  for (const n of graphData.nodes) {
    const hash = stringHash(n.canon ?? "");

    const r = (hash % 256) * 0.5 + 127;
    const g = ((hash >> 8) % 256) * 0.5 + 127;
    const b = ((hash >> 16) % 256) * 0.5 + 127;

    nodeMap.set(
      n.Id,
      addVertex(graph, {
        // position: scale3(mul3([n.x, n.y, Math.log(n.z)], [0.001, 0.001, 70]), 0.2) as Vec3,
        position: scale3([n.x, n.y, n.z], 0.1),
        color: [r, g, b, 255],
        initialized: false,
        label: n.Id,
      }),
    );
  }

  const vertsArray = [...graph.vertices];

  const vertGroups = splitBy(vertsArray, 500);

  for (const e of graphData.links) {
    const src = nodeMap.get(e.source);
    const dst = nodeMap.get(e.target);

    if (!src) {
      console.warn(`Endpoint '${e.source}' not found.`);
      continue;
    }
    if (!dst) {
      console.warn(`Endpoint '${e.target}' not found.`);
      continue;
    }

    addEdge(graph, [src, dst], [0, Math.random() * 55 + 200, 0, 255]);
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

  document.body.style = "width: 100vw; height: 100vh; overflow: hidden;";

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

      const across = (x) =>
        mix3(
          lerp(x, distFromEdge, 1 - distFromEdge),
          v.endpoints[0].data.position,
          v.endpoints[1].data.position,
        );

      let colorMul = Math.random() * 0.2 + 0.4;

      const lerpColor = (x) =>
        mul4(mix4(x, v.endpoints[0].data.color, v.endpoints[1].data.color), [
          colorMul,
          colorMul,
          colorMul,
          1,
        ]);

      return [
        {
          position: across(0),
          color: lerpColor(0),
          size: edgeThickness,
        },
        {
          position: across(0.1),
          color: lerpColor(0.1),
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

  const multiTransform = variadify(mulMat4);

  document.addEventListener("keydown", (e) => {
    keysDown.add(e.key.toLowerCase());
  });
  document.addEventListener("keyup", (e) => {
    keysDown.delete(e.key.toLowerCase());
  });

  document.addEventListener("mousedown", (e) => {
    if (
      e.target instanceof HTMLElement &&
      e.target.tagName.toUpperCase() === "A"
    )
      return;

    if (window.matchMedia("(pointer: fine)")) {
      document.body.requestPointerLock();
    }
  });

  const touches = new Map<number, { touch: Touch }>();

  function updateTouches(e: TouchEvent) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      touches.set(t.identifier, {
        touch: t,
      });
    }
  }

  function rotateBy(dx, dy) {
    const localXAxis = mulVec4ByMat4([1, 0, 0, 0], rotationMatrix);
    const localYAxis = mulVec4ByMat4([0, -1, 0, 0], rotationMatrix);

    const r1 = rotate(xyz(localYAxis), dx);
    const r2 = rotate(xyz(localXAxis), dy);

    rotationMatrix = mulMat4(rotationMatrix, mulMat4(r1, r2));
  }

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    updateTouches(e);
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (e.changedTouches.length === 1) {
      const t = e.changedTouches[0];
      const prevT = touches.get(t.identifier)?.touch;

      if (prevT) {
        const dx = t.clientX - prevT.clientX;
        const dy = t.clientY - prevT.clientY;

        rotateBy(dx * 0.005, -dy * 0.005);
      }
    }
    updateTouches(e);
  });

  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      touches.delete(t.identifier);
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement !== document.body) return;
    rotateBy(-e.movementX * 0.003, e.movementY * 0.003);
  });

  if (window.matchMedia("(pointer: coarse)")) {
    const moveControls = document.createElement("div");
    document.body.appendChild(moveControls);
    moveControls.style = `
position: absolute;
bottom: 10px;
left: 10px;    
display: grid;
z-index: 2;
grid-template-areas:
    ". up ."
    ". forward ."
    "left . right"
    ". backward ."
    ". down ."
    `;

    function mappedButton(text: string, gridArea: string, key: string) {
      const forwardButton = document.createElement("button");
      forwardButton.innerText = text;
      forwardButton.style = `
grid-area: ${gridArea};    
height: 30px;
border-radius: 5px;
border: 1px solid #888;
background-color: #000a; 
color: white;
margin: 2px;
    `;
      forwardButton.addEventListener("touchstart", () => {
        keysDown.add(key);
      });
      forwardButton.addEventListener("touchend", () => {
        keysDown.delete(key);
      });

      moveControls.appendChild(forwardButton);
    }

    mappedButton("Forward", "forward", "w");
    mappedButton("Left", "left", "a");
    mappedButton("Backward", "backward", "s");
    mappedButton("Right", "right", "d");
    mappedButton("Up", "up", " ");
    mappedButton("Down", "down", "shift");
  }

  let lastT = 0;

  const labels = new Map<
    string,
    { elem: HTMLElement; vert: Vertex<Node, Vec4> }
  >();

  let loopIter = 0;

  const highPerfLineBufferFormat = wdevice.vertexBuffer("line", {
    stride: 16,
    types: [
      {
        format: "float32x3",
        name: "position",
        offset: 0,
      },
      {
        format: "unorm8x4",
        name: "color",
        offset: 12,
      },
    ] as const,
    stepMode: "vertex",
    visibility: GPUShaderStage.VERTEX,
  });

  const highPerfLinePipeline = await wdevice.pipeline({
    bindGroups: [lines.perFrameBindGroup] as const,
    depthStencil: {
      format: "depth32float",
      depthCompare: "less",
      depthWriteEnabled: true,
    },
    inputs: [highPerfLineBufferFormat] as const,
    outputs: {
      color: {
        format: navigator.gpu.getPreferredCanvasFormat(),
        blend: lines.blend,
      },
    },
    vertex: `
    var frag: FragInput;
    frag.position = params.mvp * vec4f(vertex.position, 1.0); 
    frag.color = vertex.color;
    return frag;
    `,
    fragment: {
      function: `
      var pixel: FragOutput;
      pixel.color = input.color;
      return pixel;`,
      struct: `
    @builtin(position) position : vec4f,
    @location(0) color : vec4f,
    `,
    },
    primitive: {
      topology: "line-list",
    },
  });

  const edgesFast = highPerfLineBufferFormat.quickCreate(
    [...graph.edges].flatMap((e) => {
      const factor = Math.random() * 0.2 + 0.4;

      const colorMul = [factor, factor, factor, 1] as Vec4;

      return [
        {
          position: e.endpoints[0].data.position,
          color: mul4(e.endpoints[0].data.color, colorMul),
        },
        {
          position: e.endpoints[1].data.position,
          color: mul4(e.endpoints[1].data.color, colorMul),
        },
      ];
    }),
  );

  let lineMode = "fancy" as "fast" | "fancy";

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
      3.0,
    );

    viewerVel = add3(viewerVel, xyz(accel));
    viewerVel = scale3(viewerVel, 0.1 ** dt);
    if (Math.hypot(...viewerVel) < 0.2) {
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

    for (const n of vertGroups[loopIter % vertGroups.length]) {
      const isNearby = distance3(n.data.position, scale3(viewerPos, -1)) < 20;

      const labelElem = labels.get(n.data.label);

      if (isNearby) {
        if (!labelElem) {
          const newLabelElem = document.createElement("a");
          newLabelElem.href = `https://scp-wiki.wikidot.com${n.data.label}`;
          newLabelElem.target = "_blank";
          newLabelElem.innerText = n.data.label.slice(1);
          newLabelElem.style = `color: white; background-color: #000b; padding: 5px; transform: translateX(-50%); font-family: sans-serif;`;
          document.body.appendChild(newLabelElem);
          labels.set(n.data.label, {
            elem: newLabelElem,
            vert: n,
          });
        }
      } else {
        if (labelElem) {
          labels.delete(n.data.label);
          labelElem.elem.parentElement.removeChild(labelElem.elem);
        }
      }
    }

    for (const [id, { elem, vert }] of labels) {
      const worldSpace: Vec4 = vert.data.position.concat(1) as Vec4;

      const clipSpace = mulMat4ByVec4(currTransform, worldSpace);

      const x = clipSpace[0] / clipSpace[2];
      const y = clipSpace[1] / clipSpace[2];

      const aspect = canvas.width / canvas.height;

      if (clipSpace[2] < 0) {
        elem.style.display = "block";
        elem.style.position = "absolute";
        elem.style.left = `${rescale(x, aspect, -aspect, 0, window.innerWidth)}px`;
        elem.style.top = `${rescale(y + 0.5 / clipSpace[2], -1, 1, 0, window.innerHeight)}px`;
      } else {
        elem.style.display = "none";
      }
    }

    lines.uniforms.fill(graphUniforms, 0, {
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
      perFrame: graphPerFrameBindGroup,
    });
    pass.draw(6, graph.vertices.size);

    if (lineMode === "fancy") {
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
    } else if (lineMode === "fast") {
      pass.setPipeline(highPerfLinePipeline);
      pipelineRenderpass(
        highPerfLinePipeline,
        pass,
      )({
        perFrame: graphPerFrameBindGroup,
        line: edgesFast,
      });
      pass.draw(graph.edges.size * 2);
    }

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

        console.log("GPU:", Number(range[1] - range[0]) / 1_000_000);
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
