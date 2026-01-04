import {
  VERTEX_FORMAT_TO_TYPEDARRAY_TYPE,
  vertexFormatStride,
} from "./converters";

type WrappedBindGroupTexture = {
  name: string;
  type: "texture";
};

type Attribute = {
  format: GPUVertexFormat;
  offset: number;
  name: string;
};

type WrappedBindGroupVertexBuffer<Attrs extends Attribute[]> = {
  type: "vertex-buffer";
  arrayStride: number;
  attributes: Attrs;
  interleave(
    ...params: ConvertArrayByObjectKeys<
      Attrs,
      "format",
      VERTEX_FORMAT_TO_TYPEDARRAY_TYPE
    >
  );
  fromArray(
    ...array: ConvertArrayByObjectKeys<Attrs, "format", {}>[]
  ): ArrayBuffer;
};

type WrappedBindGroupEntry =
  | WrappedBindGroupTexture
  | WrappedBindGroupVertexBuffer<Attribute[]>;

type WrappedBindGroup = {
  entries: WrappedBindGroupEntry[];
};

type WrappedShader = {
  module: GPUShaderModule;
  stages: ShaderStage[];
};

type ShaderStage = "compute" | "vertex" | "fragment";

type ConvertArray<Arr extends any[], Dst> = Arr extends [
  infer First,
  ...infer Rest,
]
  ? [Dst, ...ConvertArray<Rest, Dst>]
  : [];

type ConvertArrayByObjectKeys<
  Arr extends any[],
  SrcKey extends keyof Arr[number],
  DstObj extends Record<Arr[number][SrcKey], any>,
> = Arr extends [infer First extends Arr[number], ...infer Rest]
  ? [DstObj[First[SrcKey]], ...ConvertArrayByObjectKeys<Rest, SrcKey, DstObj>]
  : [];

type TypesToAttrs<Types extends [string, GPUVertexFormat][]> = Types extends [
  [infer Name, infer Fmt],
  ...infer Rest extends [string, GPUVertexFormat][],
]
  ? [
      {
        name: Name;
        fmt: Fmt;
        offset: number;
      },
      ...TypesToAttrs<Rest>,
    ]
  : [];

export function wrapDevice(device: GPUDevice) {
  return {
    vertexBuffer<Types extends [string, GPUVertexFormat][]>(
      ...types: Types
    ): {
      type: "vertex-buffer";
      arrayStride: number;
      attributes: TypesToAttrs<Types>;
    } {
      let size = 0;

      let attributes: {
        format: GPUVertexFormat;
        offset: number;
        name: string;
      }[] = [];

      for (const [name, format] of types) {
        const stride = vertexFormatStride(format);

        attributes.push({
          format,
          name,
          offset: size,
        });

        size += stride;
      }

      return {
        type: "vertex-buffer",
        arrayStride: size,
        // @ts-expect-error
        attributes,
      };
    },
    bindGroup<Entries extends WrappedBindGroupEntry[]>(
      ...entries: Entries
    ): {
      entries: Entries;
    } {
      return {
        entries,
      };
    },
    texture<Name extends string>(
      name: Name
    ): {
      type: "texture";
      name: Name;
    } {
      return {
        name,
        type: "texture",
      };
    },
    shader(code: string, stages: ShaderStage[] = ["vertex", "fragment"]) {
      const module = device.createShaderModule({
        code,
      });
      return { module, stages };
    },
    pipeline<
      BindGroups extends WrappedBindGroup[],
      Shader extends WrappedShader,
      Inputs extends WrappedBindGroupVertexBuffer<any>,
    >(params: { bindGroups: BindGroups; shader: Shader; inputs: Inputs }) {},
  };
}
