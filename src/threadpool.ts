import { id } from "./range";
import {
  InterfaceWithMethods,
  WorkerifyInterface,
  WorkerifyResponse,
} from "./workerify";

type ArrayifyMethods<T extends InterfaceWithMethods> = {
  [K in keyof T]: (...args: Parameters<T[K]>) => ReturnType<T[K]>[];
};

type FunctionSerializerInner<
  Args extends any[],
  RetVal,
  SerializedArgs,
  SerializedRetVal,
> = {
  serializeArgs: (args: Args) => SerializedArgs;
  parseArgs: (args: SerializedArgs) => Args;
  serializeRetVal: (args: RetVal) => SerializedRetVal;
  parseRetVal: (args: SerializedRetVal) => SerializedRetVal;
};

export type FunctionSerializer<
  Fn extends (...args: any[]) => any | Promise<any>,
> = Fn extends (...args: infer Args) => Promise<infer RetVal>
  ? FunctionSerializerInner<Args, RetVal, any, any>
  : Fn extends (...args: infer Args) => infer RetVal
    ? FunctionSerializerInner<Args, RetVal, any, any>
    : never;

export function createRoundRobinThreadpool<T extends InterfaceWithMethods>(
  src: string,
  workerCount?: number,
  serialization?: {
    [K in keyof T]?: Pick<
      FunctionSerializer<T[K]>,
      "serializeArgs" | "parseRetVal"
    >;
  }
): {
  send: WorkerifyInterface<T>;
  sendToThread: (index: number) => WorkerifyInterface<T>;
  broadcast: WorkerifyInterface<ArrayifyMethods<T>>;
  threadCount: number;
} {
  const count = workerCount ?? navigator.hardwareConcurrency;

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
    return new Promise(async (resolve, reject) => {
      const myid = id;
      id++;
      const onResponse = async (e: MessageEvent) => {
        if (e.data.id !== myid) return;
        worker.removeEventListener("message", onResponse);
        const parseRetVal =
          serialization?.[prop as keyof T]?.parseRetVal ?? ((x) => x);
        resolve(await parseRetVal(e.data.returnValue));
      };
      worker.addEventListener("message", onResponse);
      const serializeArgs =
        serialization?.[prop as keyof T]?.serializeArgs ?? ((x) => x);
      worker.postMessage({
        type: prop,
        args: await serializeArgs(args),
        id: myid,
      });
    });
  }

  return {
    threadCount: count,

    send: new Proxy({} as T, {
      get(i, prop) {
        return async (...args: any[]) => {
          const nextWorker = getNextWorker();
          return sendMessageToWorkerWithResponse(prop, args, nextWorker);
        };
      },
    }),

    sendToThread: (threadIndex: number) =>
      new Proxy({} as T, {
        get(i, prop) {
          return async (...args: any[]) => {
            return sendMessageToWorkerWithResponse(
              prop,
              args,
              workers[threadIndex]
            );
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

export function createRoundRobinThread<T extends InterfaceWithMethods>(
  t: T,
  serialization?: {
    [K in keyof T]?: Pick<
      FunctionSerializer<T[K]>,
      "parseArgs" | "serializeRetVal"
    >;
  }
) {
  self.addEventListener("message", async (e) => {
    const parseArgs = serialization?.[e.data.type]?.parseArgs ?? id;

    const args = await parseArgs(e.data.args);

    // @ts-expect-error
    const resp = await t[e.data.type](...args);

    const serializeReturnValue =
      serialization?.[e.data.type]?.serializeRetVal ?? id;

    postMessage({
      returnValue: await serializeReturnValue(resp),
      id: e.data.id,
    });
  });
}

export function createCombinedRoundRobinThreadpool<
  T extends InterfaceWithMethods,
>(
  getInterface: () => T,
  src?: string,
  workerCount?: number,
  serialization?: {
    [K in keyof T]?: FunctionSerializer<T[K]>;
  }
): ReturnType<typeof createRoundRobinThreadpool<T>> {
  if (eval("self.WorkerGlobalScope")) {
    createRoundRobinThread(getInterface(), serialization);
    // @ts-expect-error
    return;
  } else {
    return createRoundRobinThreadpool(
      src ?? (document.currentScript as HTMLScriptElement).src,
      workerCount,
      serialization
    );
  }
}

export async function inMainThread<T>(
  cb: () => T | Promise<T>
): Promise<T | undefined> {
  if (eval("self.WorkerGlobalScope")) {
    return;
  }

  return await cb();
}
