(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/range.ts
  function range(hi) {
    let arr = [];
    for (let i = 0; i < hi && i < 1e7; i++) {
      arr.push(i);
    }
    return arr;
  }
  var init_range = __esm({
    "src/range.ts"() {
    }
  });

  // src/threadpool.ts
  function createRoundRobinThreadpool(src2) {
    const count = navigator.hardwareConcurrency;
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
  function createCombinedRoundRobinThreadpool(getInterface, src) {
    if (eval("self.WorkerGlobalScope")) {
      createRoundRobinThread(getInterface());
      return;
    } else {
      return createRoundRobinThreadpool(
        src ?? document.currentScript.src
      );
    }
  }
  var init_threadpool = __esm({
    "src/threadpool.ts"() {
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
