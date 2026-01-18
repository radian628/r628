import {
  cartesianProduct,
  hookGPUDevice,
  mulMat4,
  perspectiveWebgpu,
  range,
  rangeFrom,
  rotate,
  smartRange,
} from "../../src";
import { lineRenderer } from "../../src/webgpu/pipelines/line-renderer";

(async () => {
  function fail(msg: string) {
    window.alert(msg);
    throw new Error(msg);
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    fail("No GPU adapter!");
    return;
  }

  const device = hookGPUDevice(await adapter.requestDevice());
  device.addEventListener("uncapturederror", (event) =>
    console.error(event.error)
  );

  if (!device) {
    fail("No GPU device!");
  }

  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("webgpu");
  ctx.configure({
    device: device,
    format: navigator.gpu.getPreferredCanvasFormat(),
  });

  const renderer = await lineRenderer(
    device,
    navigator.gpu.getPreferredCanvasFormat()
  );

  const depth = renderer.depthTexFormat.instantiate(
    [1024, 1024],
    GPUTextureUsage.RENDER_ATTACHMENT
  );

  for (const i of [0, 1]) {
    renderer.drawLinesSimple(
      ctx.getCurrentTexture(),
      depth,
      i === 0 ? "clear" : "load",
      smartRange(4).map((x) => {
        const angle = x.remap(0, Math.PI * 2) + i;
        return [Math.cos(angle), Math.sin(angle), x.remap(-4 - i, -4 - i)];
      }),
      [0, i * 255, 0, 255],
      0.1,
      mulMat4(
        perspectiveWebgpu(Math.PI / 2, 1, 0.1, 100),
        rotate([1, 1, 1], (Math.PI / 2) * 0.0)
      )
    );
  }
  // document.body.appendChild(device.getDebugView());
})();
