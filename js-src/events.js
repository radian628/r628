// src/events.ts
function eventEmitter() {
  let callbacks = /* @__PURE__ */ new Set();
  return {
    dispatch(data) {
      for (const cb of callbacks) {
        cb(data);
      }
    },
    on(fn) {
      callbacks.add(fn);
      return () => {
        callbacks.delete(fn);
      };
    },
    off(fn) {
      callbacks.delete(fn);
    },
    clear() {
      callbacks = /* @__PURE__ */ new Set();
    }
  };
}
export {
  eventEmitter
};
