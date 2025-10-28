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

// src/math/vector.ts
function mul2(a, b) {
  return [a[0] * b[0], a[1] * b[1]];
}
function sub2(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}
function length2(a) {
  return Math.sqrt(dot2(a, a));
}
function distance2(a, b) {
  return length2(sub2(a, b));
}
function sum2(a) {
  return a[0] + a[1];
}
function dot2(a, b) {
  return sum2(mul2(a, b));
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
  let objects = /* @__PURE__ */ new Map();
  let buckets = range(resolution[0] * resolution[1]).map((e) => /* @__PURE__ */ new Set());
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
    for (let x = bucketXStart; x < Math.max(bucketXEnd, bucketXStart + 1); x++) {
      for (let y = bucketYStart; y < Math.max(bucketYEnd, bucketYStart + 1); y++) {
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
    },
    setObjects(o) {
      this.objects = o;
      objects = o;
    },
    setBuckets(b) {
      this.buckets = buckets;
      buckets = b;
    }
  };
}
function inCircle(sht, c, getObjectCircle) {
  const rectResult = sht.queryRect({
    a: [c.center[0] - c.radius, c.center[1] - c.radius],
    b: [c.center[0] + c.radius, c.center[1] + c.radius]
  });
  return new Set(
    Array.from(rectResult.values()).filter((e) => {
      const objectCircle = getObjectCircle(e);
      return distance2(objectCircle.center, c.center) < objectCircle.radius + c.radius;
    })
  );
}
function serializeSpatialHashTable(sht, serializeItem) {
  if (!serializeItem) {
    return {
      // @ts-expect-error
      buckets: sht.buckets,
      resolution: sht.resolution,
      bounds: sht.bounds,
      // @ts-expect-error
      objects: sht.objects
    };
  }
  const serializedObjects = new Map(
    [...sht.objects].map(([k, v]) => [k, { serialized: serializeItem(k), v }])
  );
  const ssht = {
    buckets: sht.buckets.map(
      (b) => new Set([...b].map((i) => serializedObjects.get(i)?.serialized))
    ),
    resolution: sht.resolution,
    bounds: sht.bounds,
    objects: new Map(
      [...sht.objects].map(([k, v]) => [
        serializedObjects.get(k).serialized,
        v
      ])
    )
  };
  return ssht;
}
function parseSpatialHashTable(ssht, getBounds, parseItem) {
  if (!parseItem) {
    const sht = spatialHashTable(ssht.bounds, ssht.resolution, getBounds);
    sht.setBuckets(ssht.buckets);
    sht.setObjects(ssht.objects);
    return sht;
  }
  const parsedObjects = new Map(
    [...ssht.objects].map(([k, v]) => [k, { parsed: parseItem(k), v }])
  );
  {
    const sht = spatialHashTable(ssht.bounds, ssht.resolution, getBounds);
    sht.setBuckets(
      ssht.buckets.map(
        (b) => new Set([...b].map((i) => parsedObjects.get(i)?.parsed))
      )
    );
    sht.setObjects(
      new Map(
        [...ssht.objects].map(([k, v]) => [parsedObjects.get(k).parsed, v])
      )
    );
    return sht;
  }
}
export {
  inCircle,
  parseSpatialHashTable,
  serializeSpatialHashTable,
  spatialHashTable
};
