// src/inject.ts
async function injectFunction(get, set, injector) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const fn = get();
      if (!fn) return;
      set(injector(fn));
      clearInterval(interval);
      resolve();
    });
  });
}
export {
  injectFunction
};
