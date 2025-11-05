(() => {
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

  // src/lookup-optimized-spatial-hash-table.ts
  var OVERFLOW_BUCKETS_BIT = 2147483648;
  function createLookupOptimizedSHTGenerator(params) {
    const { bounds, resolution, getBounds, estimatedObjectsPerBucket } = params;
    const htBounds = bounds;
    function getBucketIndexes(bounds2) {
      const bucketXStart = Math.floor(
        rescaleClamped(
          bounds2.a[0],
          htBounds.a[0],
          htBounds.b[0],
          0,
          resolution[0] - 1
        )
      );
      const bucketXEnd = Math.ceil(
        rescaleClamped(
          bounds2.b[0],
          htBounds.a[0],
          htBounds.b[0],
          0,
          resolution[0]
        )
      );
      const bucketYStart = Math.floor(
        rescaleClamped(
          bounds2.a[1],
          htBounds.a[1],
          htBounds.b[1],
          0,
          resolution[1] - 1
        )
      );
      const bucketYEnd = Math.ceil(
        rescaleClamped(
          bounds2.b[1],
          htBounds.a[1],
          htBounds.b[1],
          0,
          resolution[1]
        )
      );
      const indexes = [];
      for (let x = bucketXStart; x < Math.max(bucketXEnd, bucketXStart + 1); x++) {
        for (let y = bucketYStart; y < Math.max(bucketYEnd, bucketYStart + 1); y++) {
          indexes.push(x + y * resolution[0]);
        }
      }
      return indexes;
    }
    const bucketsArrayFixedSize = estimatedObjectsPerBucket + 1;
    const bucketElementCount = resolution[0] * resolution[1] * bucketsArrayFixedSize;
    return (objects) => {
      const buckets = new Uint32Array(bucketElementCount);
      const overflowBuckets = [];
      for (let j = 0; j < objects.length; j++) {
        const indexes = getBucketIndexes(getBounds(objects[j]));
        for (const i of indexes) {
          const indexIntoBucketsArray = i * bucketsArrayFixedSize;
          const len = buckets[indexIntoBucketsArray];
          if (len & OVERFLOW_BUCKETS_BIT) {
            overflowBuckets[len & ~OVERFLOW_BUCKETS_BIT].push(objects[j]);
          } else {
            if (len === estimatedObjectsPerBucket) {
              buckets[indexIntoBucketsArray] = overflowBuckets.length | OVERFLOW_BUCKETS_BIT;
              overflowBuckets.push([objects[j]]);
            } else {
              let indexToSet = indexIntoBucketsArray + len + 1;
              buckets[indexToSet] = j;
              buckets[indexIntoBucketsArray]++;
            }
          }
        }
      }
      return {
        buckets,
        overflowBuckets,
        getBounds,
        objects,
        estimatedObjectsPerBucket,
        queryRect(bounds2) {
          const indexes = getBucketIndexes(bounds2);
          return function* () {
            for (const i of indexes) {
              const bktBaseIndex = i * bucketsArrayFixedSize;
              const bktInfo = buckets[bktBaseIndex];
              const useOverflow = bktInfo & OVERFLOW_BUCKETS_BIT;
              let count = useOverflow ? estimatedObjectsPerBucket : bktInfo;
              for (let j = 1; j < count + 1; j++) {
                yield objects[buckets[bktBaseIndex + j]];
              }
              if (useOverflow) {
                for (const of of overflowBuckets[bktInfo & ~OVERFLOW_BUCKETS_BIT])
                  yield of;
              }
            }
          }();
        },
        queryPoint(bounds2) {
          return this.queryRect({ a: bounds2, b: bounds2 });
        }
      };
    };
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
  function length2(a) {
    return Math.sqrt(dot2(a, a));
  }
  function distance2(a, b) {
    return length2(sub2(a, b));
  }
  function rescale2(a, b) {
    return scale2(normalize2(a), b);
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
        remapCenter(lo, hi) {
          return (i + 1) / (n + 1) * (hi - lo) + lo;
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

  // demos-src/particle-sim.demo.ts
  function createParticleForceModel(f) {
    const { f3, f2, f1, a3, a2, a1 } = f;
    const d23 = f3 - f2;
    const a3f = 2 * Math.sqrt(a3) / d23;
    const m23 = (f2 + f3) / 2;
    const d12 = f2 - f1;
    const a2f = 2 * Math.sqrt(a2) / d12;
    const m12 = (f1 + f2) / 2;
    const a3fm23 = a3f * m23;
    const f23yshift = a3f ** 2 * d23 ** 2 / 4;
    const a2fm12 = a2f * m12;
    const f12yshift = a2f ** 2 * d12 ** 2 / 4;
    const f01yshift = a1 / f1 ** 2;
    return (x) => {
      if (x > f3) return 0;
      if (x > f2) return -((a3f * x - a3fm23) ** 2) + f23yshift;
      if (x > f1) return (a2f * x - a2fm12) ** 2 - f12yshift;
      return a1 / x ** 2 - f01yshift;
    };
  }
  var getForceMag = createParticleForceModel({
    f1: 9,
    f2: 13,
    f3: 20,
    a1: 100,
    a2: 1,
    a3: 0.1
  });
  var shtgen = createLookupOptimizedSHTGenerator({
    bounds: {
      a: [0, 0],
      b: [1024, 1024]
    },
    resolution: [80, 80],
    getBounds: (c) => ({
      a: [c.pos[0] - c.r, c.pos[1] - c.r],
      b: [c.pos[0] + c.r, c.pos[1] + c.r]
    }),
    estimatedObjectsPerBucket: 10
  });
  var LATTICE_DIST = 9;
  var LATTICE_X = 20;
  var LATTICE_Y = 20;
  var particles = cartesianProduct(
    smartRange(LATTICE_X),
    smartRange(LATTICE_Y)
  ).map(([a, b]) => {
    const pos = [
      a.remap(100, 100 + LATTICE_DIST * LATTICE_X) + b.i % 2 * LATTICE_DIST / 2,
      b.remap(100, 100 + LATTICE_DIST * LATTICE_Y * Math.sqrt(3) / 2)
    ];
    let vel = [0, 0];
    if (distance2(pos, [150, 150]) < 40) {
      vel = [3, 3];
    }
    return { pos, vel, r: 20 };
  });
  var canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = 1024;
  canvas.height = 1024;
  var ctx = canvas.getContext("2d");
  function physicsIter(dt) {
    const sht = shtgen(particles);
    for (const a of particles) {
      let force = [0, 0];
      for (const b of sht.queryPoint(a.pos)) {
        if (a === b) continue;
        const offset = sub2(a.pos, b.pos);
        const dist = length2(offset);
        const force2 = rescale2(offset, getForceMag(dist));
        force = add2(force, force2);
      }
      a.vel = add2(a.vel, scale2(force, dt));
    }
    for (const a of particles) {
      a.pos = add2(a.pos, scale2(a.vel, dt));
    }
  }
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      ctx.fillRect(...p.pos, 2, 2);
    }
    let t = performance.now();
    let iters = 0;
    while (performance.now() - t < 10) {
      iters++;
      physicsIter(4e-3);
    }
    console.log(iters);
    requestAnimationFrame(loop);
  }
  loop();
})();
