import { arrayToObjEntries } from "../../object-utils";
import {
  VERTEX_FORMAT_TO_ELEMENT_COUNT,
  VERTEX_FORMAT_TO_ELEMENT_SIZE,
  VERTEX_FORMAT_TO_JS_TYPE,
  VERTEX_FORMAT_TO_TYPEDARRAY_CONSTRUCTOR,
} from "../converters";
import {
  createLayoutGenerator,
  generateLayouts,
  typeName,
  WGSLStructSpec,
  WGSLStructValues,
} from "../wgsl-struct-layout-generator";
import { mapFlags } from "./common";

type WGSLDataStructureBufferFormat<
  Spec extends WGSLStructSpec,
  TreatAs extends "storage" | "uniform",
> = {
  type: "wgsl-data-structure";
  spec: Spec;
  treatAs: TreatAs;
};

export type Attribute = {
  format: GPUVertexFormat;
  offset: number;
  name: string;
};

type VertexBufferFormat<
  ArrayStride extends number,
  Attributes extends Attribute[],
  StepMode extends GPUVertexStepMode,
> = {
  type: "vertex";
  arrayStride: ArrayStride;
  attributes: Attributes;
  stepMode: StepMode;
};
type VertexBufferFormatGeneric = VertexBufferFormat<
  number,
  Attribute[],
  GPUVertexStepMode
>;

export type BufferFormat =
  | WGSLDataStructureBufferFormat<WGSLStructSpec, "storage" | "uniform">
  | VertexBufferFormat<number, Attribute[], GPUVertexStepMode>;

export type TypedBufferUsageFlags =
  | "map-read"
  | "map-write"
  | "copy-src"
  | "copy-dst"
  | "indirect"
  | "vertex"
  | "storage"
  | "query-resolve"
  | "uniform"
  | "index";

type TypedBufferUsageFlagsMap<Flags extends TypedBufferUsageFlags[]> =
  Flags extends [
    infer First extends TypedBufferUsageFlags,
    ...infer Rest extends TypedBufferUsageFlags[],
  ]
    ? {
        [K in First]: true;
      } & TypedBufferUsageFlagsMap<Rest>
    : Partial<Record<TypedBufferUsageFlags, true>>;

export function bufferUsageFlagsMap<Flags extends TypedBufferUsageFlags[]>(
  flags: Flags,
): TypedBufferUsageFlagsMap<Flags> {
  // @ts-expect-error
  return mapFlags(flags);
}

export type TypedBufferDesc<
  Fmt extends BufferFormat,
  Flags extends TypedBufferUsageFlags[],
> = {
  type: "buffer";
  name: string;
  usage: TypedBufferUsageFlagsMap<Flags>;
  format: Fmt;
};
export type TypedBufferDescGeneric = TypedBufferDesc<
  BufferFormat,
  TypedBufferUsageFlags[]
>;

export type TypedVertexBufferDescGeneric = TypedBufferDesc<
  VertexBufferFormatGeneric,
  TypedBufferUsageFlags[]
>;

export type TypedBindGroupEntryVertexBufferGeneric = {
  desc: TypedVertexBufferDescGeneric;
};

export function parseBufferUsageFlags(flags: TypedBufferUsageFlags[]): number {
  if (flags.length === 0) return 0;
  return (
    {
      storage: GPUBufferUsage.STORAGE,
      vertex: GPUBufferUsage.VERTEX,
      index: GPUBufferUsage.INDEX,
      "map-read": GPUBufferUsage.MAP_READ,
      "map-write": GPUBufferUsage.MAP_WRITE,
      "copy-src": GPUBufferUsage.COPY_SRC,
      "copy-dst": GPUBufferUsage.COPY_DST,
      indirect: GPUBufferUsage.INDIRECT,
      uniform: GPUBufferUsage.UNIFORM,
      "query-resolve": GPUBufferUsage.QUERY_RESOLVE,
    }[flags[0]] | parseBufferUsageFlags(flags.slice(1))
  );
}

export function getBufferPerUnitSize(fmt: BufferFormat) {
  if (fmt.type === "vertex") {
    return fmt.arrayStride;
  } else {
    const [layout] = generateLayouts([fmt.spec]);
    return layout.runtimeSized ? layout.perElementSize : 0;
  }
}
export function getBufferFixedSize(fmt: BufferFormat) {
  if (fmt.type === "vertex") {
    return 0;
  } else {
    const [layout] = generateLayouts([fmt.spec]);
    return layout.size === Infinity
      ? layout.type === "struct"
        ? layout.size
        : 0
      : layout.size;
  }
}

type VertexBufferFillData<Attributes extends Attribute[]> = Attributes extends [
  infer A extends Attribute,
  ...infer Rest extends Attribute[],
]
  ? {
      [K in A["name"]]: VERTEX_FORMAT_TO_JS_TYPE[A["format"]];
    } & VertexBufferFillData<Rest>
  : {};

type WGSLDataStructureBufferFillData<Spec extends WGSLStructSpec> =
  WGSLStructValues<Spec>;

export type BufferFillData<Fmt extends BufferFormat> =
  Fmt extends VertexBufferFormat<
    number,
    infer Attrs extends Attribute[],
    GPUVertexStepMode
  >
    ? VertexBufferFillData<Attrs>[]
    : Fmt extends { spec: infer Spec extends WGSLStructSpec }
      ? WGSLDataStructureBufferFillData<Spec>
      : never;

export type BufferFillFunction<Fmt extends BufferFormat> = (
  buf: GPUBuffer,
  offset: number,
  data: BufferFillData<Fmt>,
) => void;

export function createVertexBufferFillFunction<
  Fmt extends VertexBufferFormatGeneric,
>(device: GPUDevice, fmt: Fmt) {
  return function (buf: GPUBuffer, offset: number, data: BufferFillData<Fmt>) {
    const cpubuf = new ArrayBuffer(buf.size);
    const attrViews = arrayToObjEntries(fmt.attributes, (attr) => [
      attr.name,
      new VERTEX_FORMAT_TO_TYPEDARRAY_CONSTRUCTOR[attr.format](cpubuf),
    ]);

    let index = 0;
    for (const d of data) {
      for (const a of fmt.attributes) {
        const view = attrViews[a.name];
        const elementSize = VERTEX_FORMAT_TO_ELEMENT_SIZE[a.format];
        const elementCount = VERTEX_FORMAT_TO_ELEMENT_COUNT[a.format];
        for (let i = 0; i < elementCount; i++) {
          const byteOffset = index * fmt.arrayStride + a.offset;
          const elementOffset = byteOffset / elementSize + i;
          // @ts-expect-error
          view[elementOffset] = elementCount === 1 ? d[a.name] : d[a.name][i];
        }
      }
      index++;
    }

    device.queue.writeBuffer(buf, 0, cpubuf);
  };
}

export function createWgslDataStructureBufferFillFunction<
  Fmt extends WGSLDataStructureBufferFormat<
    WGSLStructSpec,
    "storage" | "uniform"
  >,
>(device: GPUDevice, fmt: Fmt) {
  const [withLayouts] = generateLayouts([fmt.spec]);
  const gen = createLayoutGenerator(withLayouts);

  const perUnit = getBufferPerUnitSize(fmt);
  const fixed = getBufferFixedSize(fmt);

  return function (buf: GPUBuffer, offset: number, data: BufferFillData<Fmt>) {
    const unitCount = withLayouts.runtimeSized
      ? Array.isArray(data)
        ? data.length
        : Object.values(data!).at(-1).length
      : 1;

    const buflen = withLayouts.runtimeSized
      ? fixed + perUnit * unitCount
      : withLayouts.size;

    const cpubuf = new ArrayBuffer(buflen);

    gen(new DataView(cpubuf), data);
    device.queue.writeBuffer(buf, offset, cpubuf);
  };
}

export function bufferWgsl(
  groupIndex: number,
  bindingIndex: number,
  name: string,
  spec: WGSLStructSpec,
) {
  return `@group(${groupIndex}) @binding(${bindingIndex}) var<uniform> ${
    name
  } : ${typeName(spec)};`;
}

export function bufferWgslStorage(
  groupIndex: number,
  bindingIndex: number,
  name: string,
  spec: WGSLStructSpec,
) {
  return `@group(${groupIndex}) @binding(${bindingIndex}) var<storage, read_write> ${
    name
  } : ${typeName(spec)};`;
}
