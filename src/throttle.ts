// clientside rate limiter to avoid hammering wikidot with requests

export type Throttled<T extends Function> = T & { _throttled: true };

export function throttle<Params extends any[], RetType>(
  callback: (...params: Params) => Promise<RetType>,
  options: {
    limits: {
      // seconds
      duration: number;
      maxRequests: number;
    }[];
    maxConcurrentRequests: number;
  }
): Throttled<typeof callback> {
  let queue: {
    params: Params;
    callback: (rt: RetType) => void;
  }[] = [];

  const requestHistorySize = options.limits.reduce(
    (prev, curr) => Math.max(prev, curr.duration),
    0
  );

  let requestHistory: {
    time: number;
  }[] = [];

  const pendingRequests = new Set<Promise<RetType>>();

  setInterval(() => {
    while (true) {
      // dont do anything if there are no pending requests
      const req = queue.at(0);
      if (!req) return;

      // get current time
      const time = Date.now();

      // filter out request history entries that are too old
      requestHistory = requestHistory.filter(
        (h) => (time - h.time) / 1000 <= requestHistorySize
      );

      // ensure we haven't reached the max pending requests
      if (pendingRequests.size >= options.maxConcurrentRequests) return;

      // ensure we haven't hit a rate limit
      for (const l of options.limits) {
        let reqCount = 0;
        for (const h of requestHistory) {
          const secondsAgo = (time - h.time) / 1000;
          if (secondsAgo <= l.duration) {
            reqCount++;
          }
        }
        if (reqCount >= l.maxRequests) {
          return;
        }
      }

      // remove first entry in queue
      queue.shift();

      // add request to history
      requestHistory.push({
        time: Date.now(),
      });

      // actually execute the request
      const responsePromise = callback(...req.params);
      pendingRequests.add(responsePromise);
      (async () => {
        const response = await responsePromise;
        req.callback(response);
        pendingRequests.delete(responsePromise);
      })();
    }
  });

  const fn = (...params: Params) => {
    return new Promise<RetType>((resolve, reject) => {
      queue.push({
        params,
        callback: (rt) => {
          resolve(rt);
        },
      });
    });
  };

  fn._throttled = true as true;
  return fn;
}
