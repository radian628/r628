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

  const octreeNodeFormat = wdevice.storageBuffer(
    "octree_nodes",
    struct("OctreeNode", {
      child_idx: "u32",
      data_start_idx: "u32",
      data_end_idx: "u32",
      metadata_idx: "u32",
    }),
  );

  const octreeMetadataFormat = wdevice.storageBuffer(
    "octree_metadata",
    struct("OctreeMetadata", {
      min_corner: "vec3f",
      counters_idx: "u32",
      max_corner: "vec3f",
      mass: "f32",
      center_of_mass: "vec3f",
    }),
  );

  const octreeCountersFormat = wdevice.storageBuffer(
    "octree_counters",
    struct("OctreeCounters", {
      counters: array(8, "atomic<u32>"),
    }),
  );
  const octreeCountersNonatomicFormat = wdevice.storageBuffer(
    "octree_counters",
    struct("OctreeCounters", {
      counters: array(8, "u32"),
    }),
  );

  const bodiesFormat = wdevice.storageBuffer(
    "bodies",
    struct("Body", {
      position: "vec3f",
      mass: "f32",
      velocity: "vec3f",
      impulse: "vec3f",
    }),
  );

  const aggregatedBodiesFormat = wdevice.storageBuffer(
    "agg_bodies",
    struct("AggBody", {
      center_of_mass: "vec3f",
      mass: "f32",
    }),
  );

  const nextfreesFormat = wdevice.storageBuffer(
    "nextfrees",
    struct("Nextfrees", {
      node: "atomic<u32>",
      node_metadata: "atomic<u32>",
      counters: "atomic<u32>",
      active_nodes_index: "atomic<u32>",
    }),
    { arrayify: false },
  );

  const nextfreesNonatomicFormat = wdevice.storageBuffer(
    "nextfrees",
    struct("Nextfrees", {
      node: "u32",
      node_metadata: "u32",
      counters: "u32",
      active_nodes_index: "u32",
    }),
    { arrayify: false },
  );

  const bodyNodeAssignmentsFormat = wdevice.storageBuffer(
    "body_node_assignments",
    struct("NodeIdx", {
      node_idx: "u32",
    }),
  );
  const bodyNodeAssignmentsInFormat = bodyNodeAssignmentsFormat.withName(
    "body_node_assignments_in",
  );
  const bodyNodeAssignmentsOutFormat = bodyNodeAssignmentsFormat.withName(
    "body_node_assignments_out",
  );
  const bodyNodeChildSubOffsetsFormat = bodyNodeAssignmentsFormat.withName(
    "body_node_child_sub_offsets",
  );

  const activeNodesInfoFormat = wdevice.storageBuffer(
    "active_nodes_info",
    struct("ActiveNodesInfo", {
      count: "u32",
    }),
    { arrayify: false },
  );

  const bodyOrderFormat = wdevice.storageBuffer(
    "body_order",
    struct("BodyIdx", {
      body_idx: "u32",
    }),
  );
  const bodyOrderInFormat = bodyOrderFormat.withName("body_order_in");
  const bodyOrderOutFormat = bodyOrderFormat.withName("body_order_out");

  const activeNodesInFormat =
    bodyNodeAssignmentsFormat.withName("active_nodes_in");
  const activeNodesOutFormat =
    bodyNodeAssignmentsFormat.withName("active_nodes_out");

  const computeIndirectBufferFormat = wdevice.storageBuffer(
    "compute_indirect",
    struct("ComputeIndirect", {
      workgroups: "vec3u",
    }),
    {
      arrayify: false,
      usage:
        GPUBufferUsage.INDIRECT |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.STORAGE,
    },
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

  const barnesHutUniformsFormat = wdevice.uniformBufferForComputeShader(
    "params",
    struct("Params", {
      min_width_over_distance_ratio: "f32",
      timestep: "f32",
    }),
  );

  const minMaxFormat = wdevice.storageBuffer(
    "vecs",
    struct("MinMax", {
      min: "vec3f",
      max: "vec3f",
    }),
  );

  const minMaxUniformsFormat = wdevice.uniformBufferForComputeShader(
    "params",
    struct("Params", {
      stride: "u32",
      count: "u32",
    }),
  );

  const assignBodiesBindGroupFormat = wdevice.bindGroup(
    "bg",
    bodyNodeAssignmentsFormat,
    bodyNodeChildSubOffsetsFormat,
    octreeNodeFormat,
    octreeCountersFormat,
    bodyOrderFormat,
    bodiesFormat,
    octreeMetadataFormat,
  );

  const assignBodiesPipeline = await wdevice.compute({
    bindGroups: [assignBodiesBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= arrayLength(&body_node_assignments)) {
      return; 
    }

    let body_idx = body_order[id.x].body_idx;
    let body = bodies[body_idx];
    let parent_node_idx = body_node_assignments[body_idx].node_idx;
    let parent_node = octree_nodes[parent_node_idx];
    let parent_node_metadata = octree_metadata[parent_node.metadata_idx];

    if (parent_node.child_idx == 4294967295u) {
      return; 
    }

    let min_corner = parent_node_metadata.min_corner;
    let max_corner = parent_node_metadata.max_corner;

    let halfway = (min_corner + max_corner) / 2;

    let child_offset = 
        select(0u, 4u, halfway.z < body.position.z)
      + select(0u, 2u, halfway.y < body.position.y)
      + select(0u, 1u, halfway.x < body.position.x);
  
    body_node_child_sub_offsets[body_idx].node_idx = 
      atomicAdd(
        &octree_counters[parent_node_metadata.counters_idx].counters[child_offset],
        1u
      );

    body_node_assignments[body_idx].node_idx = 
      parent_node.child_idx + child_offset;
    `,
  });

  const createNewNodesBindGroupFormat = wdevice.bindGroup(
    "bg",
    activeNodesInFormat,
    activeNodesOutFormat,
    octreeMetadataFormat,
    nextfreesFormat,
    octreeNodeFormat,
    octreeCountersNonatomicFormat,
    activeNodesInfoFormat,
  );

  const createNewNodesPipeline = await wdevice.compute({
    bindGroups: [createNewNodesBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= active_nodes_info.count) {
      return; 
    } 

    let parent_node_idx = active_nodes_in[id.x].node_idx;
    let parent_node = octree_nodes[parent_node_idx];
    let parent_node_metadata = octree_metadata[parent_node.metadata_idx];
    let parent_node_counters = 
      octree_counters[parent_node_metadata.counters_idx].counters; 
    let p = parent_node_counters; 
    let child_count = p[0] + p[1] + p[2] + p[3] + p[4] + p[5] + p[6] + p[7];

    if (child_count == 0 || child_count == 1) {
      return; 
    }

    let min_corner = parent_node_metadata.min_corner;
    let max_corner = parent_node_metadata.max_corner;
    let halfway = (min_corner + max_corner) / 2;
    let half_extent = (max_corner - min_corner) / 2;

    let prefix_sum = array(
      0,
      p[0],
      p[0] + p[1],
      p[0] + p[1] + p[2],
      p[0] + p[1] + p[2] + p[3],
      p[0] + p[1] + p[2] + p[3] + p[4],
      p[0] + p[1] + p[2] + p[3] + p[4] + p[5],
      p[0] + p[1] + p[2] + p[3] + p[4] + p[5] + p[6],
    );

    for (var i = 0u; i < 8u; i++) {
      let child_node_idx = parent_node.child_idx + i;
      octree_nodes[child_node_idx].child_idx = 4294967295u;

      if (parent_node_counters[i] == 0u) {
        continue;
      } 

      octree_nodes[child_node_idx].data_start_idx = 
        parent_node.data_start_idx + prefix_sum[i];
      octree_nodes[child_node_idx].data_end_idx = 
        parent_node.data_start_idx + prefix_sum[i] + p[i];

      let metadata_idx = atomicAdd(&nextfrees.node_metadata, 1u);
      octree_nodes[child_node_idx].metadata_idx = metadata_idx;

      let offset = vec3f(
          select(0.0, half_extent.x, i % 2u == 1u), 
          select(0.0, half_extent.y, (i / 2u) % 2u == 1u), 
          select(0.0, half_extent.z, (i / 4u) % 2u == 1u) 
        );

      octree_metadata[metadata_idx].min_corner = min_corner + offset;
      octree_metadata[metadata_idx].max_corner = halfway + offset;

      if (parent_node_counters[i] > 1u) {
        octree_metadata[metadata_idx].counters_idx = 
          atomicAdd(&nextfrees.counters, 1u);
        let child_idx = 
          atomicAdd(&nextfrees.node, 8u);
        for (var i = 0u; i < 8; i += 1) {
          octree_nodes[child_idx + i].data_start_idx = 0u; 
          octree_nodes[child_idx + i].data_end_idx = 0u; 
        }
        octree_nodes[child_node_idx].child_idx = child_idx;
        let active_idx = atomicAdd(&nextfrees.active_nodes_index, 1u);
        active_nodes_out[active_idx].node_idx = child_node_idx;
      }
    }

    `,
  });

  const reorderBodiesBindGroupFormat = wdevice.bindGroup(
    "bg",
    bodyOrderInFormat,
    bodyOrderOutFormat,
    bodyNodeAssignmentsFormat,
    bodyNodeChildSubOffsetsFormat,
    octreeNodeFormat,
    bodiesFormat,
  );

  const reorderBodiesPipeline = await wdevice.compute({
    bindGroups: [reorderBodiesBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= arrayLength(&body_node_assignments)) {
      return; 
    }

    let body_idx = body_order_in[id.x].body_idx;
    let body = bodies[body_idx];

    let node_idx = body_node_assignments[body_idx].node_idx;
    let node = octree_nodes[node_idx];
    let start = node.data_start_idx;
    let sub_offset = body_node_child_sub_offsets[body_idx].node_idx;

    body_order_out[start + sub_offset].body_idx = body_idx;
    `,
  });

  const setupNextIterationBindGroupFormat = wdevice.bindGroup(
    "bg",
    computeIndirectBufferFormat,
    nextfreesFormat,
    activeNodesInfoFormat,
  );

  const setupNextIterationPipeline = await wdevice.compute({
    bindGroups: [setupNextIterationBindGroupFormat] as const,
    workgroupSize: [1, 1, 1],
    shader: `
      let active_nodes_count = atomicLoad(&nextfrees.active_nodes_index);
      compute_indirect.workgroups = vec3u(
        active_nodes_count / 32 + 1u,
        1u,
        1u
      );
      active_nodes_info.count = active_nodes_count;
      atomicStore(&nextfrees.active_nodes_index, 0u);
    `,
  });

  const prefixSumAggBodiesUniformFormat = wdevice.uniformBufferForComputeShader(
    "params",
    struct("Params", {
      stride: "u32",
      count: "u32",
    }),
  );

  const prefixSumAggBodiesBindGroupFormat = wdevice.bindGroup(
    "bg",
    prefixSumAggBodiesUniformFormat,
    aggregatedBodiesFormat,
  );

  const prefixSumAggBodiesUpstrokePipeline = await wdevice.compute({
    bindGroups: [prefixSumAggBodiesBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
      if (id.x >= params.count) {
        return; 
      }

      let src_idx1 = id.x * params.stride * 2u + params.stride - 1u;
      let src_idx2 = src_idx1 + params.stride;
      let dst_idx = src_idx2;
      
      let m1 = agg_bodies[src_idx1].mass;
      let m2 = agg_bodies[src_idx2].mass;

      let cm1 = agg_bodies[src_idx1].center_of_mass;
      let cm2 = agg_bodies[src_idx2].center_of_mass;

      agg_bodies[dst_idx].mass = m1 + m2;
      agg_bodies[dst_idx].center_of_mass = (cm1 * m1 + cm2 * m2) / (m1 + m2);
    `,
  });

  const setupPrefixSumBodiesDownstrokeUniformFormat =
    wdevice.uniformBufferForComputeShader(
      "params",
      struct("Params", {
        end: "u32",
      }),
    );

  const setupPrefixSumBodiesDownstrokeBindGroupFormat = await wdevice.bindGroup(
    "bg",
    aggregatedBodiesFormat,
    setupPrefixSumBodiesDownstrokeUniformFormat,
  );

  const setupPrefixSumBodiesDownstrokePipeline = await wdevice.compute({
    bindGroups: [setupPrefixSumBodiesDownstrokeBindGroupFormat] as const,
    workgroupSize: [1, 1, 1],
    shader: `
    agg_bodies[params.end - 1].mass = 0;
    agg_bodies[params.end - 1].center_of_mass = vec3f(0.0);
    `,
  });

  const prefixSumAggBodiesDownstrokePipeline = await wdevice.compute({
    bindGroups: [prefixSumAggBodiesBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= params.count) {
      return; 
    }

    let src_idx1 = id.x * params.stride * 2u + params.stride - 1u;
    let src_idx2 = src_idx1 + params.stride; 

    let m1 = agg_bodies[src_idx1].mass;
    let m2 = agg_bodies[src_idx2].mass;

    let cm1 = agg_bodies[src_idx1].center_of_mass;
    let cm2 = agg_bodies[src_idx2].center_of_mass;

    agg_bodies[src_idx1].mass = agg_bodies[src_idx2].mass;
    agg_bodies[src_idx1].center_of_mass = agg_bodies[src_idx2].center_of_mass;
    agg_bodies[src_idx2].mass = m1 + m2;
    agg_bodies[src_idx2].center_of_mass = (cm1 * m1 + cm2 * m2) / (m1 + m2);
    `,
  });

  const initAggregatedBodiesBindGroupFormat = wdevice.bindGroup(
    "bg",
    aggregatedBodiesFormat,
    bodiesFormat,
    bodyOrderFormat,
  );

  const initAggregatedBodiesPipeline = await wdevice.compute({
    bindGroups: [initAggregatedBodiesBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= arrayLength(&agg_bodies)) {
      return; 
    }

    if (id.x < arrayLength(&bodies)) {
      let body_idx = body_order[id.x].body_idx;

      agg_bodies[id.x].mass = bodies[body_idx].mass;
      agg_bodies[id.x].center_of_mass = bodies[body_idx].position;
    } else {
      agg_bodies[id.x].mass = 0.0;
      agg_bodies[id.x].center_of_mass = vec3f(0.0);
    }

    `,
  });

  const aggregateMassInOctreeBindGroupFormat = wdevice.bindGroup(
    "bg",
    octreeNodeFormat,
    octreeMetadataFormat,
    aggregatedBodiesFormat,
    nextfreesNonatomicFormat,
  );

  const aggregateMassInOctreePipeline = await wdevice.compute({
    bindGroups: [aggregateMassInOctreeBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= nextfrees.node) {
      return; 
    }

    let node = octree_nodes[id.x];
    let start = node.data_start_idx;
    let end = node.data_end_idx;

    if (start == end) {
      return; 
    }

    let mass = agg_bodies[end].mass - agg_bodies[start].mass;
    octree_metadata[node.metadata_idx]
      .mass = mass;
    octree_metadata[node.metadata_idx].center_of_mass =
      (agg_bodies[end].center_of_mass * agg_bodies[end].mass
        - agg_bodies[start].mass * agg_bodies[start].center_of_mass) / mass;
    `,
  });

  const transferBodyInfoToPointsBindGroupFormat = wdevice.bindGroup(
    "bg",
    bodiesFormat,
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
      generic[i * 5 + 3].data = bitcast<u32>(0.05 * bodies[i].mass);
      generic[i * 5 + 4].data = 0xffffffff;
    `,
  });

  const applyBarnesHutBindGroupFormat = wdevice.bindGroup(
    "bg",
    bodiesFormat,
    octreeNodeFormat,
    octreeMetadataFormat,
    barnesHutUniformsFormat,
  );

  const applyBarnesHutPipeline = await wdevice.compute({
    bindGroups: [applyBarnesHutBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    globals: `
      struct StackFrame {
        node_idx: u32,
        next_child_idx: u32,
      } 
      
    `,
    shader: `
      if (id.x >= arrayLength(&bodies)) {
        return; 
      }
    
      var stack: array<StackFrame, 21>;
      var stack_size = 1u;

      var total_impulse = vec3f(0.0);

      let body = bodies[id.x];

      stack[0].node_idx = 0u;
      stack[0].next_child_idx = 0u;

      while (stack_size != 0u) {
        let top_node = octree_nodes[stack[stack_size - 1u].node_idx];
        let top_node_metadata = octree_metadata[top_node.metadata_idx];

        if (stack[stack_size - 1u].next_child_idx == 8u) {
          stack_size -= 1u;
          continue; 
        }

        let next_child_idx = stack[stack_size - 1u].next_child_idx;
        stack[stack_size - 1u].next_child_idx += 1u;

        let child_idx = top_node.child_idx + next_child_idx;

        let child = octree_nodes[child_idx];

        if (child.data_start_idx == child.data_end_idx) {
          continue;
        } 

        let child_metadata = octree_metadata[child.metadata_idx];

        let dist_to_body = distance(body.position, child_metadata.center_of_mass);

        if (dist_to_body < 0.0001) {
          continue; 
        }

        let ratio = 
          distance(child_metadata.min_corner, child_metadata.max_corner) 
          / dist_to_body;
        
        if (child.child_idx != 0xffffffff && ratio > params.min_width_over_distance_ratio) {
          stack[stack_size].node_idx = child_idx;
          stack[stack_size].next_child_idx = 0u;
          stack_size += 1u;
        } else {
          let force_mag = child_metadata.mass / pow(dist_to_body, 2.0);
          let force_dir = normalize(child_metadata.center_of_mass - body.position);
          total_impulse += force_mag * force_dir; 
        }
      }

      bodies[id.x].velocity += total_impulse / bodies[id.x].mass * params.timestep;
      bodies[id.x].position += bodies[id.x].velocity * params.timestep;
      bodies[id.x].impulse = total_impulse;
    `,
  });

  const reduceMinMaxBindGroupFormat = wdevice.bindGroup(
    "bg",
    minMaxFormat,
    minMaxUniformsFormat,
  );

  const reduceMinMaxPipeline = await wdevice.compute({
    bindGroups: [reduceMinMaxBindGroupFormat],
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= params.count) {
      return; 
    }

    let src_idx1 = id.x * params.stride * 2u;
    let src_idx2 = src_idx1 + params.stride; 

    let min1 = vecs[src_idx1].min;
    let min2 = vecs[src_idx2].min;
    let max1 = vecs[src_idx1].max;
    let max2 = vecs[src_idx2].max;

    vecs[src_idx1].min = min(min1, min2);
    vecs[src_idx1].max = max(max1, max2);
    `,
  });

  const initMinMaxBindGroupFormat = wdevice.bindGroup(
    "bg",
    bodiesFormat,
    minMaxFormat,
  );

  const initMinMaxPipeline = await wdevice.compute({
    bindGroups: [initMinMaxBindGroupFormat],
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= arrayLength(&vecs)) {
      return; 
    }

    if (id.x < arrayLength(&bodies)) {
      let pos = bodies[id.x].position;
      vecs[id.x].min = pos;
      vecs[id.x].max = pos;
    } else {
      vecs[id.x].min = vec3f(99999999999999999.0, 999999999999999999.0, 9999999999999999.0);
      vecs[id.x].max = -vec3f(99999999999999999.0, 999999999999999999.0, 9999999999999999.0);
    }
    `,
  });

  const initRootNodeBindGroupFormat = wdevice.bindGroup(
    "bg",
    bodiesFormat,
    minMaxFormat,
    octreeNodeFormat,
    octreeMetadataFormat,
    octreeCountersNonatomicFormat,
    nextfreesNonatomicFormat,
  );

  const initRootNodePipeline = await wdevice.compute({
    bindGroups: [initRootNodeBindGroupFormat],
    workgroupSize: [1, 1, 1],
    shader: `
    octree_nodes[0].data_start_idx = 0u;
    octree_nodes[0].data_end_idx = arrayLength(&bodies);
    octree_nodes[0].child_idx = 1u;
    octree_nodes[0].metadata_idx = 0u;

    octree_metadata[0].min_corner = vecs[0].min; 
    octree_metadata[0].max_corner = vecs[0].max; 
    octree_metadata[0].counters_idx = 0u;

    octree_counters[0].counters = array(0,0,0,0,0,0,0,0);

    nextfrees.node = 9u;
    nextfrees.node_metadata = 1u;
    nextfrees.counters = 1u;
    nextfrees.active_nodes_index = 0u;
    `,
  });

  const initPerBodyStateBindGroupFormat = wdevice.bindGroup(
    "bg",
    bodyOrderFormat,
    bodyNodeAssignmentsFormat,
  );

  const initPerBodyStatePipeline = await wdevice.compute({
    bindGroups: [initPerBodyStateBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= arrayLength(&body_order)) {
      return;
    }

    body_order[id.x].body_idx = id.x;
    body_node_assignments[id.x].node_idx = 0u;
    `,
  });

  const bodiesData: WGSLStructValues<typeof bodiesFormat.format>[] = [
    {
      mass: 1,
      velocity: [0, 0, 0],
      position: [0.9, 0.1, 0.1],
      impulse: [0, 0, 0],
    },
    {
      mass: 2,
      velocity: [0, 0, 0],
      position: [0.9, 0.9, 0.9],
      impulse: [0, 0, 0],
    },
    {
      mass: 3,
      velocity: [0, 0, 0],
      position: [0.3, 0.3, 0.3],
      impulse: [0, 0, 0],
    },
    {
      mass: 4,
      velocity: [0, 0, 0],
      position: [0.7, 0.7, 0.7],
      impulse: [0, 0, 0],
    },
  ];

  const OCTREE_CAP = 256;

  const octreeNodeData: WGSLStructValues<typeof octreeNodeFormat.format>[] = [
    {
      data_start_idx: 0,
      data_end_idx: bodiesData.length,
      child_idx: 1,
      metadata_idx: 0,
    },
    ...range(OCTREE_CAP - 1).map(() => ({
      data_start_idx: 0,
      data_end_idx: 0,
      child_idx: 0,
      metadata_idx: 0,
    })),
  ];

  const octreeMetadata: WGSLStructValues<typeof octreeMetadataFormat.format>[] =
    [
      {
        min_corner: [0, 0, 0],
        max_corner: [1, 1, 1],
        counters_idx: 0,
        mass: 0,
        center_of_mass: [0, 0, 0],
      },
      ...range(OCTREE_CAP - 1).map(() => ({
        min_corner: [0, 0, 0] as Vec3,
        max_corner: [0, 0, 0] as Vec3,
        counters_idx: 0,
        mass: 0,
        center_of_mass: [0, 0, 0] as Vec3,
      })),
    ];

  const octreeCounters: WGSLStructValues<typeof octreeCountersFormat.format>[] =
    range(OCTREE_CAP).map(() => ({
      counters: [0, 0, 0, 0, 0, 0, 0, 0],
    }));

  const bodiesOrder: WGSLStructValues<typeof bodyOrderFormat.format>[] =
    bodiesData.map((b, i) => ({ body_idx: i }));

  const nextfrees: WGSLStructValues<typeof nextfreesFormat.format> = {
    node: 9,
    node_metadata: 1,
    counters: 1,
    active_nodes_index: 0,
  };

  const nodeBodyAssignments: WGSLStructValues<
    typeof bodyNodeAssignmentsFormat.format
  >[] = bodiesOrder.map(() => ({ node_idx: 0 }));

  const bodyNodeChildSubOffsets: WGSLStructValues<
    typeof bodyNodeAssignmentsFormat.format
  >[] = nodeBodyAssignments;

  const activeNodesInfo: WGSLStructValues<typeof activeNodesInfoFormat.format> =
    {
      count: 1,
    };

  function setupMinMaxReduction(params: {
    bodies: ReturnType<typeof bodiesFormat.instantiate>;
    count: number;
  }) {
    const countExponent = Math.ceil(Math.log2(params.count));
    const nextPowerOfTwo = 2 ** countExponent;
    const iterSteps = countExponent;

    const minmax = minMaxFormat.instantiate(nextPowerOfTwo);

    const steps = range(iterSteps).map((i) => {
      const stride = 2 ** i;
      const count = nextPowerOfTwo / stride / 2;
      const workgroups = Math.ceil(count / 32);
      return {
        bg: reduceMinMaxBindGroupFormat.instantiate({
          vecs: minmax,
          params: minMaxUniformsFormat.quickCreate({
            stride,
            count,
          }),
        }),
        stride,
        count,
        workgroups,
      };
    });

    console.log(steps);

    const initMinMaxBindGroup = initMinMaxBindGroupFormat.instantiate({
      bodies: params.bodies,
      vecs: minmax,
    });

    return {
      run: (pass: GPUComputePassEncoder) => {
        pass.setPipeline(initMinMaxPipeline);
        pass.setBindGroup(0, initMinMaxBindGroup);
        pass.dispatchWorkgroups(Math.ceil(nextPowerOfTwo / 32));

        pass.setPipeline(reduceMinMaxPipeline);
        for (const { workgroups, bg } of steps) {
          pass.setBindGroup(0, bg);
          pass.dispatchWorkgroups(workgroups);
        }
      },
      minmax,
    };
  }

  function setupAggregatedBodyPrefixSum(params: {
    bodies: ReturnType<typeof bodiesFormat.instantiate>;
    bodyOrder: ReturnType<typeof bodyOrderFormat.instantiate>;
    count: number;
  }) {
    const countWithExtra = params.count + 1;
    const countExponent = Math.ceil(Math.log2(countWithExtra));
    const nextPowerOfTwo = 2 ** countExponent;

    const iterSteps = countExponent;

    const aggBodies = aggregatedBodiesFormat.instantiate(nextPowerOfTwo);

    const setupDownstrokeUniforms =
      setupPrefixSumBodiesDownstrokeUniformFormat.quickCreate({
        end: nextPowerOfTwo,
      });

    const setupDownstrokeBindGroup =
      setupPrefixSumBodiesDownstrokeBindGroupFormat.instantiate({
        agg_bodies: aggBodies,
        params: setupDownstrokeUniforms,
      });

    const uniformBufs = range(iterSteps).map((i) =>
      prefixSumAggBodiesUniformFormat.quickCreate({
        count: nextPowerOfTwo,
        stride: 2 ** i,
      }),
    );

    const upstrokeBindGroups = range(iterSteps).map((i) =>
      prefixSumAggBodiesBindGroupFormat.instantiate({
        agg_bodies: aggBodies,
        params: uniformBufs[i],
      }),
    );

    const downstrokeBindGroups = range(iterSteps).map((i) =>
      prefixSumAggBodiesBindGroupFormat.instantiate({
        agg_bodies: aggBodies,
        params: uniformBufs[iterSteps - i - 1],
      }),
    );

    const initBg = initAggregatedBodiesBindGroupFormat.instantiate({
      agg_bodies: aggBodies,
      bodies: params.bodies,
      body_order: params.bodyOrder,
    });

    const dispatchCount = Math.ceil(nextPowerOfTwo / 32);

    return {
      run: (pass: GPUComputePassEncoder) => {
        pass.setPipeline(initAggregatedBodiesPipeline);
        pass.setBindGroup(0, initBg);
        pass.dispatchWorkgroups(dispatchCount);

        pass.setPipeline(prefixSumAggBodiesUpstrokePipeline);
        for (let i = 0; i < iterSteps; i++) {
          const dispatchCount = Math.ceil(nextPowerOfTwo / 2 ** i / 32);
          pass.setBindGroup(0, upstrokeBindGroups[i]);
          pass.dispatchWorkgroups(dispatchCount);
        }

        pass.setPipeline(setupPrefixSumBodiesDownstrokePipeline);
        pass.setBindGroup(0, setupDownstrokeBindGroup);
        pass.dispatchWorkgroups(1);

        pass.setPipeline(prefixSumAggBodiesDownstrokePipeline);
        for (let i = 0; i < iterSteps; i++) {
          const dispatchCount = Math.ceil(
            nextPowerOfTwo / 2 ** (iterSteps - i - i) / 32,
          );
          pass.setBindGroup(0, downstrokeBindGroups[i]);
          pass.dispatchWorkgroups(dispatchCount);
        }
      },
      aggBodies,
    };
  }

  function setupOctree(params: {
    bodies: ReturnType<typeof bodiesFormat.instantiate>;
    bodyCount: number;
    octreeCapacity: number;
    octreeDepth: number;
  }) {}

  const bodiesBuffer = bodiesFormat.quickCreateMany(bodiesData);
  const octreeNodeBuffer = octreeNodeFormat.quickCreateMany(octreeNodeData);
  const octreeMetadataBuffer =
    octreeMetadataFormat.quickCreateMany(octreeMetadata);
  const octreeCountersBuffer =
    octreeCountersFormat.quickCreateMany(octreeCounters);
  const bodiesOrderBuffer1 = bodyOrderFormat.quickCreateMany(bodiesOrder);
  const bodiesOrderBuffer2 = bodyOrderFormat.quickCreateMany(bodiesOrder);
  const nextfreesBuffer = nextfreesFormat.quickCreate(nextfrees);
  const nodeBodyAssignmentsBuffer =
    bodyNodeAssignmentsFormat.quickCreateMany(nodeBodyAssignments);
  const bodyNodeChildSubOffsetsBuffer =
    bodyNodeChildSubOffsetsFormat.quickCreateMany(bodyNodeChildSubOffsets);
  const activeNodesBuffer1 = bodyNodeAssignmentsFormat.instantiate(256);
  const activeNodesBuffer2 = bodyNodeAssignmentsFormat.instantiate(256);
  const activeNodesInfoBuffer =
    activeNodesInfoFormat.quickCreate(activeNodesInfo);
  const computeIndirectBuffer = computeIndirectBufferFormat.quickCreate({
    workgroups: [1, 1, 1],
  });

  const barnesHutUniforms = barnesHutUniformsFormat.quickCreate({
    min_width_over_distance_ratio: 0.1,
    timestep: 0.002,
  });

  const assignBodiesBindGroups = range(2).map((i) =>
    assignBodiesBindGroupFormat.instantiate({
      body_node_assignments: nodeBodyAssignmentsBuffer,
      body_node_child_sub_offsets: bodyNodeChildSubOffsetsBuffer,
      octree_counters: octreeCountersBuffer,
      octree_nodes: octreeNodeBuffer,
      body_order: [bodiesOrderBuffer1, bodiesOrderBuffer1][i],
      bodies: bodiesBuffer,
      octree_metadata: octreeMetadataBuffer,
    }),
  );

  const createNewNodesBindGroup = range(2).map((i) =>
    createNewNodesBindGroupFormat.instantiate({
      active_nodes_in: [activeNodesBuffer1, activeNodesBuffer2][i],
      active_nodes_out: [activeNodesBuffer2, activeNodesBuffer1][i],
      active_nodes_info: activeNodesInfoBuffer,
      nextfrees: nextfreesBuffer,
      octree_nodes: octreeNodeBuffer,
      octree_metadata: octreeMetadataBuffer,
      octree_counters:
        octreeCountersNonatomicFormat.reinterpret(octreeCountersBuffer),
    }),
  );

  const reorderBodiesBindGroups = range(2).map((i) =>
    reorderBodiesBindGroupFormat.instantiate({
      body_order_in: [bodiesOrderBuffer1, bodiesOrderBuffer2][i],
      body_order_out: [bodiesOrderBuffer2, bodiesOrderBuffer1][i],
      body_node_assignments: nodeBodyAssignmentsBuffer,
      body_node_child_sub_offsets: bodyNodeChildSubOffsetsBuffer,
      octree_nodes: octreeNodeBuffer,
      bodies: bodiesBuffer,
    }),
  );

  const setupNextIterationBindGroup =
    setupNextIterationBindGroupFormat.instantiate({
      compute_indirect: computeIndirectBuffer,
      nextfrees: nextfreesBuffer,
      active_nodes_info: activeNodesInfoBuffer,
    });

  const aggPrefixSum = setupAggregatedBodyPrefixSum({
    bodies: bodiesBuffer,
    count: bodiesData.length,
    bodyOrder: bodiesOrderBuffer1,
  });

  const minMaxReduce = setupMinMaxReduction({
    bodies: bodiesBuffer,
    count: bodiesData.length,
  });

  const aggregateMassInOctreeBindGroup =
    aggregateMassInOctreeBindGroupFormat.instantiate({
      octree_metadata: octreeMetadataBuffer,
      octree_nodes: octreeNodeBuffer,
      agg_bodies: aggPrefixSum.aggBodies,
      nextfrees: nextfreesNonatomicFormat.reinterpret(nextfreesBuffer),
    });

  const initRootNodeBindGroup = initRootNodeBindGroupFormat.instantiate({
    bodies: bodiesBuffer,
    octree_metadata: octreeMetadataBuffer,
    octree_nodes: octreeNodeBuffer,
    nextfrees: nextfreesNonatomicFormat.reinterpret(nextfreesBuffer),
    vecs: minMaxReduce.minmax,
    octree_counters:
      octreeCountersNonatomicFormat.reinterpret(octreeCountersBuffer),
  });

  const initPerBodyStateBindGroup = initPerBodyStateBindGroupFormat.instantiate(
    {
      body_order: bodiesOrderBuffer1,
      body_node_assignments: nodeBodyAssignmentsBuffer,
    },
  );

  const applyBarnesHutBindGroup = applyBarnesHutBindGroupFormat.instantiate({
    bodies: bodiesBuffer,
    octree_metadata: octreeMetadataBuffer,
    octree_nodes: octreeNodeBuffer,
    params: barnesHutUniforms,
  });

  const perBodyWorkgroupCount = Math.ceil(bodiesData.length / 32);

  const enc = device.createCommandEncoder();
  const pass = enc.beginComputePass();

  minMaxReduce.run(pass);

  pass.setPipeline(initRootNodePipeline);
  pass.setBindGroup(0, initRootNodeBindGroup);
  pass.dispatchWorkgroups(1, 1, 1);

  pass.setPipeline(initPerBodyStatePipeline);
  pass.setBindGroup(0, initPerBodyStateBindGroup);
  pass.dispatchWorkgroups(perBodyWorkgroupCount, 1, 1);

  for (let i = 0; i < 10; i++) {
    pass.setPipeline(assignBodiesPipeline);
    pass.setBindGroup(0, assignBodiesBindGroups[i % 2]);
    pass.dispatchWorkgroups(perBodyWorkgroupCount, 1, 1);

    pass.setPipeline(createNewNodesPipeline);
    pass.setBindGroup(0, createNewNodesBindGroup[i % 2]);
    pass.dispatchWorkgroupsIndirect(computeIndirectBuffer, 0);

    pass.setPipeline(reorderBodiesPipeline);
    pass.setBindGroup(0, reorderBodiesBindGroups[i % 2]);
    pass.dispatchWorkgroups(perBodyWorkgroupCount, 1, 1);

    pass.setPipeline(setupNextIterationPipeline);
    pass.setBindGroup(0, setupNextIterationBindGroup);
    pass.dispatchWorkgroups(1, 1, 1);
  }

  aggPrefixSum.run(pass);

  pass.setPipeline(aggregateMassInOctreePipeline);
  pass.setBindGroup(0, aggregateMassInOctreeBindGroup);
  pass.dispatchWorkgroups(1, 1, 1);

  pass.setPipeline(applyBarnesHutPipeline);
  pass.setBindGroup(0, applyBarnesHutBindGroup);
  pass.dispatchWorkgroups(perBodyWorkgroupCount, 1, 1);

  pass.end();
  device.queue.submit([enc.finish()]);

  console.log(
    "body-to-node assignments",
    await quickMapWithFormat(
      bodyNodeAssignmentsFormat.format,
      device,
      nodeBodyAssignmentsBuffer,
    ),
  );

  // console.log(
  //   "octree nodes",
  //   await quickMapWithFormat(octreeNodeFormat.format, device, octreeNodeBuffer),
  // );
  // console.log(
  //   "octree metadata",
  //   await quickMapWithFormat(
  //     octreeMetadataFormat.format,
  //     device,
  //     octreeMetadataBuffer,
  //   ),
  // );
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
  console.log(
    "bodies",
    await quickMapWithFormat(bodiesFormat.format, device, bodiesBuffer),
  );

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

  // const vertices = lines.pointInstanceBufferFormat.quickCreate(
  //   bodiesData.map((v, i) => ({
  //     position: v.position,
  //     color: [255, 255, 255, 255],
  //     size: v.mass * 0.01,
  //   })),
  //   {
  //     usage:
  //       GPUBufferUsage.VERTEX |
  //       GPUBufferUsage.COPY_DST |
  //       GPUBufferUsage.COPY_SRC |
  //       GPUBufferUsage.STORAGE,
  //   },
  // );

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
      const pass = enc.beginComputePass();

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
