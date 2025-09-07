// src/localstorage-io.ts
function registerStorageItem(name, defaultValue) {
  name = "radian628-wikidot-usertools-" + name;
  let subscriptions = /* @__PURE__ */ new Set();
  const obj = {
    get() {
      const it = localStorage.getItem(name);
      if (!it) return defaultValue;
      try {
        return JSON.parse(it);
      } catch {
        return defaultValue;
      }
    },
    set(content) {
      localStorage.setItem(name, JSON.stringify(content));
      for (const s of subscriptions) {
        s(content);
      }
    },
    subscribe(cb) {
      subscriptions.add(cb);
      return () => {
        subscriptions.delete(cb);
      };
    }
  };
  if (!obj.get() && defaultValue) obj.set(defaultValue);
  return obj;
}
export {
  registerStorageItem
};
