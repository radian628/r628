// this is horrible why am i doing this
export class ArrayMap<K, V, Arr extends [K, ...K[]] = [K, ...K[]]> {
  maps: Map<number, Map<any, any>>;
  constructor() {
    this.maps = new Map();
  }

  nthMap(n: number) {
    let map = this.maps.get(n);
    if (!map) {
      map = new Map();
      this.maps.set(n, map);
    }
    return map;
  }

  get(path: Arr): V | undefined {
    let map = this.nthMap(path.length);
    for (const p of path) {
      map = map.get(p);
      if (!map) return undefined;
    }
    // @ts-expect-error
    return map;
  }

  has(path: Arr): boolean {
    let map = this.nthMap(path.length);
    for (const p of path) {
      map = map.get(p);
      if (!map) return false;
    }
    return true;
  }

  delete(path: Arr): V | undefined {
    let map = this.nthMap(path.length);
    for (const p of path.slice(0, -1)) {
      map = map.get(p);
      if (!map) return undefined;
    }
    const item = map.get(path.at(-1));
    map.delete(path.at(-1));
    return item;
  }

  change(path: Arr, cb: (v: V | undefined) => V) {
    let map = this.nthMap(path.length);
    for (const p of path.slice(0, -1)) {
      let oldMap = map;
      map = map.get(p);
      if (!map) {
        map = new Map();
        oldMap.set(p, map);
      }
    }
    map.set(path.at(-1), cb(map.get(path.at(-1))));
  }

  set(path: Arr, value: V) {
    this.change(path, () => value);
  }

  forEach(map: (path: Arr, v: V) => void) {
    const r = (n: number, m: Map<any, any>, path: K[]) => {
      if (n === 0) {
        // @ts-expect-error
        map(path, m);
      } else {
        for (const [k, v] of m) r(n - 1, m, path.concat(k));
      }
    };

    for (const [n, map] of this.maps) {
      r(n, map, []);
    }
  }
}
