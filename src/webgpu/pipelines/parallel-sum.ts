import { range } from "../../range";
import { WGSLPrimitive } from "../converters";
import { wrapDevice } from "../partial-pipelines";
import { struct } from "../wgsl-struct-layout-generator";

export async function parallelSum<P extends WGSLPrimitive>(
  device: GPUDevice,
  settings: {
    datatype: P;
  },
) {
  const WORKGROUP_SIZE_X = 32;

  const { datatype } = settings;
  const wdevice = wrapDevice(device);

  const bufferFormat = wdevice.uniformBuffer(
    "items",
    struct("Items", {
      item: datatype,
    }),
    true,
    {
      visibility: GPUShaderStage.COMPUTE,
      usage:
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.STORAGE,
    },
  );
  const itemsInFormat = bufferFormat.withName("items_in");
  const itemsOutFormat = bufferFormat.withName("items_out");

  const uniformsFormat = wdevice.uniformBuffer(
    "params",
    struct("Params", {
      countToSum: "u32",
      count: "u32",
      sumStrideSrc: "u32",
      sumStrideDst: "u32",
    }),
    false,
    { visibility: GPUShaderStage.COMPUTE },
  );

  const bufferBindGroupFormat = wdevice.bindGroup(
    "buffers",
    // @ts-expect-error
    itemsInFormat,
    itemsOutFormat,
  );

  const uniformBindGroupFormat = wdevice.bindGroup("uniforms", uniformsFormat);

  const pipeline = await wdevice.compute({
    bindGroups: [uniformBindGroupFormat, bufferBindGroupFormat] as const,
    workgroupSize: [WORKGROUP_SIZE_X, 1, 1],
    storageBufferAccess: { items_in: "read_write", items_out: "read_write" },
    shader: `
        let i = id.x;
        let sum_index = id.y;

        var sum: ${datatype} = ${datatype}(0);
        for (var j = 0u; j < params.countToSum; j += 1u) {
          let src_local_idx = i * params.countToSum + j;
          let src_idx = src_local_idx + sum_index * params.sumStrideSrc;
          sum += select(${datatype}(0), items_in[src_idx].item, src_local_idx < params.count);
        }

        items_out[i + sum_index * params.sumStrideDst].item = sum;
      `,
  });

  // const packUniformsFormat = wdevice.uniformBuffer(
  //   "params",
  //   struct("Params", {
  //     count: "u32"
  //   })
  // );

  const packBindGroupFormat = wdevice.bindGroup(
    "bindGroup",
    // @ts-expect-error
    itemsInFormat,
    itemsOutFormat,
    // packUniformsFormat
  );

  const packResultsPipeline = await wdevice.compute({
    bindGroups: [bufferBindGroupFormat] as const,
    workgroupSize: [WORKGROUP_SIZE_X, 1, 1],
    storageBufferAccess: { items_in: "read_write", items_out: "read_write" },
    shader: `
        let i = id.x;
        items_out[i] = items_in[i * ${WORKGROUP_SIZE_X}];
    `,
  });

  return {
    pipeline,
    bufferFormat,
    bufferSummer(params: {
      a: ReturnType<typeof bufferFormat.instantiate>;
      b: ReturnType<typeof bufferFormat.instantiate>;
    }) {
      const bufA = params.a;
      const bufB = params.b;

      // @ts-expect-error
      const pingpong1 = bufferBindGroupFormat.instantiate({
        items_in: itemsInFormat.reinterpret(bufA),
        items_out: itemsOutFormat.reinterpret(bufB),
      });
      // @ts-expect-error
      const pingpong2 = bufferBindGroupFormat.instantiate({
        items_in: itemsInFormat.reinterpret(bufB),
        items_out: itemsOutFormat.reinterpret(bufA),
      });

      return (params: {
        pass: GPUComputePassEncoder;
        countPerIter: number;
        size: number;
        sumCount?: number;
        sumStride?: number;
      }) => {
        let { pass, countPerIter, size, sumCount, sumStride } = params;

        sumCount ??= 1;
        sumStride ??= 0;

        const iters = Math.ceil(Math.log(size) / Math.log(countPerIter));

        let counts: number[] = [];

        let countTemp = size;
        for (let i = 0; i < iters + 1; i++) {
          counts.push(countTemp);
          countTemp = Math.ceil(countTemp / countPerIter);
        }

        const uniformBindGroups = range(iters).map((i) => {
          const uniforms = {
            countToSum: countPerIter,
            count: counts[i],
            sumStrideSrc:
              i === 0
                ? sumStride
                : Math.ceil(counts[i] / WORKGROUP_SIZE_X) * WORKGROUP_SIZE_X,
            sumStrideDst:
              Math.ceil(counts[i + 1] / WORKGROUP_SIZE_X) * WORKGROUP_SIZE_X,
          };

          const uniformBuf = uniformsFormat.quickCreate(uniforms);

          const uniformBindGroup = uniformBindGroupFormat.instantiate({
            params: uniformBuf,
          });

          return uniformBindGroup;
        });

        for (let i = 0; i < iters; i++) {
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, uniformBindGroups[i]);
          pass.setBindGroup(1, i % 2 ? pingpong2 : pingpong1);

          let wgcount = Math.ceil(counts[i] / countPerIter / WORKGROUP_SIZE_X);

          pass.dispatchWorkgroups(wgcount, sumCount);
        }

        // return {
        //   dstBuffer: iters % 2 === 0 ? bufA : bufB,
        // };

        pass.setPipeline(packResultsPipeline);
        pass.setBindGroup(0, iters % 2 ? pingpong2 : pingpong1);
        pass.dispatchWorkgroups(sumCount);

        return {
          dstBuffer: iters % 2 === 0 ? bufB : bufA,
        };
      };
    },
  };
}
