import { createRoot } from "react-dom/client";
import { gpuDebugWindow } from "./ui";

export type Textures = Set<{
  tex: GPUTexture;
  id: number;
}>;
export type Buffers = Set<{
  buf: GPUBuffer;
  id: number;
}>;

export function hookGPUDevice(
  device: GPUDevice,
  passthrough: boolean = false
): GPUDevice & {
  getDebugView(): HTMLElement;
} {
  // @ts-expect-error
  if (passthrough) return device;

  const textures: Textures = new Set();

  const buffers: Buffers = new Set();

  let texId = 0;
  let bufId = 0;

  const oldCreateTexture = device.createTexture.bind(device);
  device.createTexture = (descriptor: GPUTextureDescriptor) => {
    const desc2 = { ...descriptor };
    desc2.usage |= GPUTextureUsage.COPY_SRC;
    const tex = oldCreateTexture(desc2);
    textures.add({ tex, id: texId++ });
    return tex;
  };

  // const oldCreateBuffer = device.createBuffer.bind(device);
  // device.createBuffer = (descriptor: GPUBufferDescriptor) => {
  //   const desc2 = { ...descriptor };
  //   desc2.usage |= GPUBufferUsage.COPY_SRC;
  //   const buf = oldCreateBuffer(desc2);
  //   buffers.add({ buf, id: bufId++ });
  //   return buf;
  // };

  // @ts-expect-error
  device.getDebugView = () => {
    return gpuDebugWindow({ textures, buffers, device });
  };

  // @ts-expect-error
  return device;
}
