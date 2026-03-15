import {
  array,
  hookGPUDevice,
  quickMapWithFormat,
  range,
  struct,
  Vec3,
  WGSLStructValues,
  wrapDevice,
} from "../../src";

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

  const octreeNodeMetadataFormat = wdevice.storageBuffer(
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

  const assignBodiesBindGroupFormat = wdevice.bindGroup(
    "bg",
    bodyNodeAssignmentsFormat,
    bodyNodeChildSubOffsetsFormat,
    octreeNodeFormat,
    octreeCountersFormat,
    bodyOrderFormat,
    bodiesFormat,
    octreeNodeMetadataFormat,
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
    octreeNodeMetadataFormat,
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
        octree_nodes[child_node_idx].child_idx = 
          atomicAdd(&nextfrees.node, 8u);
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

  const reduceAggregatedBodiesUniformFormat = wdevice.uniformBuffer(
    "params",
    struct("Params", {
      src_idx: "u32",
      dst_idx: "u32",
      count: "u32",
    }),
    false,
    {
      visibility: GPUShaderStage.COMPUTE,
    },
  );

  const reduceAggregatedBodiesBindGroupFormat = wdevice.bindGroup(
    "bg",
    reduceAggregatedBodiesUniformFormat,
    aggregatedBodiesFormat,
  );

  const reduceAggregatedBodiesPipeline = await wdevice.compute({
    bindGroups: [reduceAggregatedBodiesBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
      if (id.x >= params.count) {
        return; 
      }
      let dst_idx = params.dst_idx + id.x;
      let src_idx = params.src_idx + id.x * 2u;

      let mass1 = 
        agg_bodies[src_idx].mass;
      let mass2 = 
        agg_bodies[src_idx + 1u].mass;
      
      let cm1 = 
        agg_bodies[src_idx].center_of_mass;
      let cm2 = 
        agg_bodies[src_idx + 1u].center_of_mass;

      agg_bodies[dst_idx].mass = mass1 + mass2;
      agg_bodies[dst_idx].center_of_mass =
        (cm1 * mass1 + cm2 * mass2) / (mass1 + mass2);
    `,
  });

  const initAggregatedBodiesBindGroupFormat = wdevice.bindGroup(
    "bg",
    aggregatedBodiesFormat,
    bodiesFormat,
  );

  const initAggregatedBodiesPipeline = await wdevice.compute({
    bindGroups: [initAggregatedBodiesBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= arraySize(&bodies)) {
      return; 
    } 

    agg_bodies[id.x].mass = bodies[id.x].mass;
    agg_bodies[id.x].center_of_mass = bodies[id.x].position;
    `,
  });

  const aggregateMassInOctree = await wdevice.compute({
    bindGroups: [] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= arraySize()) {
      return; 
    }

    let node = octree_nodes[id.x];
    let start = node.data_start_idx;
    let end = node.data_end_idx;
    octree_metadata[node.metadata_idx];
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
      mass: 1,
      velocity: [0, 0, 0],
      position: [0.9, 0.9, 0.9],
      impulse: [0, 0, 0],
    },
    {
      mass: 1,
      velocity: [0, 0, 0],
      position: [0.3, 0.3, 0.3],
      impulse: [0, 0, 0],
    },
    {
      mass: 1,
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

  const octreeMetadata: WGSLStructValues<
    typeof octreeNodeMetadataFormat.format
  >[] = [
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

  const bodiesBuffer = bodiesFormat.quickCreateMany(bodiesData);
  const octreeNodeBuffer = octreeNodeFormat.quickCreateMany(octreeNodeData);
  const octreeMetadataBuffer =
    octreeNodeMetadataFormat.quickCreateMany(octreeMetadata);
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

  const computeIndirectBuffer = computeIndirectBufferFormat.instantiate(1);

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

  const enc = device.createCommandEncoder();
  const pass = enc.beginComputePass();

  pass.setPipeline(assignBodiesPipeline);
  pass.setBindGroup(0, assignBodiesBindGroups[0]);
  pass.dispatchWorkgroups(1, 1, 1);

  pass.setPipeline(createNewNodesPipeline);
  pass.setBindGroup(0, createNewNodesBindGroup[0]);
  pass.dispatchWorkgroups(1, 1, 1);

  pass.setPipeline(reorderBodiesPipeline);
  pass.setBindGroup(0, reorderBodiesBindGroups[0]);
  pass.dispatchWorkgroups(1, 1, 1);

  pass.setPipeline(setupNextIterationPipeline);
  pass.setBindGroup(0, setupNextIterationBindGroup);
  pass.dispatchWorkgroups(1, 1, 1);

  pass.setPipeline(assignBodiesPipeline);
  pass.setBindGroup(0, assignBodiesBindGroups[1]);
  pass.dispatchWorkgroups(1, 1, 1);

  pass.setPipeline(createNewNodesPipeline);
  pass.setBindGroup(0, createNewNodesBindGroup[1]);
  pass.dispatchWorkgroups(1, 1, 1);

  pass.setPipeline(reorderBodiesPipeline);
  pass.setBindGroup(0, reorderBodiesBindGroups[1]);
  pass.dispatchWorkgroups(1, 1, 1);

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

  console.log(
    "octree nodes",
    await quickMapWithFormat(octreeNodeFormat.format, device, octreeNodeBuffer),
  );
  console.log(
    "octree metadata",
    await quickMapWithFormat(
      octreeNodeMetadataFormat.format,
      device,
      octreeMetadataBuffer,
    ),
  );
  console.log(
    "octree counters",
    await quickMapWithFormat(
      octreeCountersFormat.format,
      device,
      octreeCountersBuffer,
    ),
  );
  console.log(
    "body order in",
    await quickMapWithFormat(
      bodyOrderFormat.format,
      device,
      bodiesOrderBuffer2,
    ),
  );
  console.log(
    "body order ouot",
    await quickMapWithFormat(
      bodyOrderFormat.format,
      device,
      bodiesOrderBuffer1,
    ),
  );
})();
