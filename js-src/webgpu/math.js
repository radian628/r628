// src/webgpu/math.ts
function perspectiveWebgpu(fieldOfViewInRadians, aspectRatio, near, far) {
  const f = 1 / Math.tan(fieldOfViewInRadians / 2);
  const rangeInv = 1 / (near - far);
  return [
    f / aspectRatio,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    far * rangeInv,
    -1,
    0,
    0,
    near * far * rangeInv,
    0
  ];
}
export {
  perspectiveWebgpu
};
