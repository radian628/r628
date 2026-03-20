import { mapFlags } from "./common";

export type GPUSampleCount = 1 | 4;

export type TypedTextureUsageFlags =
  | "copy-src"
  | "copy-dst"
  | "render-attachment"
  | "storage-binding"
  | "texture-binding";

type TypedTextureUsageFlagsMap<Flags extends TypedTextureUsageFlags[]> =
  Flags extends [
    infer First extends TypedTextureUsageFlags,
    ...infer Rest extends TypedTextureUsageFlags[],
  ]
    ? {
        [K in First]: true;
      } & TypedTextureUsageFlagsMap<Rest>
    : Partial<Record<TypedTextureUsageFlags, true>>;

export function textureUsageFlagsMap<Flags extends TypedTextureUsageFlags[]>(
  flags: Flags,
): TypedTextureUsageFlagsMap<Flags> {
  // @ts-expect-error
  return mapFlags(flags);
}

export type TypedTextureDesc<
  Format extends GPUTextureFormat,
  ViewDimension extends GPUTextureViewDimension,
  SampleCount extends GPUSampleCount,
  Flags extends TypedTextureUsageFlags[],
> = {
  type: "texture";
  name: string;
  format: Format;
  viewDimension: ViewDimension;
  sampleCount: SampleCount;
  usage: TypedTextureUsageFlagsMap<Flags>;
};
export type TypedTextureDescGeneric = TypedTextureDesc<
  GPUTextureFormat,
  GPUTextureViewDimension,
  GPUSampleCount,
  TypedTextureUsageFlags[]
>;

export function parseTextureUsageFlags(
  flags: TypedTextureUsageFlags[],
): number {
  if (flags.length === 0) return 0;
  return (
    {
      "copy-src": GPUTextureUsage.COPY_SRC,
      "copy-dst": GPUTextureUsage.COPY_DST,
      "render-attachment": GPUTextureUsage.RENDER_ATTACHMENT,
      "storage-binding": GPUTextureUsage.STORAGE_BINDING,
      "texture-binding": GPUTextureUsage.TEXTURE_BINDING,
    }[flags[0]] | parseTextureUsageFlags(flags.slice(1))
  );
}
