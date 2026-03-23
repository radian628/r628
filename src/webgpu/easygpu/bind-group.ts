import {
  BufferFormat,
  TypedBufferDesc,
  TypedBufferDescGeneric,
  TypedBufferUsageFlags,
} from "./buffer";
import { GPUSamplerType, TypedSamplerDesc } from "./sampler";
import { TypedShaderStage, TypedShaderStageMapGeneric } from "./shader";
import {
  GPUSampleCount,
  TypedTextureDesc,
  TypedTextureDescGeneric,
  TypedTextureUsageFlags,
} from "./texture";

export type TypedBindGroupEntryDesc =
  | TypedTextureDesc<
      GPUTextureFormat,
      GPUTextureViewDimension,
      GPUSampleCount,
      TypedTextureUsageFlags[]
    >
  | TypedSamplerDesc<GPUSamplerType>
  | TypedBufferDesc<BufferFormat, TypedBufferUsageFlags[]>;

export type TypedBindGroupEntry = {
  desc: TypedBindGroupEntryDesc;
  visibility: TypedShaderStageMapGeneric;
};

type TypeCheckableBindGroupEntryDesc<D extends TypedBindGroupEntryDesc> = Omit<
  D,
  "name"
>;

export type TypedBindGroupLayoutDesc<Entries extends TypedBindGroupEntry[]> = {
  name: string;
  entries: Entries;
};

export type TypedBindGroupLayoutDescGeneric = TypedBindGroupLayoutDesc<
  TypedBindGroupEntry[]
>;

export type InstantiateBindGroupEntry<Entry extends TypedBindGroupEntry> =
  Entry["desc"] extends TypedBufferDescGeneric
    ? GPUBuffer & { _typeInfo: TypeCheckableBindGroupEntryDesc<Entry["desc"]> }
    : Entry["desc"] extends TypedTextureDescGeneric
      ? GPUTexture & {
          _typeInfo: TypeCheckableBindGroupEntryDesc<Entry["desc"]>;
        }
      : Entry["desc"] extends TypedSamplerDesc<GPUSamplerType>
        ? GPUSampler & {
            _typeInfo: TypeCheckableBindGroupEntryDesc<Entry["desc"]>;
          }
        : never;

export type InstantiateBindGroupEntries<Entries extends TypedBindGroupEntry[]> =
  Entries extends [
    infer First extends TypedBindGroupEntry,
    ...infer Rest extends TypedBindGroupEntry[],
  ]
    ? {
        [K in First["desc"]["name"]]: InstantiateBindGroupEntry<First>;
      } & InstantiateBindGroupEntries<Rest>
    : {};

export type TypedBindGroupDescGeneric = {
  desc: {
    name: string;
    layout: GPUBindGroupLayout;
    entries: TypedBindGroupEntry[];
  };
};
