// src/wait.ts
function waitUntil(fn) {
  return new Promise((resolve, reject) => {
    const unsub = fn((t) => {
      unsub();
      resolve(t);
    });
  });
}
function wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}
function waitForCond(fn, checkInterval = 0) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const result = fn();
      if (result !== void 0) {
        resolve(result);
        clearInterval(interval);
      }
    }, checkInterval);
  });
}
export {
  wait,
  waitForCond,
  waitUntil
};
