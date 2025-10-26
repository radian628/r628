// src/threadpool.ts
function createRoundRobinThreadpool(src2, workerCount2) {
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
  let id = 0;
  function sendMessageToWorkerWithResponse(prop, args, worker) {
    return new Promise((resolve, reject) => {
      const myid = id;
      id++;
      const onResponse = (e) => {
        if (e.data.id !== myid) return;
        worker.removeEventListener("message", onResponse);
        resolve(e.data.returnValue);
      };
      worker.addEventListener("message", onResponse);
      worker.postMessage({
        type: prop,
        args,
        id: myid
      });
    });
  }
  return {
    send: new Proxy({}, {
      get(i, prop) {
        return async (...args) => {
          const nextWorker2 = getNextWorker();
          return sendMessageToWorkerWithResponse(prop, args, nextWorker2);
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
function createRoundRobinThread(t) {
  self.addEventListener("message", async (e) => {
    const resp = await t[e.data.type](...e.data.args);
    postMessage({
      returnValue: resp,
      id: e.data.id
    });
  });
}
function createCombinedRoundRobinThreadpool(getInterface, src, workerCount) {
  if (eval("self.WorkerGlobalScope")) {
    createRoundRobinThread(getInterface());
    return;
  } else {
    return createRoundRobinThreadpool(
      src ?? document.currentScript.src,
      workerCount
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
