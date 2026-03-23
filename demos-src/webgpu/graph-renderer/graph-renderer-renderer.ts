import {
  ClearRenderer,
  clearRenderer,
  distance3,
  LineRenderer,
  lineRenderer,
  linesRendererBufferDefs,
  memoOnce,
  mul4,
  mulMat4,
  mulMat4ByVec4,
  perspectiveWebgpu,
  quickMap,
  quickMapWithFormat,
  rescale,
  runtimeArray,
  scale3,
  scale4,
  splitBy,
  struct,
  variadify,
  Vec2,
  Vec4,
} from "../../../src";
import { graphRendererUI, PositionedNode } from "./graph-renderer-ui";
import { createNBodyOctreeDefs } from "../n-body-octree";
import { typeDevice } from "../../../src/webgpu/easygpu/easygpu";
import { Node, fetchGraphRendererData } from "./fetch-data";
import { graphRendererControls } from "./graph-renderer-controls";

export async function setupGraphRenderer(
  device: GPUDevice,
  params: { ui: ReturnType<typeof graphRendererUI> },
) {
  const canvas = document.createElement("canvas");
  canvas.style =
    "position: absolute; top: 0; left: 0; width: 100vw; height: 100vh;";
  const ctx = canvas.getContext("webgpu")!;
  ctx.configure({
    device: device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    alphaMode: "opaque",
  });

  const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

  const mResizeCanvas = memoOnce((size: Vec2) => {
    canvas.width = size[0];
    canvas.height = size[1];
  });

  const mLinesRenderer = memoOnce((antialiasMode: "msaa" | "none") =>
    lineRenderer(device, canvasFormat, {
      multisample: antialiasMode === "msaa" ? { count: 4 } : undefined,
    }),
  );

  const mClearRenderer = memoOnce((antialiasMode: "msaa" | "none") =>
    clearRenderer(device, canvasFormat, {
      multisample: antialiasMode === "msaa" ? { count: 4 } : undefined,
    }),
  );

  const mDepthTex = memoOnce(
    (width: number, height: number, lineRenderer: LineRenderer) =>
      lineRenderer.depthTexFormat.new([width, height]),
  );

  const mMultisampleTex = memoOnce(
    (width: number, height: number, lineRenderer: LineRenderer) =>
      lineRenderer.colorTexFormat.new([width, height]),
  );

  const mClearPass = memoOnce(
    (clear: ClearRenderer, antialiasMode: "msaa" | "none") => {
      if (antialiasMode === "msaa") {
        return (
          canvasTex: GPUTextureView,
          multisampleTex: GPUTextureView | undefined,
        ) => clear.clear(multisampleTex!, [0, 0, 0, 255], canvasTex);
      } else {
        return (
          canvasTex: GPUTextureView,
          multisampleTex: GPUTextureView | undefined,
        ) => clear.clear(canvasTex, [0, 0, 0, 255]);
      }
    },
  );

  const mRenderPass = memoOnce((antialiasMode: "msaa" | "none") => {
    type Params = {
      enc: GPUCommandEncoder;
      color: GPUTextureView;
      depth: GPUTextureView;
      multisample: GPUTextureView | undefined;
    };
    if (antialiasMode === "msaa") {
      return (params: Params) =>
        params.enc.beginRenderPass({
          colorAttachments: [
            {
              view: params.multisample!,
              loadOp: "load",
              storeOp: "store",
              resolveTarget: params.color,
            },
          ],
          depthStencilAttachment: {
            view: params.depth,
            depthClearValue: 1.0,
            depthLoadOp: "clear",
            depthStoreOp: "store",
          },
        });
    } else {
      return (params: Params) =>
        params.enc.beginRenderPass({
          colorAttachments: [
            {
              view: params.color,
              loadOp: "load",
              storeOp: "store",
            },
          ],
          depthStencilAttachment: {
            view: params.depth,
            depthClearValue: 1.0,
            depthLoadOp: "clear",
            depthStoreOp: "store",
          },
        });
    }
  });

  let windowSize: Vec2;

  function handleResize() {
    windowSize = [
      Math.round(window.innerWidth * window.devicePixelRatio),
      Math.round(window.innerHeight * window.devicePixelRatio),
    ];
  }
  handleResize();
  window.addEventListener("resize", handleResize);

  const linesFormats = linesRendererBufferDefs(device);

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

  const accelsFormat = td.storageBufferFormat("accels", runtimeArray("vec3f"));

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
      impulse += accels[i] * physics_params.attraction_multiplier;
      impulse -= bodies[i].position * 0.0001; 

      bodies[i].velocity += impulse / bodies[i].mass * params.timestep;
      bodies[i].position += bodies[i].velocity * params.timestep;
      bodies[i].velocity *= physics_params.velocity_damping;
    `,
    extraPhysicsBuffers: [accelsFormat, physicsUniformsFormat] as const,
  });

  const bodiesFormat = nBodySim.bodiesFormat;

  const highPerfLinePipeline = await td.renderPipeline({
    bindGroups: [linesFormats.perFrameBindGroup] as const,
    depthStencil: {
      format: "depth32float",
      depthCompare: "less",
      depthWriteEnabled: true,
    },
    inputs: [highPerfLineBufferFormat] as const,
    outputs: {
      color: {
        format: navigator.gpu.getPreferredCanvasFormat(),
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
    .storageBufferFormat("generic", runtimeArray("u32"))
    .usage("storage", "copy-src");

  const transferBodyInfoToPointsPipeline = await td.computePipelineBundled(
    `
      let i = id.x;
      if (i >= arrayLength(&bodies)) { return; }
      points[i * 5] = bitcast<u32>(bodies[i].position.x);
      points[i * 5 + 1] = bitcast<u32>(bodies[i].position.y);
      points[i * 5 + 2] = bitcast<u32>(bodies[i].position.z);
      points[i * 5 + 3] = bitcast<u32>(0.5);
      points[i * 5 + 4] = pack4x8unorm(bodies[i].color);
    `,
    [32, 1, 1],
    bodiesFormat,
    genericBufferFormat.name("points"),
  );

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

  const calcEdgeForcesPipeline = await td.computePipelineBundled(
    `
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
    [32, 1, 1],
    weightedEdgesBufferFormat,
    accelVectorPairsFormat,
    bodiesFormat,
  );

  const sumEdgeForcesPipeline = await td.computePipelineBundled(
    `
    let i = id.x;
    if (i >= arrayLength(&accels)) {
      return; 
    }
    
    let edge_index_start = edge_loc_map[i].location;
    let edge_index_end = edge_index_start + edge_loc_map[i].count;

    for (var j = edge_index_start; j < edge_index_end; j++) {
      accels[i] += accel_vectors[j].to_src;
    }

    `,
    [32, 1, 1],
    accelVectorPairsFormat,
    edgeLocationMapFormat,
    accelsFormat,
  );

  const transferBodyInfoToLinesUniformsFormat = td.uniformBufferComputeFormat(
    "params",

    struct("Params", {
      line_width_multiplier: "f32",
      nan: "f32",
    }),
  );

  const transferBodyInfoToLinesPipeline = await td.computePipelineBundled(
    `

/*globals
var<private> endpoint1: vec3f;
var<private> endpoint2: vec3f;
var<private> color1: vec4f;
var<private> color2: vec4f;
var<private> color_mul: f32;

fn set_point(idx: u32, across: f32, width: f32) {
  let i = idx * 5;
  let position = mix(endpoint1, endpoint2, across);
  lines[i] = bitcast<u32>(position.x);
  lines[i + 1] = bitcast<u32>(position.y);
  lines[i + 2] = bitcast<u32>(position.z);
  lines[i + 3] = bitcast<u32>(width * params.line_width_multiplier);
  lines[i + 4] = pack4x8unorm(mix(color1, color2, across) * vec4f(vec3f(color_mul), 1.0));
}    
*/ 

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
    [32, 1, 1],
    bodiesFormat,
    genericBufferFormat.name("lines"),
    displayEdgesBufferFormat,
    transferBodyInfoToLinesUniformsFormat,
  );

  const visualizeOctreeCubePositionFormat = td
    .instanceBufferFormat("cube_position", 28, [
      {
        name: "min_corner",
        format: "float32x3",
        offset: 0,
      },
      {
        name: "max_corner",
        format: "float32x3",
        offset: 12,
      },
      {
        name: "depth",
        format: "float32",
        offset: 24,
      },
    ] as const)
    .usage("vertex", "storage");

  const visualizeOctreeGeometryFormat = td.vertexBufferFormat("position", 12, [
    {
      name: "position",
      format: "float32x3",
      offset: 0,
    },
  ] as const);

  const indexFormat = td
    .vertexBufferFormat("index", 4, [
      {
        name: "index",
        format: "uint32",
        offset: 0,
      },
    ] as const)
    .usage("index", "copy-dst");

  const visualizeOctreeConstructionPipeline = await td.computePipelineBundled(
    `
    let i = id.x;
    if (i >= nextfrees.node) { return; }
    let ri = nextfrees.node - i - 1u;
    let metadata_idx = octree_nodes[ri].metadata_idx;
    let metadata = octree_metadata[metadata_idx];

    generic[i * 7] = bitcast<u32>(metadata.min_corner.x);
    generic[i * 7 + 1] = bitcast<u32>(metadata.min_corner.y);
    generic[i * 7 + 2] = bitcast<u32>(metadata.min_corner.z);
    generic[i * 7 + 3] = bitcast<u32>(metadata.max_corner.x);
    generic[i * 7 + 4] = bitcast<u32>(metadata.max_corner.y);
    generic[i * 7 + 5] = bitcast<u32>(metadata.max_corner.z);

    let depth = (10.0 - log2(distance(metadata.max_corner, metadata.min_corner))) / 10.0;

    generic[i * 7 + 6] = bitcast<u32>(depth);

    `,
    [32, 1, 1],
    nBodySim.octreeNodeFormat,
    nBodySim.octreeMetadataFormat,
    genericBufferFormat,
    nBodySim.nextfreesNonatomicFormat,
  );

  const mVisualizeOctreePipeline = memoOnce((aa: "msaa" | "none") =>
    td.renderPipeline({
      bindGroups: [linesFormats.perFrameBindGroup] as const,
      inputs: [
        visualizeOctreeCubePositionFormat,
        visualizeOctreeGeometryFormat,
      ] as const,
      outputs: {
        color: canvasFormat,
      },
      multisample: aa === "msaa" ? { count: 4 } : undefined,
      depthStencil: {
        format: "depth32float",
        depthCompare: "less",
        depthWriteEnabled: true,
      },
      vertex: `
    var frag: FragInput;
    let l = (vertex.position - vec3f(0.5)) * 1.0 + vec3f(0.5);
    frag.position = params.mvp * vec4f(mix(vertex.min_corner, vertex.max_corner, l), 1.0);
    frag.depth = vertex.depth;
    return frag;
    `,
      fragment: {
        function: `
      var pixel: FragOutput;
      pixel.color = vec4f(input.depth, 0.0, 1.0 - input.depth, 1.0); 
      return pixel;
      `,
        struct: `@location(0) color: vec4f, @builtin(position) position : vec4f, @location(1) depth : f32,`,
      },
      primitive: {
        topology: "line-list",
      },
    }),
  );

  const drawIndirectBufferFormat = td
    .storageBufferFormat(
      "draw_indirect",
      struct("DrawIndirect", {
        index_count: "u32",
        instance_count: "u32",
        first_index: "u32",
        base_vertex: "u32",
        first_instance: "u32",
      }),
    )
    .usage("indirect", "storage");

  const determineNumberOfOctreeNodesToDrawPipeline =
    await td.computePipelineBundled(
      `
    draw_indirect.index_count = 24u;
    draw_indirect.instance_count = nextfrees.node;
    draw_indirect.first_index = 0u;
    draw_indirect.base_vertex = 0u;
    draw_indirect.first_instance = 0u;
    
    compute_indirect.workgroups = vec3u(
      (nextfrees.node / 32u) + 1u, 1u, 1u
    );
    `,
      [1, 1, 1],
      nBodySim.nextfreesNonatomicFormat,
      drawIndirectBufferFormat,
      nBodySim.computeIndirectBufferFormat,
    );

  const cubeVertsBuffer = visualizeOctreeGeometryFormat.quickCreate([
    {
      position: [0, 0, 0],
    },
    {
      position: [1, 0, 0],
    },
    {
      position: [0, 1, 0],
    },
    {
      position: [1, 1, 0],
    },
    {
      position: [0, 0, 1],
    },
    {
      position: [1, 0, 1],
    },
    {
      position: [0, 1, 1],
    },
    {
      position: [1, 1, 1],
    },
  ]);

  const cubeEdgesIndexBuffer = indexFormat.quickCreate(
    [
      0, 1, 2, 3, 4, 5, 6, 7,

      0, 2, 1, 3, 4, 6, 5, 7,

      0, 4, 1, 5, 2, 6, 3, 7,
    ].map((i) => ({ index: i })),
  );

  const multiTransform = variadify(mulMat4);

  const controls = graphRendererControls({
    canvas,
    ui: params.ui,
  });
  controls.init();

  return {
    canvas,
    async createGraph() {
      let tags = params.ui.state.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      let positiveTags = tags.filter((t) => t[0] !== "!");
      let negativeTags = tags
        .filter((t) => t[0] === "!")
        ?.map((t) => t.slice(1));

      const graph = await fetchGraphRendererData({
        positiveTags,
        negativeTags,
        positions: params.ui.state.positions,
        url: params.ui.state.dataSourceUrl,
      });

      const labelVertsArray = [...graph.vertices].map((vert) => ({
        ...vert.data,
      }));

      const vertGroups = splitBy(labelVertsArray, 500);

      const vertices = linesFormats.pointInstanceBufferFormat
        .usage("vertex", "storage", "copy-src")
        .new(graph.vertices.size);

      const edgeThickness = 0.2;

      const edges = linesFormats.pointInstanceBufferFormat
        .usage("vertex", "storage", "copy-src")
        .new(graph.edges.size * 7);

      const graphUniforms = linesFormats.uniforms.new(1);

      const graphPerFrameBindGroup = linesFormats.perFrameBindGroup.new({
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

      const calcEdgeForces = calcEdgeForcesPipeline.new({
        edges: edgesBuffer,
        bodies: bodies,
        accel_vectors: accelVectorPairsBuffer,
      });

      const sumEdgeForces = sumEdgeForcesPipeline.new({
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

      const applyBarnesHut = nBodySim.applyBarnesHutPipeline.new({
        bodies: bodies,
        octree_metadata: octree.octreeMetadataBuffer,
        octree_nodes: octree.octreeNodeBuffer,
        params: barnesHutUniforms,
        accels: accelsFinal,
        physics_params: physicsUniforms,
      });

      const transferBodyInfoToPoints = transferBodyInfoToPointsPipeline.new({
        bodies,
        points: genericBufferFormat.reinterpret(vertices),
      });

      const transferBodyInfoToLines = transferBodyInfoToLinesPipeline.new({
        bodies,
        lines: genericBufferFormat.reinterpret(edges),
        edges: unidirectionalEdgesBuffer,
        params: transferBodyInfoToLinesUniforms,
      });

      const octreeVizBuffer = visualizeOctreeCubePositionFormat.new(200000);

      const octreeNodeDrawCountIndirectBuffer = drawIndirectBufferFormat.new(1);

      const octreeNodeComputeCountIndirectBuffer =
        nBodySim.computeIndirectBufferFormat.new(1);

      const determineNumberOfOctreeNodesToDraw =
        determineNumberOfOctreeNodesToDrawPipeline.new({
          nextfrees: nBodySim.nextfreesNonatomicFormat.reinterpret(
            octree.nextfreesBuffer,
          ),
          draw_indirect: octreeNodeDrawCountIndirectBuffer,
          compute_indirect: octreeNodeComputeCountIndirectBuffer,
        });

      const vizOctree = visualizeOctreeConstructionPipeline.new({
        octree_nodes: octree.octreeNodeBuffer,
        octree_metadata: octree.octreeMetadataBuffer,
        generic: genericBufferFormat.reinterpret(octreeVizBuffer),
        nextfrees: nBodySim.nextfreesNonatomicFormat.reinterpret(
          octree.nextfreesBuffer,
        ),
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
        transferBodyInfoToPoints.run(pass, perBodyWorkgroups);
        transferBodyInfoToLines.run(
          pass,
          Math.ceil(unidirectionalEdgeList.length / 32),
        );

        if (params.ui.state.showOctree) {
          determineNumberOfOctreeNodesToDraw.run(pass, 1);
          vizOctree.runIndirect(pass, octreeNodeComputeCountIndirectBuffer);
        }
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

        const perEdgeWorkgroups = Math.ceil(edgeList.length / 32);

        calcEdgeForces.run(pass, perEdgeWorkgroups);
        sumEdgeForces.run(pass, perBodyWorkgroups);

        octree.run(pass);

        applyBarnesHut.run(pass, perBodyWorkgroups);

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

      let destroyed = false;

      return {
        moveBodies,
        updateViewer(dt: number) {
          controls.updateViewer(dt);
        },
        updateLabels() {
          loopIter++;
          for (const n of vertGroups[loopIter % vertGroups.length]) {
            const isNearby =
              distance3(n.position, scale3(controls.viewerPos, -1)) <
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

              if (destroyed) return;

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

            const clipSpace = mulMat4ByVec4(controls.currTransform, worldSpace);

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
        async draw(lineMode: "fast" | "fancy" | "none") {
          const aa = params.ui.state.antialiasing;
          const linesRenderer = await mLinesRenderer(aa);
          const clearRenderer = await mClearRenderer(aa);
          const visualizeOctreePipeline = await mVisualizeOctreePipeline(aa);
          mResizeCanvas(windowSize);
          const canvasTex = ctx.getCurrentTexture();
          const size: Vec2 = [canvasTex.width, canvasTex.height];
          const depthTex = mDepthTex(...size, linesRenderer);
          const multisampleTex = mMultisampleTex(...size, linesRenderer);

          const clearPass = mClearPass(clearRenderer, aa);
          const renderPass = mRenderPass(aa);

          linesFormats.uniforms.fill(graphUniforms, 0, {
            mvp: multiTransform(
              perspectiveWebgpu(
                Math.PI / 2,
                canvas.width / canvas.height,
                0.1,
                params.ui.state.farPlane,
              ),
              controls.currTransform,
            ),
            aspect: canvas.width / canvas.height,
          });

          clearPass(canvasTex.createView(), multisampleTex?.createView());

          const enc = device.createCommandEncoder();

          const pass = renderPass({
            enc,
            color: canvasTex.createView(),
            depth: depthTex.createView(),
            multisample: multisampleTex.createView(),
          });

          pass.setPipeline(linesRenderer.pointPipeline);
          linesRenderer.pointPipeline.bind(pass, {
            points: vertices,
            geometry: linesRenderer.quad,
            perFrame: graphPerFrameBindGroup,
          });
          pass.draw(6, graph.vertices.size);

          if (lineMode === "fancy") {
            linesRenderer.pointPipeline.bind(pass, {
              points: edges,
            });
            pass.draw(6, graph.edges.size * 7);
            pass.setPipeline(linesRenderer.linePipeline);
            linesRenderer.linePipeline.bind(pass, {
              lineSegments1:
                linesRenderer.lineSegInstanceBufferFormat1.reinterpret(edges),
              lineSegments2: [
                linesRenderer.lineSegInstanceBufferFormat2.reinterpret(edges),
                20,
              ],
              perFrame: graphPerFrameBindGroup,
              geometry: linesRenderer.quad,
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

          if (params.ui.state.showOctree) {
            pass.setPipeline(visualizeOctreePipeline);
            visualizeOctreePipeline.bind(pass, {
              perFrame: graphPerFrameBindGroup,
              position: cubeVertsBuffer,
              cube_position: octreeVizBuffer,
            });
            pass.setIndexBuffer(cubeEdgesIndexBuffer, "uint32");
            pass.drawIndexedIndirect(octreeNodeDrawCountIndirectBuffer, 0);
          }

          pass.end();

          device.queue.submit([enc.finish()]);
        },
        destroy() {
          destroyed = true;
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
