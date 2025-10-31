(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb2, mod) => function __require() {
    return mod || (0, cb2[__getOwnPropNames(cb2)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/range.ts
  function range(hi) {
    let arr = [];
    for (let i = 0; i < hi && i < 1e7; i++) {
      arr.push(i);
    }
    return arr;
  }
  function id(x) {
    return x;
  }
  var init_range = __esm({
    "src/range.ts"() {
    }
  });

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
  var init_threadpool = __esm({
    "src/threadpool.ts"() {
      init_range();
    }
  });

  // demos-src/threadpool.demo.ts
  var require_threadpool_demo = __commonJS({
    "demos-src/threadpool.demo.ts"(exports, module) {
      init_range();
      init_threadpool();
      var x = 0;
      var threadpool = createCombinedRoundRobinThreadpool(() => ({
        double(x2) {
          return x2 * 2;
        },
        addX(a) {
          return a + x;
        },
        setX(newx) {
          x = newx;
        }
      }));
      async function main() {
        console.log(
          await Promise.all(range(100).map((d) => threadpool.send.double(d)))
        );
        console.log(await threadpool.broadcast.setX(10));
        console.log(await threadpool.broadcast.addX(5));
        console.log(await threadpool.broadcast.setX(3));
        console.log(await threadpool.broadcast.addX(5));
        console.log(
          await Promise.all(range(100).map((d) => threadpool.send.addX(d)))
        );
      }
      if (!eval("self.WorkerGlobalScope")) main();
    }
  });
  require_threadpool_demo();
})();
