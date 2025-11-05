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
export {
  createLookupOptimizedSHTGenerator
};
