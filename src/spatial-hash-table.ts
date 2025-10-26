import { rescale, rescaleClamped } from "./interpolation";
import { Vec2 } from "./math/vector";
import { range } from "./range";

export type Rect = {
  a: Vec2;
  b: Vec2;
};

export type SpatialHashTable<T> = {
  getBounds(t: T): Rect;
  buckets: Set<T>[];
  resolution: Vec2;
  bounds: Rect;
  objects: Map<
    T,
    {
      buckets: number[];
    }
  >;
  insert(t: T): void;
  delete(t: T): boolean;
  queryRect(bounds: Rect): Set<T>;
  queryPoint(pt: Vec2): Set<T>;
  all(): Set<T>;
};

export function spatialHashTable<T>(
  htBounds: Rect,
  resolution: Vec2,
  getBounds: (t: T) => Rect
): SpatialHashTable<T> {
  const objects = new Map<T, { buckets: number[] }>();
  const buckets = range(resolution[0] * resolution[1]).map((e) => new Set<T>());

  function getBucketIndexes(bounds: Rect): number[] {
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

    const indexes: number[] = [];

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
      const output = new Set<T>();
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
        b: r,
      });
    },
    all() {
      return new Set(objects.keys());
    },
  };
}
