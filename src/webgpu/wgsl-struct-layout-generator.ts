import { memo, range, TypeLevelError } from "..";
import { roundUp } from "../math/round";
import {
  WGSL_TYPE_ALIGNMENTS,
  WGSL_TYPE_DATATYPES,
  WGSL_TYPE_ELEMENT_COUNTS,
  WGSL_TYPE_SIZES,
  WgslPrimitiveToType,
} from "./converters";

type WGSLStructSpecStruct = WGSLStructSpec & { type: "struct" };

export type WGSLStructSpec =
  | {
      type: "struct";
      members:
        | [string, { type: WGSLStructSpec }][]
        | Record<string, { type: WGSLStructSpec }>;
      name: string;
    }
  | {
      type: keyof typeof WGSL_TYPE_SIZES;
    }
  | {
      type: "array";
      count: number;
      member: WGSLStructSpec;
    };

export type GenerateWGSLStructFromCompactRepr<
  Name extends string,
  Members extends Record<
    string,
    keyof typeof WGSL_TYPE_ALIGNMENTS | WGSLStructSpec
  >,
> = {
  type: "struct";
  name: Name;
  members: {
    [K in keyof Members]: {
      type: Members[K] extends string
        ? { type: Members[K] }
        : Members[K] extends WGSLStructSpec
          ? Members[K]
          : never;
    };
  };
};

export function struct<
  Name extends string,
  Members extends Record<
    string,
    keyof typeof WGSL_TYPE_ALIGNMENTS | WGSLStructSpec
  >,
>(
  name: Name,
  members: Members
): GenerateWGSLStructFromCompactRepr<Name, Members> {
  return {
    type: "struct",
    name,
    // @ts-expect-error
    members: Object.entries(members).map(([k, v]) => [
      k,
      typeof v === "string" ? { type: { type: v } } : { type: v },
    ]),
  };
}

export function array<
  Count extends number,
  Member extends WGSLStructSpec | keyof typeof WGSL_TYPE_ALIGNMENTS,
>(
  count: Count,
  member: Member
): {
  type: "array";
  count: Count;
  member: Member extends string ? { type: Member } : Member;
} {
  return {
    type: "array",
    count,
    // @ts-expect-error
    member: typeof member === "string" ? { type: member } : member,
  };
}

export function primitive<T extends keyof typeof WGSL_TYPE_ALIGNMENTS>(
  type: T
) {
  return { type };
}

export type WGSLStructSpecWithOffsets =
  | {
      type: "struct";
      members: [string, { type: WGSLStructSpecWithOffsets; offset: number }][];
      size: number;
      align: number;
      name: string;
    }
  | {
      type: keyof typeof WGSL_TYPE_SIZES;
      size: number;
      align: number;
    }
  | {
      type: "array";
      count: number;
      member: WGSLStructSpecWithOffsets;
      size: number;
      align: number;
    };

type ArrayToObject<A extends [keyof any, any][]> = A extends [
  [infer K extends keyof any, infer V],
  ...infer Rest extends [keyof any, any][],
]
  ? { [Key in K]: V } & ArrayToObject<Rest>
  : {};

type WGSLStructMembersToValues<
  T extends Record<string, { type: WGSLStructSpec }>,
> = {
  [K in keyof T]: WGSLStructValues<T[K]["type"]>;
};

export type WGSLStructValues<T> = T extends WGSLStructSpec
  ? T extends {
      type: "struct";
    }
    ? T["members"] extends any[]
      ? WGSLStructMembersToValues<ArrayToObject<T["members"]>>
      : T["members"] extends Record<any, any>
        ? WGSLStructMembersToValues<T["members"]>
        : never
    : T extends { type: "array" }
      ? WGSLStructValues<T["member"]>[]
      : WgslPrimitiveToType[T["type"] & keyof WgslPrimitiveToType]
  : TypeLevelError<["WGSLStructSpec expected; rececived ", T]>;

// type TEST1 = WGSLStructValues<{
//   type: "struct";
//   members: [["color", { type: "vec4f" }], ["size", { type: "vec3f" }], ["numbers", {
//     type: "array",
//     count: 6,
//     member: { type: "vec2f" }
//   }]];
// }>;

function getAllStructs(
  specs: WGSLStructSpecWithOffsets[]
): (WGSLStructSpecStruct & {})[] {
  const ret: WGSLStructSpecStruct[] = [];

  function r(spec: WGSLStructSpec) {
    if (spec.type === "struct") {
      ret.push(spec);

      for (const [n, m] of Array.isArray(spec.members)
        ? spec.members
        : Object.entries(spec.members)) {
        r(m.type);
      }
    } else if (spec.type === "array") {
      r(spec.member);
    }
  }

  for (const s of specs) r(s);

  return ret;
}

function makeCodeForType(type: WGSLStructSpec): string {
  if (type.type === "struct") return type.name;
  if (type.type === "array")
    return `array<${makeCodeForType(type.member)}${type.count ? ", " + type.count : ""}>`;
  return type.type;
}

function structsCode(spec: WGSLStructSpecWithOffsets[]): string {
  let out: string = "";

  const allTypesToDefine = getAllStructs(spec);

  for (const t of allTypesToDefine) {
    out += `struct ${t.name} {
  ${(Array.isArray(t.members) ? t.members : Object.entries(t.members)).map((m) => `${m[0]}: ${makeCodeForType(m[1].type)},`).join("\n  ")}
}`;
  }

  return out;
}

export function generateLayouts(
  specs: WGSLStructSpec[]
): WGSLStructSpecWithOffsets[] {
  const clone = structuredClone(specs) as WGSLStructSpecWithOffsets[];

  const determineIndividualLayoutSizeAndAlignment = memo(
    (spec: WGSLStructSpecWithOffsets) => {
      if (spec.type === "struct") {
        let currOffset = 0;

        for (const [memberName, member] of spec.members) {
          determineIndividualLayoutSizeAndAlignment(member.type);
          member.offset = currOffset;
          currOffset += roundUp(member.type.align, member.type.size);
        }

        const lastMember = spec.members.at(-1)![1];
        const justPastLastMember = lastMember.offset + lastMember.type.size;

        spec.align = Math.max(...spec.members.map((m) => m[1].type.align));
        spec.size = roundUp(spec.align, justPastLastMember);
      } else if (spec.type === "array") {
        determineIndividualLayoutSizeAndAlignment(spec.member);
        spec.size = spec.count * roundUp(spec.member.align, spec.member.size);
        spec.align = spec.member.align;
      } else {
        spec.size = WGSL_TYPE_SIZES[spec.type];
        spec.align = WGSL_TYPE_ALIGNMENTS[spec.type];
      }
    }
  );

  for (const e of clone) {
    determineIndividualLayoutSizeAndAlignment(e);
  }

  return clone;
}

function wgslDataTypeToDataViewSetter(
  dt: (typeof WGSL_TYPE_DATATYPES)[keyof typeof WGSL_TYPE_DATATYPES]
) {
  return {
    i32: "setInt32",
    u32: "setUint32",
    f32: "setFloat32",
    f16: "setFloat16",
  }[dt];
}

function wgslDataTypeToDataViewGetter(
  dt: (typeof WGSL_TYPE_DATATYPES)[keyof typeof WGSL_TYPE_DATATYPES]
) {
  return {
    i32: "getInt32",
    u32: "getUint32",
    f32: "getFloat32",
    f16: "getFloat16",
  }[dt];
}

export function createLayoutGenerator<S extends WGSLStructSpecWithOffsets>(
  spec: S
) {
  function createSetters(
    spec: WGSLStructSpecWithOffsets,
    baseOffset: number,
    arrayNestingLevel: number,
    extraOffsets: string[],
    accessor: string
  ): string {
    if (spec.type === "struct") {
      return spec.members
        .map(([name, member]) =>
          createSetters(
            member.type,
            baseOffset + member.offset,
            arrayNestingLevel,
            extraOffsets,
            accessor + `.${name}`
          )
        )
        .join("\n");
    } else if (spec.type === "array") {
      const iname = `i${arrayNestingLevel}`;

      const elemSize = roundUp(spec.member.align, spec.member.size);

      return `for (let ${iname} = 0; ${iname} < ${spec.count}; ${iname}++) {
  ${createSetters(spec.member, baseOffset, arrayNestingLevel + 1, [...extraOffsets, `${iname} * ${elemSize}`], accessor + `[${iname}]`)} 
}`;
    } else {
      const iname = `i${arrayNestingLevel}`;

      const primitiveCount = WGSL_TYPE_ELEMENT_COUNTS[spec.type];

      return `for (let ${iname} = 0; ${iname} < ${WGSL_TYPE_ELEMENT_COUNTS[spec.type]}; ${iname}++) {
  dst.${wgslDataTypeToDataViewSetter(WGSL_TYPE_DATATYPES[spec.type])}(
    ${baseOffset} + ${extraOffsets.join(" + ")} + ${iname} * ${WGSL_TYPE_SIZES[WGSL_TYPE_DATATYPES[spec.type]]},
    ${primitiveCount > 1 ? accessor + `[${iname}]` : accessor},
    true
  );
}`;
    }
  }

  const fnbody = createSetters(spec, 0, 0, [], "src");

  return new Function("dst", "src", fnbody) as (
    dst: DataView,
    src: WGSLStructValues<S>
  ) => void;
}

export function readWgslLayout<S extends WGSLStructSpecWithOffsets>(
  spec: S,
  view: DataView,
  offset = 0
): WGSLStructValues<S> {
  if (spec.type === "struct") {
    // @ts-expect-error
    return Object.fromEntries(
      spec.members.map(([name, value]) => [
        name,
        readWgslLayout(value.type, view, offset + value.offset),
      ])
    );
  } else if (spec.type === "array") {
    const elemSize = roundUp(spec.member.align, spec.member.size);
    // @ts-expect-error
    return range(spec.count).map((i) =>
      readWgslLayout(spec.member, view, offset + i * elemSize)
    );
  } else {
    const count = WGSL_TYPE_ELEMENT_COUNTS[spec.type];
    const elemType = WGSL_TYPE_DATATYPES[spec.type];
    const getter = wgslDataTypeToDataViewGetter(elemType);
    const elemSize = WGSL_TYPE_SIZES[elemType];

    let arr: number[] = [];

    for (let i = 0; i < count; i++) {
      arr.push(view[getter](offset + i * elemSize, true));
    }

    // @ts-expect-error
    return count === 1 ? arr[0] : arr;
  }
}

type WGSLSerializers<SS extends WGSLStructSpec[]> = SS extends [
  infer First extends WGSLStructSpec,
  infer Rest extends WGSLStructSpec[],
]
  ? [
      (dst: DataView, src: WGSLStructValues<First>) => void,
      ...WGSLSerializers<Rest>,
    ]
  : [];

export function createWgslSerializers<SS extends WGSLStructSpec[]>(...ss: SS) {
  const layouts = generateLayouts(ss);
  const gens = layouts.map((l) => ({
    dataLayout: l,
    gen: createLayoutGenerator(l),
  }));

  return {
    code: structsCode(layouts),
    generators: gens as WGSLSerializers<SS>,
  };
}
