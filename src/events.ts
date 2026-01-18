export function eventEmitter<T>() {
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
