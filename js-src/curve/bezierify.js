// src/interpolation.ts
function clamp(x, lo, hi) {
  return Math.max(Math.min(x, hi), lo);
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
function sub3(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
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
function scale3(a, b) {
  return [a[0] * b, a[1] * b, a[2] * b];
}

// src/curve/bezierify.ts
function dotself2(x) {
  return dot2(x, x);
}
function clamp3(v, lo, hi) {
  return [clamp(v[0], lo, hi), clamp(v[1], lo, hi), clamp(v[2], lo, hi)];
}
function sign2(a) {
  return [Math.sign(a[0]), Math.sign(a[1])];
}
function abs2(a) {
  return [Math.abs(a[0]), Math.abs(a[1])];
}
function pow2(a, b) {
  return [Math.pow(a[0], b[0]), Math.pow(a[1], b[1])];
}
function sdBezier(pos, A, B, C) {
  const a = sub2(B, A);
  const b = add2(sub2(A, scale2(B, 2)), C);
  const c = scale2(a, 2);
  const d = sub2(A, pos);
  const kk = 1 / dot2(b, b);
  const kx = kk * dot2(a, b);
  const ky = kk * (2 * dot2(a, a) + dot2(d, b)) / 3;
  const kz = kk * dot2(d, a);
  let res = 0;
  const p = ky - kx * kx;
  const p3 = p * p * p;
  const q = kx * (2 * kx * kx - 3 * ky) + kz;
  let h = q * q + 4 * p3;
  if (h >= 0) {
    h = Math.sqrt(h);
    const x = scale2(sub2([h, -h], [q, q]), 1 / 2);
    const uv = mul2(sign2(x), pow2(abs2(x), [1 / 3, 1 / 3]));
    const t = clamp(uv[0] + uv[1] - kx, 0, 1);
    res = dotself2(add2(d, scale2(add2(c, scale2(b, t)), t)));
  } else {
    const z = Math.sqrt(-p);
    const v = Math.acos(q / (p * z * 2)) / 3;
    const m = Math.cos(v);
    const n = Math.sin(v) * 1.732050808;
    const t = clamp3(
      sub3(scale3([m + m, -n - m, n - m], z), [kx, kx, kx]),
      0,
      1
    );
    res = Math.min(
      dotself2(add2(d, scale2(add2(c, scale2(b, t[0])), t[0]))),
      dotself2(add2(d, scale2(add2(c, scale2(b, t[1])), t[1])))
    );
    res = Math.min(
      res,
      dotself2(add2(d, scale2(add2(c, scale2(b, t[2])), t[2])))
    );
  }
  return Math.sqrt(res);
}
function gradient2(fn, pos, diff) {
  const a = fn(pos);
  const b = fn(add2(pos, [diff, 0]));
  const c = fn(add2(pos, [0, diff]));
  return [(a - b) / diff, (a - c) / diff];
}
function bezierifyFixedCount(path, count, learningRate, gradientDescentIters) {
  const beziers = [];
  for (let i = 0; i < count; i++) {
    const startIndex = Math.floor(i / count * (path.length - 1));
    const endIndex = Math.floor((i + 1) / count * (path.length - 1));
    beziers.push(
      generateBezierApproximation(
        path,
        startIndex,
        endIndex,
        learningRate,
        gradientDescentIters
      ).bezier
    );
  }
  return beziers;
}
function bezierAdaptive(path, maxError, learningRate, gradientDescentIters) {
  return bezierAdaptiveInner(
    path,
    maxError,
    0,
    path.length - 1,
    learningRate,
    gradientDescentIters
  );
}
function bezierAdaptiveInner(path, maxError, startIndex, endIndex, learningRate, gradientDescentIters) {
  const approx = generateBezierApproximation(
    path,
    startIndex,
    endIndex,
    learningRate,
    gradientDescentIters
  );
  if (approx.error <= maxError || endIndex - startIndex < 3)
    return [approx.bezier];
  const mid = Math.floor((startIndex + endIndex) / 2);
  return [
    ...bezierAdaptiveInner(
      path,
      maxError,
      startIndex,
      mid,
      learningRate,
      gradientDescentIters
    ),
    ...bezierAdaptiveInner(
      path,
      maxError,
      mid,
      endIndex,
      learningRate,
      gradientDescentIters
    )
  ];
}
function generateBezierApproximation(path, startIndex, endIndex, learningRate, gradientDescentIters) {
  const start = path[startIndex];
  const end = path[endIndex];
  let controlPoint = add2(
    scale2(add2(path[startIndex], path[endIndex]), 0.5),
    [1e-4, 1e-4]
  );
  const getError = (v) => {
    let error = 0;
    let count = 0;
    for (let i = startIndex + 1; i < endIndex; i++) {
      error += sdBezier(path[i], start, v, end) ** 2;
      count++;
    }
    return error / count;
  };
  for (let i = 0; i < gradientDescentIters; i++) {
    const gradient = gradient2(getError, controlPoint, 1e-3);
    if (isNaN(gradient[0]) || isNaN(gradient[1])) {
      continue;
    }
    controlPoint = add2(controlPoint, scale2(gradient, learningRate));
  }
  return {
    bezier: { a: start, b: controlPoint, c: end },
    error: getError(controlPoint)
  };
}
function bezierPreview(beziers, size) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  const points = beziers.flatMap((e) => [e.a, e.b, e.c]);
  c.width = Math.max(...points.map((b) => b[0])) * size + size;
  c.height = Math.max(...points.map((b) => b[1])) * size + size;
  ctx?.beginPath();
  for (const p of beziers) {
    ctx.moveTo(p.a[0] * size, p.a[1] * size);
    ctx.quadraticCurveTo(
      p.b[0] * size,
      p.b[1] * size,
      p.c[0] * size,
      p.c[1] * size
    );
  }
  ctx.stroke();
  return c;
}
export {
  bezierAdaptive,
  bezierAdaptiveInner,
  bezierPreview,
  bezierifyFixedCount,
  gradient2,
  sdBezier
};
