import { test, describe, expect } from "bun:test";
import {
  createLayoutGenerator,
  createWgslSerializers,
  generateLayouts,
  readWgslLayout,
  struct,
  WGSLStructSpec,
  WGSLStructValues,
} from "../src/webgpu/wgsl-struct-layout-generator";

function roundtrip<S extends WGSLStructSpec>(
  s: S,
  values: WGSLStructValues<S>
) {
  const [withLayouts] = generateLayouts([s]);
  const gen = createLayoutGenerator(withLayouts);
  const buf = new ArrayBuffer(withLayouts.size);
  const view = new DataView(buf);
  gen(view, values);
  expect(readWgslLayout(withLayouts, view)).toEqual(values);
}

test("struct codegen", () => {
  expect(
    createWgslSerializers(
      struct("Test", {
        a: "vec2f",
        b: "vec3f",
        c: "vec4f",
      })
    ).code
  ).toEqual(`struct Test {
  a: vec2f,
  b: vec3f,
  c: vec4f,
}`);
});

test("struct helper methods", () => {
  roundtrip(
    struct("Test", {
      a: "vec2f",
      b: "vec3f",
      c: "vec4f",
    }),
    {
      a: [2, 3],
      b: [6, 7, 8],
      c: [1, 2, 7, 5],
    }
  );
});

test("struct encode/decode rountrips", () => {
  roundtrip({ type: "i32" }, 3);
  roundtrip({ type: "u32" }, 4);
  roundtrip({ type: "i32" }, -1);
  roundtrip({ type: "f32" }, 5);
  roundtrip({ type: "f32" }, 0.5);
  roundtrip({ type: "f16" }, 5);
  roundtrip({ type: "vec2f" }, [1.0, 2.0]);
  roundtrip({ type: "vec3f" }, [1.0, 2.0, 4.0]);
  roundtrip({ type: "vec4f" }, [1.0, 2.0, 4.0, 0.5]);
  roundtrip(
    { type: "array", member: { type: "f32" }, count: 5 },
    [2, 4, 8, 0.5, 0.25]
  );
  roundtrip({ type: "array", member: { type: "vec3f" }, count: 3 }, [
    [1, 2, 3],
    [4, 3, 2],
    [5, 6, 1],
  ]);

  const quadratic = {
    type: "struct",
    members: [
      ["a", { type: { type: "f32" } }],
      ["b", { type: { type: "f32" } }],
      ["c", { type: { type: "f32" } }],
    ],
    name: "Quadratic",
  } satisfies WGSLStructSpec;

  roundtrip(quadratic, {
    a: 2,
    b: 4,
    c: 6,
  });

  roundtrip(
    {
      type: "array",
      member: quadratic,
      count: 3,
    },
    [
      {
        a: 1,
        b: 2,
        c: 3,
      },
      {
        a: 10,
        b: 20,
        c: 30,
      },
      {
        a: 100,
        b: 200,
        c: 300,
      },
    ]
  );

  roundtrip(
    { type: "mat4x4f" },
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  );
});
