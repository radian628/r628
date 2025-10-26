(() => {
  // src/range.ts
  function range(hi) {
    let arr = [];
    for (let i = 0; i < hi && i < 1e7; i++) {
      arr.push(i);
    }
    return arr;
  }
  function smartRangeMap(n, cb) {
    const a = range(n);
    const res1 = a.map((i, index, arr) => {
      return {
        remap(lo, hi, inclEnd) {
          return i / (inclEnd ? n - 1 : n) * (hi - lo) + lo;
        },
        segment(lo, hi) {
          return [i / n * (hi - lo) + lo, (i + 1) / n * (hi - lo) + lo];
        },
        slidingWindow(arr2) {
          return [arr2[i], arr2[i + 1]];
        },
        randkf() {
          if (i === 0) return 0;
          if (i === n - 1) return 100;
          const lo = i / (n - 2) * 100;
          const hi = (i + 1) / (n - 2) * 100;
          return rand(lo, hi);
        },
        get(arr2) {
          return arr2[i];
        },
        i,
        next: i + 1,
        end: () => i === n - 1,
        start: () => i === 0
      };
    });
    const res = res1.map(cb);
    return res;
  }
  function smartRange(n) {
    return smartRangeMap(n, id);
  }
  function id(x) {
    return x;
  }
  function rand(lo, hi, random) {
    if (!random) random = () => Math.random();
    return random() * (hi - lo) + lo;
  }
  function cartesianProductInner(ts, arr) {
    if (ts.length === 0) return [arr];
    return ts[0].map((e) => cartesianProductInner(ts.slice(1), [...arr, e])).flat(1);
  }
  function cartesianProduct(...ts) {
    const res = cartesianProductInner(ts, []);
    return res;
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
  function length2(a) {
    return Math.sqrt(dot2(a, a));
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

  // src/array-utils.ts
  function bifurcate(arr, fn) {
    const bools = arr.map(fn);
    return [arr.filter((e, i) => bools[i]), arr.filter((e, i) => !bools[i])];
  }

  // src/interpolation.ts
  function lerp(x, a, b) {
    return a * (1 - x) + b * x;
  }
  function unlerp(x, a, b) {
    return (x - a) / (b - a);
  }
  function rescaleClamped(x, a1, b1, a2, b2) {
    return lerp(clamp(unlerp(x, a1, b1), 0, 1), a2, b2);
  }
  function clamp(x, lo, hi) {
    return Math.max(Math.min(x, hi), lo);
  }

  // src/spatial-hash-table.ts
  function spatialHashTable(htBounds, resolution, getBounds) {
    const objects = /* @__PURE__ */ new Map();
    const buckets = range(resolution[0] * resolution[1]).map((e) => /* @__PURE__ */ new Set());
    function getBucketIndexes(bounds) {
      const bucketXStart = Math.floor(
        rescaleClamped(
          bounds.a[0],
          htBounds.a[0],
          htBounds.b[0],
          0,
          resolution[0]
        )
      );
      const bucketXEnd = Math.ceil(
        rescaleClamped(
          bounds.b[0],
          htBounds.a[0],
          htBounds.b[0],
          0,
          resolution[0]
        )
      );
      const bucketYStart = Math.floor(
        rescaleClamped(
          bounds.a[1],
          htBounds.a[1],
          htBounds.b[1],
          0,
          resolution[1]
        )
      );
      const bucketYEnd = Math.ceil(
        rescaleClamped(
          bounds.b[1],
          htBounds.a[1],
          htBounds.b[1],
          0,
          resolution[1]
        )
      );
      const indexes = [];
      for (let x = bucketXStart; x < bucketXEnd; x++) {
        for (let y = bucketYStart; y < bucketYEnd; y++) {
          indexes.push(x + y * resolution[0]);
        }
      }
      return indexes;
    }
    return {
      objects,
      buckets,
      resolution,
      getBounds,
      bounds: htBounds,
      insert(t) {
        const indexes = getBucketIndexes(getBounds(t));
        for (const i of indexes) {
          buckets[i].add(t);
        }
        objects.set(t, { buckets: indexes });
      },
      delete(t) {
        const obj = objects.get(t);
        if (!obj) return false;
        for (const b of obj.buckets) {
          buckets[b].delete(t);
        }
        objects.delete(t);
        return true;
      },
      queryRect(r) {
        const queryBuckets = getBucketIndexes(r);
        const output = /* @__PURE__ */ new Set();
        for (const b of queryBuckets) {
          for (const t of buckets[b]) {
            output.add(t);
          }
        }
        return output;
      },
      queryPoint(r) {
        return this.queryRect({
          a: r,
          b: r
        });
      },
      all() {
        return new Set(objects.keys());
      }
    };
  }

  // demos-src/god-is-watching.demo.ts
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var points = [];
  var edges = [];
  var LINE_COUNT = 500;
  var POINTS_PER_LINE = 100;
  cartesianProduct(smartRange(LINE_COUNT), smartRange(POINTS_PER_LINE)).map(
    ([iLine, iPoint]) => {
      const pos = [iPoint.remap(-0.1, 1.1, true), iLine.remap(0, 1, true)];
      const point = {
        pos,
        fixed: iPoint.start() || iPoint.end(),
        resistance: 1
      };
      points.push(point);
      if (!iPoint.start()) {
        edges.push({ points: [points.at(-1), points.at(-2)], force: 0.025 });
      }
    }
  );
  console.log(points, edges);
  function physicsIter(points2, edges2, push) {
    for (const p of points2) {
      if (p.fixed) continue;
      const force = push(p);
      p.pos = add2(p.pos, scale2(force, p.resistance));
    }
    for (const e of edges2) {
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
  function splitLongEdges(points2, edges2, threshold, maxPoints) {
    const [edgesToSplit, edgesToKeep] = bifurcate(
      edges2,
      (e) => length2(sub2(e.points[0].pos, e.points[1].pos)) > threshold
    );
    const newEdges = edgesToKeep;
    if (maxPoints < points2.length + edgesToSplit.length) {
      console.warn("Exceeded max point limit", maxPoints);
      return edges2;
    }
    for (const edge of edgesToSplit) {
      const newPoint = {
        pos: scale2(add2(edge.points[0].pos, edge.points[1].pos), 0.5),
        fixed: false,
        resistance: (edge.points[0].resistance + edge.points[1].resistance) / 2
      };
      points2.push(newPoint);
      newEdges.push({
        points: [edge.points[0], newPoint],
        force: edge.force
      });
      newEdges.push({
        points: [newPoint, edge.points[1]],
        force: edge.force
      });
    }
    return newEdges;
  }
  function drawEdges(edges2, ctx2, width, height) {
    ctx2.beginPath();
    for (const e of edges2) {
      ctx2.moveTo(e.points[0].pos[0] * width, e.points[0].pos[1] * height);
      ctx2.lineTo(e.points[1].pos[0] * width, e.points[1].pos[1] * height);
    }
    ctx2.stroke();
  }
  document.body.appendChild(canvas);
  canvas.width = 3e3;
  canvas.height = 3e3;
  var forceEmitters = spatialHashTable(
    { a: [-0.5, -0.5], b: [1.5, 1.5] },
    [15, 15],
    (f) => ({
      a: [f.pos[0] - f.radMax, f.pos[1] - f.radMax],
      b: [f.pos[0] + f.radMax, f.pos[1] + f.radMax]
    })
  );
  function runIters(n) {
    for (const i in range(n)) {
      console.log("Iter", i);
      physicsIter(points, edges, (pt) => {
        let force = [0, 0];
        for (const f of forceEmitters.queryPoint(pt.pos)) {
          const center = f.pos;
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
            Math.min(5e-3, 1 / 1e6 * strength)
          );
          force = add2(force, forceFromCenter);
        }
        return force;
      });
      edges = splitLongEdges(points, edges, 0.5 * 1 / POINTS_PER_LINE, 2e6);
    }
  }
  function addForceEmitters(n, sizeMin, sizeMax, gamma, forceGamma) {
    for (const f of forceEmitters.all()) {
      f.forceMax = 0;
    }
    for (const i in range(n)) {
      const pos = [Math.random(), Math.random()];
      const size = rand(sizeMin, sizeMax);
      const radMin = size * 0.5;
      const radMax = size;
      const nearbyThreshold = radMin * 1.4;
      const nearbyEmitters = forceEmitters.queryRect({
        a: [pos[0] - nearbyThreshold, pos[1] - nearbyThreshold],
        b: [pos[0] + nearbyThreshold, pos[1] + nearbyThreshold]
      });
      let tooClose = false;
      for (const emitter of nearbyEmitters) {
        if (length2(sub2(emitter.pos, pos)) < nearbyThreshold + emitter.radMin * 1.4) {
          console.log("too clsoe");
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;
      forceEmitters.insert({
        pos,
        forceMin: 0,
        forceMax: size ** 0.3 * 1e3,
        radMin,
        radMax,
        forceGamma
      });
    }
  }
  function addEyeball(points2, edges2, position, irisRadius, pupilRadius) {
    const COUNT = 250;
    for (const i of smartRange(COUNT)) {
      const angle = i.remap(0, Math.PI * 2);
      const dir = [Math.cos(angle), Math.sin(angle)];
      const irisPoint = {
        pos: add2(position, scale2(dir, irisRadius)),
        fixed: false,
        resistance: 1e4
      };
      const dirPupil = [Math.cos(angle * 20), Math.sin(angle * 20)];
      const pupilPoint = {
        pos: add2(position, scale2(dir, pupilRadius * i.remap(1, 1))),
        fixed: false,
        resistance: 1e4
      };
      points2.push(irisPoint);
      points2.push(pupilPoint);
      if (!i.start()) {
        edges2.push({ points: [points2.at(-3), points2.at(-1)], force: 0 });
        edges2.push({ points: [points2.at(-4), points2.at(-2)], force: 0 });
      }
      if (i.end()) {
        edges2.push({
          points: [points2.at(-1), points2.at(-COUNT * 2 + 1)],
          force: 0
        });
        edges2.push({
          points: [points2.at(-2), points2.at(-COUNT * 2 - 0)],
          force: 0
        });
      }
    }
    const irisCount = Math.floor(clamp(irisRadius * 7e3, 10, Infinity));
    for (const i of smartRange(irisCount)) {
      const angle = i.remap(0, Math.PI * 2);
      const dir = [Math.cos(angle), Math.sin(angle)];
      const mag = lerp(Math.random() > 0.5 ? 0.9 : 0.1, irisRadius, pupilRadius);
      const point = {
        pos: add2(position, scale2(dir, mag)),
        fixed: false,
        resistance: 1e4
      };
      points2.push(point);
      edges2.push({ points: [points2.at(-2), points2.at(-1)], force: 0 });
    }
  }
  forceEmitters.insert({
    pos: [0.5, 0.5],
    forceMin: 0,
    forceMax: 1100,
    radMin: 0.1,
    radMax: 0.8,
    forceGamma: 4
  });
  var HUGE = 0.1;
  var BIG = 0.025;
  var MEDIUM = 0.01;
  var SMALL = 5e-3;
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
      e.radMin / 2 * canvas.width,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
})();
