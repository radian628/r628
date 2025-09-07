// src/throttle.ts
function throttle(callback, options) {
  let queue = [];
  const requestHistorySize = options.limits.reduce(
    (prev, curr) => Math.max(prev, curr.duration),
    0
  );
  let requestHistory = [];
  const pendingRequests = /* @__PURE__ */ new Set();
  setInterval(() => {
    while (true) {
      const req = queue.at(0);
      if (!req) return;
      const time = Date.now();
      requestHistory = requestHistory.filter(
        (h) => (time - h.time) / 1e3 <= requestHistorySize
      );
      if (pendingRequests.size >= options.maxConcurrentRequests) return;
      for (const l of options.limits) {
        let reqCount = 0;
        for (const h of requestHistory) {
          const secondsAgo = (time - h.time) / 1e3;
          if (secondsAgo <= l.duration) {
            reqCount++;
          }
        }
        if (reqCount >= l.maxRequests) {
          return;
        }
      }
      queue.shift();
      requestHistory.push({
        time: Date.now()
      });
      const responsePromise = callback(...req.params);
      pendingRequests.add(responsePromise);
      (async () => {
        const response = await responsePromise;
        req.callback(response);
        pendingRequests.delete(responsePromise);
      })();
    }
  });
  const fn = (...params) => {
    return new Promise((resolve, reject) => {
      queue.push({
        params,
        callback: (rt) => {
          resolve(rt);
        }
      });
    });
  };
  fn._throttled = true;
  return fn;
}
export {
  throttle
};
