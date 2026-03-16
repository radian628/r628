import Matrix, { inverse } from "ml-matrix";
import {
  add3,
  addEdge,
  addVertex,
  argmax,
  clamp,
  clearRenderer,
  createGraph,
  distance3,
  generateLayouts,
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
  parallelSum,
  perspectiveWebgpu,
  pickrand,
  pipelineRenderpass,
  quickMap,
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
import { createNBodyOctreeDefs } from "./n-body-octree";
import { graphRendererUI } from "./graph-renderer-ui";

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
  const params = new URLSearchParams(window.location.search);

  const tags = params.get("tags")?.split(",");

  let graphData = await (
    await fetch("../assets/crosslinksv3_(RELOADED).json")
  ).json();

  graphData = graphData
    .filter(
      (g) =>
        typeof g.x === "number" &&
        typeof g.y === "number" &&
        typeof g.z === "number" &&
        !isNaN(g.x) &&
        !isNaN(g.y) &&
        !isNaN(g.z),
    )
    .filter((g) => !tags || g.tags?.some((t) => tags.includes(t)));

  console.log(argmax(graphData, (g) => Math.abs(g.x)));
  console.log(argmax(graphData, (g) => Math.abs(g.y)));
  console.log(argmax(graphData, (g) => Math.abs(g.z)));

  console.log(graphData);
  // graphData.nodes = graphData.nodes;

  const graph: Graph<Node, Vec4> = createGraph();

  let nodeMap = new Map<string, Vertex<Node, Vec4>>();

  let i = 0;

  // for (const n of graphData.nodes) {
  //   const hash = stringHash(n.canon ?? "");

  //   const r = (hash % 256) * 0.5 + 127;
  //   const g = ((hash >> 8) % 256) * 0.5 + 127;
  //   const b = ((hash >> 16) % 256) * 0.5 + 127;

  //   nodeMap.set(
  //     n.Id,
  //     addVertex(graph, {
  //       // position: scale3(mul3([n.x, n.y, Math.log(n.z)], [0.001, 0.001, 70]), 0.2) as Vec3,
  //       position: scale3([n.x, n.y, n.z], 0.1),
  //       // position: scale3([n.x, n.y, n.z], 0.01),
  //       // color: [255, (i / graphData.nodes.length) * 255, 255, 255],
  //       color: [r, g, b, 255],
  //       initialized: false,
  //       label: n.Id,
  //     }),
  //   );
  //   i++;
  // }

  // for (const e of graphData.links) {
  //   const src = nodeMap.get(e.source);
  //   const dst = nodeMap.get(e.target);

  //   if (!src) {
  //     console.warn(`Endpoint '${e.source}' not found.`);
  //     continue;
  //   }
  //   if (!dst) {
  //     console.warn(`Endpoint '${e.target}' not found.`);
  //     continue;
  //   }

  //   addEdge(graph, [src, dst], [0, Math.random() * 55 + 200, 0, 255]);
  // }

  for (const n of graphData) {
    nodeMap.set(
      n.url,
      addVertex(graph, {
        position: scale3([n.x, n.y, n.z], 0.005),
        color: [255, 255, 255, 255],
        initialized: false,
        label: n.url.replace("http://scp-wiki.wikidot.com", ""),
      }),
    );
  }

  for (const n of graphData) {
    for (const link of n.other) {
      const src = nodeMap.get(n.url);
      const dst = nodeMap.get(link.trim());

      if (!src) {
        // console.warn(`Endpoint '${n.url}' not found.`);
        continue;
      }
      if (!dst) {
        // console.warn(`Endpoint '${link}' not found.`);
        continue;
      }

      addEdge(graph, [src, dst], [127, 127, 127, 255]);
    }
  }

  const vertsArray = [...graph.vertices];

  const labelVertsArray = [...graph.vertices].map((vert) => ({ ...vert.data }));

  const vertGroups = splitBy(labelVertsArray, 500);

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
    [...graph.vertices].map((v, i) => ({
      position: v.data.position,
      color: v.data.color,
      size: 0.5,
    })),
    {
      usage:
        GPUBufferUsage.VERTEX |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.STORAGE,
    },
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
    {
      usage:
        GPUBufferUsage.VERTEX |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.STORAGE,
    },
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

  const isDesktop = window.matchMedia("(pointer: fine)").matches;

  const multiTransform = variadify(mulMat4);

  document.addEventListener("keydown", (e) => {
    keysDown.add(e.key.toLowerCase());
  });
  document.addEventListener("keyup", (e) => {
    keysDown.delete(e.key.toLowerCase());
  });

  document.addEventListener("mousedown", (e) => {
    if (!(e.target instanceof HTMLCanvasElement)) {
      return;
    }

    if (isDesktop) {
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

  if (!isDesktop) {
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
user-select: none;
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

  const labels = new Map<string, { elem: HTMLElement; vert: Node }>();

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

  const accelsFormat = wdevice.storageBuffer(
    "accels",
    struct("Accel", {
      accel: "vec3f",
    }),
  );

  const physicsUniformsFormat = wdevice.uniformBufferForComputeShader(
    "physics_params",
    struct("PhysicsParams", {
      repulsion_multiplier: "f32",
      attraction_multiplier: "f32",
    }),
  );

  const nBodySim = await createNBodyOctreeDefs(device, {
    extraBodyFields: {},
    bodyBodyInteraction: `
      let force_mag = 40.0 * mass * bodies[i].mass / pow(max(10.0, dist_to_body), 2.0);
      let force_dir = -normalize(center_of_mass - bodies[i].position);
      return force_mag * force_dir; 
    `,
    applyForces: `
      var impulse = total_impulse * physics_params.repulsion_multiplier;
      impulse += accels[i].accel * physics_params.attraction_multiplier;

      bodies[i].velocity += impulse / bodies[i].mass * params.timestep;
      bodies[i].position += bodies[i].velocity * params.timestep;
      bodies[i].velocity *= 0.9;
    `,
    extraPhysicsBuffers: [accelsFormat, physicsUniformsFormat] as const,
  });

  const bodiesFormat = nBodySim.bodiesFormat;

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
    "nbody",
    bodiesFormat,
    genericBufferFormat,
  );

  const transferBodyInfoToPointsPipeline = await wdevice.compute({
    bindGroups: [transferBodyInfoToPointsBindGroupFormat],
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
    `,
  });

  const edgesBufferFormat = wdevice.storageBuffer(
    "edges",
    struct("Edge", {
      src: "u32",
      dst: "u32",
    }),
  );

  const accelVectorPairsFormat = wdevice.storageBuffer(
    "accel_vectors",
    struct("AccelVectors", {
      to_src: "vec3f",
    }),
  );

  const edgeLocationMapFormat = wdevice.storageBuffer(
    "edge_loc_map",
    struct("EdgeLoc", {
      location: "u32",
      count: "u32",
    }),
  );

  const calcEdgeForcesBindGroupFormat = wdevice.bindGroup(
    "bg",
    edgesBufferFormat,
    accelVectorPairsFormat,
    bodiesFormat,
  );

  const calcEdgeForcesPipeline = await wdevice.compute({
    bindGroups: [calcEdgeForcesBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    storageBufferAccess: {
      bodies: "read_write",
      edges: "read_write",
      accel_vectors: "read_write",
    },
    shader: `
    let i = id.x;
    if (i >= arrayLength(&edges)) {
      return;
    } 

    let edge = edges[i];
    let src = bodies[edges[i].src]; 
    let dst = bodies[edges[i].dst]; 

    let offset = dst.position - src.position;
    let dist = length(offset);
    let offset_norm = offset / dist;

    let mag = dist * 0.02;

    accel_vectors[i].to_src = mag * offset_norm;
    // accel_vectors[i].to_src = vec3f(1.0, 0.0, 0.0);
    `,
  });

  const sumEdgeForcesBindGroupFormat = wdevice.bindGroup(
    "bg",
    accelVectorPairsFormat,
    edgeLocationMapFormat,
    accelsFormat,
  );

  const sumEdgeForcesPipeline = await wdevice.compute({
    bindGroups: [sumEdgeForcesBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    storageBufferAccess: {
      accel_vectors: "read_write",
      edge_loc_map: "read_write",
      accels: "read_write",
    },
    shader: `
    let i = id.x;
    if (i >= arrayLength(&accels)) {
      return; 
    }
    
    let edge_index_start = edge_loc_map[i].location;
    let edge_index_end = edge_index_start + edge_loc_map[i].count;

    for (var j = edge_index_start; j < edge_index_end; j++) {
      accels[i].accel += accel_vectors[j].to_src;
    }

    `,
  });

  const transferBodyInfoToLinesBindGroupFormat = wdevice.bindGroup(
    "nbody",
    bodiesFormat,
    genericBufferFormat,
    edgesBufferFormat,
  );

  const transferBodyInfoToLinesPipeline = await wdevice.compute({
    bindGroups: [transferBodyInfoToLinesBindGroupFormat],
    workgroupSize: [32, 1, 1],
    storageBufferAccess: {
      bodies: "read_write",
      generic: "read_write",
      edges: "read_write",
    },
    globals: `
fn set_point(idx: u32, position: vec3f) {
  let i = idx * 5;
  generic[i].data = bitcast<u32>(position.x);
  generic[i + 1].data = bitcast<u32>(position.y);
  generic[i + 2].data = bitcast<u32>(position.z);
}    
    `,
    shader: `
      let i = id.x;
      if (i >= arrayLength(&edges)) { return; }

      let src = bodies[edges[i].src];
      let dst = bodies[edges[i].dst];

      let ipt = i * 7;

      let dist = length(src.position - dst.position);
      let margin = 0.8 / dist; 

      set_point(ipt, mix(src.position, dst.position, margin));
      set_point(ipt + 1, mix(src.position, dst.position, 0.1));
      set_point(ipt + 2, mix(src.position, dst.position, 0.33));
      set_point(ipt + 3, mix(src.position, dst.position, 0.67));
      set_point(ipt + 4, mix(src.position, dst.position, 0.9));
      set_point(ipt + 5, mix(src.position, dst.position, 1 - margin));
    `,
  });

  const edgeList: {
    src: number;
    dst: number;
  }[] = [];
  const unidirectionalEdgeList: {
    src: number;
    dst: number;
  }[] = [];

  const edgeLocMap: {
    location: number;
    count: number;
  }[] = [];

  const vertToIndexMap = new Map([...graph.vertices].map((e, i) => [e, i]));

  const edgesWithThisSrc = new Map<number, { src: number; dst: number }[]>();

  const addEdgeToEdgesWithThisSrc = (src: number, dst: number) =>
    edgesWithThisSrc.set(
      src,
      (edgesWithThisSrc.get(src) ?? []).concat({ src, dst }),
    );

  for (const vert of graph.vertices) {
    // let location = edgeList.length;
    for (const outgoing of vert.outgoing) {
      const startIndex = vertToIndexMap.get(vert)!;
      const endIndex = vertToIndexMap.get(outgoing.endpoints[1])!;
      unidirectionalEdgeList.push({ src: startIndex, dst: endIndex });
      if (startIndex === endIndex) continue;
      addEdgeToEdgesWithThisSrc(startIndex, endIndex);
      addEdgeToEdgesWithThisSrc(endIndex, startIndex);
    }
  }

  for (let i = 0; i < graph.vertices.size; i++) {
    const edges = edgesWithThisSrc.get(i) ?? [];

    let location = edgeList.length;

    for (const e of edges) edgeList.push(e);

    let count = edgeList.length - location;
    edgeLocMap.push({ location, count });
  }

  const edgesBuffer = edgesBufferFormat.quickCreateMany(edgeList);
  const unidirectionalEdgesBuffer = edgesBufferFormat.quickCreateMany(
    unidirectionalEdgeList,
  );
  const edgeLocMapBuffer = edgeLocationMapFormat.quickCreateMany(edgeLocMap);

  const accelVectorPairsBuffer = accelVectorPairsFormat.instantiate(
    edgeList.length,
  );

  const bodies = bodiesFormat.quickCreateMany(
    [...graph.vertices].map((vert, i, a) => {
      return {
        mass: 1,
        velocity: [0, 0, 0],
        position: vert.data.position,
      };
      // return i === 0
      //   ? {
      //       mass: 30000,
      //       force: 60000,
      //       velocity: [0, 0, 0],
      //       position: [0, 0, -200],
      //     }
      //   : (() => {
      //       const angle = 1 * ((Math.PI * 2) / a.length) * i + 4.2;

      //       return {
      //         mass: 1,
      //         force: 2,
      //         velocity: [
      //           15 * Math.cos(angle) + Math.random() * 1 - 0.5,
      //           15 * Math.sin(angle) + Math.random() * 1 - 0.5,
      //           Math.random(),
      //         ],
      //         position: [
      //           (Math.random() * 20 + 90) * Math.cos(angle + Math.PI / 2) +
      //             Math.random() -
      //             0.5,
      //           (Math.random() * 20 + 90) * Math.sin(angle + Math.PI / 2) +
      //             Math.random() -
      //             0.5,
      //           Math.random() - 200,
      //         ],
      //       };
      //     })();
    }),
  );

  const accelsFinal = accelsFormat.instantiate(graph.vertices.size);

  const calcEdgeForcesBindGroup = calcEdgeForcesBindGroupFormat.instantiate({
    edges: edgesBuffer,
    bodies: bodies,
    accel_vectors: accelVectorPairsBuffer,
  });

  const sumEdgeForcesBindGroup = sumEdgeForcesBindGroupFormat.instantiate({
    accel_vectors: accelVectorPairsBuffer,
    accels: accelsFinal,
    edge_loc_map: edgeLocMapBuffer,
  });

  const octree = nBodySim.setupOctree({
    bodies: bodies,
    bodyCount: graph.vertices.size,
    octreeCapacity: 2 ** 19,
    octreeDepth: 20,
  });

  const barnesHutUniforms = nBodySim.barnesHutUniformsFormat.quickCreate({
    min_width_over_distance_ratio: 1.2,
    timestep: 0.06,
  });

  const physicsUniforms = physicsUniformsFormat.instantiate(1);

  const applyBarnesHutBindGroup =
    nBodySim.applyBarnesHutBindGroupFormat.instantiate({
      bodies: bodies,
      octree_metadata: octree.octreeMetadataBuffer,
      octree_nodes: octree.octreeNodeBuffer,
      params: barnesHutUniforms,
      accels: accelsFinal,
      physics_params: physicsUniforms,
    });

  function moveBodies() {
    const perBodyWorkgroups = Math.ceil(graph.vertices.size / 32);

    const enc = device.createCommandEncoder();
    enc.clearBuffer(accelsFinal);
    let pass = enc.beginComputePass();

    pass.setPipeline(calcEdgeForcesPipeline);
    pass.setBindGroup(0, calcEdgeForcesBindGroup);
    const perEdgeWorkgroups = Math.ceil(edgeList.length / 32);
    pass.dispatchWorkgroups(perEdgeWorkgroups);

    pass.setPipeline(sumEdgeForcesPipeline);
    pass.setBindGroup(0, sumEdgeForcesBindGroup);
    pass.dispatchWorkgroups(perBodyWorkgroups);

    octree.run(pass);

    pass.setPipeline(nBodySim.applyBarnesHutPipeline);
    pass.setBindGroup(0, applyBarnesHutBindGroup);
    pass.dispatchWorkgroups(perBodyWorkgroups, 1, 1);

    pass.setPipeline(transferBodyInfoToPointsPipeline);
    const transferBodyInfoToPointsBindGroup =
      transferBodyInfoToPointsBindGroupFormat.instantiate({
        bodies,
        generic: genericBufferFormat.reinterpret(vertices),
      });
    pass.setBindGroup(0, transferBodyInfoToPointsBindGroup);
    pass.dispatchWorkgroups(perBodyWorkgroups);

    pass.setPipeline(transferBodyInfoToLinesPipeline);
    const transferBodyInfoToLinesBindGroup =
      transferBodyInfoToLinesBindGroupFormat.instantiate({
        bodies,
        generic: genericBufferFormat.reinterpret(edges),
        edges: unidirectionalEdgesBuffer,
      });
    pass.setBindGroup(0, transferBodyInfoToLinesBindGroup);
    pass.dispatchWorkgroups(Math.ceil(unidirectionalEdgeList.length / 32));

    pass.end();
    device.queue.submit([enc.finish()]);
  }

  const isPhysicsEnabled = params.get("physics") === "true";

  let physicsCalculationsPerFrame = Number(
    params.get("physicsCalculationsPerFrame") ?? "5",
  );

  console.log(physicsCalculationsPerFrame);

  let lineMode = "fancy" as "fast" | "fancy" | "none";
  let physicsMode = (isPhysicsEnabled ? "physics" : "none") as
    | "none"
    | "physics";

  const ui = graphRendererUI();
  document.body.appendChild(ui.dom);

  async function loop(t) {
    physicsUniformsFormat.fill(physicsUniforms, 0, {
      repulsion_multiplier: ui.state.repulsionMultiplier,
      attraction_multiplier: ui.state.attractionMultiplier,
    });

    const start = performance.now();
    const seconds = t / 1000;

    let dt = (t - lastT) / 1000;
    lastT = t;

    if (physicsMode === "physics") {
      moveBodies();
    }

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
      ui.state.viewerSpeed,
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
      const isNearby = distance3(n.position, scale3(viewerPos, -1)) < 20;

      const labelElem = labels.get(n.label);

      if (isNearby) {
        if (!labelElem) {
          const newLabelElem = document.createElement("a");
          newLabelElem.href = `https://scp-wiki.wikidot.com${n.label}`;
          newLabelElem.target = "_blank";
          newLabelElem.innerText = n.label.slice(1);
          newLabelElem.style = `color: white; background-color: #000b; padding: 5px; transform: translateX(-50%); font-family: sans-serif;`;
          document.body.appendChild(newLabelElem);
          labels.set(n.label, {
            elem: newLabelElem,
            vert: n,
          });
        }
      } else {
        if (labelElem) {
          labels.delete(n.label);
          labelElem.elem.parentElement.removeChild(labelElem.elem);
        }
      }
    }

    if (loopIter % 5 === 0) {
      (async () => {
        const buf = new Float32Array(await quickMap(device, vertices));

        let stride = 5;
        let i = 0;
        for (const v of labelVertsArray) {
          v.position = [
            buf[i * stride],
            buf[i * stride + 1],
            buf[i * stride + 2],
          ];
          i++;
        }
      })();
    }

    for (const [id, { elem, vert }] of labels) {
      const worldSpace: Vec4 = vert.position.concat(1) as Vec4;

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
      pass.draw(6, graph.edges.size * 7);

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
      pass.draw(6, graph.edges.size * 7 - 1);
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
