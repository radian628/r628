import { groupBy, hookGPUDevice, range, splitBy } from "../../src";
import { parallelSum } from "../../src/webgpu/pipelines/parallel-sum";

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

  const sum = await parallelSum(device, { datatype: "f32" });

  const stagingBuffer = device.createBuffer({
    size: 4096 * 4,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  const data1 = range(4096).map((i) => ({ item: i }));
  const data2 = range(4096).map((d) => ({ item: 0 }));

  const pp1 = sum.bufferFormat.quickCreateMany(data1);
  const pp2 = sum.bufferFormat.quickCreateMany(data2);

  const s = sum.bufferSummer({
    a: pp1,
    b: pp2,
  });

  const enc = device.createCommandEncoder();

  const pass = enc.beginComputePass();

  const { dstBuffer } = s({
    pass,
    countPerIter: 3,
    size: 32,
    sumCount: 100,
    sumStride: 32,
  });

  pass.end();

  enc.copyBufferToBuffer(dstBuffer, stagingBuffer);

  device.queue.submit([enc.finish()]);

  await stagingBuffer.mapAsync(GPUMapMode.READ);

  const data = new Float32Array(stagingBuffer.getMappedRange().slice());

  console.log("Data on GPU: ", data);

  console.log(
    "Sum on CPU: ",
    // data1.reduce((a, b) => a + b.item, 0),
    splitBy(data1, 32).map((d) => d.reduce((a, b) => a + b.item, 0)),
  );
})();
