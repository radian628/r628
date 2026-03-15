import {
  argmin,
  array,
  createWgslSerializers,
  distance3,
  generateLayouts,
  hookGPUDevice,
  quickMap,
  quickMapWithFormat,
  range,
  readWgslLayout,
  struct,
  Vec3,
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

  const octreeNodeStruct = struct("OctreeNode", {
    child_idx: "u32",
    data_idx: "u32",
  });
  const octreeNodesFormat = wdevice.storageBuffer(
    "octree_nodes",
    octreeNodeStruct,
  );

  const octreeDataStruct = struct("OctreeData", {
    min_bounds: "vec3f",
    point_idx: "u32",
    max_bounds: "vec3f",
  });
  const octreeDataFormat = wdevice.storageBuffer(
    "octree_data",
    octreeDataStruct,
  );

  const octreeMutexStruct = struct("OctreeMutex", {
    mutex: "atomic<u32>",
  });
  const octreeMutexFormat = wdevice.storageBuffer(
    "octree_mutex",
    octreeMutexStruct,
  );

  const octreeDeferredThreadStruct = struct("OctreeDeferredThread", {
    point_idx: "u32",
    root_node_idx: "u32",
  });
  const octreeDeferredThreadFormat = wdevice.storageBuffer(
    "octree_deferred_threads",
    octreeDeferredThreadStruct,
  );

  const octreeNextfreePointersStruct = struct("OctreeNextfreePointers", {
    node: "atomic<u32>",
    data: "atomic<u32>",
    deferred_thread: "atomic<u32>",
  });
  const octreeNextfreePointersFormat = wdevice.storageBuffer(
    "octree_nextfree_pointers",
    octreeNextfreePointersStruct,
    { arrayify: false },
  );

  const octreeNextfreePointersNonatomicStruct = struct(
    "OctreeNextfreePointers",
    {
      node: "u32",
      data: "u32",
      deferred_thread: "u32",
    },
  );
  const octreeNextfreePointersNonatomicFormat = wdevice.storageBuffer(
    "octree_nextfree_pointers",
    octreeNextfreePointersNonatomicStruct,
    { arrayify: false },
  );

  const pointFormat = wdevice.storageBuffer(
    "points",
    struct("Point", {
      pos: "vec3f",
      mass: "f32",
      vel: "vec3f",
    }),
  );

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

  const deferredThreadCountBufferFormat = wdevice.storageBuffer(
    "deferred_thread_count",
    struct("DeferredThreadCount", {
      count: "u32",
    }),
    {
      arrayify: false,
    },
  );

  const constructOctreeBindGroupFormat = wdevice.bindGroup(
    "construct_octree",
    octreeNodesFormat,
    octreeDataFormat,
    octreeMutexFormat,
    octreeDeferredThreadFormat,
    octreeDeferredThreadFormat.withName("octree_deferred_threads_input"),
    octreeNextfreePointersFormat,
    pointFormat,
    deferredThreadCountBufferFormat,
  );

  const constructOctreePipeline = await wdevice.compute({
    bindGroups: [constructOctreeBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    globals: `
    // const SENTINEL = 4294967295u;
    `,
    shader: `
    if (id.x >= deferred_thread_count.count) { return; }

    let work_item = octree_deferred_threads_input[id.x]; 
    let point = points[work_item.point_idx];
    let root_node = octree_nodes[work_item.root_node_idx];
    let root_node_data = octree_data[root_node.data_idx];
    var curr_node_idx = work_item.root_node_idx;
    var halfway = (root_node_data.min_bounds + root_node_data.max_bounds) / 2.0;
    var deltas = (root_node_data.max_bounds - root_node_data.min_bounds) / 2.0;

    for (var i = 0; i < 20; i += 1) {
      let ex = atomicCompareExchangeWeak(
        &octree_mutex[curr_node_idx].mutex,
        0,
        1
      );

      if (ex.exchanged) {
        let node = octree_nodes[curr_node_idx];

        // node is a leaf node
        if (node.child_idx == 0) {

          // node has no data meaning we can safely insert data here
          if (node.data_idx == 0) {
            let data_idx = atomicAdd(
              &octree_nextfree_pointers.data, 1
            );
            octree_nodes[curr_node_idx].data_idx = data_idx;
            octree_data[data_idx].min_bounds = halfway - deltas;
            octree_data[data_idx].max_bounds = halfway + deltas;
            octree_data[data_idx].point_idx = work_item.point_idx;
            atomicStore(
              &octree_mutex[curr_node_idx].mutex,
              0
            );
            return;
          } else {

            // node already has data 
            let existing_data = octree_data[node.data_idx];

            // update it to a branch node 
            let next_node_idx = atomicAdd(
              &octree_nextfree_pointers.node, 8 
            );
            octree_nodes[curr_node_idx].child_idx = next_node_idx;

            // put other item in the deferred thread queue 
            let deferred_thread_idx = 
              atomicAdd(&octree_nextfree_pointers.deferred_thread, 1u);
            octree_deferred_threads[deferred_thread_idx].point_idx = 
              existing_data.point_idx;
            octree_deferred_threads[deferred_thread_idx].root_node_idx = 
              curr_node_idx;

            // done editing node
            atomicStore(
              &octree_mutex[curr_node_idx].mutex,
              2
            );
          }
        } 
      } 
        
      if (atomicLoad(&octree_mutex[curr_node_idx].mutex) == 2u) {
        // node is a branch node; we can safely traverse it
        let next_node_idx = octree_nodes[curr_node_idx].child_idx; 

        // determine what child this node should be placed in
        let pz = select(0u, 1u, point.pos.z > halfway.z);    
        let py = select(0u, 1u, point.pos.y > halfway.y);    
        let px = select(0u, 1u, point.pos.x > halfway.x);
        let child_idx = pz * 4u + py * 2u + px;

        // traverse one layer deeper
        curr_node_idx = next_node_idx + child_idx;
        deltas *= 0.5;
        halfway.x += select(-deltas.x, deltas.x, px == 1);    
        halfway.y += select(-deltas.y, deltas.y, py == 1);    
        halfway.z += select(-deltas.z, deltas.z, pz == 1);    

      } else {
        // defer execution if mutex already locked 
        let deferred_thread_idx = 
          atomicAdd(&octree_nextfree_pointers.deferred_thread, 1u);

        octree_deferred_threads[deferred_thread_idx].point_idx = 
          work_item.point_idx;
        octree_deferred_threads[deferred_thread_idx].root_node_idx = 
          curr_node_idx;
          
        return;
      }
    }
    `,
  });

  const constructOctreeDeferredThreadsInputUniformsFormat =
    wdevice.uniformBuffer(
      "input",
      struct("Input", {
        count: "u32",
      }),
      false,
      {
        visibility: GPUShaderStage.COMPUTE,
      },
    );

  const constructOctreeDeferredThreadsInputBindGroupFormat = wdevice.bindGroup(
    "construct_octree_deferred_threads",
    octreeDeferredThreadFormat,
    constructOctreeDeferredThreadsInputUniformsFormat,
  );

  const constructOctreeDeferredThreadsInputPipeline = await wdevice.compute({
    bindGroups: [constructOctreeDeferredThreadsInputBindGroupFormat] as const,
    workgroupSize: [32, 1, 1],
    shader: `
    if (id.x >= input.count) { return; }

    octree_deferred_threads[id.x].point_idx = id.x;
    octree_deferred_threads[id.x].root_node_idx = 0;
    `,
  });

  const constructOctreeComputeIndirectBindGroupFormat = wdevice.bindGroup(
    "construct_octree_compute_indirect",
    computeIndirectBufferFormat,
    octreeNextfreePointersNonatomicFormat,
    deferredThreadCountBufferFormat,
  );

  const constructOctreeComputeIndirectBufferPipeline = await wdevice.compute({
    bindGroups: [constructOctreeComputeIndirectBindGroupFormat],
    workgroupSize: [1, 1, 1],
    shader: `
      compute_indirect.workgroups = vec3u(
        octree_nextfree_pointers.deferred_thread / 32 + 1u,
        1u,
        1u
      );
      deferred_thread_count.count = octree_nextfree_pointers.deferred_thread;
      octree_nextfree_pointers.deferred_thread = 0;
    `,
  });

  const barnesHutDeferredThreadStruct = struct("BarnesHutDeferredThread", {
    point_idx: "u32",
    node_idx: "u32",
  });
  const barnesHutDeferredThreadFormat = wdevice.storageBuffer(
    "barnes_hut_deferred_threads",
    barnesHutDeferredThreadStruct,
  );

  const barnesHutNextfreePointersStruct = struct("BarnesHutNextfreePointers", {
    deferred_thread: "u32",
  });
  const barnesHutNextfreePointersFormat = wdevice.storageBuffer(
    "barnes_hut_nextfree_pointers",
    barnesHutNextfreePointersStruct,
  );

  // the process:

  // 1. initialize root node
  // 2. initialize deferred execution threads
  // 3. run initial compute pass
  // 4. repeat 19 times:
  //    1. create the indirect buffer for additional deferred threads
  //    2. run dispatchWorkgroupsIndirect
  //    3. reset nextfree pointers as needed

  // CPU-SIDE DATA DEFS =============================================

  const pointData = range(128).map(() => ({
    pos: [Math.random(), Math.random(), Math.random()] as Vec3,
    vel: [0, 0, 0] as Vec3,
    mass: 1,
  }));

  // const pointData = [
  //   { pos: [0.3, 0.3, 0.3] as Vec3 },
  //   { pos: [0.1, 0.1, 0.1] as Vec3 },
  //   {
  //     pos: [0.7, 0.7, 0.7] as Vec3,
  //   },
  // ];

  const POINT_COUNT = pointData.length;

  const OCTREE_CAP = 32768;

  const octreeNodeData = range(OCTREE_CAP).map((i) => ({
    child_idx: i === 0 ? 1 : 0,
    data_idx: 0,
  }));

  const octreeDataData = range(OCTREE_CAP).map(() => ({
    min_bounds: [0, 0, 0] as Vec3,
    max_bounds: [1, 1, 1] as Vec3,
    point_idx: 0,
  }));

  const octreeMutexData = range(OCTREE_CAP).map((i) => ({
    mutex: i === 0 ? 2 : 0,
  }));

  const octreeDeferredThreadsPingpong1Data = range(POINT_COUNT).map((i) => ({
    point_idx: i,
    root_node_idx: 0,
  }));
  const octreeDeferredThreadsPingpong2Data = range(POINT_COUNT).map((i) => ({
    point_idx: 0,
    root_node_idx: 0,
  }));

  const octreeNextfreePointersData = { node: 9, data: 1, deferred_thread: 0 };

  const octreeComputeIndirectData = {
    workgroups: [0, 0, 0] as Vec3,
  };

  const deferredThreadCountData = {
    count: POINT_COUNT,
  };

  // GPU BUFFERS ========================================================

  const pointBuffer = pointFormat.quickCreateMany(pointData);

  const octreeNodeBuffer = octreeNodesFormat.quickCreateMany(octreeNodeData);

  const octreeDataBuffer = octreeDataFormat.quickCreateMany(octreeDataData);

  const octreeMutexBuffer = octreeMutexFormat.quickCreateMany(octreeMutexData);

  const octreeDeferredThreadsPingpong1Buffer =
    octreeDeferredThreadFormat.quickCreateMany(
      octreeDeferredThreadsPingpong1Data,
    );
  const octreeDeferredThreadsPingpong2Buffer =
    octreeDeferredThreadFormat.quickCreateMany(
      octreeDeferredThreadsPingpong2Data,
    );

  const octreeNextfreePointersBuffer = octreeNextfreePointersFormat.quickCreate(
    octreeNextfreePointersData,
  );

  const octreeComputeIndirectBuffer = computeIndirectBufferFormat.quickCreate(
    octreeComputeIndirectData,
  );

  const deferredThreadCountBuffer = deferredThreadCountBufferFormat.quickCreate(
    deferredThreadCountData,
  );

  // GPU BIND GROUPS ====================================

  const constructOctreeBindGroup1 = constructOctreeBindGroupFormat.instantiate({
    octree_data: octreeDataBuffer,
    octree_deferred_threads_input: octreeDeferredThreadsPingpong1Buffer,
    octree_deferred_threads: octreeDeferredThreadsPingpong2Buffer,
    octree_mutex: octreeMutexBuffer,
    octree_nextfree_pointers: octreeNextfreePointersBuffer,
    octree_nodes: octreeNodeBuffer,
    points: pointBuffer,
    deferred_thread_count: deferredThreadCountBuffer,
  });
  const constructOctreeBindGroup2 = constructOctreeBindGroupFormat.instantiate({
    octree_data: octreeDataBuffer,
    octree_deferred_threads_input: octreeDeferredThreadsPingpong2Buffer,
    octree_deferred_threads: octreeDeferredThreadsPingpong1Buffer,
    octree_mutex: octreeMutexBuffer,
    octree_nextfree_pointers: octreeNextfreePointersBuffer,
    octree_nodes: octreeNodeBuffer,
    points: pointBuffer,
    deferred_thread_count: deferredThreadCountBuffer,
  });
  const constructIndirectBindGroup =
    constructOctreeComputeIndirectBindGroupFormat.instantiate({
      compute_indirect: octreeComputeIndirectBuffer,
      octree_nextfree_pointers:
        octreeNextfreePointersNonatomicFormat.reinterpret(
          octreeNextfreePointersBuffer,
        ),
      deferred_thread_count: deferredThreadCountBuffer,
    });

  // ACTUALLY RUN IT =============================================

  const enc = device.createCommandEncoder();

  const pass = enc.beginComputePass();

  pass.setPipeline(constructOctreePipeline);
  pass.setBindGroup(0, constructOctreeBindGroup1);
  pass.dispatchWorkgroups(Math.ceil(POINT_COUNT / 32), 1, 1);

  for (let i = 0; i < 20; i++) {
    pass.setPipeline(constructOctreeComputeIndirectBufferPipeline);
    pass.setBindGroup(0, constructIndirectBindGroup);
    pass.dispatchWorkgroups(1, 1, 1);
    pass.setPipeline(constructOctreePipeline);
    pass.setBindGroup(
      0,
      i % 2 === 0 ? constructOctreeBindGroup2 : constructOctreeBindGroup1,
    );
    pass.dispatchWorkgroupsIndirect(octreeComputeIndirectBuffer, 0);
  }

  pass.end();
  device.queue.submit([enc.finish()]);

  console.log(
    await quickMapWithFormat(octreeNodeStruct, device, octreeNodeBuffer),
  );
  console.log(
    await quickMapWithFormat(
      octreeNextfreePointersStruct,
      device,
      octreeNextfreePointersBuffer,
    ),
  );
  console.log(
    await quickMapWithFormat(
      octreeDeferredThreadStruct,
      device,
      octreeDeferredThreadsPingpong2Buffer,
    ),
  );
  console.log(new Uint32Array(await quickMap(device, octreeMutexBuffer)));
  console.log(
    await quickMapWithFormat(octreeDataStruct, device, octreeDataBuffer),
  );
})();
