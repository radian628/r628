import { roundUp } from "../math/round";
import { sub3, Vec3 } from "../math/vector";
import {
  getCopyFootprintPerTexel,
  TEXEL_BLOCK_COPY_FOOTPRINTS,
  TextureFormat,
} from "./converters";

export function readPixelsSizeReq(params: {
  format: TextureFormat;
  subregion: [Vec3, Vec3];
}) {
  let { format, subregion } = params;
  const copyFootprintPerTexel = getCopyFootprintPerTexel(format)!;
  const area = sub3(subregion[1], subregion[0]);
  return roundUp(256, copyFootprintPerTexel * area[0]) * area[1] * area[2];
}

export async function readPixels(params: {
  device: GPUDevice;
  tex: GPUTexture;
  buf: GPUBuffer;
  subregion?: [Vec3, Vec3];
  mipLevel?: number;
  aspect?: "all" | "depth-only" | "stencil-only";
  offsetInBuffer?: number;
}) {
  let { device, tex, buf, subregion, mipLevel, aspect, offsetInBuffer } =
    params;

  const copyFootprintPerTexel = getCopyFootprintPerTexel(params.tex.format)!;

  if (!subregion) {
    subregion = [
      [0, 0, 0],
      [tex.width, tex.height, tex.depthOrArrayLayers],
    ];
  }

  const enc = device.createCommandEncoder();

  const area = sub3(subregion[1], subregion[0]);

  const bytesPerRow = roundUp(256, copyFootprintPerTexel * area[0]);
  const rowsPerImage = area[1];

  enc.copyTextureToBuffer(
    {
      texture: tex,
      mipLevel,
      aspect,
      origin: subregion[0],
    },
    {
      buffer: buf,
      offset: offsetInBuffer,
      bytesPerRow,
      rowsPerImage,
    },
    area
  );

  device.queue.submit([enc.finish()]);
  await device.queue.onSubmittedWorkDone();

  await buf.mapAsync(GPUMapMode.READ);
  const range = buf.getMappedRange();

  return {
    range,
    bytesPerRow,
    rowsPerImage,
  };
}

export async function readPixelsToCpuBuffer(
  params: Parameters<typeof readPixels>[0] & {
    cpuBuffer?: ArrayBuffer;
  }
) {
  const { tex } = params;

  const size = readPixelsSizeReq({
    format: tex.format,
    subregion: params.subregion ?? [
      [0, 0, 0],
      [tex.width, tex.height, tex.depthOrArrayLayers],
    ],
  });

  const cpuBuffer = params.cpuBuffer ?? new ArrayBuffer(size);

  const mappedBuffer = await readPixels(params);

  const mappedBufferContents = new Uint8Array(mappedBuffer.range);
  const cpuBufferContents = new Uint8Array(cpuBuffer);

  for (let i = 0; i < mappedBufferContents.length; i++) {
    cpuBufferContents[i] = mappedBufferContents[i];
  }

  params.buf.unmap();

  return {
    cpuBuffer,
    bytesPerRow: mappedBuffer.bytesPerRow,
    rowsPerImage: mappedBuffer.rowsPerImage,
    size,
  };
}
