type GPUSamplerType = "comparison" | "filtering" | "non-filtering";

type TypedSamplerDesc<SamplerType extends GPUSamplerType> = {
  type: "sampler";
  name: string;
  samplerType: SamplerType;
};
