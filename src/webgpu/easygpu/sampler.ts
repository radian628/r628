export type GPUSamplerType = "comparison" | "filtering" | "non-filtering";

export type TypedSamplerDesc<SamplerType extends GPUSamplerType> = {
  type: "sampler";
  name: string;
  samplerType: SamplerType;
};
