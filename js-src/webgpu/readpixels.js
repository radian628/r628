// src/math/round.ts
function roundUp(factor, x) {
  return Math.ceil(x / factor) * factor;
}

// src/math/vector.ts
function sub3(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

// src/webgpu/converters.ts
function getCopyFootprintPerTexel(fmt, aspect = "all") {
  if (aspect === "stencil-only") {
    if (fmt === "depth24plus-stencil8" || fmt === "depth32float-stencil8") {
      return 1;
    }
  } else if (aspect === "depth-only") {
    if (fmt === "depth32float-stencil8") {
      return 4;
    }
  }
  return TEXEL_BLOCK_COPY_FOOTPRINTS[fmt];
}
var TEXEL_BLOCK_COPY_FOOTPRINTS = {
  r8unorm: 1,
  r8snorm: 1,
  r8uint: 1,
  r8sint: 1,
  r16unorm: 2,
  r16snorm: 2,
  r16uint: 2,
  r16sint: 2,
  r16float: 2,
  rg8unorm: 2,
  rg8snorm: 2,
  rg8uint: 2,
  rg8sint: 2,
  r32uint: 4,
  r32sint: 4,
  r32float: 4,
  rg16unorm: 4,
  rg16snorm: 4,
  rg16uint: 4,
  rg16sint: 4,
  rg16float: 4,
  rgba8unorm: 4,
  "rgba8unorm-srgb": 4,
  rgba8snorm: 4,
  rgba8uint: 4,
  rgba8sint: 4,
  bgra8unorm: 4,
  "bgra8unorm-srgb": 4,
  rgb9e5ufloat: 4,
  rgb10a2uint: 4,
  rgb10a2unorm: 4,
  rg11b10ufloat: 4,
  rg32uint: 8,
  rg32sint: 8,
  rg32float: 8,
  rgba16unorm: 8,
  rgba16snorm: 8,
  rgba16uint: 8,
  rgba16sint: 8,
  rgba16float: 8,
  rgba32uint: 16,
  rgba32sint: 16,
  rgba32float: 16,
  stencil8: 1,
  depth16unorm: 2,
  depth24plus: void 0,
  "depth24plus-stencil8": void 0,
  depth32float: void 0,
  "depth32float-stencil8": void 0,
  "bc1-rgba-unorm": 8,
  "bc1-rgba-unorm-srgb": 8,
  "bc2-rgba-unorm": 16,
  "bc2-rgba-unorm-srgb": 16,
  "bc3-rgba-unorm": 16,
  "bc3-rgba-unorm-srgb": 16,
  "bc4-r-unorm": 8,
  "bc4-r-snorm": 8,
  "bc5-rg-unorm": 16,
  "bc5-rg-snorm": 16,
  "bc6h-rgb-ufloat": 16,
  "bc6h-rgb-float": 16,
  "bc7-rgba-unorm": 16,
  "bc7-rgba-unorm-srgb": 16,
  "etc2-rgb8unorm": 8,
  "etc2-rgb8unorm-srgb": 8,
  "etc2-rgb8a1unorm": 8,
  "etc2-rgb8a1unorm-srgb": 8,
  "etc2-rgba8unorm": 16,
  "etc2-rgba8unorm-srgb": 16,
  "eac-r11unorm": 8,
  "eac-r11snorm": 8,
  "eac-rg11unorm": 16,
  "eac-rg11snorm": 16,
  "astc-4x4-unorm": 16,
  "astc-4x4-unorm-srgb": 16,
  "astc-5x4-unorm": 16,
  "astc-5x4-unorm-srgb": 16,
  "astc-5x5-unorm": 16,
  "astc-5x5-unorm-srgb": 16,
  "astc-6x5-unorm": 16,
  "astc-6x5-unorm-srgb": 16,
  "astc-6x6-unorm": 16,
  "astc-6x6-unorm-srgb": 16,
  "astc-8x5-unorm": 16,
  "astc-8x5-unorm-srgb": 16,
  "astc-8x6-unorm": 16,
  "astc-8x6-unorm-srgb": 16,
  "astc-8x8-unorm": 16,
  "astc-8x8-unorm-srgb": 16,
  "astc-10x5-unorm": 16,
  "astc-10x5-unorm-srgb": 16,
  "astc-10x6-unorm": 16,
  "astc-10x6-unorm-srgb": 16,
  "astc-10x8-unorm": 16,
  "astc-10x8-unorm-srgb": 16,
  "astc-10x10-unorm": 16,
  "astc-10x10-unorm-srgb": 16,
  "astc-12x10-unorm": 16,
  "astc-12x10-unorm-srgb": 16,
  "astc-12x12-unorm": 16,
  "astc-12x12-unorm-srgb": 16
};

// src/webgpu/readpixels.ts
function readPixelsSizeReq(params) {
  let { format, subregion } = params;
  const copyFootprintPerTexel = getCopyFootprintPerTexel(format);
  const area = sub3(subregion[1], subregion[0]);
  return roundUp(256, copyFootprintPerTexel * area[0]) * area[1] * area[2];
}
async function readPixels(params) {
  let { device, tex, buf, subregion, mipLevel, aspect, offsetInBuffer } = params;
  const copyFootprintPerTexel = getCopyFootprintPerTexel(params.tex.format);
  if (!subregion) {
    subregion = [
      [0, 0, 0],
      [tex.width, tex.height, tex.depthOrArrayLayers]
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
      origin: subregion[0]
    },
    {
      buffer: buf,
      offset: offsetInBuffer,
      bytesPerRow,
      rowsPerImage
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
    rowsPerImage
  };
}
async function readPixelsToCpuBuffer(params) {
  const { tex } = params;
  const size = readPixelsSizeReq({
    format: tex.format,
    subregion: params.subregion ?? [
      [0, 0, 0],
      [tex.width, tex.height, tex.depthOrArrayLayers]
    ]
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
    size
  };
}
export {
  readPixels,
  readPixelsSizeReq,
  readPixelsToCpuBuffer
};
