import { createRoot } from "react-dom/client";
import React, { useState } from "react";
import {
  mutatify,
  objectUI,
  UIData,
  variantUI,
} from "../../src/ui/react-nested-layout";
import { NumberField } from "../../src";

const root = document.createElement("div");

document.body.appendChild(root);

createRoot(root).render(<App></App>);

const Num = mutatify(NumberField);

const ObjTest = variantUI({
  type1: {
    ui: objectUI({
      a: Num,
      b: Num,
      c: Num,
    }),
    default: { a: 1, b: 1, c: 1 },
  },
  type2: {
    ui: objectUI({
      d: Num,
      e: Num,
    }),
    default: { d: 69, e: 420 },
  },
});

function App() {
  const [value, setValue] = useState<UIData<typeof ObjTest>>({
    type: "type1" as "type1",
    data: { a: 1, b: 2, c: 3 },
    variants: {
      type1: { a: 1, b: 2, c: 3 },
    },
  });

  return (
    <>
      <ObjTest {...{ value, setValue }}></ObjTest>
    </>
  );
}
