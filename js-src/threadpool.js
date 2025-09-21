// src/threadpool.ts
function createRoundRobinThreadpool(src) {
  const count = navigator.hardwareConcurrency;
  const workers = [];
  let nextWorker = 0;
  for (let i = 0; i < count; i++) {
    workers.push(new Worker(src));
  }
  function getNextWorker() {
    const w = workers[nextWorker];
    nextWorker = (nextWorker + 1) % count;
    return w;
  }
  let id = 0;
  return new Proxy({}, {
    get(i, prop) {
      return (...args) => {
        return new Promise((resolve, reject) => {
          const myid = id;
          id++;
          const nextWorker2 = getNextWorker();
          const onResponse = (e) => {
            if (e.data.id !== myid) return;
            nextWorker2.removeEventListener("message", onResponse);
            resolve(e.data.returnValue);
          };
          nextWorker2.addEventListener("message", onResponse);
          nextWorker2.postMessage({
            type: prop,
            args,
            id: myid
          });
        });
      };
    }
  });
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
export {
  createRoundRobinThread,
  createRoundRobinThreadpool
};
