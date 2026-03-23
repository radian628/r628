import {
  TEXTURE_FORMAT_TO_WGSL_TYPE_LUT,
  WGSL_TYPE_DATATYPES,
} from "../converters";
import {
  TypedBindGroupDescGeneric,
  TypedBindGroupLayoutDescGeneric,
} from "./bind-group";
import {
  bufferWgsl,
  bufferWgslStorage,
  TypedBindGroupEntryVertexBufferGeneric,
  TypedVertexBufferDescGeneric,
} from "./buffer";
import { TypedShader, TypedShaderStage } from "./shader";
import { TypedTextureDescGeneric } from "./texture";

export type TypedOutputFormat =
  | GPUTextureFormat
  | GPUColorTargetState
  | TypedTextureDescGeneric;

export type TypedRenderPipelineDesc<
  BindGroups extends ({ desc: TypedBindGroupLayoutDescGeneric } | undefined)[],
  Shader extends TypedShader<["vertex", "fragment"]> | TypedShader<["vertex"]>,
  Inputs extends { desc: TypedVertexBufferDescGeneric }[],
  Outputs extends Record<string, TypedOutputFormat>,
> = {
  bindGroups: BindGroups;
  shader: Shader;
  inputs: Inputs;
  outputs: Outputs;
};

export type TypedComputePipelineDesc<
  BindGroups extends (TypedBindGroupLayoutDescGeneric | undefined)[],
  Shader extends TypedShader<["compute"]>,
> = {
  bindGroups: BindGroups;
  shader: Shader;
};

export function getStructDefsAndBindings<
  BindGroups extends TypedBindGroupDescGeneric[],
>(bindGroups: BindGroups) {
  const requiredStructDefs = bindGroups.flatMap((bg) =>
    bg.desc.entries.flatMap((e) => {
      if (
        e.desc.type === "buffer" &&
        e.desc.format.type === "wgsl-data-structure"
      ) {
        return [e.desc.format.spec];
      } else {
        return [];
      }
    }),
  );

  const requiredBindings = bindGroups
    .flatMap((bg, groupIndex) =>
      bg.desc.entries.flatMap((e, bindingIndex) => {
        if (e.desc.type === "buffer") {
          if (e.desc.format.type === "wgsl-data-structure") {
            if (e.desc.format.treatAs === "uniform") {
              return bufferWgsl(
                groupIndex,
                bindingIndex,
                e.desc.name,
                e.desc.format.spec,
              );
            } else {
              return bufferWgslStorage(
                groupIndex,
                bindingIndex,
                e.desc.name,
                e.desc.format.spec,
              );
            }
          }
        } else if (e.desc.type === "texture") {
          return `@group(${
            groupIndex
          }) @binding(${bindingIndex}) var ${e.desc.name}: texture_${e.desc.viewDimension.replace("-", "_")}<${WGSL_TYPE_DATATYPES[TEXTURE_FORMAT_TO_WGSL_TYPE_LUT[e.desc.format]]}>;`;
        } else if (e.desc.type === "sampler") {
          return `@group(${groupIndex}) @binding(${bindingIndex}) var ${e.desc.name}: sampler;`;
        } else {
          return "";
        }
      }),
    )
    .join("\n");

  return {
    requiredStructDefs,
    requiredBindings,
  };
}

export type BindGroupRecord<BindGroups extends TypedBindGroupDescGeneric[]> =
  BindGroups extends [
    infer First extends TypedBindGroupDescGeneric,
    ...infer Rest extends TypedBindGroupDescGeneric[],
  ]
    ? {
        [K in First["desc"]["name"]]: GPUBindGroup & {
          _typeInfo: First["desc"];
        };
      } & BindGroupRecord<Rest>
    : {};

type InputRecordEntry<T> = T | [T, number];

type InputRecord<Inputs extends TypedBindGroupEntryVertexBufferGeneric[]> =
  Inputs extends [
    infer First extends TypedBindGroupEntryVertexBufferGeneric,
    ...infer Rest extends TypedBindGroupEntryVertexBufferGeneric[],
  ]
    ? {
        [K in First["desc"]["name"]]: InputRecordEntry<
          GPUBuffer & {
            _typeInfo: Omit<First["desc"], "name" | "usage"> & {
              usage: { vertex: true };
            };
          }
        >;
      } & InputRecord<Rest>
    : {};

export type RenderPipelineBindings<
  BindGroups extends TypedBindGroupDescGeneric[],
  Inputs extends TypedBindGroupEntryVertexBufferGeneric[],
> = BindGroupRecord<BindGroups> & InputRecord<Inputs>;
