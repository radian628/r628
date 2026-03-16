import React, { useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import R628_UI_CSS from "../../src/ui/r628-ui.css?raw";
import {
  mutatify,
  NumberField,
  objectUI,
  objectUIGeneric as objectUIGeneric,
  StringField,
  using,
} from "../../src";
import { BooleanField } from "../../src/ui/react-boolean-field";

export type UIState = {
  viewerSpeed: number;

  physics: boolean;
  repulsionMultiplier: number;
  attractionMultiplier: number;
  velocityDamping: number;
  repulsionExponent: number;
  simulationAccuracy: number;
  timestep: number;

  tags: string;
};

const DEFAULT_UI_STATE = {
  viewerSpeed: 1,

  physics: true,
  repulsionMultiplier: 1,
  attractionMultiplier: 1,
  velocityDamping: 0.9,
  repulsionExponent: 2,
  simulationAccuracy: 1 / 1.2,
  timestep: 0.06,

  tags: "",
};

export type GraphRendererUI = {
  dom: HTMLElement;
  state: UIState;
  setState: (fn: (o: UIState) => UIState) => void;
};

export function graphRendererUI(params: { updateRenderer: () => void }) {
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
      updateRenderer={params.updateRenderer}
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

// const RootUI = objectUI({
//   viewerSpeed: mutatify(NumberField),
//   repulsionMultiplier: mutatify(NumberField),
//   attractionMultiplier: mutatify(NumberField),
//   tags: mutatify(StringField),
// });

const NumberFieldM = mutatify(NumberField);
const StringFieldM = mutatify(StringField);

const ClampedNumberFieldM = using(mutatify(NumberField), {
  min: 0,
  max: 1,
});

const NonNegativeNumberFieldM = using(mutatify(NumberField), {
  min: 0,
});

const RootUI = objectUIGeneric<UIState>((Field) => () => {
  return (
    <>
      <h2>Viewer</h2>
      <div className="ui-object">
        <label>Movement Speed</label>
        <Field name="viewerSpeed" ui={NumberFieldM}></Field>
      </div>
      <h2>Physics</h2>
      <div className="ui-object">
        <label>Physics Enabled</label>
        <Field name="physics" ui={BooleanField}></Field>
        <label>Repulsion Multiplier</label>
        <Field name="repulsionMultiplier" ui={NumberFieldM}></Field>
        <label>Attraction Multiplier</label>
        <Field name="attractionMultiplier" ui={NumberFieldM}></Field>
        <label>Velocity Damping</label>
        <Field name="velocityDamping" ui={ClampedNumberFieldM}></Field>
        <label>Repulsion Exponent</label>
        <Field name="repulsionExponent" ui={NumberFieldM}></Field>
        <label>Simulation Accuracy</label>
        <Field name="simulationAccuracy" ui={NumberFieldM}></Field>
        <label>Timestep</label>
        <Field name="timestep" ui={NonNegativeNumberFieldM}></Field>
      </div>
      <h2>Filters</h2>
      <div className="ui-object">
        <label>Tags</label>
        <Field name="tags" ui={StringFieldM}></Field>
      </div>
    </>
  );
});

function UI(props: {
  subscribe: Parameters<typeof useSyncExternalStore<GraphRendererUI>>[0];
  getSnapshot: Parameters<typeof useSyncExternalStore<GraphRendererUI>>[1];
  updateRenderer: () => void;
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
  padding-inline: 10px;
  padding-block: 7px;
  font-size: 80%;
}

h1 {
  font-size: 1.2em;
  margin: 0;
}

h2 {
  font-size: 1.1em;
  margin-top: var(--gap-big);
  border-bottom: 1px solid #444;
  margin-bottom: var(--gap-big);
  padding-bottom: var(--gap-big);
}
`}</style>
      <div className="ui-root ui-container">
        <RootUI value={state.state} setValue={state.setState}></RootUI>
        <button onClick={props.updateRenderer}>Apply Filters</button>
      </div>
    </>
  );
}
