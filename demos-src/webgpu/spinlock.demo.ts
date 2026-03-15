import { hookGPUDevice, quickMap, struct, wrapDevice } from "../../src";

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

  const bufFormat = wdevice.storageBuffer(
    "buf",
    struct("Buf", {
      lock: "atomic<u32>",
      data: "f32",
    }),
  );

  const bgFormat = wdevice.bindGroup("bg", bufFormat);

  const ppln = await wdevice.compute({
    bindGroups: [bgFormat] as const,
    storageBufferAccess: { buf: "read_write" },
    workgroupSize: [32, 1, 1],
    globals: `
fn lock() {
  while (true) {
    let res = atomicCompareExchangeWeak(&buf[0].lock, 0, 1);
    if (res.exchanged) {
      return;
    }
  }
} 

fn unlock() {
  atomicStore(&buf[0].lock, 0);
}
    `,
    shader: `
      if (local_id.x != 0) { return; }
      lock();
      buf[0].data += 1.0; 
      unlock();
    `,
  });

  const buf = bufFormat.quickCreate({
    lock: 0,
    data: 0,
  });

  const bg = bgFormat.instantiate({
    buf,
  });

  const enc = device.createCommandEncoder();
  const pass = enc.beginComputePass();
  pass.setPipeline(ppln);
  pass.setBindGroup(0, bg);
  pass.dispatchWorkgroups(3000, 3000, 1);
  pass.end();

  device.queue.submit([enc.finish()]);

  console.log(new Float32Array(await quickMap(device, buf)));
})();
