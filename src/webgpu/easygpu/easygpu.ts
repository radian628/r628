import { Vec2, Vec3 } from "../../math/vector.generated";
import { arrayToObjEntries } from "../../object-utils";
import {
  TEXTURE_FORMAT_TO_SAMPLER_TYPE_LUT,
  TEXTURE_FORMAT_TO_WGSL_TYPE_LUT,
  VERTEX_FORMAT_TO_ELEMENT_COUNT,
  VERTEX_FORMAT_TO_ELEMENT_SIZE,
  VERTEX_FORMAT_TO_JS_TYPE,
  VERTEX_FORMAT_TO_TYPEDARRAY_CONSTRUCTOR,
  vertexFormatToWgslType,
} from "../converters";
import {
  createLayoutGenerator,
  createWgslSerializers,
  generateLayouts,
  WGSLStructSpec,
  WGSLStructValues,
} from "../wgsl-struct-layout-generator";
import {
  InstantiateBindGroupEntries,
  TypedBindGroupEntry,
  TypedBindGroupDescGeneric,
} from "./bind-group";
import {
  Attribute,
  BufferFillData,
  BufferFormat,
  bufferUsageFlagsMap,
  bufferWgsl,
  bufferWgslStorage,
  createVertexBufferFillFunction,
  createWgslDataStructureBufferFillFunction,
  getBufferFixedSize,
  getBufferPerUnitSize,
  parseBufferUsageFlags,
  TypedBindGroupEntryVertexBufferGeneric,
  TypedBufferDesc,
  TypedBufferUsageFlags,
  TypedVertexBufferDescGeneric,
} from "./buffer";
import {
  BindGroupRecord,
  getStructDefsAndBindings,
  RenderPipelineBindings,
  TypedOutputFormat,
} from "./pipeline";
import {
  parseShaderStages,
  shaderStageFlagsMap,
  TypedShader,
  TypedShaderGeneric,
  TypedShaderStage,
} from "./shader";
import {
  parseTextureUsageFlags,
  textureUsageFlagsMap,
  TypedTextureDesc,
  TypedTextureUsageFlags,
} from "./texture";

export function typeDevice(device: GPUDevice) {
  const dev = {
    device,
    bufferFormat<
      Name extends string,
      Fmt extends BufferFormat,
      Flags extends TypedBufferUsageFlags[],
      Visibility extends TypedShaderStage[],
    >(
      params: {
        label?: string;
        name: Name;
        format: Fmt;
        visibility: Visibility;
      },
      ...usage: Flags
    ) {
      const perUnitSize = getBufferPerUnitSize(params.format);
      const fixedSize = getBufferFixedSize(params.format);
      const flags = parseBufferUsageFlags(usage);
      const [withLayouts] =
        params.format.type === "wgsl-data-structure"
          ? generateLayouts([params.format.spec])
          : [undefined];

      console.log("layout", withLayouts);

      // @ts-expect-error
      const fill: BufferFillFunction<Fmt> =
        params.format.type === "vertex"
          ? createVertexBufferFillFunction(device, params.format)
          : createWgslDataStructureBufferFillFunction(device, params.format);

      return {
        visibility: shaderStageFlagsMap(params.visibility),
        desc: {
          type: "buffer",
          name: params.name,
          format: params.format,
          usage: bufferUsageFlagsMap(usage),
        } satisfies TypedBufferDesc<Fmt, Flags>,
        new(
          count: number,
        ): GPUBuffer & { _typeInfo: TypedBufferDesc<Fmt, Flags> } {
          // @ts-expect-error
          return device.createBuffer({
            label: params.label ?? params.name,
            usage: flags,
            size: count * perUnitSize + fixedSize,
          });
        },
        reinterpret(
          buf: GPUBuffer,
        ): GPUBuffer & { _typeInfo: TypedBufferDesc<Fmt, Flags> } {
          // @ts-expect-error
          return buf;
        },
        fill,
        quickCreate(data: BufferFillData<Fmt>) {
          const buf = this.new(
            params.format.type === "vertex"
              ? // @ts-expect-error
                data.length
              : withLayouts?.runtimeSized
                ? Array.isArray(data)
                  ? data.length
                  : Object.values(data).at(-1).length
                : 1,
          );
          this.fill(buf, 0, data);
          return buf;
        },
        name<Name2 extends string>(name2: Name2) {
          return dev.bufferFormat(
            {
              ...params,
              name: name2,
            },
            ...usage,
          );
        },
        viz<Visibility2 extends TypedShaderStage[]>(v: Visibility2) {
          return dev.bufferFormat(
            {
              ...params,
              visibility: v,
            },
            ...usage,
          );
        },
        usage<Flags extends TypedBufferUsageFlags[]>(...usage2: Flags) {
          return dev.bufferFormat(params, ...usage2);
        },
        stepMode: <StepMode extends "vertex" | "instance">(mode: StepMode) => {
          if (params.format.type === "wgsl-data-structure") {
            throw new Error("stepMode can only be called on a vertex buffer!");
          }
          return dev.bufferFormat(
            {
              ...params,
              format: {
                ...params.format,
                stepMode: mode,
              },
            },
            ...usage,
          );
        },
      };
    },

    uniformBufferFormat<Name extends string, Spec extends WGSLStructSpec>(
      name: Name,
      spec: Spec,
    ) {
      return this.bufferFormat(
        {
          name,
          format: {
            type: "wgsl-data-structure",
            spec,
            treatAs: "uniform",
          },
          visibility: ["vertex", "fragment"],
        },
        "uniform",
        "copy-dst",
      );
    },

    uniformBufferComputeFormat<
      Name extends string,
      Spec extends WGSLStructSpec,
    >(name: Name, spec: Spec) {
      return this.bufferFormat(
        {
          name,
          format: {
            type: "wgsl-data-structure",
            spec,
            treatAs: "uniform",
          },
          visibility: ["compute"],
        },
        "uniform",
        "copy-dst",
      );
    },

    storageBufferFormat<Name extends string, Spec extends WGSLStructSpec>(
      name: Name,
      spec: Spec,
    ) {
      return this.bufferFormat(
        {
          name,
          format: {
            type: "wgsl-data-structure",
            spec,
            treatAs: "storage",
          },
          visibility: ["compute"],
        },
        "storage",
        "copy-dst",
      );
    },

    vertexBufferFormat<
      Name extends string,
      Attributes extends Attribute[],
      ArrayStride extends number,
    >(name: Name, stride: ArrayStride, attrs: Attributes) {
      return this.bufferFormat(
        {
          name,
          format: {
            type: "vertex",
            attributes: attrs,
            arrayStride: stride,
            stepMode: "vertex",
          },
          visibility: ["vertex"],
        },
        "vertex",
        "copy-dst",
      );
    },

    instanceBufferFormat<
      Name extends string,
      Attributes extends Attribute[],
      ArrayStride extends number,
    >(name: Name, stride: ArrayStride, attrs: Attributes) {
      return this.bufferFormat(
        {
          name,
          format: {
            type: "vertex",
            attributes: attrs,
            arrayStride: stride,
            stepMode: "instance",
          },
          visibility: ["vertex"],
        },
        "vertex",
        "copy-dst",
      );
    },

    textureFormat<
      Name extends string,
      Fmt extends GPUTextureFormat,
      ViewDimension extends GPUTextureViewDimension,
      SampleCount extends 1 | 4,
      Flags extends TypedTextureUsageFlags[],
      Visibility extends TypedShaderStage[],
    >(
      params: {
        name: Name;
        format: Fmt;
        label?: string;
        viewDimension: ViewDimension;
        sampleCount: SampleCount;
        visibility: Visibility;
        mipLevelCount?: number;
        viewFormats?: Iterable<GPUTextureFormat>;
        dimension?: GPUTextureDimension;
        textureBindingViewDimension?: GPUTextureViewDimension;
      },
      ...usage: Flags
    ) {
      const flags = parseTextureUsageFlags(usage);
      return {
        visibility: shaderStageFlagsMap(params.visibility),
        desc: {
          type: "texture",
          name: params.name,
          usage: textureUsageFlagsMap(usage),
          format: params.format,
          viewDimension: params.viewDimension,
          sampleCount: params.sampleCount,
        } satisfies TypedTextureDesc<Fmt, ViewDimension, SampleCount, Flags>,
        new(resolution: Vec2 | Vec3): GPUTexture & {
          _typeInfo: TypedTextureDesc<Fmt, ViewDimension, SampleCount, Flags>;
        } {
          // @ts-expect-error
          return device.createTexture({
            label: params.label ?? params.name,
            size: resolution,
            format: params.format,
            usage: flags,
            mipLevelCount: params.mipLevelCount,
            viewFormats: params.viewFormats,
            sampleCount: params.sampleCount,
            dimension: params.dimension,
            textureBindingViewDimension: params.textureBindingViewDimension,
          });
        },
        name<Name2>(name2: string) {
          return dev.textureFormat(
            {
              ...params,
              name: name2,
            },
            ...usage,
          );
        },
        viz<Visibility2 extends TypedShaderStage[]>(v: Visibility2) {
          return dev.textureFormat(
            {
              ...params,
              visibility: v,
            },
            ...usage,
          );
        },
        usage<Flags extends TypedTextureUsageFlags[]>(...usage2: Flags) {
          return dev.textureFormat(params, ...usage2);
        },
      };
    },

    sampler<
      Name extends string,
      Type extends GPUSamplerType,
      Visibility extends TypedShaderStage[],
    >(
      name: string,
      params: {
        type: Type;
        visibility: Visibility;
      },
    ) {
      return {
        visibility: params.visibility,
        desc: {
          type: params.type,
          name,
        },
        new(
          desc?: GPUSamplerDescriptor,
        ): GPUSampler & { _typeInfo: { type: Type } } {
          // @ts-expect-error
          return device.createSampler({});
        },
      };
    },

    bindGroupFormat<Name extends string, Entries extends TypedBindGroupEntry[]>(
      name: Name,
      ...entries: Entries
    ) {
      const layout = device.createBindGroupLayout({
        entries: entries.map((e, i): GPUBindGroupLayoutEntry => {
          const visibility = parseShaderStages(
            Object.keys(e.visibility) as TypedShaderStage[],
          );

          if (e.desc.type === "texture") {
            return {
              binding: i,
              visibility,
              texture: {
                sampleType: TEXTURE_FORMAT_TO_SAMPLER_TYPE_LUT[e.desc.format],
                multisampled: e.desc.sampleCount > 1,
                viewDimension: e.desc.viewDimension,
              },
            };
          } else if (e.desc.type === "buffer") {
            if (e.desc.format.type === "vertex") {
              return {
                binding: i,
                visibility,
                buffer: {
                  type: "storage",
                },
              };
            } else {
              if (e.desc.format.treatAs === "storage") {
                return {
                  binding: i,
                  visibility,
                  buffer: {
                    type: "storage",
                  },
                };
              } else /* if (e.desc.format.treatAs === "uniform") */ {
                return {
                  binding: i,
                  visibility,
                  buffer: {
                    type: "uniform",
                  },
                };
              }
            }
          } else /* if (e.desc.type === "sampler") */ {
            return {
              binding: i,
              visibility,
              sampler: {
                type: e.desc.samplerType,
              },
            };
          }
        }),
      });

      return {
        desc: {
          name,
          layout,
          entries,
        },
        new(params: InstantiateBindGroupEntries<Entries>): GPUBindGroup & {
          _typeInfo: {
            name: Name;
            layout: GPUBindGroupLayout;
            entries: Entries;
          };
        } {
          // @ts-expect-error
          return device.createBindGroup({
            layout,
            entries: entries.map((e, i) => ({
              binding: i,
              // @ts-expect-error
              resource: params[e.desc.name],
            })),
          });
        },
      };
    },

    shader<Stages extends TypedShaderStage[]>(
      code: string,
      ...stages: Stages
    ): TypedShader<Stages> {
      const module = device.createShaderModule({
        code,
      });

      console.log(code);

      // @ts-expect-error
      module._typeInfo = { stages: shaderStageFlagsMap(stages) };

      // @ts-expect-error
      return module;
    },

    async renderPipelineRaw<
      BindGroups extends TypedBindGroupDescGeneric[],
      Shader extends TypedShaderGeneric,
      Inputs extends TypedBindGroupEntryVertexBufferGeneric[],
      Outputs extends Record<string, TypedOutputFormat>,
    >(params: {
      bindGroups: BindGroups;
      shader: Shader;
      inputs: Inputs;
      outputs: Outputs;
      label?: string;
      primitive?: GPUPrimitiveState;
      multisample?: GPUMultisampleState;
      depthStencil?: GPUDepthStencilState;
    }): Promise<
      GPURenderPipeline & {
        bind(
          pass: GPURenderPassEncoder | GPURenderBundleEncoder,
          bindings: Partial<RenderPipelineBindings<BindGroups, Inputs>>,
        ): void;
      }
    > {
      const fragment = params.shader._typeInfo.stages.fragment
        ? {
            module: params.shader,
            targets: Object.values(params.outputs).map((o) => {
              if (typeof o === "string") {
                return { format: o };
              } else if ((o as any)?.type === "texture") {
                return {
                  format: o.format,
                };
              } else {
                return o as GPUColorTargetState;
              }
            }),
          }
        : undefined;

      let shaderLoc = 0;

      const ppln = await device.createRenderPipelineAsync({
        layout: device.createPipelineLayout({
          bindGroupLayouts: params.bindGroups.map((bg) => bg.desc.layout),
        }),
        label: params.label,
        primitive: params.primitive,
        vertex: {
          module: params.shader,
          buffers: params.inputs.map((b) => ({
            arrayStride: b.desc.format.arrayStride,
            stepMode: b.desc.format.stepMode,
            attributes: b.desc.format.attributes.map((a) => ({
              format: a.format,
              offset: a.offset,
              shaderLocation: shaderLoc++,
            })),
          })),
        },
        multisample: params.multisample,
        fragment,
        depthStencil: params.depthStencil,
      });
      const bindGroupNameToIndex = new Map(
        params.bindGroups.flatMap((b, i) => (b ? [[b.desc.name, i]] : [])),
      );
      const inputNameToIndex = new Map(
        params.inputs.map((b, i) => [b.desc.name, i]),
      );

      // @ts-expect-error
      ppln.bind = (pass, bindings) => {
        for (const [k, v] of Object.entries(bindings)) {
          const bindGroupIndex = bindGroupNameToIndex.get(k);
          if (bindGroupIndex !== undefined) {
            pass.setBindGroup(bindGroupIndex, v as GPUBindGroup);
            continue;
          }

          const inputIndex = inputNameToIndex.get(k);
          if (inputIndex !== undefined) {
            pass.setVertexBuffer(
              inputIndex,
              ...(Array.isArray(v) ? v : [v as GPUBuffer]),
            );
            continue;
          }

          throw new Error(`Bound pipeline does not have attribute '${k}'.`);
        }
      };

      // @ts-expect-error
      return ppln;
    },

    async computePipelineRaw<
      BindGroups extends TypedBindGroupDescGeneric[],
      Shader extends TypedShaderGeneric,
    >(params: {
      bindGroups: BindGroups;
      shader: Shader;
      label?: string;
    }): Promise<
      GPUComputePipeline & {
        bind(
          pass: GPUComputePassEncoder,
          bindings: BindGroupRecord<BindGroups>,
        ): void;
      }
    > {
      const ppln = await device.createComputePipelineAsync({
        layout: device.createPipelineLayout({
          bindGroupLayouts: params.bindGroups.map((bg) => bg.desc.layout),
        }),
        label: params.label,
        compute: {
          module: params.shader,
        },
      });

      const bindGroupNameToIndex = new Map(
        params.bindGroups.flatMap((b, i) => (b ? [[b.desc.name, i]] : [])),
      );

      //@ts-expect-error
      ppln.bind = (pass, bindings) => {
        for (const [k, v] of Object.entries(bindings)) {
          const bindGroupIndex = bindGroupNameToIndex.get(k);
          if (bindGroupIndex !== undefined) {
            pass.setBindGroup(bindGroupIndex, v as GPUBindGroup);
            continue;
          }

          throw new Error(`Bound pipeline does not have attribute '${k}'.`);
        }
      };

      //@ts-expect-error
      return ppln;
    },

    async computePipeline<
      BindGroups extends TypedBindGroupDescGeneric[],
    >(params: {
      bindGroups: BindGroups;
      workgroupSize: Vec3;
      shader: string;
      globals?: string;
      storageBufferAccess?: Record<string, "read" | "write" | "read_write">;
    }) {
      const { requiredStructDefs, requiredBindings } = getStructDefsAndBindings(
        params.bindGroups,
      );

      const shaderSource = `
${createWgslSerializers(...requiredStructDefs).code}          
${requiredBindings}
${params.globals ?? ""}

@compute
@workgroup_size(${params.workgroupSize.join(", ")})
fn ComputeMain(@builtin(global_invocation_id) id: vec3u, @builtin(local_invocation_id) local_id: vec3u) {
  ${params.shader}
}
          `;

      return this.computePipelineRaw({
        bindGroups: params.bindGroups,
        shader: this.shader(shaderSource, "compute"),
      });
    },

    async renderPipeline<
      BindGroups extends TypedBindGroupDescGeneric[],
      Inputs extends TypedBindGroupEntryVertexBufferGeneric[],
      Outputs extends Record<string, TypedOutputFormat>,
    >(params: {
      bindGroups: BindGroups;
      inputs: Inputs;
      outputs: Outputs;
      globals?: string;
      vertex: string;
      primitive?: GPUPrimitiveState;
      fragment?: {
        function: string;
        struct: string;
        extraOutputs?: string;
      };
      depthStencil?: GPUDepthStencilState;
      multisample?: GPUMultisampleState;
    }) {
      const { requiredStructDefs, requiredBindings } = getStructDefsAndBindings(
        params.bindGroups,
      );

      let shaderLoc = 0;

      const vertexStruct =
        params.inputs.length > 0
          ? `struct Vertex {
        ${params.inputs.flatMap((i) => i.desc.format.attributes.map((attr) => `@location(${shaderLoc++}) ${attr.name}: ${vertexFormatToWgslType(attr.format)}`)).join(",\n")}
      }`
          : "";

      return dev.renderPipelineRaw({
        multisample: params.multisample,
        primitive: params.primitive,
        bindGroups: params.bindGroups,
        inputs: params.inputs,
        outputs: params.outputs,
        depthStencil: params.depthStencil,
        shader: this.shader(
          `
        ${createWgslSerializers(...requiredStructDefs).code}
        ${requiredBindings}
        ${params.globals ?? ""}
        ${vertexStruct}

        struct FragInput {
          ${params.fragment?.struct ?? ""}
        }

        struct FragOutput {
          ${params.fragment?.extraOutputs ?? ""}
          ${Object.entries(params.outputs)
            .map(
              ([name, value], i) =>
                `@location(${i}) ${name} : ${TEXTURE_FORMAT_TO_WGSL_TYPE_LUT[typeof value === "string" ? value : value.format]}`,
            )
            .join(",\n  ")}
        }

        @vertex
        fn VSMain(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instanceIndex: u32, ${vertexStruct ? "vertex: Vertex" : ""}) -> FragInput {
          ${params.vertex} 
        }

      ${
        params.fragment
          ? `@fragment
        fn FSMain(input : FragInput) -> FragOutput {
          ${params.fragment.function}
        }`
          : ""
      }
        `,
          ...(params.fragment
            ? (["vertex", "fragment"] as ["vertex", "fragment"])
            : (["vertex"] as ["vertex"])),
        ),
      });
    },

    async computePipelineBundled<Entries extends TypedBindGroupEntry[]>(
      shader: string,
      workgroupSize: Vec3,
      ...bindGroupEntries: Entries
    ) {
      const bgf = dev.bindGroupFormat("bg", ...bindGroupEntries);

      const pl = await dev.computePipeline({
        bindGroups: [bgf] as const,
        shader,
        workgroupSize,
        globals:
          shader.match(/\/\*globals[\s\S]+\*\//g)?.[0]?.slice(9, -2) ??
          undefined,
      });

      return {
        pl,
        bgf,
        new(params: InstantiateBindGroupEntries<Entries>) {
          return {
            bg: bgf.new(params),
            bindAndDispatch(
              pass: GPUComputePassEncoder,
              x: number,
              y?: number,
              z?: number,
            ) {
              pass.setBindGroup(0, this.bg);
              pass.dispatchWorkgroups(x, y, z);
            },
            run(
              pass: GPUComputePassEncoder,
              x: number,
              y?: number,
              z?: number,
            ) {
              pass.setPipeline(pl);
              pass.setBindGroup(0, this.bg);
              pass.dispatchWorkgroups(x, y, z);
            },
            runIndirect(
              pass: GPUComputePassEncoder,
              indirect: GPUBuffer,
              offset?: number,
            ) {
              pass.setPipeline(pl);
              pass.setBindGroup(0, this.bg);
              pass.dispatchWorkgroupsIndirect(indirect, offset ?? 0);
            },
          };
        },
      };
    },
  };

  return dev;
}
