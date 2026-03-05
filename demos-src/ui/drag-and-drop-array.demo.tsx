import { createRoot } from "react-dom/client";
import {
  createDragContext,
  draggableArrayUI,
  mutatify,
  objectUI,
  range,
  StringField,
  useprop,
} from "../../src";
import { useState } from "react";
import React from "react";
import { v4 } from "uuid";
import R628_UI_CSS from "../../src/ui/r628-ui.css?raw";

const root = document.createElement("div");

document.body.appendChild(root);

createRoot(root).render(<App></App>);

const dnd = createDragContext<{
  data: string;
  id: string;
}>();

const StringArrayUI = draggableArrayUI<{ data: string; id: string }>({
  Element: useprop("data", mutatify(StringField)),
  key: (t) => t.id,
  context: dnd,
  DragDst: () => <div className="ui-drag-dst"></div>,
  DragSrc: () => <div className="ui-drag-src"></div>,
});

const RootUI = objectUI({
  a: StringArrayUI,
  b: StringArrayUI,
});

function App() {
  const [dragCtx, setDragCtx] = useState<
    { data: string; id: string } | undefined
  >();

  const [value, setValue] = useState<{
    a: { data: string; id: string }[];
    b: { data: string; id: string }[];
  }>({
    a: range(10).map((r) => ({
      id: v4(),
      data: r.toString(),
    })),
    b: range(10).map((r) => ({
      id: v4(),
      data: r.toString() + "b",
    })),
  });

  return (
    <>
      <style>{R628_UI_CSS}</style>
      <div className="ui-container">
        <dnd.DragContextContainer {...{ dragCtx, setDragCtx }}>
          <RootUI {...{ value, setValue }}></RootUI>
          {/* <StringArrayUI {...{ value, setValue }}></StringArrayUI>
          <StringArrayUI
            {...{ value: value2, setValue: setValue2 }}
          ></StringArrayUI> */}
          <dnd.DragFloat>{dragCtx?.data}</dnd.DragFloat>
        </dnd.DragContextContainer>
      </div>
    </>
  );
}
