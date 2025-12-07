// src/interpolation.ts
function lerp(x, a, b) {
  return a * (1 - x) + b * x;
}
function unlerp(x, a, b) {
  return (x - a) / (b - a);
}
function rescale(x, a1, b1, a2, b2) {
  return lerp(unlerp(x, a1, b1), a2, b2);
}
function modulo(a, b) {
  return a - b * Math.floor(a / b);
}

// src/math/intersections.ts
function rangeIntersects(a1, a2, b1, b2) {
  return !(a1 > b2 || b1 > a2);
}

// src/range.ts
function range(hi) {
  let arr = [];
  for (let i = 0; i < hi && i < 1e7; i++) {
    arr.push(i);
  }
  return arr;
}

// src/1d-spatial-hash-table.ts
var OneDimensionalSpatialHashTable = class {
  constructor(bucketCount, start, end, getBounds) {
    this.start = start;
    this.end = end;
    this.buckets = range(bucketCount).map(() => /* @__PURE__ */ new Set());
    this.objects = /* @__PURE__ */ new Map();
    this.getBounds = getBounds;
  }
  positionToBucketIndex(pos) {
    return modulo(
      Math.floor(rescale(pos, this.start, this.end, 0, this.buckets.length)),
      this.buckets.length
    );
  }
  rangeToBucketSet(start, end) {
    if (end - start >= this.end - this.start) {
      return this.buckets;
    } else {
      const bucketStart = this.positionToBucketIndex(start);
      const bucketEnd = this.positionToBucketIndex(end);
      if (bucketStart >= bucketEnd) {
        return this.buckets.slice(bucketStart).concat(this.buckets.slice(0, bucketEnd + 1));
      } else {
        return this.buckets.slice(bucketStart, bucketEnd + 1);
      }
    }
  }
  add(t) {
    const bounds = this.getBounds(t);
    const buckets = this.rangeToBucketSet(bounds.start, bounds.end);
    for (const b of buckets) b.add(t);
    this.objects.set(t, { buckets });
  }
  delete(t) {
    const obj = this.objects.get(t);
    for (const bkt of obj.buckets) {
      bkt.delete(t);
    }
  }
  query(start, end) {
    const buckets = this.rangeToBucketSet(start, end);
    return new Set(
      buckets.flatMap((b) => Array.from(b)).filter((e) => {
        const bounds = this.getBounds(e);
        return rangeIntersects(bounds.start, bounds.end, start, end);
      })
    );
  }
};
export {
  OneDimensionalSpatialHashTable
};
