import {
  add3,
  argmax,
  argmin,
  cross,
  dot3,
  length3,
  max3,
  min3,
  normalize3,
  pickrand,
  rand,
  range,
  rescale,
  rodrigues,
  rotate,
  scale3,
  smartRange,
  sub2,
  sub3,
  variadify,
  Vec2,
  Vec3,
  xxx,
} from "../../src";

type DistFn = (v: Vec3) => number;

export function gradient3(fn: DistFn, pos: Vec3, diff: number): Vec3 {
  const a = fn(pos);
  const b = fn(add3(pos, [diff, 0, 0]));
  const c = fn(add3(pos, [0, diff, 0]));
  const d = fn(add3(pos, [0, 0, diff]));
  return [(b - a) / diff, (c - a) / diff, (d - a) / diff];
}

export function findSurface(params: {
  sdf: DistFn;
  start: Vec3;
  threshold: number;
  maxIters: number;
  dx: number;
}) {
  const { sdf, start, threshold, maxIters, dx } = params;
  let pos = start;

  for (let i = 0; i < maxIters; i++) {
    let dist = sdf(pos);
    if (Math.abs(dist) < threshold) {
      return pos;
    }
    const grad = normalize3(gradient3(sdf, start, 0.001));
    if (isNaN(pos[0]) || isNaN(grad[0])) {
      console.log("nans", pos, grad);
      throw new Error();
    }
    pos = add3(pos, scale3(grad, -dist * 0.3));
  }

  console.log("above dist threshold", sdf(pos));

  return pos;
}

const sphere = (rad: number) => (v: Vec3) => length3(v) - rad;

const box = (b: Vec3) => (v: Vec3) => {
  const q: Vec3 = [
    Math.abs(v[0]) - b[0],
    Math.abs(v[1]) - b[1],
    Math.abs(v[2]) - b[2],
  ];
  return (
    length3(max3(q, [0, 0, 0])) + Math.min(Math.max(q[0], q[1], q[2]), 0.0)
  );
};

const translateSdf = (sdf: DistFn, translation: Vec3) => (v: Vec3) =>
  sdf(sub3(v, translation));

const smoothUnion = (k: number) => {
  k *= 4;
  return variadify((a: DistFn, b: DistFn) => (v: Vec3) => {
    const d1 = a(v);
    const d2 = b(v);
    const h = Math.max(0, k - Math.abs(d2 - d1), 0.0);
    return Math.min(d1, d2) - (h * h * 0.25) / k;
  });
};

const union = variadify(
  (a: DistFn, b: DistFn) => (v: Vec3) => Math.min(a(v), b(v))
);

function walkSdfSimple(params: {
  sdf: DistFn;
  step: number;
  initPos: Vec3;
  angleThreshold: number;
  findTangent: (pos: Vec3, lastTangent: Vec3 | undefined) => Vec3;
  maxIters: number;
  dx;
  lastTangent?: Vec3;
}) {
  const { step, initPos, angleThreshold, findTangent, maxIters, sdf, dx } =
    params;

  const dotThreshold = Math.cos(angleThreshold);

  let lastTangent: Vec3 | undefined = params.lastTangent;
  let pos = initPos;
  const initNormal = normalize3(gradient3(sdf, pos, dx));

  for (let i = 0; i < maxIters; i++) {
    const normal = normalize3(gradient3(sdf, pos, dx));
    const cosAngle = dot3(initNormal, normal);
    if (cosAngle < dotThreshold) {
      return { pos, lastTangent };
    }

    const tangent = findTangent(pos, lastTangent);

    lastTangent = tangent;

    pos = findSurface({
      sdf,
      start: add3(pos, scale3(tangent, step)),
      threshold: dx,
      dx,
      maxIters,
    });
  }

  return { pos, lastTangent };
}

function highestCurvatureNaive(sdf: DistFn, samples: number) {
  const angles = smartRange(samples).map((x) => x.remap(0, Math.PI * 2));

  return (v: Vec3, lastTangent: Vec3 | undefined) => {
    const DX = 0.001;
    const grad = gradient3(sdf, v, DX);
    const normal = normalize3(grad);

    const UP = normalize3([rand(-1, 1), rand(-1, 1), rand(-1, 1)]) as Vec3;

    const initTangent = normalize3(cross(normal, UP));

    const tangents = angles.map((a) => rodrigues(initTangent, normal, a));

    if (Math.random() > 0.65) return pickrand(tangents);

    return argmin(tangents as [Vec3, ...Vec3[]], (tangent) => {
      if (lastTangent && dot3(tangent, lastTangent) < -0.4) {
        return 2;
      }
      const normal2 = normalize3(
        gradient3(sdf, add3(v, scale3(tangent, DX)), DX)
      );
      return dot3(normal, normal2);
    });
  };
}

function perspectivePlot(points: Vec3[], offset: Vec3, magnify: number) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 1024;
  canvas.height = 1024;

  const [ox, oy, oz] = offset;

  let angle = 0;

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#0003";
    ctx.beginPath();

    let i = 0;

    for (const pt of points) {
      const [x, y, z] = rodrigues(pt, normalize3([1, 1, 1]), angle);
      const pz = z + oz;
      const projected = [
        ((x + ox) / pz) * magnify + 512,
        -((y + oy) / pz) * magnify + 512,
      ] as Vec2;

      let squareSize = 30 / pz;

      let halfSize = squareSize / 2;

      ctx.fillStyle = `hsl(${rescale(i++, 0, points.length, 0, 360)}deg, 100%, 50%)`;
      ctx.fillRect(
        ...sub2(projected, [halfSize, halfSize]),
        squareSize,
        squareSize
      );
      ctx.lineTo(...projected);
    }

    ctx.stroke();

    angle += 0.005;

    requestAnimationFrame(loop);
  }

  loop();

  document.body.appendChild(canvas);
}

function main() {
  // const SCENE = smoothUnion(0.1)(
  //   box(xxx([1.5])),
  //   translateSdf(sphere(3), [0, -4.6, 0]),
  //   translateSdf(sphere(3), [-4.6, 0, 0])
  // );

  const SCENE = union(
    translateSdf(box(xxx([1.5])), xxx([-0.75])),
    translateSdf(box(xxx([1.5])), xxx([0.75]))
  );

  let pos: Vec3 = findSurface({
    sdf: SCENE,
    start: [-3, 0, 0],
    threshold: 0.001,
    maxIters: 32,
    dx: 0.001,
  });

  let lastTangent: Vec3 | undefined;

  let pts: Vec3[] = [];

  for (let i = 0; i < 10000; i++) {
    pts.push(pos);
    const r = walkSdfSimple({
      sdf: SCENE,
      step: 0.05,
      initPos: pos,
      angleThreshold: (Math.PI * 2) / 30,
      // up: normalize3(rodrigues([0, 1, 0], [1, 0, 0], i * 0.01)),
      findTangent: highestCurvatureNaive(SCENE, 20),
      maxIters: 128,
      dx: 0.001,
      lastTangent,
    });
    pos = r.pos;
    lastTangent = r.lastTangent;
  }

  console.log(pts);

  perspectivePlot(pts, [0, 0, 12], 1600);
}

main();
