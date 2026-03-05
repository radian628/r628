import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { createDragContext } from "../../src/ui/react-drag-and-drop";

const root = document.createElement("div");

document.body.appendChild(root);

createRoot(root).render(<App2></App2>);

const dnd = createDragContext<string>();

function App() {
  const [dragCtx, setDragCtx] = useState<string | undefined>(undefined);

  return (
    <dnd.DragContextContainer {...{ dragCtx, setDragCtx }}>
      <Slot init="A"></Slot>
      <Slot init={undefined}></Slot>
      <Slot init={undefined}></Slot>
      <dnd.DragFloat>{dragCtx}</dnd.DragFloat>
    </dnd.DragContextContainer>
  );
}

function Slot(props: { init: string | undefined }) {
  const [data, setData] = useState<string | undefined>(props.init);

  if (data === undefined) {
    return (
      <dnd.DragDestination onSetValue={(v) => setData(v)}>
        Empty
      </dnd.DragDestination>
    );
  }

  return (
    <dnd.DragSource
      value={data}
      onReachDestination={() => {
        setData(undefined);
      }}
    >
      {data}
    </dnd.DragSource>
  );
}

function App2() {
  const [dragCtx, setDragCtx] = useState<string | undefined>(undefined);

  const [data, setData] = useState<(string | undefined)[]>([
    "A",
    undefined,
    undefined,
  ]);

  return (
    <div style={{ userSelect: "none" }}>
      <dnd.DragContextContainer {...{ dragCtx, setDragCtx }}>
        {data.map((e, i) => (
          <LiftedSlot
            key={i}
            data={e}
            setData={(s) =>
              setData((oldData) => oldData.map((e2, i2) => (i === i2 ? s : e2)))
            }
          ></LiftedSlot>
        ))}
        <dnd.DragFloat>{dragCtx}</dnd.DragFloat>
      </dnd.DragContextContainer>
    </div>
  );
}

function LiftedSlot(props: {
  data: string | undefined;
  setData: (d: string | undefined) => void;
}) {
  const { data, setData } = props;

  if (data === undefined) {
    return (
      <dnd.DragDestination onSetValue={(v) => setData(v)}>
        Empty
      </dnd.DragDestination>
    );
  }

  return (
    <dnd.DragSource
      value={data}
      onReachDestination={() => {
        setData(undefined);
      }}
    >
      {data}
    </dnd.DragSource>
  );
}
