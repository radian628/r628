import {
  InterfaceWithMethods,
  WorkerifyInterface,
  WorkerifyResponse,
} from "./workerify";

type ArrayifyMethods<T extends InterfaceWithMethods> = {
  [K in keyof T]: (...args: Parameters<T[K]>) => ReturnType<T[K]>[];
};

export function createRoundRobinThreadpool<T extends InterfaceWithMethods>(
  src: string
): {
  send: WorkerifyInterface<T>;
  broadcast: WorkerifyInterface<ArrayifyMethods<T>>;
} {
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

  function sendMessageToWorkerWithResponse(
    prop: string | symbol,
    args: any[],
    worker: Worker
  ) {
    return new Promise((resolve, reject) => {
      const myid = id;
      id++;
      const onResponse = (e: MessageEvent) => {
        if (e.data.id !== myid) return;
        worker.removeEventListener("message", onResponse);
        resolve(e.data.returnValue);
      };
      worker.addEventListener("message", onResponse);
      worker.postMessage({
        type: prop,
        args: args,
        id: myid,
      });
    });
  }

  return {
    send: new Proxy({} as T, {
      get(i, prop) {
        return async (...args: any[]) => {
          const nextWorker = getNextWorker();
          return sendMessageToWorkerWithResponse(prop, args, nextWorker);
        };
      },
    }),

    broadcast: new Proxy({} as T, {
      get(i, prop) {
        return async (...args: any[]) => {
          return await Promise.all(
            workers.map((w) => sendMessageToWorkerWithResponse(prop, args, w))
          );
        };
      },
    }),
  };
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

export function createCombinedRoundRobinThreadpool<
  T extends InterfaceWithMethods,
>(
  getInterface: () => T,
  src?: string
): ReturnType<typeof createRoundRobinThreadpool<T>> {
  if (eval("self.WorkerGlobalScope")) {
    createRoundRobinThread(getInterface());
    // @ts-expect-error
    return;
  } else {
    return createRoundRobinThreadpool(
      src ?? (document.currentScript as HTMLScriptElement).src
    );
  }
}
