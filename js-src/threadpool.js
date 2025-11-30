// src/range.ts
function id(x) {
  return x;
}

// src/array-utils.ts
function groupBy(arr, getGroup) {
  const groups = /* @__PURE__ */ new Map();
  for (const entry of arr) {
    const groupName = getGroup(entry);
    let group = groups.get(groupName) ?? [];
    group.push(entry);
    groups.set(groupName, group);
  }
  return groups;
}

// src/threadpool.ts
function getPerformanceStatistics(records) {
  return Object.fromEntries(
    Array.from(groupBy(records, (g) => g.name).entries()).map(([name, v]) => {
      const totalRuntime = v.reduce((prev, curr) => prev + curr.runtime, 0) / v.length;
      const invocationCount = v.length;
      return [
        name,
        {
          totalRuntime,
          invocationCount,
          averageRuntime: totalRuntime / invocationCount,
          worstCaseRuntime: v.reduce(
            (prev, curr) => Math.max(prev, curr.runtime),
            0
          ),
          bestCaseRuntime: v.reduce(
            (prev, curr) => Math.min(prev, curr.runtime),
            0
          )
        }
      ];
    })
  );
}
function wrapWithPromise(t) {
  if (t instanceof Promise) {
    return t;
  }
  return Promise.resolve(t);
}
function createRoundRobinThreadpool(src2, workerCount2, serialization2, t) {
  const count = workerCount2 ?? navigator.hardwareConcurrency;
  const performanceRecords = [];
  const workers = [];
  let nextWorker = 0;
  for (let i = 0; i < count; i++) {
    workers.push(new Worker(src2));
  }
  function getNextWorker() {
    const workerChoice = nextWorker;
    nextWorker = (nextWorker + 1) % count;
    return workerChoice;
  }
  let id2 = 0;
  function sendMessageToWorkerWithResponse(prop, args, workerIndex) {
    const worker = workers[workerIndex];
    const serializationInfo = serialization2?.[prop];
    const startTime = performance.now();
    const shouldRunInMain = serializationInfo?.runMode?.(args) ?? "worker";
    if (shouldRunInMain === "main") {
      if (!t)
        throw new Error(
          "If a threadpool method is to run in the main thread, its interface should be provided to the main thread!"
        );
      const res2 = t[prop](...args);
      performanceRecords.push(
        wrapWithPromise(res2).then((retval) => {
          return {
            name: prop,
            inputSize: serializationInfo?.estimateInputSize?.(args) ?? 1,
            runtime: performance.now() - startTime,
            metadata: serializationInfo?.getRuntimeMetadata?.(args, retval),
            thread: { type: "main" }
          };
        })
      );
      return res2;
    }
    const res = new Promise(async (resolve, reject) => {
      const myid = id2;
      id2++;
      const onResponse = async (e) => {
        if (e.data.id !== myid) return;
        worker.removeEventListener("message", onResponse);
        const parseRetVal = serialization2?.[prop]?.parseRetVal ?? ((x) => x);
        resolve(await parseRetVal(e.data.returnValue));
      };
      worker.addEventListener("message", onResponse);
      const serializeArgs = serialization2?.[prop]?.serializeArgs ?? ((x) => x);
      worker.postMessage(
        {
          type: prop,
          args: await serializeArgs(args),
          id: myid
        },
        serialization2?.[prop]?.transferArgs?.(args) ?? []
      );
    });
    performanceRecords.push(
      res.then((retval) => {
        return {
          name: prop,
          inputSize: serializationInfo?.estimateInputSize?.(args) ?? 1,
          runtime: performance.now() - startTime,
          metadata: serializationInfo?.getRuntimeMetadata?.(args, retval),
          thread: { type: "worker", workerId: workerIndex }
        };
      })
    );
    return res;
  }
  return {
    threadCount: count,
    getCurrentPerformanceRecords() {
      return Promise.all(performanceRecords);
    },
    send: new Proxy({}, {
      get(i, prop) {
        return async (...args) => {
          const nextWorker2 = getNextWorker();
          return sendMessageToWorkerWithResponse(prop, args, nextWorker2);
        };
      }
    }),
    sendToThread: (threadIndex) => new Proxy({}, {
      get(i, prop) {
        return async (...args) => {
          return sendMessageToWorkerWithResponse(prop, args, threadIndex);
        };
      }
    }),
    broadcast: new Proxy({}, {
      get(i, prop) {
        return async (...args) => {
          return await Promise.all(
            workers.map(
              (w, i2) => sendMessageToWorkerWithResponse(prop, args, i2)
            )
          );
        };
      }
    })
  };
}
function createRoundRobinThread(t, serialization2) {
  self.addEventListener("message", async (e) => {
    const parseArgs = serialization2?.[e.data.type]?.parseArgs ?? id;
    const args = await parseArgs(e.data.args);
    const resp = await t[e.data.type](...args);
    const serializeReturnValue = serialization2?.[e.data.type]?.serializeRetVal ?? id;
    postMessage(
      {
        returnValue: await serializeReturnValue(resp),
        id: e.data.id
      },
      // @ts-expect-error
      serialization2?.[e.data.type]?.transferRetVal?.(resp) ?? []
    );
  });
}
function createCombinedRoundRobinThreadpool(getInterface, src, workerCount, serialization) {
  if (eval("self.WorkerGlobalScope")) {
    createRoundRobinThread(getInterface(false), serialization);
    return;
  } else {
    return createRoundRobinThreadpool(
      src ?? document.currentScript.src,
      workerCount,
      serialization,
      getInterface(true)
    );
  }
}
async function inMainThread(cb) {
  if (eval("self.WorkerGlobalScope")) {
    return;
  }
  return await cb();
}
export {
  createCombinedRoundRobinThreadpool,
  createRoundRobinThread,
  createRoundRobinThreadpool,
  getPerformanceStatistics,
  inMainThread
};
