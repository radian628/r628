// src/math/vector.ts
function add3(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function mul3(a, b) {
  return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
}
function sum3(a) {
  return a[0] + a[1] + a[2];
}
function dot3(a, b) {
  return sum3(mul3(a, b));
}
function scale3(a, b) {
  return [a[0] * b, a[1] * b, a[2] * b];
}

// src/webgl/mesh.ts
function parametric2D(x, y, attr, getPoint) {
  const data = [];
  for (let j = 0; j < y; j++) {
    for (let i = 0; i < x; i++) {
      const a = getPoint(i, j);
      const b = getPoint(i + 1, j);
      const c = getPoint(i, j + 1);
      const d = getPoint(i + 1, j + 1);
      data.push({ [attr]: a });
      data.push({ [attr]: c });
      data.push({ [attr]: b });
      data.push({ [attr]: c });
      data.push({ [attr]: d });
      data.push({ [attr]: b });
    }
  }
  return data;
}
function uvSphere(x, y, rad, attr) {
  return parametric2D(x, y, attr, (i, j) => {
    const a = (i + x) % x / x * Math.PI * 2;
    const b = (j + y) % y / y * Math.PI - Math.PI / 2;
    let px = Math.cos(a) * Math.cos(b) * rad;
    let pz = Math.sin(a) * Math.cos(b) * rad;
    let py = Math.sin(b) * rad;
    return [px, py, pz];
  });
}
function ring(x, rad, height, attr) {
  return parametric2D(x, 1, attr, (i, j) => {
    const a = (i + x) % x / x * Math.PI * 2;
    const px = Math.cos(a) * rad;
    const pz = Math.sin(a) * rad;
    const py = j === 1 ? height / 2 : -height / 2;
    return [px, py, pz];
  });
}
function torus(x, y, R, r, attr) {
  return parametric2D(x, y, attr, (i, j) => {
    const a = (i + x) % x / x * Math.PI * 2;
    const b = (j + y) % y / y * Math.PI * 2;
    let px = Math.cos(a);
    let pz = Math.sin(a);
    let py = Math.sin(b) * r;
    px *= R + Math.cos(b) * r;
    pz *= R + Math.cos(b) * r;
    return [px, py, pz];
  });
}
function move(mesh, attr, offset) {
  return mesh.map((m) => ({
    ...m,
    [attr]: m[attr].map((e, i) => e + offset[i])
  }));
}
function perspective(fieldOfViewInRadians, aspectRatio, near, far) {
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
    (near + far) * rangeInv,
    -1,
    0,
    0,
    near * far * rangeInv * 2,
    0
  ];
}
function ortho(left, right, top, bottom, near, far) {
  return [
    2 / (right - left),
    0,
    0,
    -(right + left) / (right - left),
    0,
    2 / (top - bottom),
    0,
    -(top + bottom) / (top - bottom),
    0,
    0,
    -2 / (far - near),
    -(far + near) / (far - near),
    0,
    0,
    0,
    1
  ];
}
function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}
function normalize(v) {
  const len = Math.hypot(...v);
  return scale3(v, 1 / len);
}
function rodrigues(v, k, theta) {
  k = normalize(k);
  return add3(
    add3(scale3(v, Math.cos(theta)), scale3(cross(k, v), Math.sin(theta))),
    scale3(k, dot3(k, v) * (1 - Math.cos(theta)))
  );
}
function rotate(axis, angle) {
  return [
    ...rodrigues([1, 0, 0], axis, angle),
    0,
    ...rodrigues([0, 1, 0], axis, angle),
    0,
    ...rodrigues([0, 0, 1], axis, angle),
    0,
    0,
    0,
    0,
    1
  ];
}
function scale(axes) {
  return [axes[0], 0, 0, 0, 0, axes[1], 0, 0, 0, 0, axes[2], 0, 0, 0, 0, 1];
}
function translate(v) {
  return [1, 0, 0, v[0], 0, 1, 0, v[1], 0, 0, 1, v[2], 0, 0, 0, 1];
}
export {
  cross,
  move,
  ortho,
  parametric2D,
  perspective,
  ring,
  rodrigues,
  rotate,
  scale,
  torus,
  translate,
  uvSphere
};
