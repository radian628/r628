import {
  range,
  cartesianProduct,
  smartRangeMap,
  smartRange,
  rand,
} from "../src/range";
import { add2, length2, scale2, sub2, Vec2, w } from "../src/math/vector";
import { bifurcate } from "../src/array-utils";
import { makeQuadtree } from "../src/quadtree";
import { clamp, lerp, unlerp } from "../src/interpolation";
import { spatialHashTable, SpatialHashTable } from "../src/spatial-hash-table";

const canvas = document.createElement("canvas");

const ctx = canvas.getContext("2d")!;

type Point = { pos: Vec2; fixed: boolean; resistance: number };

type Points = Point[];
type Edge = { points: [Point, Point]; force: number };
type Edges = Edge[];

let points: Points = [];
let edges: Edges = [];

const LINE_COUNT = 500;
const POINTS_PER_LINE = 100;

cartesianProduct(smartRange(LINE_COUNT), smartRange(POINTS_PER_LINE)).map(
  ([iLine, iPoint]) => {
    const pos: Vec2 = [iPoint.remap(-0.1, 1.1, true), iLine.remap(0, 1, true)];
    const point: Point = {
      pos,
      fixed: iPoint.start() || iPoint.end(),
      resistance: 1,
    };
    points.push(point);

    if (!iPoint.start()) {
      edges.push({ points: [points.at(-1)!, points.at(-2)!], force: 0.025 });
    }
  }
);

console.log(points, edges);

function physicsIter(points: Points, edges: Edges, push: (pt: Point) => Vec2) {
  for (const p of points) {
    if (p.fixed) continue;
    const force = push(p);
    p.pos = add2(p.pos, scale2(force, p.resistance));
  }

  for (const e of edges) {
    const offset = sub2(e.points[1].pos, e.points[0].pos);
    const dist = length2(offset);
    const dir = scale2(offset, 1 / dist);
    const force = scale2(dir, dist * e.force);
    if (!e.points[0].fixed)
      e.points[0].pos = add2(
        e.points[0].pos,
        scale2(force, e.points[0].resistance)
      );
    if (!e.points[1].fixed)
      e.points[1].pos = sub2(
        e.points[1].pos,
        scale2(force, e.points[1].resistance)
      );
  }
}

function splitLongEdges(
  points: Points,
  edges: Edges,
  threshold: number,
  maxPoints: number
): Edges {
  const [edgesToSplit, edgesToKeep] = bifurcate(
    edges,
    (e) => length2(sub2(e.points[0].pos, e.points[1].pos)) > threshold
  );

  const newEdges = edgesToKeep;

  if (maxPoints < points.length + edgesToSplit.length) {
    console.warn("Exceeded max point limit", maxPoints);
    return edges;
  }

  for (const edge of edgesToSplit) {
    const newPoint: Point = {
      pos: scale2(add2(edge.points[0].pos, edge.points[1].pos), 0.5),
      fixed: false,
      resistance: (edge.points[0].resistance + edge.points[1].resistance) / 2,
    };

    points.push(newPoint);

    newEdges.push({
      points: [edge.points[0], newPoint],
      force: edge.force,
    });
    newEdges.push({
      points: [newPoint, edge.points[1]],
      force: edge.force,
    });
  }

  return newEdges;
}

function drawEdges(
  edges: Edges,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.beginPath();
  for (const e of edges) {
    ctx.moveTo(e.points[0].pos[0] * width, e.points[0].pos[1] * height);
    ctx.lineTo(e.points[1].pos[0] * width, e.points[1].pos[1] * height);
  }
  ctx.stroke();
}

document.body.appendChild(canvas);
canvas.width = 3000;
canvas.height = 3000;

type ForceEmitter = {
  pos: Vec2;
  radMin: number;
  forceMin: number;
  radMax: number;
  forceMax: number;
  forceGamma: number;
};

const forceEmitters: SpatialHashTable<ForceEmitter> = spatialHashTable(
  { a: [-0.5, -0.5], b: [1.5, 1.5] },
  [15, 15],
  (f) => ({
    a: [f.pos[0] - f.radMax, f.pos[1] - f.radMax],
    b: [f.pos[0] + f.radMax, f.pos[1] + f.radMax],
  })
);

function runIters(n: number) {
  for (const i in range(n)) {
    console.log("Iter", i);
    physicsIter(points, edges, (pt) => {
      let force: Vec2 = [0, 0];
      for (const f of forceEmitters.queryPoint(pt.pos)) {
        const center: Vec2 = f.pos;
        const offsetFromCenter = sub2(pt.pos, center);
        const distFromCenter = length2(offsetFromCenter);
        const directionFromCenter = scale2(
          offsetFromCenter,
          1 / distFromCenter
        );

        const normedDist = unlerp(distFromCenter, f.radMin, f.radMax);
        const strength = lerp(
          clamp(normedDist, 0, 1) ** f.forceGamma,
          f.forceMax,
          f.forceMin
        );

        const forceFromCenter = scale2(
          directionFromCenter,
          Math.min(0.005, (1 / 1_000_000) * strength)
        );
        force = add2(force, forceFromCenter);
      }
      return force;
    });
    edges = splitLongEdges(points, edges, (0.5 * 1) / POINTS_PER_LINE, 2000000);
  }
}

function addForceEmitters(
  n: number,
  sizeMin: number,
  sizeMax: number,
  gamma: number,
  forceGamma: number
) {
  for (const f of forceEmitters.all()) {
    f.forceMax = 0;
  }

  for (const i in range(n)) {
    const pos: Vec2 = [Math.random(), Math.random()];

    const size = rand(sizeMin, sizeMax);

    const radMin = size * 0.5;
    const radMax = size;

    const nearbyThreshold = radMin * 1.4;

    const nearbyEmitters = forceEmitters.queryRect({
      a: [pos[0] - nearbyThreshold, pos[1] - nearbyThreshold],
      b: [pos[0] + nearbyThreshold, pos[1] + nearbyThreshold],
    });

    let tooClose = false;

    for (const emitter of nearbyEmitters) {
      if (
        length2(sub2(emitter.pos, pos)) <
        nearbyThreshold + emitter.radMin * 1.4
      ) {
        console.log("too clsoe");
        tooClose = true;
        break;
      }
    }

    if (tooClose) continue;

    forceEmitters.insert({
      pos,
      forceMin: 0,
      forceMax: size ** 0.3 * 1000,
      radMin,
      radMax,
      forceGamma,
    });
  }
}

function addEyeball(
  points: Points,
  edges: Edges,
  position: Vec2,
  irisRadius: number,
  pupilRadius: number
) {
  const COUNT = 250;
  for (const i of smartRange(COUNT)) {
    const angle = i.remap(0, Math.PI * 2);
    const dir: Vec2 = [Math.cos(angle), Math.sin(angle)];
    const irisPoint = {
      pos: add2(position, scale2(dir, irisRadius)),
      fixed: false,
      resistance: 10000,
    };
    const dirPupil: Vec2 = [Math.cos(angle * 20), Math.sin(angle * 20)];
    const pupilPoint = {
      pos: add2(position, scale2(dir, pupilRadius * i.remap(1, 1))),
      fixed: false,
      resistance: 10000,
    };
    points.push(irisPoint);
    points.push(pupilPoint);
    if (!i.start()) {
      edges.push({ points: [points.at(-3)!, points.at(-1)!], force: 0 });
      edges.push({ points: [points.at(-4)!, points.at(-2)!], force: 0 });
    }
    if (i.end()) {
      edges.push({
        points: [points.at(-1)!, points.at(-COUNT * 2 + 1)!],
        force: 0,
      });
      edges.push({
        points: [points.at(-2)!, points.at(-COUNT * 2 - 0)!],
        force: 0,
      });
    }
  }

  const irisCount = Math.floor(clamp(irisRadius * 7000, 10, Infinity));

  for (const i of smartRange(irisCount)) {
    const angle = i.remap(0, Math.PI * 2);
    const dir: Vec2 = [Math.cos(angle), Math.sin(angle)];
    const mag = lerp(Math.random() > 0.5 ? 0.9 : 0.1, irisRadius, pupilRadius);
    const point = {
      pos: add2(position, scale2(dir, mag)),
      fixed: false,
      resistance: 10000,
    };
    points.push(point);
    edges.push({ points: [points.at(-2)!, points.at(-1)!], force: 0 });
  }
}

forceEmitters.insert({
  pos: [0.5, 0.5],
  forceMin: 0,
  forceMax: 1100,
  radMin: 0.1,
  radMax: 0.8,
  forceGamma: 4,
});

const HUGE = 0.1;
const BIG = 0.025;
const MEDIUM = 0.01;
const SMALL = 0.005;

runIters(100);
addForceEmitters(200, BIG, HUGE, 1, 2);
runIters(100);
addForceEmitters(800, MEDIUM, BIG, 1, 2);
runIters(100);
addForceEmitters(2500, SMALL, MEDIUM, 1, 2);
runIters(100);
for (const e of forceEmitters.all()) {
  const radius = e.radMin;
  addEyeball(points, edges, e.pos, radius, radius / 2);
}
// runIters(25);

for (const i of range(100)) {
  physicsIter(points, edges, () => [0, 0]);
}

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

drawEdges(edges, ctx, canvas.width, canvas.height);

ctx.fillStyle = "black";
for (const e of forceEmitters.all()) {
  ctx.beginPath();
  ctx.arc(
    e.pos[0] * canvas.width,
    e.pos[1] * canvas.height,
    (e.radMin / 2) * canvas.width,
    0,
    Math.PI * 2
  );
  ctx.fill();
}
