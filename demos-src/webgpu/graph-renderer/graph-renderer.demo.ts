import { hookGPUDevice } from "../../../src";
import { graphRendererUI } from "./graph-renderer-ui";
import { setupGraphRenderer } from "./graph-renderer-renderer";

document.head.innerHTML += `<meta name="viewport" 
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>`;

(async () => {
  const loadingMsg = document.createElement("div");
  loadingMsg.innerText = "Loading...";
  loadingMsg.style = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 300%`;
  document.body.appendChild(loadingMsg);

  const params = new URLSearchParams(window.location.search);

  let i = 0;

  function fail(msg: string) {
    window.alert(msg);
    throw new Error(msg);
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    fail("No GPU adapter!");
    return;
  }

  const device = hookGPUDevice(
    await adapter.requestDevice({
      requiredFeatures: [
        //  "timestamp-query"
      ],
    }),
  );
  device.addEventListener("uncapturederror", (event) =>
    console.error(event.error),
  );

  if (!device) {
    fail("No GPU device!");
  }

  document.body.style = "width: 100vw; height: 100vh; overflow: hidden;";

  const ui = graphRendererUI({
    async updateRenderer() {
      graphRendererInstance.destroy();
      graphRendererInstance = await graphRenderer.createGraph({ ui });
    },
    exportPositions() {
      return graphRendererInstance.exportPositions();
    },
  });
  const graphRenderer = await setupGraphRenderer(device);
  let graphRendererInstance = await graphRenderer.createGraph({ ui });

  let lastT = 0;
  let loopIter = 0;

  const isPhysicsEnabled = params.get("physics") === "true";

  let lineMode = "fancy" as "fast" | "fancy" | "none";
  let physicsMode = (isPhysicsEnabled ? "physics" : "none") as
    | "none"
    | "physics";

  document.body.appendChild(graphRenderer.canvas);
  document.body.appendChild(ui.dom);

  async function loop(t: number) {
    if (document.hasFocus() && document.visibilityState === "visible") {
      loadingMsg.style.display = "none";

      let dt = (t - lastT) / 1000;
      lastT = t;

      graphRendererInstance.updateViewer(dt);

      physicsMode = ui.state.physics ? "physics" : "none";

      if (physicsMode === "physics") {
        graphRendererInstance.moveBodies();
      }

      graphRendererInstance.updateLabels();

      await graphRendererInstance.draw(lineMode);

      loopIter++;
    }

    // @ts-expect-error firefox is slow
    if (window.mozInnerScreenX) {
      setTimeout(() => loop((loopIter * 1000) / 60), 1000 / 60);
    } else {
      requestAnimationFrame(loop);
    }
  }

  loop(0);
})();
