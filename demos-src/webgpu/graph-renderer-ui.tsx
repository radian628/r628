import React, { useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import R628_UI_CSS from "../../src/ui/r628-ui.css?raw";
import { mutatify, NumberField, objectUI, StringField } from "../../src";

export type UIState = {
  viewerSpeed: number;
  repulsionMultiplier: number;
  attractionMultiplier: number;
};

const DEFAULT_UI_STATE = {
  viewerSpeed: 1,
  repulsionMultiplier: 1,
  attractionMultiplier: 1,
};

export type GraphRendererUI = {
  dom: HTMLElement;
  state: UIState;
  setState: (fn: (o: UIState) => UIState) => void;
};

export function graphRendererUI() {
  const root = document.createElement("div");

  let subscriptions = new Set<() => void>();

  createRoot(root).render(
    <UI
      subscribe={(cb) => {
        subscriptions.add(cb);
        return () => {
          subscriptions.delete(cb);
        };
      }}
      getSnapshot={() => {
        return obj;
      }}
    ></UI>,
  );

  function setState(fn: (o: UIState) => UIState): void {
    const newState = fn(obj.state);
    ret.state = newState;
    obj = {
      dom: root,
      state: newState,
      setState: obj.setState,
    };
    for (const s of subscriptions) s();
  }

  let obj: GraphRendererUI = {
    dom: root,
    state: DEFAULT_UI_STATE,
    setState,
  };

  const ret = {
    dom: root,
    state: obj.state,
  };

  return ret;
}

const RootUI = objectUI({
  viewerSpeed: mutatify(NumberField),
  repulsionMultiplier: mutatify(NumberField),
  attractionMultiplier: mutatify(NumberField),
});

function UI(props: {
  subscribe: Parameters<typeof useSyncExternalStore<GraphRendererUI>>[0];
  getSnapshot: Parameters<typeof useSyncExternalStore<GraphRendererUI>>[1];
}) {
  const state = useSyncExternalStore(props.subscribe, props.getSnapshot);

  return (
    <>
      <style>{R628_UI_CSS}</style>
      <style>{`
.ui-root {
  top: 0;
  right: 0;
  position: absolute;
  z-index: 2;
  padding: 10px;
}
`}</style>
      <div className="ui-root ui-container">
        <RootUI value={state.state} setValue={state.setState}></RootUI>
      </div>
    </>
  );
}
