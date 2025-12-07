import { modulo, rescale } from "./interpolation";
import { rangeIntersects } from "./math/intersections";
import { range } from "./range";

export class OneDimensionalSpatialHashTable<T> {
  constructor(
    bucketCount: number,
    start: number,
    end: number,
    getBounds: (t: T) => { start: number; end: number }
  ) {
    this.start = start;
    this.end = end;
    this.buckets = range(bucketCount).map(() => new Set());
    this.objects = new Map();
    this.getBounds = getBounds;
  }

  getBounds: (t: T) => { start: number; end: number };
  start: number;
  end: number;
  buckets: Set<T>[];
  objects: Map<
    T,
    {
      buckets: Set<T>[];
    }
  >;

  positionToBucketIndex(pos: number) {
    return modulo(
      Math.floor(rescale(pos, this.start, this.end, 0, this.buckets.length)),
      this.buckets.length
    );
  }

  rangeToBucketSet(start: number, end: number) {
    if (end - start >= this.end - this.start) {
      return this.buckets;
    } else {
      const bucketStart = this.positionToBucketIndex(start);
      const bucketEnd = this.positionToBucketIndex(end);

      if (bucketStart >= bucketEnd) {
        return this.buckets
          .slice(bucketStart)
          .concat(this.buckets.slice(0, bucketEnd + 1));
      } else {
        return this.buckets.slice(bucketStart, bucketEnd + 1);
      }
    }
  }

  add(t: T) {
    const bounds = this.getBounds(t);
    const buckets = this.rangeToBucketSet(bounds.start, bounds.end);

    for (const b of buckets) b.add(t);
    this.objects.set(t, { buckets });
  }

  delete(t: T) {
    const obj = this.objects.get(t);
    for (const bkt of obj.buckets) {
      bkt.delete(t);
    }
  }

  query(start: number, end: number) {
    const buckets = this.rangeToBucketSet(start, end);

    return new Set(
      buckets
        .flatMap((b) => Array.from(b))
        .filter((e) => {
          const bounds = this.getBounds(e);
          return rangeIntersects(bounds.start, bounds.end, start, end);
        })
    );
  }
}
