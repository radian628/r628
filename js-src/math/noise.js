// src/interpolation.ts
function lerp(x, a, b) {
  return a * (1 - x) + b * x;
}
function clamp(x, lo, hi) {
  return Math.max(Math.min(x, hi), lo);
}
function unclampedSmoothstep(x) {
  return x * x * (3 - 2 * x);
}
function smoothstep(x) {
  return unclampedSmoothstep(clamp(x, 0, 1));
}

// src/math/vector.ts
function add2(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}
function mul2(a, b) {
  return [a[0] * b[0], a[1] * b[1]];
}
function sub2(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}
function normalize2(a) {
  return scale2(a, 1 / Math.sqrt(dot2(a, a)));
}
function sum2(a) {
  return a[0] + a[1];
}
function dot2(a, b) {
  return sum2(mul2(a, b));
}
function scale2(a, b) {
  return [a[0] * b, a[1] * b];
}

// src/math/noise.ts
function fract(x) {
  return x - Math.floor(x);
}
function simpleRandVec2ToFloat(co) {
  return fract(Math.sin(dot2(co, [12.9898, 78.233])) * 43758.5453);
}
function simpleRandVec2ToVec2(co) {
  return [simpleRandVec2ToFloat(co), simpleRandVec2ToFloat([-co[0], -co[1]])];
}
function perlin2d(p, randVec2 = simpleRandVec2ToVec2) {
  const fp = [Math.floor(p[0]), Math.floor(p[1])];
  const v1 = normalize2(sub2(randVec2(fp), [0.5, 0.5]));
  const v2 = normalize2(sub2(randVec2(add2(fp, [1, 0])), [0.5, 0.5]));
  const v3 = normalize2(sub2(randVec2(add2(fp, [0, 1])), [0.5, 0.5]));
  const v4 = normalize2(sub2(randVec2(add2(fp, [1, 1])), [0.5, 0.5]));
  const o1 = sub2(p, fp);
  const o2 = sub2(o1, [1, 0]);
  const o3 = sub2(o1, [0, 1]);
  const o4 = sub2(o1, [1, 1]);
  const d1 = dot2(v1, o1);
  const d2 = dot2(v2, o2);
  const d3 = dot2(v3, o3);
  const d4 = dot2(v4, o4);
  const h1 = lerp(smoothstep(p[0] - fp[0]), d1, d2);
  const h2 = lerp(smoothstep(p[0] - fp[0]), d3, d4);
  return lerp(smoothstep(p[1] - fp[1]), h1, h2);
}
function boxMullerTransform(u) {
  const a = Math.sqrt(-2 * Math.log(u[0]));
  const b = 2 * Math.PI * u[1];
  return [a * Math.cos(b), a * Math.sin(b)];
}
export {
  boxMullerTransform,
  perlin2d,
  simpleRandVec2ToFloat,
  simpleRandVec2ToVec2
};
