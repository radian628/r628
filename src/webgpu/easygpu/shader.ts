import { mapFlags } from "./common";

export function shaderStageFlagsMap<Flags extends TypedShaderStage[]>(
  flags: Flags,
): TypedShaderStageMap<Flags> {
  // @ts-expect-error
  return mapFlags(flags);
}

type TypedShaderDesc = {
  stages: TypedShaderStageMap<TypedShaderStage[]>;
};

export function parseShaderStages(flags: TypedShaderStage[]): number {
  if (flags.length === 0) return 0;
  return (
    {
      vertex: GPUShaderStage.VERTEX,
      fragment: GPUShaderStage.FRAGMENT,
      compute: GPUShaderStage.COMPUTE,
    }[flags[0]] | parseShaderStages(flags.slice(1))
  );
}

export type TypedShaderStage = "vertex" | "fragment" | "compute";

export type TypedShaderStageMap<Flags extends TypedShaderStage[]> =
  Flags extends [
    infer First extends TypedShaderStage,
    ...infer Rest extends TypedShaderStage[],
  ]
    ? {
        [K in First]: true;
      } & TypedShaderStageMap<Rest>
    : {};

export type TypedShaderStageMapGeneric = {
  fragment?: true;
  vertex?: true;
  compute?: true;
};

export type TypedShader<Stages extends TypedShaderStage[]> = GPUShaderModule & {
  _typeInfo: {
    stages: TypedShaderStageMap<Stages>;
  };
};

export type TypedShaderGeneric = GPUShaderModule & {
  _typeInfo: {
    stages: TypedShaderStageMapGeneric;
  };
};
