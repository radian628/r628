import {
  array,
  range,
  runtimeArray,
  struct,
  WGSL_TYPE_ALIGNMENTS,
  WGSLStructSpec,
} from "../../src";
import { TypedBindGroupEntry } from "../../src/webgpu/easygpu/bind-group";
import { typeDevice } from "../../src/webgpu/easygpu/easygpu";

export async function createNBodyOctreeDefs<
  ExtraBodyFields extends Record<
    string,
    keyof typeof WGSL_TYPE_ALIGNMENTS | WGSLStructSpec
  >,
  ExtraPhysicsBuffers extends TypedBindGroupEntry[],
>(
  device: GPUDevice,
  params: {
    extraBodyFields: ExtraBodyFields;
    bodyBodyInteraction: string;
    applyForces: string;
    bodyReset?: string;
    extraPhysicsBuffers: ExtraPhysicsBuffers;
  },
) {
  const td = typeDevice(device);

  const octreeNodeFormat = td.storageBufferFormat(
    "octree_nodes",
    runtimeArray(
      struct("OctreeNode", {
        child_idx: "u32",
        data_start_idx: "u32",
        data_end_idx: "u32",
        metadata_idx: "u32",
      }),
    ),
  );

  const octreeMetadataFormat = td.storageBufferFormat(
    "octree_metadata",
    runtimeArray(
      struct("OctreeMetadata", {
        min_corner: "vec3f",
        counters_idx: "u32",
        max_corner: "vec3f",
        mass: "f32",
        center_of_mass: "vec3f",
      }),
    ),
  );

  const octreeCountersFormat = td.storageBufferFormat(
    "octree_counters",
    runtimeArray(
      struct("OctreeCounters", {
        counters: array(8, "atomic<u32>"),
      }),
    ),
  );
  const octreeCountersNonatomicFormat = td.storageBufferFormat(
    "octree_counters",
    runtimeArray(
      struct("OctreeCounters", {
        counters: array(8, "u32"),
      }),
    ),
  );

  const bodiesFormat = td.storageBufferFormat(
    "bodies",
    runtimeArray(
      // @ts-expect-error
      struct("Body", {
        position: "vec3f",
        mass: "f32",
        velocity: "vec3f",
        ...params.extraBodyFields,
      }),
    ),
  );

  const aggregatedBodiesFormat = td.storageBufferFormat(
    "agg_bodies",
    runtimeArray(
      struct("AggBody", {
        center_of_mass: "vec3f",
        mass: "f32",
      }),
    ),
  );

  const createNewNodesUniforms = td.uniformBufferComputeFormat(
    "params",
    struct("Params", {
      is_final_iter: "u32",
    }),
  );

  const nextfreesFormat = td.storageBufferFormat(
    "nextfrees",
    struct("Nextfrees", {
      node: "atomic<u32>",
      node_metadata: "atomic<u32>",
      counters: "atomic<u32>",
      active_nodes_index: "atomic<u32>",
    }),
  );

  const nextfreesNonatomicFormat = td.storageBufferFormat(
    "nextfrees",
    struct("Nextfrees", {
      node: "u32",
      node_metadata: "u32",
      counters: "u32",
      active_nodes_index: "u32",
    }),
  );

  const bodyNodeAssignmentsFormat = td.storageBufferFormat(
    "body_node_assignments",
    runtimeArray("u32"),
  );
  const bodyNodeChildSubOffsetsFormat = bodyNodeAssignmentsFormat.name(
    "body_node_child_sub_offsets",
  );

  const activeNodesInfoFormat = td.storageBufferFormat(
    "active_nodes_info",
    struct("ActiveNodesInfo", {
      count: "u32",
    }),
  );

  const bodyOrderFormat = td.storageBufferFormat(
    "body_order",
    runtimeArray("u32"),
  );
  const bodyOrderInFormat = bodyOrderFormat.name("body_order_in");
  const bodyOrderOutFormat = bodyOrderFormat.name("body_order_out");

  const activeNodesInFormat = bodyNodeAssignmentsFormat.name("active_nodes_in");
  const activeNodesOutFormat =
    bodyNodeAssignmentsFormat.name("active_nodes_out");

  const computeIndirectBufferFormat = td
    .storageBufferFormat(
      "compute_indirect",
      struct("ComputeIndirect", {
        workgroups: "vec3u",
      }),
    )
    .usage("indirect", "copy-dst", "storage");

  const barnesHutUniformsFormat = td.uniformBufferComputeFormat(
    "params",
    struct("Params", {
      min_width_over_distance_ratio: "f32",
      timestep: "f32",
    }),
  );

  const minMaxFormat = td.storageBufferFormat(
    "vecs",
    runtimeArray(
      struct("MinMax", {
        min: "vec3f",
        max: "vec3f",
      }),
    ),
  );

  const minMaxUniformsFormat = td.uniformBufferComputeFormat(
    "params",
    struct("Params", {
      stride: "u32",
      count: "u32",
    }),
  );

  const assignBodiesBindGroupFormat = td.bindGroupFormat(
    "bg",
    bodyNodeAssignmentsFormat,
    bodyNodeChildSubOffsetsFormat,
    octreeNodeFormat,
    octreeCountersFormat,
    bodyOrderFormat,
    bodiesFormat,
    octreeMetadataFormat,
  );

  const assignBodiesPipeline = await td.computePipeline({
    bindGroups: [assignBodiesBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= arrayLength(&body_node_assignments)) {
      return; 
    }

    let body_idx = body_order[id.x];
    let body = bodies[body_idx];
    let parent_node_idx = body_node_assignments[body_idx];
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
  
    body_node_child_sub_offsets[body_idx] = 
      atomicAdd(
        &octree_counters[parent_node_metadata.counters_idx].counters[child_offset],
        1u
      );

    body_node_assignments[body_idx] = 
      parent_node.child_idx + child_offset;
    `,
  });

  const createNewNodesBindGroupFormat = td.bindGroupFormat(
    "bg",
    activeNodesInFormat,
    activeNodesOutFormat,
    octreeMetadataFormat,
    nextfreesFormat,
    octreeNodeFormat,
    octreeCountersNonatomicFormat,
    activeNodesInfoFormat,
    createNewNodesUniforms,
  );

  const createNewNodesPipeline = await td.computePipeline({
    bindGroups: [createNewNodesBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= active_nodes_info.count) {
      return; 
    } 

    let parent_node_idx = active_nodes_in[id.x];
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

      if (parent_node_counters[i] > 1u && params.is_final_iter == 0u) {
        let counter_idx = 
          atomicAdd(&nextfrees.counters, 1u);
        octree_metadata[metadata_idx].counters_idx = counter_idx;
        octree_counters[counter_idx].counters = array(0,0,0,0,0,0,0,0);

        let child_idx = 
          atomicAdd(&nextfrees.node, 8u);
        for (var i = 0u; i < 8; i += 1) {
          octree_nodes[child_idx + i].data_start_idx = 0u; 
          octree_nodes[child_idx + i].data_end_idx = 0u; 
        }
        octree_nodes[child_node_idx].child_idx = child_idx;

        let active_idx = atomicAdd(&nextfrees.active_nodes_index, 1u);
        active_nodes_out[active_idx] = child_node_idx;
      }
    }

    `,
  });

  const reorderBodiesBindGroupFormat = td.bindGroupFormat(
    "bg",
    bodyOrderInFormat,
    bodyOrderOutFormat,
    bodyNodeAssignmentsFormat,
    bodyNodeChildSubOffsetsFormat,
    octreeNodeFormat,
    bodiesFormat,
  );

  const reorderBodiesPipeline = await td.computePipeline({
    bindGroups: [reorderBodiesBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= arrayLength(&body_node_assignments)) {
      return; 
    }

    let body_idx = body_order_in[id.x];
    let body = bodies[body_idx];

    let node_idx = body_node_assignments[body_idx];
    let node = octree_nodes[node_idx];
    let start = node.data_start_idx;
    let sub_offset = body_node_child_sub_offsets[body_idx];

    body_order_out[start + sub_offset] = body_idx;
    `,
  });

  const setupNextIterationBindGroupFormat = td.bindGroupFormat(
    "bg",
    computeIndirectBufferFormat,
    nextfreesFormat,
    activeNodesInfoFormat,
  );

  const setupNextIterationPipeline = await td.computePipeline({
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

  const prefixSumAggBodiesUniformFormat = td.uniformBufferComputeFormat(
    "params",
    struct("Params", {
      stride: "u32",
      count: "u32",
    }),
  );

  const prefixSumAggBodiesBindGroupFormat = td.bindGroupFormat(
    "bg",
    prefixSumAggBodiesUniformFormat,
    aggregatedBodiesFormat,
  );

  const prefixSumAggBodiesUpstrokePipeline = await td.computePipeline({
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
    td.uniformBufferComputeFormat(
      "params",
      struct("Params", {
        end: "u32",
      }),
    );

  const setupPrefixSumBodiesDownstrokeBindGroupFormat =
    await td.bindGroupFormat(
      "bg",
      aggregatedBodiesFormat,
      setupPrefixSumBodiesDownstrokeUniformFormat,
    );

  const setupPrefixSumBodiesDownstrokePipeline = await td.computePipeline({
    bindGroups: [setupPrefixSumBodiesDownstrokeBindGroupFormat] as const,
    workgroupSize: [1, 1, 1],
    shader: `
    agg_bodies[params.end - 1].mass = 0;
    agg_bodies[params.end - 1].center_of_mass = vec3f(0.0);
    `,
  });

  const prefixSumAggBodiesDownstrokePipeline = await td.computePipeline({
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

  const initAggregatedBodiesBindGroupFormat = td.bindGroupFormat(
    "bg",
    aggregatedBodiesFormat,
    bodiesFormat,
    bodyOrderFormat,
  );

  const initAggregatedBodiesPipeline = await td.computePipeline({
    bindGroups: [initAggregatedBodiesBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= arrayLength(&agg_bodies)) {
      return; 
    }

    if (id.x < arrayLength(&bodies)) {
      let body_idx = body_order[id.x];

      agg_bodies[id.x].mass = bodies[body_idx].mass;
      agg_bodies[id.x].center_of_mass = bodies[body_idx].position;
    } else {
      agg_bodies[id.x].mass = 0.0;
      agg_bodies[id.x].center_of_mass = vec3f(0.0);
    }

    `,
  });

  const aggregateMassInOctreeBindGroupFormat = td.bindGroupFormat(
    "bg",
    octreeNodeFormat,
    octreeMetadataFormat,
    aggregatedBodiesFormat,
    nextfreesNonatomicFormat,
  );

  const aggregateMassInOctreePipeline = await td.computePipeline({
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

  const applyBarnesHutBindGroupFormat = td.bindGroupFormat(
    "bg",
    bodiesFormat,
    octreeNodeFormat,
    octreeMetadataFormat,
    barnesHutUniformsFormat,
    ...params.extraPhysicsBuffers,
  );

  const applyBarnesHutPipeline = await td.computePipeline({
    bindGroups: [applyBarnesHutBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    globals: `
      struct StackFrame {
        node_idx: u32,
        next_child_idx: u32,
      } 
      
      fn body_body_interaction(i: u32, mass: f32, center_of_mass: vec3f, dist_to_body: f32) -> vec3f {
        ${params.bodyBodyInteraction} 
      }

      fn apply_forces(i: u32, total_impulse: vec3f) {
        ${params.applyForces} 
      }

      fn body_reset(i: u32) {
        ${params.bodyReset ?? ""} 
      }

      const STACK_CAP = 20u;
    `,
    shader: `
      if (id.x >= arrayLength(&bodies)) {
        return; 
      }
    
      var stack: array<StackFrame, STACK_CAP>;
      var stack_size = 1u;

      var total_impulse = vec3f(0.0);

      body_reset(id.x);
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
        
        if (child.child_idx != 0xffffffff && ratio > params.min_width_over_distance_ratio && stack_size < STACK_CAP) {
          stack[stack_size].node_idx = child_idx;
          stack[stack_size].next_child_idx = 0u;
          stack_size += 1u;
        } else {
          total_impulse += body_body_interaction(
            id.x, 
            child_metadata.mass,
            child_metadata.center_of_mass,
            dist_to_body
          );
        }
      }

      apply_forces(id.x, total_impulse);
    `,
  });

  const reduceMinMaxBindGroupFormat = td.bindGroupFormat(
    "bg",
    minMaxFormat,
    minMaxUniformsFormat,
  );

  const reduceMinMaxPipeline = await td.computePipeline({
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

  const initMinMaxBindGroupFormat = td.bindGroupFormat(
    "bg",
    bodiesFormat,
    minMaxFormat,
  );

  const initMinMaxPipeline = await td.computePipeline({
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

  const initRootNodeBindGroupFormat = td.bindGroupFormat(
    "bg",
    bodiesFormat,
    minMaxFormat,
    octreeNodeFormat,
    octreeMetadataFormat,
    octreeCountersNonatomicFormat,
    nextfreesNonatomicFormat,
    activeNodesInfoFormat,
    activeNodesInFormat,
  );

  const initRootNodePipeline = await td.computePipeline({
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

    for (var i = 1u; i < 9u; i += 1) {
      octree_nodes[i].data_start_idx = 0u; 
      octree_nodes[i].data_end_idx = 0u; 
      octree_nodes[i].child_idx = 0u; 
      octree_nodes[i].metadata_idx = 0u; 
    }

    nextfrees.node = 9u;
    nextfrees.node_metadata = 1u;
    nextfrees.counters = 1u;
    nextfrees.active_nodes_index = 0u;

    active_nodes_info.count = 1u;
    active_nodes_in[0] = 0u;
    `,
  });

  const initRootNodeBindGroup2Format = td.bindGroupFormat(
    "bg",
    computeIndirectBufferFormat,
  );

  const initRootNodePipeline2 = await td.computePipeline({
    bindGroups: [initRootNodeBindGroup2Format],
    workgroupSize: [1, 1, 1],
    shader: `
    compute_indirect.workgroups = vec3u(1, 1, 1);
    `,
  });

  const initPerBodyStateBindGroupFormat = td.bindGroupFormat(
    "bg",
    bodyOrderFormat,
    bodyNodeAssignmentsFormat,
  );

  const initPerBodyStatePipeline = await td.computePipeline({
    bindGroups: [initPerBodyStateBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= arrayLength(&body_order)) {
      return;
    }

    body_order[id.x] = id.x;
    body_node_assignments[id.x] = 0u;
    `,
  });

  function setupMinMaxReduction(params: {
    bodies: ReturnType<typeof bodiesFormat.new>;
    count: number;
  }) {
    const countExponent = Math.ceil(Math.log2(params.count));
    const nextPowerOfTwo = 2 ** countExponent;
    const iterSteps = countExponent;

    const minmax = minMaxFormat.new(nextPowerOfTwo);

    const steps = range(iterSteps).map((i) => {
      const stride = 2 ** i;
      const count = nextPowerOfTwo / stride / 2;
      const workgroups = Math.ceil(count / 32);
      return {
        bg: reduceMinMaxBindGroupFormat.new({
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

    const initMinMaxBindGroup = initMinMaxBindGroupFormat.new({
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
    bodies: ReturnType<typeof bodiesFormat.new>;
    bodyOrder: ReturnType<typeof bodyOrderFormat.new>;
    count: number;
  }) {
    const countWithExtra = params.count + 1;
    const countExponent = Math.ceil(Math.log2(countWithExtra));
    const nextPowerOfTwo = 2 ** countExponent;

    const iterSteps = countExponent;

    const aggBodies = aggregatedBodiesFormat.new(nextPowerOfTwo);

    const setupDownstrokeUniforms =
      setupPrefixSumBodiesDownstrokeUniformFormat.quickCreate({
        end: nextPowerOfTwo,
      });

    const setupDownstrokeBindGroup =
      setupPrefixSumBodiesDownstrokeBindGroupFormat.new({
        agg_bodies: aggBodies,
        params: setupDownstrokeUniforms,
      });

    const uniformBufs = range(iterSteps).map((i) =>
      prefixSumAggBodiesUniformFormat.quickCreate({
        count: nextPowerOfTwo / 2 ** i,
        stride: 2 ** i,
      }),
    );

    const upstrokeBindGroups = range(iterSteps).map((i) =>
      prefixSumAggBodiesBindGroupFormat.new({
        agg_bodies: aggBodies,
        params: uniformBufs[i],
      }),
    );

    const downstrokeBindGroups = range(iterSteps).map((i) =>
      prefixSumAggBodiesBindGroupFormat.new({
        agg_bodies: aggBodies,
        params: uniformBufs[iterSteps - i - 1],
      }),
    );

    const initBg = initAggregatedBodiesBindGroupFormat.new({
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
            nextPowerOfTwo / 2 ** (iterSteps - i - 1) / 32,
          );
          pass.setBindGroup(0, downstrokeBindGroups[i]);
          pass.dispatchWorkgroups(dispatchCount);
        }
      },
      aggBodies,
    };
  }

  function setupOctree(params: {
    bodies: ReturnType<typeof bodiesFormat.new>;
    // extraPhysicsBuffers: BindGroupEntriesToBindGroups<
    //   FromEntries<ToKvPairs<ExtraPhysicsBuffers, "name">>
    // >;
    bodyCount: number;
    octreeCapacity: number;
    octreeDepth: number;
  }) {
    const octreeNodeBuffer = octreeNodeFormat.new(params.octreeCapacity);
    const octreeMetadataBuffer = octreeMetadataFormat.new(
      params.octreeCapacity,
    );
    const octreeCountersBuffer = octreeCountersFormat.new(
      params.octreeCapacity,
    );
    const bodiesOrderBuffer1 = bodyOrderFormat.new(params.bodyCount);
    const bodiesOrderBuffer2 = bodyOrderFormat.new(params.bodyCount);
    const nextfreesBuffer = nextfreesFormat.new(1);
    const nodeBodyAssignmentsBuffer = bodyNodeAssignmentsFormat.new(
      params.bodyCount,
    );
    const bodyNodeChildSubOffsetsBuffer = bodyNodeChildSubOffsetsFormat.new(
      params.bodyCount,
    );
    const activeNodesBuffer1 = bodyNodeAssignmentsFormat.new(
      params.octreeCapacity,
    );
    const activeNodesBuffer2 = bodyNodeAssignmentsFormat.new(
      params.octreeCapacity,
    );
    const activeNodesInfoBuffer = activeNodesInfoFormat.new(1);
    const computeIndirectBuffer = computeIndirectBufferFormat.new(1);
    const nonfinalIterBuffer = createNewNodesUniforms.quickCreate({
      is_final_iter: 0,
    });
    const finalIterBuffer = createNewNodesUniforms.quickCreate({
      is_final_iter: 1,
    });

    const assignBodiesBindGroups = range(2).map((i) =>
      assignBodiesBindGroupFormat.new({
        body_node_assignments: nodeBodyAssignmentsBuffer,
        body_node_child_sub_offsets: bodyNodeChildSubOffsetsBuffer,
        octree_counters: octreeCountersBuffer,
        octree_nodes: octreeNodeBuffer,
        body_order: [bodiesOrderBuffer1, bodiesOrderBuffer1][i],
        bodies: params.bodies,
        octree_metadata: octreeMetadataBuffer,
      }),
    );

    const createNewNodesBindGroup = range(2).map((j) =>
      range(2).map((i) =>
        createNewNodesBindGroupFormat.new({
          active_nodes_in: [activeNodesBuffer1, activeNodesBuffer2][i],
          active_nodes_out: [activeNodesBuffer2, activeNodesBuffer1][i],
          active_nodes_info: activeNodesInfoBuffer,
          nextfrees: nextfreesBuffer,
          octree_nodes: octreeNodeBuffer,
          octree_metadata: octreeMetadataBuffer,
          octree_counters:
            octreeCountersNonatomicFormat.reinterpret(octreeCountersBuffer),
          params: [nonfinalIterBuffer, finalIterBuffer][j],
        }),
      ),
    );

    const reorderBodiesBindGroups = range(2).map((i) =>
      reorderBodiesBindGroupFormat.new({
        body_order_in: [bodiesOrderBuffer1, bodiesOrderBuffer2][i],
        body_order_out: [bodiesOrderBuffer2, bodiesOrderBuffer1][i],
        body_node_assignments: nodeBodyAssignmentsBuffer,
        body_node_child_sub_offsets: bodyNodeChildSubOffsetsBuffer,
        octree_nodes: octreeNodeBuffer,
        bodies: params.bodies,
      }),
    );

    const setupNextIterationBindGroup = setupNextIterationBindGroupFormat.new({
      compute_indirect: computeIndirectBuffer,
      nextfrees: nextfreesBuffer,
      active_nodes_info: activeNodesInfoBuffer,
    });

    const aggPrefixSum = setupAggregatedBodyPrefixSum({
      bodies: params.bodies,
      count: params.bodyCount,
      bodyOrder: bodiesOrderBuffer1,
    });

    const minMaxReduce = setupMinMaxReduction({
      bodies: params.bodies,
      count: params.bodyCount,
    });

    const initRootNodeBindGroup = initRootNodeBindGroupFormat.new({
      bodies: params.bodies,
      octree_metadata: octreeMetadataBuffer,
      octree_nodes: octreeNodeBuffer,
      nextfrees: nextfreesNonatomicFormat.reinterpret(nextfreesBuffer),
      vecs: minMaxReduce.minmax,
      octree_counters:
        octreeCountersNonatomicFormat.reinterpret(octreeCountersBuffer),
      active_nodes_info: activeNodesInfoBuffer,
      active_nodes_in: activeNodesBuffer1,
    });
    const initRootNodeBindGroup2 = initRootNodeBindGroup2Format.new({
      compute_indirect: computeIndirectBuffer,
    });

    const initPerBodyStateBindGroup = initPerBodyStateBindGroupFormat.new({
      body_order: bodiesOrderBuffer1,
      body_node_assignments: nodeBodyAssignmentsBuffer,
    });

    const aggregateMassInOctreeBindGroup =
      aggregateMassInOctreeBindGroupFormat.new({
        octree_metadata: octreeMetadataBuffer,
        octree_nodes: octreeNodeBuffer,
        agg_bodies: aggPrefixSum.aggBodies,
        nextfrees: nextfreesNonatomicFormat.reinterpret(nextfreesBuffer),
      });

    const perBodyWorkgroupCount = Math.ceil(params.bodyCount / 32);

    return {
      octreeNodeBuffer,
      octreeMetadataBuffer,
      octreeCountersBuffer,
      bodiesOrderBuffer1,
      bodiesOrderBuffer2,
      nextfreesBuffer,
      nodeBodyAssignmentsBuffer,
      bodyNodeChildSubOffsetsBuffer,
      activeNodesBuffer1,
      activeNodesBuffer2,
      activeNodesInfoBuffer,
      clear: (enc: GPUCommandEncoder) => {
        enc.clearBuffer(octreeNodeBuffer);
        enc.clearBuffer(octreeMetadataBuffer);
        enc.clearBuffer(octreeCountersBuffer);
        enc.clearBuffer(bodiesOrderBuffer1);
        enc.clearBuffer(bodiesOrderBuffer2);
        enc.clearBuffer(nextfreesBuffer);
        enc.clearBuffer(nodeBodyAssignmentsBuffer);
        enc.clearBuffer(bodyNodeChildSubOffsetsBuffer);
        enc.clearBuffer(activeNodesBuffer1);
        enc.clearBuffer(activeNodesBuffer2);
        enc.clearBuffer(activeNodesInfoBuffer);
      },
      run: (pass: GPUComputePassEncoder) => {
        minMaxReduce.run(pass);

        pass.setPipeline(initRootNodePipeline);
        pass.setBindGroup(0, initRootNodeBindGroup);
        pass.dispatchWorkgroups(1, 1, 1);

        pass.setPipeline(initRootNodePipeline2);
        pass.setBindGroup(0, initRootNodeBindGroup2);
        pass.dispatchWorkgroups(1, 1, 1);

        pass.setPipeline(initPerBodyStatePipeline);
        pass.setBindGroup(0, initPerBodyStateBindGroup);
        pass.dispatchWorkgroups(perBodyWorkgroupCount, 1, 1);

        for (let i = 0; i < params.octreeDepth; i++) {
          pass.setPipeline(assignBodiesPipeline);
          pass.setBindGroup(0, assignBodiesBindGroups[i % 2]);
          pass.dispatchWorkgroups(perBodyWorkgroupCount, 1, 1);

          pass.setPipeline(createNewNodesPipeline);
          pass.setBindGroup(
            0,
            createNewNodesBindGroup[i === params.octreeDepth - 1 ? 1 : 0][
              i % 2
            ],
          );
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
        pass.dispatchWorkgroups(params.octreeCapacity / 32, 1, 1);
      },
    };
  }

  return {
    octreeNodeFormat,
    octreeMetadataFormat,
    octreeCountersFormat,
    octreeCountersNonatomicFormat,
    bodiesFormat,
    aggregatedBodiesFormat,
    nextfreesFormat,
    nextfreesNonatomicFormat,
    bodyNodeAssignmentsFormat,
    bodyNodeChildSubOffsetsFormat,
    activeNodesInfoFormat,
    bodyOrderFormat,
    bodyOrderInFormat,
    bodyOrderOutFormat,
    activeNodesInFormat,
    activeNodesOutFormat,
    computeIndirectBufferFormat,
    barnesHutUniformsFormat,
    minMaxFormat,
    minMaxUniformsFormat,
    prefixSumAggBodiesUniformFormat,
    setupPrefixSumBodiesDownstrokeUniformFormat,

    assignBodiesBindGroupFormat,
    assignBodiesPipeline,

    createNewNodesBindGroupFormat,
    createNewNodesPipeline,

    reorderBodiesBindGroupFormat,
    reorderBodiesPipeline,

    setupNextIterationBindGroupFormat,
    setupNextIterationPipeline,

    prefixSumAggBodiesBindGroupFormat,
    prefixSumAggBodiesUpstrokePipeline,
    prefixSumAggBodiesDownstrokePipeline,

    setupPrefixSumBodiesDownstrokeBindGroupFormat,
    setupPrefixSumBodiesDownstrokePipeline,

    initAggregatedBodiesBindGroupFormat,
    initAggregatedBodiesPipeline,

    aggregateMassInOctreeBindGroupFormat,
    aggregateMassInOctreePipeline,

    applyBarnesHutBindGroupFormat,
    applyBarnesHutPipeline,

    reduceMinMaxBindGroupFormat,
    reduceMinMaxPipeline,

    initMinMaxBindGroupFormat,
    initMinMaxPipeline,

    initRootNodeBindGroupFormat,
    initRootNodePipeline,

    initRootNodeBindGroup2Format,
    initRootNodePipeline2,

    initPerBodyStateBindGroupFormat,
    initPerBodyStatePipeline,

    setupAggregatedBodyPrefixSum,
    setupMinMaxReduction,
    setupOctree,
  };
}
