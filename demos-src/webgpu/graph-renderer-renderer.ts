import stringHash from "string-hash";
import {
  add3,
  addEdge,
  addVertex,
  clearRenderer,
  createGraph,
  distance3,
  Graph,
  lerp,
  lineRenderer,
  Mat4,
  max3,
  min3,
  mix3,
  mix4,
  mul3,
  mul4,
  mulMat4,
  mulMat4ByVec4,
  mulVec4ByMat4,
  perspectiveWebgpu,
  pipelineRenderpass,
  quickMap,
  quickMapWithFormat,
  rescale,
  rotate,
  runtimeArray,
  scale3,
  scale4,
  splitBy,
  struct,
  translate,
  variadify,
  Vec3,
  Vec4,
  Vertex,
  WGSLStructValues,
  wrapDevice,
  xyz,
} from "../../src";
import { graphRendererUI, PositionedNode } from "./graph-renderer-ui";
import { createNBodyOctreeDefs } from "./n-body-octree";
import { CANON_TAGS, SERIES_TAGS } from "./tags";
import { typeDevice } from "../../src/webgpu/easygpu/easygpu";

type Node = {
  position: Vec3;
  color: Vec4;
  initialized: boolean;
  label: string;
  slug: string;
};

export async function setupGraphRenderer(device: GPUDevice) {
  const canvas = document.createElement("canvas");
  canvas.style =
    "position: absolute; top: 0; left: 0; width: 100vw; height: 100vh;";
  const ctx = canvas.getContext("webgpu")!;
  ctx.configure({
    device: device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    // alphaMode: "premultiplied",
    alphaMode: "opaque",
  });

  function handleResize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    depthTex = lines.depthTexFormat.new(
      [canvas.width, canvas.height],
      // GPUTextureUsage.RENDER_ATTACHMENT,
      // aaMode === "msaa" ? { sampleCount: 4 } : undefined,
    );
    if (aaMode === "msaa") {
      multisampleTex = lines.colorTexFormat.new(
        [canvas.width, canvas.height],
        // GPUTextureUsage.RENDER_ATTACHMENT,
        // {
        //   sampleCount: 4,
        // },
      );
    }
  }

  const aaMode = "none" as "none" | "msaa";

  const lines = await lineRenderer(
    device,
    navigator.gpu.getPreferredCanvasFormat(),
    {
      multisample: aaMode === "msaa" ? { count: 4 } : (undefined as never),
    },
  );

  let multisampleTex: ReturnType<typeof lines.colorTexFormat.new>;

  let depthTex: ReturnType<typeof lines.depthTexFormat.new>;

  handleResize();
  window.addEventListener("resize", handleResize);

  const clear = await clearRenderer(
    device,
    navigator.gpu.getPreferredCanvasFormat(),
    {
      multisample: aaMode === "msaa" ? { count: 4 } : undefined,
    },
  );

  const td = typeDevice(device);

  const highPerfLineBufferFormat = td.vertexBufferFormat("line", 16, [
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
  ] as const);

  const accelsFormat = td.storageBufferFormat(
    "accels",
    runtimeArray(
      struct("Accel", {
        accel: "vec3f",
      }),
    ),
  );

  const physicsUniformsFormat = td.uniformBufferComputeFormat(
    "physics_params",
    struct("PhysicsParams", {
      repulsion_multiplier: "f32",
      attraction_multiplier: "f32",
      repulsion_exponent: "f32",
      velocity_damping: "f32",
    }),
  );

  const nBodySim = await createNBodyOctreeDefs(device, {
    extraBodyFields: {
      color: "vec4f",
    },
    bodyBodyInteraction: `
      let force_mag = 40.0 * mass * bodies[i].mass / pow(max(10.0, dist_to_body), physics_params.repulsion_exponent);
      let force_dir = -normalize(center_of_mass - bodies[i].position);
      return force_mag * force_dir; 
    `,
    applyForces: `
      var impulse = total_impulse * physics_params.repulsion_multiplier;
      impulse += accels[i].accel * physics_params.attraction_multiplier;
      impulse -= bodies[i].position * 0.0001; 

      bodies[i].velocity += impulse / bodies[i].mass * params.timestep;
      bodies[i].position += bodies[i].velocity * params.timestep;
      bodies[i].velocity *= physics_params.velocity_damping;
    `,
    extraPhysicsBuffers: [accelsFormat, physicsUniformsFormat] as const,
  });

  const bodiesFormat = nBodySim.bodiesFormat;

  const highPerfLinePipeline = await td.renderPipeline({
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

  const genericBufferFormat = td
    .storageBufferFormat(
      "generic",
      runtimeArray(struct("Generic", { data: "u32" })),
    )
    .usage("storage", "copy-src");

  const transferBodyInfoToPointsBindGroupFormat = td.bindGroupFormat(
    "nbody",
    bodiesFormat,
    genericBufferFormat,
  );

  const transferBodyInfoToPointsPipeline = await td.computePipeline({
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
      generic[i * 5 + 3].data = bitcast<u32>(0.5);
      generic[i * 5 + 4].data = pack4x8unorm(bodies[i].color);
    `,
  });

  const edgesBufferFormat = td.storageBufferFormat(
    "edges",
    runtimeArray(
      struct("Edge", {
        src: "u32",
        dst: "u32",
      }),
    ),
  );

  const displayEdgesBufferFormat = td.storageBufferFormat(
    "edges",
    runtimeArray(
      struct("Edge", {
        src: "u32",
        dst: "u32",
        color_mul: "f32",
      }),
    ),
  );

  const weightedEdgesBufferFormat = td.storageBufferFormat(
    "edges",
    runtimeArray(
      struct("WeightedEdge", {
        src: "u32",
        dst: "u32",
        weight: "f32",
      }),
    ),
  );

  const accelVectorPairsFormat = td.storageBufferFormat(
    "accel_vectors",
    runtimeArray(
      struct("AccelVectors", {
        to_src: "vec3f",
      }),
    ),
  );

  const edgeLocationMapFormat = td.storageBufferFormat(
    "edge_loc_map",
    runtimeArray(
      struct("EdgeLoc", {
        location: "u32",
        count: "u32",
      }),
    ),
  );

  const calcEdgeForcesBindGroupFormat = td.bindGroupFormat(
    "bg",
    weightedEdgesBufferFormat,
    accelVectorPairsFormat,
    bodiesFormat,
  );

  const calcEdgeForcesPipeline = await td.computePipeline({
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
    let src = bodies[edge.src]; 
    let dst = bodies[edge.dst]; 

    let offset = dst.position - src.position;
    let dist = length(offset);

    // avoid division by zero
    if (dist < 0.0001) {
      return; 
    }
    let offset_norm = offset / dist;

    let mag = dist * 0.02;

    accel_vectors[i].to_src = mag * offset_norm * edge.weight;
    // accel_vectors[i].to_src = vec3f(1.0, 0.0, 0.0);
    `,
  });

  const sumEdgeForcesBindGroupFormat = td.bindGroupFormat(
    "bg",
    accelVectorPairsFormat,
    edgeLocationMapFormat,
    accelsFormat,
  );

  const sumEdgeForcesPipeline = await td.computePipeline({
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

  const transferBodyInfoToLinesUniformsFormat = td.uniformBufferComputeFormat(
    "params",

    struct("Params", {
      line_width_multiplier: "f32",
      nan: "f32",
    }),
  );

  const transferBodyInfoToLinesBindGroupFormat = td.bindGroupFormat(
    "nbody",
    bodiesFormat,
    genericBufferFormat,
    displayEdgesBufferFormat,
    transferBodyInfoToLinesUniformsFormat,
  );

  const transferBodyInfoToLinesPipeline = await td.computePipeline({
    bindGroups: [transferBodyInfoToLinesBindGroupFormat],
    workgroupSize: [32, 1, 1],
    storageBufferAccess: {
      bodies: "read_write",
      generic: "read_write",
      edges: "read_write",
    },
    globals: `

var<private> endpoint1: vec3f;
var<private> endpoint2: vec3f;
var<private> color1: vec4f;
var<private> color2: vec4f;
var<private> color_mul: f32;

fn set_point(idx: u32, across: f32, width: f32) {
  let i = idx * 5;
  let position = mix(endpoint1, endpoint2, across);
  generic[i].data = bitcast<u32>(position.x);
  generic[i + 1].data = bitcast<u32>(position.y);
  generic[i + 2].data = bitcast<u32>(position.z);
  generic[i + 3].data = bitcast<u32>(width * params.line_width_multiplier);
  generic[i + 4].data = pack4x8unorm(mix(color1, color2, across) * vec4f(vec3f(color_mul), 1.0));
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
      endpoint1 = mix(src.position, dst.position, margin);
      endpoint2 = mix(src.position, dst.position, 1 - margin);
      color1 = src.color;
      color2 = dst.color;
      color_mul = edges[i].color_mul;

      set_point(ipt, 0.0, 1.0);
      set_point(ipt + 1, 0.1, 0.25);
      set_point(ipt + 2, 0.33, 0.1);
      set_point(ipt + 3, 0.67, 0.1);
      set_point(ipt + 4, 0.9, 0.25);
      set_point(ipt + 5, 1.0, 1.0);
      set_point(ipt + 6, params.nan, 1.0);
    `,
  });

  let keysDown = new Set<string>();

  let isDesktop = true;

  const multiTransform = variadify(mulMat4);

  let rotationMatrix: Mat4 = rotate([0, 1, 0], 0.1);

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
      canvas.requestPointerLock();
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
    if (document.pointerLockElement !== canvas) return;
    rotateBy(-e.movementX * 0.003, e.movementY * 0.003);
  });

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
-webkit-user-select: none;
-webkit-touch-callout: none;
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

  function rotateBy(dx: number, dy: number) {
    const localXAxis = mulVec4ByMat4([1, 0, 0, 0], rotationMatrix);
    const localYAxis = mulVec4ByMat4([0, -1, 0, 0], rotationMatrix);

    const r1 = rotate(xyz(localYAxis), dx);
    const r2 = rotate(xyz(localXAxis), dy);

    rotationMatrix = mulMat4(rotationMatrix, mulMat4(r1, r2));
  }

  return {
    canvas,
    async createGraph(params: { ui: ReturnType<typeof graphRendererUI> }) {
      let tags = params.ui.state.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      let positiveTags = tags.filter((t) => t[0] !== "!");
      let negativeTags = tags
        .filter((t) => t[0] === "!")
        ?.map((t) => t.slice(1));

      const graph: Graph<Node, Vec4> = createGraph();

      let graphData = await (
        await fetch("../assets/crosslinksv3_(RELOADED).json")
      ).json();

      graphData = graphData
        .filter(
          (g: any) =>
            typeof g.x === "number" &&
            typeof g.y === "number" &&
            typeof g.z === "number" &&
            !isNaN(g.x) &&
            !isNaN(g.y) &&
            !isNaN(g.z),
        )
        .filter(
          (g: any) =>
            (positiveTags.length === 0 ||
              g.tags?.some((t: any) => positiveTags.includes(t))) &&
            (negativeTags.length === 0 ||
              !g.tags?.some((t: any) => negativeTags.includes(t))),
        );

      let nodeMap = new Map<string, Vertex<Node, Vec4>>();

      let urlToNodeData = new Map<string, { tags: string[] }>();

      for (const n of graphData) {
        urlToNodeData.set(n.url, {
          tags: n.tags,
        });
      }

      let tagCounts = new Map<string, number>();

      for (const [url, { tags }] of urlToNodeData) {
        for (const tag of tags) {
          tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
        }
      }

      function getNodeColor(url: string): Vec4 {
        const tags = urlToNodeData.get(url)?.tags ?? [];
        const tagWeights = tags.map((t) => ({
          tag: t,
          weight:
            (1 / (tagCounts.get(t) ?? 20000)) *
            (CANON_TAGS.has(t) ? 1 : SERIES_TAGS.has(t) ? 5 : 0),
        }));
        const tagWeightSum = tagWeights.reduce((a, b) => a + b.weight, 0);

        if (tagWeightSum === 0) return [180, 180, 180, 255];

        let sum: Vec3 = [0, 0, 0];

        for (const { tag, weight } of tagWeights) {
          const hash = stringHash(tag);
          sum = add3(
            sum,
            scale3(
              [
                hash % 256,
                Math.floor(hash / 256) % 256,
                Math.floor(hash / 256 / 256) % 256,
              ],
              weight / tagWeightSum,
            ),
          );
        }

        return [...sum, 255];
      }

      const customPositions = params.ui.state.positions;
      console.log("custom positions", customPositions);

      const nodePositions: PositionedNode[] = customPositions
        ? JSON.parse(await customPositions.text())
        : graphData.map((g: any) => ({
            position: scale3([g.x, g.y, g.z], 0.005),
            slug: g.url.replace("http://scp-wiki.wikidot.com/", "").trim(),
          }));

      for (const { position, slug } of nodePositions) {
        const url = `http://scp-wiki.wikidot.com/${slug}`;

        nodeMap.set(
          url,
          addVertex(graph, {
            position: add3(position, [0, 0, 0]),
            color: getNodeColor(url),
            initialized: false,
            label: slug,
            slug,
          }),
        );
      }

      for (const n of graphData) {
        for (const link of n.other) {
          const src = nodeMap.get(n.url.trim());
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

      console.log("edges", graph.edges);

      const labelVertsArray = [...graph.vertices].map((vert) => ({
        ...vert.data,
      }));

      const vertGroups = splitBy(labelVertsArray, 500);

      const vertices = lines.pointInstanceBufferFormat
        .usage("vertex", "storage", "copy-src")
        .new(graph.vertices.size);

      const edgeThickness = 0.2;

      const edges = lines.pointInstanceBufferFormat
        .usage("vertex", "storage", "copy-src")
        .new(graph.edges.size * 7);

      const graphUniforms = lines.uniforms.new(1);

      const graphPerFrameBindGroup = lines.perFrameBindGroup.new({
        params: graphUniforms,
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

      const edgeList: {
        src: number;
        dst: number;
        weight: number;
      }[] = [];
      const unidirectionalEdgeList: {
        src: number;
        dst: number;
        color_mul: number;
      }[] = [];

      const edgeLocMap: {
        location: number;
        count: number;
      }[] = [];

      const vertToIndexMap = new Map([...graph.vertices].map((e, i) => [e, i]));

      const edgesWithThisSrc = new Map<
        number,
        { src: number; dst: number; weight: number }[]
      >();

      const addEdgeToEdgesWithThisSrc = (
        src: number,
        dst: number,
        weight: number,
      ) =>
        edgesWithThisSrc.set(
          src,
          (edgesWithThisSrc.get(src) ?? []).concat({ src, dst, weight }),
        );

      for (const vert of graph.vertices) {
        // let location = edgeList.length;
        for (const outgoing of vert.outgoing) {
          const startIndex = vertToIndexMap.get(vert)!;
          const endIndex = vertToIndexMap.get(outgoing.endpoints[1])!;
          unidirectionalEdgeList.push({
            src: startIndex,
            dst: endIndex,
            color_mul: Math.random() * 0.3 + 0.3,
          });
          if (startIndex === endIndex) continue;
          const weight = 1;
          addEdgeToEdgesWithThisSrc(startIndex, endIndex, weight);
          addEdgeToEdgesWithThisSrc(endIndex, startIndex, weight);
        }
      }

      for (let i = 0; i < graph.vertices.size; i++) {
        const edges = edgesWithThisSrc.get(i) ?? [];

        let location = edgeList.length;

        for (const e of edges) edgeList.push(e);

        let count = edgeList.length - location;
        edgeLocMap.push({ location, count });
      }

      const edgesBuffer = weightedEdgesBufferFormat.quickCreate(edgeList);
      const unidirectionalEdgesBuffer = displayEdgesBufferFormat.quickCreate(
        unidirectionalEdgeList,
      );
      const edgeLocMapBuffer = edgeLocationMapFormat.quickCreate(edgeLocMap);

      const accelVectorPairsBuffer = accelVectorPairsFormat.new(
        edgeList.length,
      );

      const transferBodyInfoToLinesUniforms =
        transferBodyInfoToLinesUniformsFormat.new(1);

      console.log(
        "MINS",
        [...graph.vertices].reduce((a, b) => min3(a, b.data.position), [
          0, 0, 0,
        ] as Vec3),
      );
      console.log(
        "MAXES",
        [...graph.vertices].reduce((a, b) => max3(a, b.data.position), [
          0, 0, 0,
        ] as Vec3),
      );

      const bodies = bodiesFormat.quickCreate(
        [...graph.vertices].map((vert, i, a) => {
          return {
            mass: 1,
            velocity: [0, 0, 0],
            position: vert.data.position,
            color: scale4(vert.data.color, 1 / 256),
          };
        }),
      );

      const accelsFinal = accelsFormat.new(graph.vertices.size);

      const calcEdgeForcesBindGroup = calcEdgeForcesBindGroupFormat.new({
        edges: edgesBuffer,
        bodies: bodies,
        accel_vectors: accelVectorPairsBuffer,
      });

      const sumEdgeForcesBindGroup = sumEdgeForcesBindGroupFormat.new({
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

      const physicsUniforms = physicsUniformsFormat.new(1);

      const applyBarnesHutBindGroup =
        nBodySim.applyBarnesHutBindGroupFormat.new({
          bodies: bodies,
          octree_metadata: octree.octreeMetadataBuffer,
          octree_nodes: octree.octreeNodeBuffer,
          params: barnesHutUniforms,
          accels: accelsFinal,
          physics_params: physicsUniforms,
        });

      const transferBodyInfoToPointsBindGroup =
        transferBodyInfoToPointsBindGroupFormat.new({
          bodies,
          generic: genericBufferFormat.reinterpret(vertices),
        });

      const transferBodyInfoToLinesBindGroup =
        transferBodyInfoToLinesBindGroupFormat.new({
          bodies,
          generic: genericBufferFormat.reinterpret(edges),
          edges: unidirectionalEdgesBuffer,
          params: transferBodyInfoToLinesUniforms,
        });

      function updateGeometry(pass: GPUComputePassEncoder) {
        transferBodyInfoToLinesUniformsFormat.fill(
          transferBodyInfoToLinesUniforms,
          0,
          {
            line_width_multiplier: params.ui.state.lineWidth,
            nan: NaN,
          },
        );

        const perBodyWorkgroups = Math.ceil(graph.vertices.size / 32);
        pass.setPipeline(transferBodyInfoToPointsPipeline);
        pass.setBindGroup(0, transferBodyInfoToPointsBindGroup);
        pass.dispatchWorkgroups(perBodyWorkgroups);

        pass.setPipeline(transferBodyInfoToLinesPipeline);
        pass.setBindGroup(0, transferBodyInfoToLinesBindGroup);
        pass.dispatchWorkgroups(Math.ceil(unidirectionalEdgeList.length / 32));
      }

      function moveBodies() {
        physicsUniformsFormat.fill(physicsUniforms, 0, {
          repulsion_multiplier: params.ui.state.repulsionMultiplier,
          attraction_multiplier: params.ui.state.attractionMultiplier,
          velocity_damping: params.ui.state.velocityDamping,
          repulsion_exponent: params.ui.state.repulsionExponent,
        });
        nBodySim.barnesHutUniformsFormat.fill(barnesHutUniforms, 0, {
          min_width_over_distance_ratio: 1 / params.ui.state.simulationAccuracy,
          timestep: params.ui.state.timestep,
        });

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

        updateGeometry(pass);

        pass.end();
        device.queue.submit([enc.finish()]);
      }

      const enc = device.createCommandEncoder();
      let pass = enc.beginComputePass();
      updateGeometry(pass);
      pass.end();
      device.queue.submit([enc.finish()]);

      let loopIter = 0;

      const labels = new Map<string, { elem: HTMLElement; vert: Node }>();

      let currTransform = translate([0, 0, 0]);

      let viewerPos = [0, 0, -150] as Vec3;
      let viewerVel = [0, 0, 0] as Vec3;

      // @ts-expect-error
      window.getBodyInfo = async () => {
        console.log(
          "bodies",
          await quickMapWithFormat(
            bodiesFormat.desc.format.spec,
            device,
            bodies,
          ),
        );
        console.log(
          "nodes",
          await quickMapWithFormat(
            nBodySim.octreeNodeFormat.desc.format.spec,
            device,
            octree.octreeNodeBuffer,
          ),
        );
        console.log(
          "node metadata",
          await quickMapWithFormat(
            nBodySim.octreeMetadataFormat.desc.format.spec,
            device,
            octree.octreeMetadataBuffer,
          ),
        );
      };

      // @ts-expect-error
      window.getDrawInfo = async () => {
        console.log(
          "verts",
          new Float32Array(await quickMap(device, vertices)),
        );
      };

      // @ts-expect-error
      window.doOnePhysicsStep = async () => {
        moveBodies();
      };

      return {
        moveBodies,
        updateViewer(dt: number) {
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
            params.ui.state.viewerSpeed,
          );

          viewerVel = add3(viewerVel, xyz(accel));
          viewerVel = scale3(viewerVel, 0.1 ** dt);
          if (Math.hypot(...viewerVel) < 0.2) {
            viewerVel = [0, 0, 0];
          }

          currTransform = mulMat4(rotationMatrix, translate(viewerPos));

          isDesktop =
            params.ui.state.uiMode === "auto"
              ? window.matchMedia("(pointer: fine)").matches
              : params.ui.state.uiMode === "desktop";

          if (isDesktop) {
            moveControls.style.display = "none";
          } else {
            moveControls.style.display = "grid";
          }
        },
        updateLabels() {
          loopIter++;
          for (const n of vertGroups[loopIter % vertGroups.length]) {
            const isNearby =
              distance3(n.position, scale3(viewerPos, -1)) <
              params.ui.state.showLabelThreshold;

            const labelElem = labels.get(n.label);

            if (isNearby) {
              if (!labelElem) {
                const newLabelElem = document.createElement("a");
                newLabelElem.href = `https://scp-wiki.wikidot.com/${n.slug}`;
                newLabelElem.target = "_blank";
                newLabelElem.innerText = n.label;
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
                labelElem.elem.parentElement?.removeChild(labelElem.elem);
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
        },
        draw(lineMode: "fast" | "fancy" | "none") {
          lines.uniforms.fill(graphUniforms, 0, {
            mvp: multiTransform(
              perspectiveWebgpu(
                Math.PI / 2,
                canvas.width / canvas.height,
                0.1,
                params.ui.state.farPlane,
              ),
              currTransform,
            ),
            aspect: canvas.width / canvas.height,
          });

          const colorTex = ctx.getCurrentTexture();

          if (aaMode === "msaa") {
            clear.clear(multisampleTex, [0, 0, 0, 255], colorTex);
          } else {
            clear.clear(colorTex, [0, 0, 0, 255]);
          }

          const enc = device.createCommandEncoder();

          const pass =
            aaMode === "msaa"
              ? enc.beginRenderPass({
                  colorAttachments: [
                    {
                      view: multisampleTex.createView(),
                      loadOp: "load",
                      storeOp: "store",
                      resolveTarget: colorTex,
                    },
                  ],
                  depthStencilAttachment: {
                    view: depthTex.createView(),
                    depthClearValue: 1.0,
                    depthLoadOp: "clear",
                    depthStoreOp: "store",
                  },
                })
              : enc.beginRenderPass({
                  colorAttachments: [
                    {
                      view: colorTex.createView(),
                      loadOp: "load",
                      storeOp: "store",
                    },
                  ],
                  depthStencilAttachment: {
                    view: depthTex.createView(),
                    depthClearValue: 1.0,
                    depthLoadOp: "clear",
                    depthStoreOp: "store",
                  },
                });

          pass.setPipeline(lines.pointPipeline);
          lines.pointPipeline.bind(pass, {
            points: vertices,
            geometry: lines.quad,
            perFrame: graphPerFrameBindGroup,
          });
          pass.draw(6, graph.vertices.size);

          if (lineMode === "fancy") {
            lines.pointPipeline.bind(pass, {
              points: edges,
            });
            pass.draw(6, graph.edges.size * 7);
            pass.setPipeline(lines.linePipeline);
            lines.linePipeline.bind(pass, {
              lineSegments1:
                lines.lineSegInstanceBufferFormat1.reinterpret(edges),
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
            highPerfLinePipeline.bind(pass, {
              perFrame: graphPerFrameBindGroup,
              line: edgesFast,
            });
            pass.draw(graph.edges.size * 2);
          }

          pass.end();

          device.queue.submit([enc.finish()]);
        },
        destroy() {
          for (const { elem } of labels.values()) {
            elem.parentElement?.removeChild(elem);
          }
        },
        async exportPositions() {
          const buf = new Float32Array(await quickMap(device, vertices));

          let nodes: PositionedNode[] = [];

          let stride = 5;
          let i = 0;
          for (const v of labelVertsArray) {
            nodes.push({
              position: [
                buf[i * stride],
                buf[i * stride + 1],
                buf[i * stride + 2],
              ],
              slug: v.slug,
            });
            i++;
          }

          return nodes;
        },
      };
    },
  };
}
