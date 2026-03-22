import { range } from "../../range";
import { namedPromiseAll } from "../../unpromise";
import { typeDevice } from "../easygpu/easygpu";
import {
  runtimeArray,
  struct,
  typeName,
  WGSLStructSpec,
} from "../wgsl-struct-layout-generator";

export async function createReductionFormat(params: {
  device: GPUDevice;
  type: WGSLStructSpec;
  reduce: string;
}) {
  const td = typeDevice(params.device);

  const reductionArrayFormat = td.storageBufferFormat(
    "vecs",
    runtimeArray(params.type),
  );

  const reductionUniformsFormat = td.uniformBufferComputeFormat(
    "params",
    struct("Params", {
      stride: "u32",
      count: "u32",
    }),
  );

  const typename = typeName(params.type);

  const reductionPipeline = await td.computePipelineBundled(
    `
/*globals
fn reduce(a : ${typename}, b : ${typename}) -> ${typename} {
  ${params.reduce}
}
*/
  
    if (id.x >= params.count) {
      return; 
    }

    let src_idx1 = id.x * params.stride * 2u;
    let src_idx2 = src_idx1 + params.stride; 

    vecs[src_idx1] = reduce(
      vecs[src_idx1],
      vecs[src_idx2]
    );

    `,
    [32, 1, 1],
    reductionArrayFormat,
    reductionUniformsFormat,
  );

  return {
    reductionArrayFormat,
    reductionUniformsFormat,
    reductionPipeline,
    new(count: number) {
      const countExponent = Math.ceil(Math.log2(count));
      const nextPowerOfTwo = 2 ** countExponent;
      const iterSteps = countExponent;

      const array = reductionArrayFormat.new(nextPowerOfTwo);

      const steps = range(iterSteps).map((i) => {
        const stride = 2 ** i;
        const count = nextPowerOfTwo / stride / 2;
        const workgroups = Math.ceil(count / 32);
        return {
          bg: reductionPipeline.new({
            vecs: array,
            params: reductionUniformsFormat.quickCreate({
              stride,
              count,
            }),
          }),
          stride,
          count,
          workgroups,
        };
      });

      return {
        run: (pass: GPUComputePassEncoder) => {
          pass.setPipeline(reductionPipeline.pl);
          for (const { workgroups, bg } of steps) {
            bg.bindAndDispatch(pass, workgroups);
          }
        },
        reductionArray: array,
      };
    },
  };
}

export async function createPrefixSumFormat(params: {
  device: GPUDevice;
  type: WGSLStructSpec;
  reduce: string;
  zero: string;
}) {
  const td = typeDevice(params.device);

  const prefixSumArrayFormat = td.storageBufferFormat(
    "arr",
    runtimeArray(params.type),
  );

  const prefixSumUniformFormat = td.uniformBufferComputeFormat(
    "params",
    struct("Params", {
      stride: "u32",
      count: "u32",
    }),
  );

  const typename = typeName(params.type);

  const reductionFunction = `
/*globals
fn reduce(a: ${typename}, b: ${typename}) -> ${typename} {
  ${params.reduce}
}
*/
  `;

  const prefixSumUpstrokePipelinePromise = td.computePipelineBundled(
    `
    ${reductionFunction}
      if (id.x >= params.count) {
        return; 
      }

      let src_idx1 = id.x * params.stride * 2u + params.stride - 1u;
      let src_idx2 = src_idx1 + params.stride;
      let dst_idx = src_idx2;
      
      arr[dst_idx] = reduce(arr[src_idx1], arr[src_idx2]);
    `,
    [32, 1, 1],
    prefixSumUniformFormat,
    prefixSumArrayFormat,
  );

  const setupPrefixSumDownstrokeUniformFormat = td.uniformBufferComputeFormat(
    "params",
    struct("Params", {
      end: "u32",
    }),
  );

  const setupPrefixSumDownstrokePipelinePromise = td.computePipelineBundled(
    `
    /*globals fn zero() -> ${typename} {
      ${params.zero} 
    } */
    arr[params.end - 1] = zero();
    `,
    [1, 1, 1],
    prefixSumArrayFormat,
    setupPrefixSumDownstrokeUniformFormat,
  );

  const prefixSumDownstrokePipelinePromise = td.computePipelineBundled(
    `
    ${reductionFunction}
    if (id.x >= params.count) {
      return; 
    }

    let src_idx1 = id.x * params.stride * 2u + params.stride - 1u;
    let src_idx2 = src_idx1 + params.stride; 

    let temp = arr[src_idx2];
    arr[src_idx2] = reduce(arr[src_idx1], temp);
    arr[src_idx1] = temp;
    `,
    [32, 1, 1],
    prefixSumUniformFormat,
    prefixSumArrayFormat,
  );

  const {
    prefixSumDownstrokePipeline,
    prefixSumUpstrokePipeline,
    setupPrefixSumDownstrokePipeline,
  } = await namedPromiseAll({
    prefixSumDownstrokePipelinePromise,
    prefixSumUpstrokePipelinePromise,
    setupPrefixSumDownstrokePipelinePromise,
  });

  return {
    prefixSumArrayFormat,
    prefixSumDownstrokePipeline,
    prefixSumUpstrokePipeline,
    setupPrefixSumDownstrokePipeline,
    new(count: number) {
      const countWithExtra = count + 1;
      const countExponent = Math.ceil(Math.log2(countWithExtra));
      const nextPowerOfTwo = 2 ** countExponent;

      const iterSteps = countExponent;

      const prefixSumArray = prefixSumArrayFormat.new(nextPowerOfTwo);

      const setupDownstrokeUniforms =
        setupPrefixSumDownstrokeUniformFormat.quickCreate({
          end: nextPowerOfTwo,
        });

      const setupDownstroke = setupPrefixSumDownstrokePipeline.new({
        arr: prefixSumArray,
        params: setupDownstrokeUniforms,
      });

      const uniformBufs = range(iterSteps).map((i) =>
        prefixSumUniformFormat.quickCreate({
          count: nextPowerOfTwo / 2 ** i,
          stride: 2 ** i,
        }),
      );

      const upstroke = range(iterSteps).map((i) =>
        prefixSumUpstrokePipeline.new({
          arr: prefixSumArray,
          params: uniformBufs[i],
        }),
      );

      const downstroke = range(iterSteps).map((i) =>
        prefixSumDownstrokePipeline.new({
          arr: prefixSumArray,
          params: uniformBufs[iterSteps - i - 1],
        }),
      );

      const dispatchCount = Math.ceil(nextPowerOfTwo / 32);

      return {
        nextPowerOfTwo,
        run: (pass: GPUComputePassEncoder) => {
          pass.setPipeline(prefixSumUpstrokePipeline.pl);
          for (let i = 0; i < iterSteps; i++) {
            const dispatchCount = Math.ceil(nextPowerOfTwo / 2 ** i / 32);
            upstroke[i].run(pass, dispatchCount);
          }

          setupDownstroke.run(pass, 1);

          pass.setPipeline(prefixSumDownstrokePipeline.pl);
          for (let i = 0; i < iterSteps; i++) {
            const dispatchCount = Math.ceil(
              nextPowerOfTwo / 2 ** (iterSteps - i - 1) / 32,
            );
            downstroke[i].run(pass, dispatchCount);
          }
        },
        prefixSumArray,
      };
    },
  };
}
