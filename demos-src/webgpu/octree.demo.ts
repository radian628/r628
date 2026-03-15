import {
  argmin,
  array,
  createWgslSerializers,
  distance3,
  generateLayouts,
  hookGPUDevice,
  quickMap,
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
    pos: "vec3f",
    state: "atomic<u32>",
    minBounds: "vec3f",
    lock: "atomic<u32>",
    maxBounds: "vec3f",
    data: "u32",
  });

  const nonAtomicOctreeNodeStruct = struct("OctreeNode", {
    pos: "vec3f",
    state: "u32",
    minBounds: "vec3f",
    lock: "u32",
    maxBounds: "vec3f",
    data: "u32",
  });

  const octreeFormat = wdevice.storageBuffer("octree", octreeNodeStruct);
  const nonAtomicOctreeFormat = wdevice.storageBuffer(
    "octree",
    nonAtomicOctreeNodeStruct,
  );

  const nextfreeFormat = wdevice.storageBuffer(
    "nextfree",
    struct("Nextfree", {
      idx: "atomic<u32>",
    }),
    { arrayify: false },
  );

  const octreeItemsFormat = wdevice.storageBuffer(
    "items",
    struct("Item", {
      pos: "vec3f",
    }),
  );

  const testPointFormat = octreeItemsFormat.withName("points");

  const bgFormat = wdevice.bindGroup(
    "bg",
    octreeFormat,
    nextfreeFormat,
    octreeItemsFormat,
  );

  const createOctree = await wdevice.compute({
    bindGroups: [bgFormat] as const,
    storageBufferAccess: {
      octree: "read_write",
      nextfree: "read_write",
      items: "read_write",
    },
    workgroupSize: [1, 1, 1],
    globals: `
fn insert(data: u32, pos: vec3f) {
  var curr_node = 0u;
  var deltas = vec3f(0.25);
  var halfway = vec3f(0.5, 0.5, 0.5);

  for (var i = 0; i < 20; i += 1) {
    while (true) {
      // if this is a branch node it won't be mutated anymore; we can safely read
      let state = atomicLoad(&octree[curr_node].state);
      if (state == 2) { break; }
      
      // otherwise, wait to acquire the lock so we can mutate it
      let ex = atomicCompareExchangeWeak(&octree[curr_node].lock, 0, 1);
      if (ex.exchanged) { break; }
    }

    let state = atomicLoad(&octree[curr_node].state);

    if (state == 0) {
      // if this is a leaf node, make it a branch node instead
      let idx = atomicAdd(&nextfree.idx, 8);
      octree[curr_node].data = idx;
      octree[curr_node].minBounds = halfway - deltas * 2.0;
      octree[curr_node].maxBounds = halfway + deltas * 2.0;
      atomicStore(&octree[curr_node].state, 2);

      atomicStore(&octree[curr_node].lock, 0);
    } else {
      // if this is a branch node, no need to lock it at all
      atomicStore(&octree[curr_node].lock, 0);
    }
  
    // determine what child this node should be placed in
    let pz = select(0u, 1u, pos.z > halfway.z);    
    let py = select(0u, 1u, pos.y > halfway.y);    
    let px = select(0u, 1u, pos.x > halfway.x);
    let child_idx = pz * 4u + py * 2u + px;
     
    // traverse one layer deeper
    curr_node = octree[curr_node].data + child_idx;       
    halfway.x += select(-deltas.x, deltas.x, px == 1);    
    halfway.y += select(-deltas.y, deltas.y, py == 1);    
    halfway.z += select(-deltas.z, deltas.z, pz == 1);    
    deltas *= 0.5;
  }
  
  // insert node
  let ex = atomicCompareExchangeWeak(&octree[curr_node].lock, 0, 1);
  if (ex.exchanged) {
    atomicStore(&octree[curr_node].state, 1);
    octree[curr_node].data = data;
    octree[curr_node].pos = pos;
  }
}
    `,
    shader: `
      insert(id.x, items[id.x].pos);
    `,
  });

  const nearestNeighborOutputFormat = wdevice.storageBuffer(
    "nn_output",
    struct("NearestNeighborOutput", {
      idx: "u32",
    }),
  );

  const nearestNeighborBgFormat = wdevice.bindGroup(
    "bg",
    nonAtomicOctreeFormat,
    testPointFormat,
    nearestNeighborOutputFormat,
  );

  const nearestNeighbor = await wdevice.compute({
    bindGroups: [nearestNeighborBgFormat] as const,
    storageBufferAccess: {
      octree: "read_write",
      points: "read_write",
      nn_output: "read_write",
    },
    workgroupSize: [32, 1, 1],
    globals: `
      fn sdBox( p: vec3f, b: vec3f ) -> f32 {
        let q: vec3f = abs(p) - b;
        return length(max(q,vec3f(0.0))) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      fn closest_to_box(a: vec3f, b: vec3f, test: vec3f) -> f32 {
        let center = (a + b) / 2.0;
        let b2 = (b - a) / 2.0;

        return max(0.0, sdBox(test - center, b2));
      }

      fn farthest_to_box(a: vec3f, b: vec3f, test: vec3f) -> f32 {
        return closest_to_box(a, b, test) + distance(a, b);
      }

      const QUEUE_CAP = 2048u;

      struct OctreeQueue {
        size: u32,
        start: u32,
        entries: array<u32, QUEUE_CAP>,
      };

      var<private> q: OctreeQueue;
      var<private> threshold = 999999.0; 
      var<private> closest_dist = 999999.0;
      var<private> closest_so_far = 4294967295u;

      fn try_insert_node(node_idx: u32, pt: vec3f) {
        let node = octree[node_idx];
        let closest = closest_to_box(node.minBounds, node.maxBounds, pt);
        let farthest = farthest_to_box(node.minBounds, node.maxBounds, pt);

        if (closest > threshold) {
          return;
        }

        threshold = min(threshold, farthest);

        q.entries[(q.start + q.size) % QUEUE_CAP] = node_idx;
        q.size += 1;
      }


    `,
    shader: `
      var pt = points[id.x].pos;
      q.size = 1u;
      q.start = 0u;
      q.entries[0] = 0u;

      for (var j = 0; j < 4096 && q.size > 0; j += 1) {
        let node = octree[q.entries[q.start]];
        q.start = (q.start + 1) % QUEUE_CAP;
        q.size -= 1;
        
        if (node.state == 0) {
          // empty node; do nothing
        } else if (node.state == 1) {
          let test_dist = distance(node.pos, pt);
          if (test_dist < closest_dist) {
            closest_dist = test_dist;
            closest_so_far = node.data;
          }
        } else {
          for (var i = 0u; i < 8; i += 1) {
            try_insert_node(node.data + i, pt); 
          }

          // edge case: ran out of queue space
          if (q.size > QUEUE_CAP) {
            nn_output[id.x].idx = 4294967294u;
            return; 
          }
        }
      }
      
      nn_output[id.x].idx = closest_so_far; 
    `,
  });

  const itemData: { pos: Vec3 }[] = [
    // {
    //   pos: [0.3, 0.3, 0.3],
    // },
    // {
    //   pos: [0.7, 0.7, 0.7],
    // },
    ...range(8192).map((i) => ({
      pos: [Math.random(), Math.random(), Math.random()] as Vec3,
    })),
  ];

  const ITEMCOUNT = itemData.length;

  const octree = octreeFormat.quickCreateMany(
    range(ITEMCOUNT * 8 * 20 + 1).map(() => ({
      lock: 0,
      pos: [0, 0, 0],
      state: 0,
      data: 0,
      minBounds: [0, 0, 0],
      maxBounds: [1, 1, 1],
    })),
  );

  const nextfree = nextfreeFormat.quickCreate({ idx: 1 });

  const octreeItems = octreeItemsFormat.quickCreateMany(itemData);

  const bg = bgFormat.instantiate({
    octree,
    nextfree,
    items: octreeItems,
  });

  const testPointsOnCPU = range(32768).map((p) => ({
    pos: [Math.random(), Math.random(), Math.random()] as Vec3,
  }));

  const testPoints = testPointFormat.quickCreateMany(testPointsOnCPU);

  const nnOutput = nearestNeighborOutputFormat.instantiate(
    testPointsOnCPU.length,
  );

  const nnbg = nearestNeighborBgFormat.instantiate({
    octree: nonAtomicOctreeFormat.reinterpret(octree),
    points: testPoints,
    nn_output: nnOutput,
  });

  const enc = device.createCommandEncoder();
  const pass = enc.beginComputePass();
  pass.setPipeline(createOctree);
  pass.setBindGroup(0, bg);
  pass.dispatchWorkgroups(ITEMCOUNT, 1, 1);

  pass.setPipeline(nearestNeighbor);
  pass.setBindGroup(0, nnbg);
  pass.dispatchWorkgroups(Math.ceil(testPointsOnCPU.length / 32), 1, 1);
  pass.end();

  device.queue.submit([enc.finish()]);

  console.log(new Float32Array(await quickMap(device, octreeItems)));

  const octreeDataRaw = new DataView(await quickMap(device, octree));
  const nextfreeData = new Uint32Array(await quickMap(device, nextfree))[0];

  const [withLayouts] = generateLayouts([octreeNodeStruct]);

  console.log(nextfreeData, withLayouts);

  const octreeData = range(nextfreeData - 1).map((i) =>
    readWgslLayout(withLayouts, octreeDataRaw, withLayouts.size * i),
  );

  console.log(
    "test points",
    new Float32Array(await quickMap(device, testPoints)),
  );
  const nnOutputGPU = new Uint32Array(await quickMap(device, nnOutput));
  const nnOutputCPU = testPointsOnCPU.map(
    (t) =>
      argmin(
        itemData.map((e, i) => ({ ...e, i })) as unknown as [
          { pos: Vec3; i: number },
        ],
        (x) => distance3(t.pos, x.pos),
      ).i,
  );

  console.log("gpu output", nnOutputGPU);
  console.log("nn on CPU output", nnOutputCPU);

  for (let i = 0; i < nnOutputGPU.length; i++) {
    if (nnOutputCPU[i] !== nnOutputGPU[i]) {
      console.warn(
        `Mismatch for element ${i} -- GPU=${nnOutputGPU[i]} CPU=${nnOutputCPU[i]} `,
      );
    }
  }

  // console.log(new Uint32Array());
  console.log(octreeData);
})();
