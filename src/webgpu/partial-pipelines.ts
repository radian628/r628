import {
  AllEq,
  Eq,
  FromEntries,
  OneLayerFlatten,
  TypeLevelError,
  ListAppend,
  LinkedList,
  ListTail,
} from "../typelevel";
import {
  VERTEX_FORMAT_TO_JS_TYPE,
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

type WrappedBindGroupVertexBuffer<
  ArrayStride extends number,
  Attrs extends Attribute[],
> = {
  type: "vertex-buffer";
  name: string;
  arrayStride: ArrayStride;
  attributes: Attrs;
  instantiate(count: number): GPUBuffer;
  interleave(
    src: FromEntries<{
      [N in keyof Attrs]: [
        Attrs[N]["name"],
        VERTEX_FORMAT_TO_TYPEDARRAY_TYPE[Attrs[N]["format"]],
      ];
    }>,
    dst?: ArrayBuffer,
    offset?: number
  ): ArrayBuffer;
  parametric(fn: (i: number) => VBufferParametric<Attrs>);
};

type WrappedBuffer<
  ArrayStride extends number,
  Attrs extends Attribute[],
> = GPUBuffer & {
  arrayStride: ArrayStride;
  attributes: Attrs;
};

type WrappedBufferGeneric = WrappedBuffer<number, Attribute[]>;

type WrappedOutput = {
  format: GPUTextureFormat;
};

type WrappedPipeline<
  BindGroups extends (WrappedBindGroup | undefined)[],
  Shader extends WrappedShader,
  Inputs extends WrappedBindGroupVertexBuffer<number, Attribute[]>[],
  Outputs extends WrappedOutput,
> = {
  bindGroups: BindGroups;
  shader: Shader;
  inputs: Inputs;
  outputs: Outputs;
};

type WrappedPipelineGeneric = WrappedPipeline<
  (WrappedBindGroup | undefined)[],
  WrappedShader,
  WrappedBindGroupVertexBuffer<number, Attribute[]>[],
  WrappedOutput
>;

type WithKeys<A, B> = Omit<A, keyof B> & B;

type RenderPassBindings = {
  pipeline?: LinkedList<GPURenderPipeline | null>;
  indexBuffer?: LinkedList<GPUBuffer>;
  indexFormat?: LinkedList<"uint32" | "uint16">;
} & {
  [K in `bindGroup${number}`]?: LinkedList<GPUBindGroup | null>;
} & {
  [K in `vertexBuffer${number}`]?: LinkedList<GPUBuffer | null>;
};

type CurrentBindings<RPB extends RenderPassBindings> = {
  [K in keyof RPB]: RPB[K] extends LinkedList<any> ? ListTail<RPB[K]> : never;
};

type InitRenderPassEncoder = WrappedRenderPassEncoder<{}>;

type RenderPassEncoderDrawFunctions = Pick<
  GPURenderPassEncoder,
  "draw" | "drawIndexed" | "drawIndexedIndirect" | "drawIndirect"
>;

type RenderPassEncoderDrawErrors<Errs> = {
  draw: Errs;
  drawIndexed: Errs;
  drawIndexedIndirect: Errs;
  drawIndirect: Errs;
};

type EqOrError<A, B, Err> = Eq<A, B> extends true ? [] : [Err];

type AllEqOrError<As extends any[], Bs extends any[], Err> =
  AllEq<As, Bs> extends true ? [] : [Err];

type TypecheckAttr<
  Expected extends Attribute,
  Actual extends Attribute,
  BufferIndex extends number,
> = AllEqOrError<
  [Expected["format"], Expected["offset"]],
  [Actual["format"], Expected["offset"]],
  `Pipeline expects attribute '${Expected["name"]}' in buffer ${BufferIndex} to have a format of '${Expected["format"]}' at offset ${Expected["offset"]}; however, no such attribute exists in the currently bound buffer.`
>;

type TypecheckAttrsInner<
  Expected extends Attribute[],
  Actual extends Attribute[],
  BufferIndex extends number,
> = Expected extends [
  infer ExpectedAttr extends Attribute,
  ...infer ExpectedRest extends Attribute[],
]
  ? Actual extends [
      infer ActualAttr extends Attribute,
      ...infer ActualRest extends Attribute[],
    ]
    ? [
        TypecheckAttr<ExpectedAttr, ActualAttr, BufferIndex>,
        ...TypecheckAttrsInner<ExpectedRest, ActualRest, BufferIndex>,
      ]
    : [
        `Pipeline expects attribute '${ExpectedAttr["name"]}' in buffer ${BufferIndex} to have a format of '${ExpectedAttr["format"]}' at offset ${ExpectedAttr["offset"]}; however, no such attribute exists in the currently bound buffer.`,
      ]
  : [];

type TypecheckAttrs<
  Pipeline extends WrappedPipelineGeneric,
  Index extends number,
  BufferFmt extends WrappedBufferGeneric,
> = TypecheckAttrsInner<
  Pipeline["inputs"][Index]["attributes"],
  BufferFmt["attributes"],
  Index
>;

type TypecheckVertexBuffer<
  Pipeline extends WrappedPipelineGeneric,
  Index extends number,
  BufferFmt extends WrappedBufferGeneric,
> = Pipeline["inputs"][Index] extends undefined
  ? []
  : [
      ...EqOrError<
        Pipeline["inputs"][Index]["arrayStride"],
        BufferFmt["arrayStride"],
        `Currently bound vertex buffer ${Index} has array stride ${BufferFmt["arrayStride"]} but currently bound pipeline expects ${Pipeline["inputs"][Index]["arrayStride"]}`
      >,
      ...TypecheckAttrs<Pipeline, Index, BufferFmt>,
    ];

type TypecheckRenderPassInputs<Bindings> = Bindings extends RenderPassBindings
  ? []
  : never;

type GatherRenderPassErrors<Bindings> = Bindings extends RenderPassBindings
  ? Bindings["pipeline"] extends undefined
    ? ["Cannot draw with no pipeline."]
    : Bindings["pipeline"] extends WrappedPipelineGeneric
      ? []
      : ["Expected a typed pipeline; received", Bindings["pipeline"]]
  : ["Expected render pass bindings, received", Bindings];

type WrappedRenderPassEncoderDrawFunctions<Bindings> =
  GatherRenderPassErrors<Bindings> extends []
    ? RenderPassEncoderDrawFunctions
    : RenderPassEncoderDrawErrors<GatherRenderPassErrors<Bindings>>;

const enc: InitRenderPassEncoder = undefined as any;

enc.bindings;

enc.setPipeline(undefined as unknown as GPURenderPipeline);

enc.draw;
enc.bindings.pipeline;
enc.setPipeline(undefined as unknown as GPURenderPipeline);

enc.bindings.pipeline;
enc.setPipeline(undefined as unknown as null);
enc.bindings.pipeline;
enc.setPipeline(undefined as unknown as GPURenderPipeline);
enc.bindings.pipeline;
enc.setPipeline(undefined as unknown as GPURenderPipeline);
enc.bindings.pipeline;
type Errstest = WrappedRenderPassEncoderDrawFunctions<{
  pipeline: GPURenderPipeline;
}>;

// type SKLDFJ = ListAppend<
//   {
//     data: GPURenderPipeline
//   },
//   null
// >

type WrappedRenderPassEncoder<Bindings> = Bindings extends RenderPassBindings
  ? {
      bindings: Bindings;
      setPipeline<P extends GPURenderPipeline | null>(
        p: P
      ): asserts this is WrappedRenderPassEncoder<{
        pipeline: ListAppend<
          Bindings extends {
            pipeline: infer P2 extends LinkedList<GPURenderPipeline>;
          }
            ? P2
            : undefined,
          P
        >;
      }>;

      setBindGroup<N extends number, Group extends GPUBindGroup | null>(
        index: N,
        bindGroup: Group,
        dynamicOffsets?: Uint32Array | number[],
        dynamicOffsetsStart?: number,
        dynamicOffsetsEnd?: number
      ): asserts this is WrappedRenderPassEncoder<
        WithKeys<
          Bindings,
          {
            [B in N as `bindGroup${B}`]: Group;
          }
        >
      >;
      setVertexBuffer<N extends number, Buffer extends GPUBuffer | null>(
        slot: N,
        buffer: Buffer,
        offset?: number,
        size?: number
      ): asserts this is WrappedRenderPassEncoder<
        WithKeys<
          Bindings,
          {
            [B in N as `vertexBuffer${B}`]: Buffer;
          }
        >
      >;
      setIndexBuffer<Buffer extends GPUBuffer, Fmt extends "uint32" | "uint16">(
        buffer: Buffer,
        indexFormat: Fmt,
        offset?: number,
        size?: number
      ): asserts this is WrappedRenderPassEncoder<
        WithKeys<
          Bindings,
          {
            indexBuffer: Buffer;
            indexFormat: Fmt;
          }
        >
      >;
    } & Omit<
      GPURenderPassEncoder,
      | "setPipeline"
      | "setBindGroup"
      | "setVertexBuffer"
      | "setIndexBuffer"
      | "draw"
      | "drawIndirect"
      | "drawIndexed"
      | "drawIndexedIndirect"
    > &
      WrappedRenderPassEncoderDrawFunctions<CurrentBindings<Bindings>>
  : TypeLevelError<["Unrecognized render pass bindings."]>;

const rpe: InitRenderPassEncoder =
  undefined as unknown as InitRenderPassEncoder;

class Test1 {
  assert(): asserts this is { a: "hello" } {
    return;
  }
}

type VBufferParametric<A extends Attribute[]> = FromEntries<{
  [N in keyof A]: [A[N]["name"], VERTEX_FORMAT_TO_JS_TYPE[A[N]["format"]]];
}>;

type WrappedBindGroupEntry = WrappedBindGroupTexture;

type WrappedBindGroup = {
  name: string;
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
  DstObj,
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
      Inputs extends WrappedBindGroupVertexBuffer<any, any>[],
    >(params: { bindGroups: BindGroups; shader: Shader; inputs: Inputs }) {},
  };
}
