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

// src/range.ts
function range(hi) {
  let arr = [];
  for (let i = 0; i < hi && i < 1e7; i++) {
    arr.push(i);
  }
  return arr;
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
export {
  spatialHashTable
};
