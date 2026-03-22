type Emitter<T> = {
  dispatch(t: T): void;
  on(fn: (t: T) => void): () => void;
  off(fn: (t: T) => void): void;
  clear(): void;
};

export function eventEmitter<T>(): Emitter<T> {
  let callbacks = new Set<(t: T) => void>();

  return {
    dispatch(data: T) {
      for (const cb of callbacks) {
        cb(data);
      }
    },
    on(fn: (t: T) => void) {
      callbacks.add(fn);
      return () => {
        callbacks.delete(fn);
      };
    },
    off(fn: (t: T) => void) {
      callbacks.delete(fn);
    },
    clear() {
      callbacks = new Set();
    },
  };
}

// export function statefulEventEmitter<T>(
//   init: T,
//   equal?: (a: T, b: T) => boolean,
// ) {
//   let callbacks = new Set<(t: T) => void>();
//   let state: T = init;
//   if (!equal) equal = (a, b) => a === b;

//   return {
//     dispatch(data: T) {
//       if (equal(data, state)) {
//         return;
//       }
//       for (const cb of callbacks) {
//         cb(data);
//       }
//     },
//     on(fn: (t: T) => void) {
//       callbacks.add(fn);
//       return () => {
//         callbacks.delete(fn);
//       };
//     },
//     off(fn: (t: T) => void) {
//       callbacks.delete(fn);
//     },
//     clear() {
//       callbacks = new Set();
//     },
//   };
// }

type Reactive<T> = {
  poll(): T | undefined;
  state: Promise<T>;
  emitter: Emitter<T>;
};

export function reactive<T, Deps extends Record<string, Reactive<any>>>(
  deps: Deps,
  update: (
    deps: {
      [K in keyof Deps]: Awaited<Deps[K]["state"]>;
    },
    t: T | undefined,
  ) => T | Promise<T>,
): Reactive<T> {
  const values: any = {};
  const emitter = eventEmitter();

  let currState: T;

  const ret = {
    emitter,
    poll() {
      return currState;
    },
  } as unknown as Reactive<T>;

  for (const [name, dep] of Object.entries(deps)) {
    values[name] = dep.state;
    dep.emitter.on(async (v) => {
      values[name] = v;
      ret.state = Promise.resolve(update(values, currState));
      currState = await ret.state;
      emitter.dispatch(currState);
    });
  }

  (async () => {
    ret.state = Promise.resolve(update(values, undefined));
    currState = await ret.state;
  })();

  return ret;
}

export function reactiveSource<T>(
  init: T,
): Reactive<T> & { set: (t: T) => void } {
  let currState: T | undefined;
  return {
    state: Promise.resolve(init),
    emitter: eventEmitter<T>(),
    poll() {
      return currState;
    },
    set(t: T) {
      currState = t;
      this.state = Promise.resolve(t);
      this.emitter.dispatch(t);
    },
  };
}
