import React, { useEffect, useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import R628_UI_CSS from "../../src/ui/r628-ui.css?raw";
import {
  download,
  getSetProp,
  mutatify,
  NumberField,
  objectUI,
  objectUIGeneric as objectUIGeneric,
  StringField,
  using,
  Vec3,
} from "../../src";
import { BooleanField } from "../../src/ui/react-boolean-field";
import { FileField } from "../../src/ui/react-file-field";

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
  positions: Blob | undefined;
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
  positions: undefined,
};

export type GraphRendererUI = {
  dom: HTMLElement;
  state: UIState;
  setState: (fn: (o: UIState) => UIState) => void;
};

export type PositionedNode = {
  position: Vec3;
  slug: string;
};

export function graphRendererUI(params: {
  updateRenderer: () => void;
  exportPositions: () => Promise<PositionedNode[]>;
}) {
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
      {...params}
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

const TextareaM = using(StringFieldM, { isTextarea: true });

// const RootUI = objectUIGeneric<UIState>((Field) => () => {
//   return (
//     <>
//     </>
//   );
// });

function UI(
  props: {
    subscribe: Parameters<typeof useSyncExternalStore<GraphRendererUI>>[0];
    getSnapshot: Parameters<typeof useSyncExternalStore<GraphRendererUI>>[1];
  } & Parameters<typeof graphRendererUI>[0],
) {
  const state = useSyncExternalStore(props.subscribe, props.getSnapshot);

  function prop<K extends keyof UIState>(p: K) {
    return getSetProp<UIState, K>(
      { value: state.state, setValue: state.setState },
      p,
    );
  }

  const [hideUI, setHideUI] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHideUI(document.pointerLockElement instanceof HTMLCanvasElement);
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, []);

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
  transition: opacity 0.5s;
  max-height: 50vh;
  overflow: auto;
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
      <div
        className="ui-root ui-container"
        style={{
          opacity: hideUI ? 0 : 1,
        }}
      >
        {/* <RootUI value={state.state} setValue={state.setState}></RootUI> */}
        <h2>Viewer</h2>
        <div className="ui-object">
          <label>Movement Speed</label>
          <NumberFieldM {...prop("viewerSpeed")}></NumberFieldM>
        </div>
        <h2>Physics</h2>
        <div className="ui-object">
          <label>Physics Enabled</label>
          <BooleanField {...prop("physics")}></BooleanField>
          <label>Repulsion Multiplier</label>
          <NumberFieldM {...prop("repulsionMultiplier")}></NumberFieldM>
          <label>Attraction Multiplier</label>
          <NumberFieldM {...prop("attractionMultiplier")}></NumberFieldM>
          <label>Velocity Damping</label>
          <NumberFieldM
            {...prop("velocityDamping")}
            min={0}
            max={1}
          ></NumberFieldM>
          <label>Repulsion Exponent</label>
          <NumberFieldM {...prop("repulsionExponent")}></NumberFieldM>
          <label>Simulation Accuracy</label>
          <NumberFieldM {...prop("simulationAccuracy")} min={0}></NumberFieldM>
          <label>Timestep</label>
          <NumberFieldM {...prop("timestep")} min={0}></NumberFieldM>
        </div>
        <h2>Initial Conditions</h2>
        <div className="ui-object">
          <label>Tags</label>
          <StringFieldM {...prop("tags")}></StringFieldM>
          <label>Positions</label>
          <FileField {...prop("positions")}></FileField>
        </div>
        <button onClick={props.updateRenderer}>Apply Initial Conditions</button>
        <button
          onClick={() => {
            (async () => {
              const positionedNodes = await props.exportPositions();
              const json = JSON.stringify(positionedNodes, null, 2);

              download(
                new Blob([json], { type: "application/json" }),
                "positions.json",
              );
            })();
          }}
        >
          Export Current Node Positions
        </button>
      </div>
    </>
  );
}
