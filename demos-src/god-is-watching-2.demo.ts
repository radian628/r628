import {
  addEdge,
  addVertex,
  createGraph,
  findEndpoint,
  getConnectedComponents,
  getDepthFirstTraversalOrder,
  Graph,
  graph2json,
  json2graph,
  subdivideEdges,
  subdivideEdgesAtCutsSimple,
  subdivideEdgesByDistance,
  subdivideEdgesByMaximumAngleDifference,
  Vertex,
} from "../src/graph";
import { clamp, rescale } from "../src/interpolation";
import {
  circleIntersectLine,
  closestApproachOfLineSegmentToPoint,
  getEqualAngularDivisionsOfLineSegment,
  sampleLineSegment,
} from "../src/math/intersections";
import {
  add2,
  cart2Polar,
  distance2,
  length2,
  mix2,
  mul2,
  polar2Cart,
  rescale2,
  scale2,
  sub2,
  Vec2,
} from "../src/math/vector";
import { cartesianProduct, id, rand, range, smartRange } from "../src/range";
import {
  Circle,
  inCircle,
  parseSpatialHashTable,
  serializeSpatialHashTable,
  SpatialHashTable,
  spatialHashTable,
} from "../src/spatial-hash-table";
import {
  createCombinedRoundRobinThreadpool,
  inMainThread,
} from "../src/threadpool";

const LINE_COUNT = 250;
const POINTS_PER_LINE = 20;

type Eyeball = {
  irisRadius: number;
  pupilRadius: number;
  forceRadius: number;
  forceEnabled: boolean;
  pos: Vec2;
};

type Point = { pos: Vec2; pushed: boolean; initialPos: Vec2 };
type Edge = {};

const tp = createCombinedRoundRobinThreadpool(
  () => {
    let graph: Graph<Point, Edge> = createGraph();
    let eyeballs: SpatialHashTable<Eyeball>;

    function shiftLines() {
      for (const i of range(1)) {
        subdivideEdgesAtCutsSimple(
          graph,
          (edge) => {
            if (
              distance2(
                edge.endpoints[0].data.initialPos,
                edge.endpoints[1].data.initialPos
              ) <
              1 / 2048
            )
              return [];

            const ebs = eyeballs.queryRect({
              a: edge.endpoints[0].data.initialPos,
              b: edge.endpoints[1].data.initialPos,
            });

            return [...ebs]
              .filter((e) => e.forceEnabled)
              .map((e) => {
                const seg = {
                  a: edge.endpoints[0].data.initialPos,
                  b: edge.endpoints[1].data.initialPos,
                };

                const tValue = closestApproachOfLineSegmentToPoint(seg, e.pos);
                const distAway = distance2(
                  sampleLineSegment(seg, tValue),
                  e.pos
                );
                const radiiAway = clamp(distAway / e.forceRadius, 0, 1);

                return getEqualAngularDivisionsOfLineSegment(
                  e.pos,
                  seg,
                  Math.max(0.6 * radiiAway, 0.1)
                );
              })
              .flat(1);
          },
          (a, b, f) => {
            const mixedPos = mix2(f, a.data.pos, b.data.pos);
            const mixedIPos = mix2(f, a.data.initialPos, b.data.initialPos);

            return {
              pushed: false,
              initialPos: mixedIPos,
              pos: mixedPos,
            };
          },
          {}
        );

        pushLines(graph, eyeballs);

        // subdivideEdgesAtCutsSimple(
        //   graph,
        //   (edge) => {
        //     const ebs = eyeballs.queryRect({
        //       a: edge.endpoints[0].data.pos,
        //       b: edge.endpoints[1].data.pos,
        //     });

        //     return [...ebs]
        //       .filter((e) => e.forceEnabled)
        //       .map((e) => {
        //         const intersect = circleIntersectLine(
        //           {
        //             center: e.pos,
        //             radius: e.forceRadius,
        //           },
        //           {
        //             a: edge.endpoints[0].data.pos,
        //             b: edge.endpoints[1].data.pos,
        //           }
        //         );

        //         if (intersect.length === 2) {
        //           return smartRange(10).map((e) =>
        //             e.remap(intersect[0], intersect[1], true)
        //           );
        //         } else {
        //           return intersect;
        //         }
        //       })
        //       .flat(1);
        //   },
        //   (a, b, f) => {
        //     const mixedPos = mix2(f, a.data.pos, b.data.pos);
        //     const mixedIPos = mix2(f, a.data.initialPos, b.data.initialPos);

        //     return {
        //       pushed: false,
        //       initialPos: mixedIPos,
        //       pos: mixedPos,
        //     };
        //   },
        //   {}
        // );

        // pushLines(graph, eyeballs);

        // subdivideEdgesByMaximumAngleDifference(
        //   graph,
        //   (e) =>
        //     Math.atan2(
        //       e.endpoints[1].data.pos[1] - e.endpoints[0].data.pos[1],
        //       e.endpoints[1].data.pos[0] - e.endpoints[0].data.pos[0]
        //     ),
        //   (e, angle) => {
        //     let cutsToMake = Math.min(
        //       Math.floor((angle / Math.PI) * 30),
        //       Math.floor(
        //         distance2(e.endpoints[0].data.pos, e.endpoints[1].data.pos) *
        //           2048
        //       )
        //     );
        //     if (cutsToMake === 0) return undefined;
        //     return [
        //       smartRange(cutsToMake).map((e) => [{}, e.remapCenter(0, 1)]),
        //       {},
        //     ];
        //   },
        //   (a, b, f) => {
        //     const mixedPos = mix2(f, a.data.pos, b.data.pos);
        //     const mixedIPos = mix2(f, a.data.initialPos, b.data.initialPos);

        //     return {
        //       pushed: false,
        //       initialPos: mixedIPos,
        //       pos: mixedPos,
        //     };
        //   }
        // );

        // subdivideEdgesByDistance(
        //   graph,
        //   0.01,
        //   (e) => distance2(e.endpoints[0].data.pos, e.endpoints[1].data.pos),
        //   (edge, fractionAcross) => ({
        //     pos: mix2(
        //       fractionAcross,
        //       edge.endpoints[0].data.pos,
        //       edge.endpoints[1].data.pos
        //     ),
        //     initialPos: mix2(
        //       fractionAcross,
        //       edge.endpoints[0].data.initialPos,
        //       edge.endpoints[1].data.initialPos
        //     ),
        //     pushed: false,
        //   }),
        //   () => ({})
        // );
      }
      pushLines(graph, eyeballs);
      [...graph.vertices.values()].forEach((v) => {
        v.data.initialPos = v.data.pos;
      });
    }

    return {
      setGraph(g: Graph<Point, Edge>) {
        graph = g;
      },
      setEyeballs(ebs: SpatialHashTable<Eyeball>) {
        eyeballs = ebs;
      },
      shiftLines() {
        shiftLines();
      },
      getGraph() {
        return graph;
      },
    };
  },
  undefined,
  undefined,
  {
    getGraph: {
      serializeArgs: id,
      parseArgs: id,
      serializeRetVal(r) {
        return graph2json(r);
      },
      parseRetVal(r) {
        return json2graph(r);
      },
    },
    setGraph: {
      serializeArgs(args) {
        return graph2json(args[0]);
      },
      parseArgs(args) {
        return [json2graph(args)];
      },
      serializeRetVal: id,
      parseRetVal: id,
    },
    setEyeballs: {
      serializeArgs(ebs) {
        return serializeSpatialHashTable(ebs[0]);
      },
      parseArgs(ebs) {
        return [parseSpatialHashTable<Eyeball>(ebs, getEyeballBounds)];
      },
      serializeRetVal: id,
      parseRetVal: id,
    },
  }
);

function circle(ctx: CanvasRenderingContext2D, c: Circle) {
  ctx.moveTo(c.center[0], c.center[1]);
  ctx.arc(c.center[0], c.center[1], c.radius, 0, Math.PI * 2);
}

function pushLines(
  graph: Graph<Point, Edge>,
  eyeballs: SpatialHashTable<Eyeball>
) {
  for (const vert of graph.vertices) {
    // if (vert.data.pushed) continue;
    const eyesInRange = inCircle(
      eyeballs,
      { center: vert.data.initialPos, radius: 0 },
      (e) => ({
        radius: e.forceRadius,
        center: e.pos,
      })
    );

    let offset: Vec2 = [0, 0];

    for (const e of eyesInRange) {
      if (!e.forceEnabled) continue;
      const offsetToEye = sub2(vert.data.initialPos, e.pos);
      const distToEye = length2(offsetToEye);
      const pushFactor = rescale(distToEye, 0, e.forceRadius, 1, 0);
      const pushMag = pushFactor ** 2 * e.forceRadius * 0.3;
      const push = rescale2(offsetToEye, pushMag);
      offset = add2(offset, mul2(push, [1.0, 1.0]));
      vert.data.pushed = true;
    }
    vert.data.pos = add2(vert.data.initialPos, offset);
  }
}

function getEyeballBounds(e: Eyeball) {
  const maxRadius = Math.max(e.forceRadius, e.irisRadius, e.pupilRadius);
  return {
    a: sub2(e.pos, [maxRadius, maxRadius]),
    b: add2(e.pos, [maxRadius, maxRadius]),
  };
}

function addEyeballs(
  eyeballs: SpatialHashTable<Eyeball>,
  tryCount: number,
  logMax: number,
  logMin: number
) {
  for (const eb of eyeballs.all()) {
    eb.forceEnabled = false;
  }

  for (const i of smartRange(tryCount)) {
    const radius = Math.pow(10, i.remap(logMax, logMin));
    const center: Vec2 = [Math.random(), Math.random()];

    const MARGIN = 1 + Math.random() ** 0.5 * 0.2;

    if (
      inCircle(eyeballs, { radius: radius * MARGIN, center }, (t) => ({
        radius: t.irisRadius * MARGIN,
        center: t.pos,
      })).size > 0
    ) {
      continue;
    }

    eyeballs.insert({
      pos: center,
      irisRadius: radius * 1,
      pupilRadius: radius * 0.5,
      forceRadius: radius * 3,
      forceEnabled: true,
    });
  }
}

inMainThread(async () => {
  const mainThreadEyeballs = spatialHashTable<Eyeball>(
    {
      a: [-0.3, -0.3],
      b: [1.3, 1.3],
    },
    [100, 100],
    getEyeballBounds
  );

  await Promise.all(
    smartRange(tp.threadCount).map(async (t) => {
      const graph = createGraph<Point, Edge>();

      const yBounds = t.segment(0, 1);

      cartesianProduct(
        smartRange(Math.ceil(LINE_COUNT / tp.threadCount)),
        smartRange(POINTS_PER_LINE)
      ).reduce<Vertex<{ pos: Vec2 }, {}> | null>((prev, [line, point]) => {
        const pos: Vec2 = [
          point.remap(-0.1, 1.1, true),
          line.remap(...yBounds),
        ];
        const pt = addVertex<Point, Edge>(graph, {
          pos,
          initialPos: pos,
          pushed: false,
        });
        if (!point.start() && prev) {
          addEdge(graph, [prev, pt], {});
        }

        return pt;
      }, null);

      await tp.sendToThread(t.i).setGraph(graph);
    })
  );

  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = 3000;
  canvas.height = 3000;
  const ctx = canvas.getContext("2d")!;
  addEyeballs(mainThreadEyeballs, 100, -1.1, -1.4);
  await tp.broadcast.setEyeballs(mainThreadEyeballs);
  await tp.broadcast.shiftLines();
  addEyeballs(mainThreadEyeballs, 1000, -1.4, -1.7);
  await tp.broadcast.setEyeballs(mainThreadEyeballs);
  await tp.broadcast.shiftLines();
  addEyeballs(mainThreadEyeballs, 10000, -1.7, -2.0);
  await tp.broadcast.setEyeballs(mainThreadEyeballs);
  await tp.broadcast.shiftLines();
  addEyeballs(mainThreadEyeballs, 40000, -2.0, -2.7);
  await tp.broadcast.setEyeballs(mainThreadEyeballs);
  await tp.broadcast.shiftLines();

  const components = (await tp.broadcast.getGraph()).flatMap((e) =>
    getConnectedComponents(e)
  );

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";

  for (const comp of components) {
    const path = getDepthFirstTraversalOrder(comp, findEndpoint(comp));

    ctx.beginPath();
    for (const e of path) {
      ctx.lineTo(...scale2(e.data.pos, canvas.width));
      ctx.fillRect(...scale2(e.data.pos, canvas.width), 2, 2);
    }
    ctx.stroke();
  }

  ctx.beginPath();
  for (const e of mainThreadEyeballs.all()) {
    const toCenter = cart2Polar(sub2([0.5, 0.5], e.pos));

    // const offset = polar2Cart(toCenter[0] * e.pupilRadius * 1.2, toCenter[1]);

    // const offset: Vec2 = [-e.pupilRadius * 0.7, 0];

    const offset: Vec2 = [0, 0];

    const eyePos = add2(e.pos, offset);

    // circle(ctx, {
    //   radius: e.pupilRadius * canvas.width,
    //   center: scale2(eyePos, canvas.width),
    // });

    const pointCount = Math.floor(12_000_000 * e.pupilRadius ** 2);

    for (const i of range(pointCount)) {
      const randomPointInCircle: Vec2 = [
        rand(eyePos[0] - e.pupilRadius, eyePos[0] + e.pupilRadius),
        rand(eyePos[1] - e.pupilRadius, eyePos[1] + e.pupilRadius),
      ];
      if (distance2(randomPointInCircle, eyePos) > e.pupilRadius) continue;

      ctx.fillRect(...scale2(randomPointInCircle, canvas.width), 2, 2);
    }
  }
  ctx.fill();
});
