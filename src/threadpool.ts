import {
  InterfaceWithMethods,
  WorkerifyInterface,
  WorkerifyResponse,
} from "./workerify";

export function createRoundRobinThreadpool<T extends InterfaceWithMethods>(
  src: string
): WorkerifyInterface<T> {
  const count = navigator.hardwareConcurrency;

  const workers: Worker[] = [];
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

  return new Proxy({} as T, {
    get(i, prop) {
      return (...args: any[]) => {
        return new Promise<WorkerifyResponse<T>>((resolve, reject) => {
          const myid = id;
          id++;
          const nextWorker = getNextWorker();
          const onResponse = (e: MessageEvent) => {
            if (e.data.id !== myid) return;
            nextWorker.removeEventListener("message", onResponse);
            resolve(e.data.returnValue);
          };
          nextWorker.addEventListener("message", onResponse);
          nextWorker.postMessage({
            type: prop,
            args: args,
            id: myid,
          });
        });
      };
    },
  });
}

export function createRoundRobinThread<T extends InterfaceWithMethods>(t: T) {
  self.addEventListener("message", async (e) => {
    const resp = await t[e.data.type](...e.data.args);
    postMessage({
      returnValue: resp,
      id: e.data.id,
    });
  });
}
