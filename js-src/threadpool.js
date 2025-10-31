// src/range.ts
function id(x) {
  return x;
}

// src/threadpool.ts
function createRoundRobinThreadpool(src2, workerCount2, serialization2) {
  const count = workerCount2 ?? navigator.hardwareConcurrency;
  const workers = [];
  let nextWorker = 0;
  for (let i = 0; i < count; i++) {
    workers.push(new Worker(src2));
  }
  function getNextWorker() {
    const w = workers[nextWorker];
    nextWorker = (nextWorker + 1) % count;
    return w;
  }
  let id2 = 0;
  function sendMessageToWorkerWithResponse(prop, args, worker) {
    return new Promise(async (resolve, reject) => {
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
  }
  return {
    threadCount: count,
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
          return sendMessageToWorkerWithResponse(
            prop,
            args,
            workers[threadIndex]
          );
        };
      }
    }),
    broadcast: new Proxy({}, {
      get(i, prop) {
        return async (...args) => {
          return await Promise.all(
            workers.map((w) => sendMessageToWorkerWithResponse(prop, args, w))
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
    createRoundRobinThread(getInterface(), serialization);
    return;
  } else {
    return createRoundRobinThreadpool(
      src ?? document.currentScript.src,
      workerCount,
      serialization
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
  inMainThread
};
