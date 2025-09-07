// src/array-map.ts
var ArrayMap = class _ArrayMap {
  maps;
  constructor() {
    this.maps = /* @__PURE__ */ new Map();
  }
  nthMap(n) {
    let map = this.maps.get(n);
    if (!map) {
      map = /* @__PURE__ */ new Map();
      this.maps.set(n, map);
    }
    return map;
  }
  get(path) {
    let map = this.nthMap(path.length);
    for (const p of path) {
      map = map.get(p);
      if (!map) return void 0;
    }
    return map;
  }
  has(path) {
    let map = this.nthMap(path.length);
    for (const p of path) {
      map = map.get(p);
      if (!map) return false;
    }
    return true;
  }
  delete(path) {
    let map = this.nthMap(path.length);
    for (const p of path.slice(0, -1)) {
      map = map.get(p);
      if (!map) return void 0;
    }
    const item = map.get(path.at(-1));
    map.delete(path.at(-1));
    return item;
  }
  change(path, cb) {
    let map = this.nthMap(path.length);
    for (const p of path.slice(0, -1)) {
      let oldMap = map;
      map = map.get(p);
      if (!map) {
        map = /* @__PURE__ */ new Map();
        oldMap.set(p, map);
      }
    }
    map.set(path.at(-1), cb(map.get(path.at(-1))));
  }
  set(path, value) {
    this.change(path, () => value);
  }
  forEach(map) {
    const r = (n, m, path) => {
      if (n === 0) {
        map(path, m);
      } else {
        for (const [k, v] of m) r(n - 1, m, path.concat(k));
      }
    };
    for (const [n, map2] of this.maps) {
      r(n, map2, []);
    }
  }
  serialize() {
    const out = [];
    this.forEach((arr, v) => out.push([arr, v]));
    return out;
  }
  static fromSerialized(s) {
    const am = new _ArrayMap();
    for (const [k, v] of s) {
      am.set(k, v);
    }
    return am;
  }
};

// src/listen-for-element.ts
function listenForSelector(selector) {
  const elem = document.querySelector(selector);
  if (elem) return Promise.resolve(elem);
  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(() => {
      const elem2 = document.querySelector(selector);
      if (elem2) {
        observer.disconnect();
        resolve(elem2);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}
function listenForNoSelector(selector) {
  const elem = document.querySelector(selector);
  if (!elem) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(() => {
      const elem2 = document.querySelector(selector);
      if (!elem2) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}
var alterElementsCallbackId = 0;
function alterElements(selector, callback) {
  const id = alterElementsCallbackId++;
  const alteredByKey = "alteredby" + id;
  let unmountCallbacks = [];
  function alter() {
    const elems = document.querySelectorAll(selector);
    for (const e of Array.from(elems)) {
      if (e.dataset[alteredByKey]) continue;
      const unmount = callback(e);
      unmountCallbacks.push(unmount);
      e.dataset[alteredByKey] = "true";
    }
  }
  alter();
  const observer = new MutationObserver(() => {
    alter();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  return () => {
    observer.disconnect();
    for (const cb of unmountCallbacks) cb();
  };
}
var injectedCallbackId = 0;
function injectElementsAt(selector, position, element) {
  const myid = injectedCallbackId++;
  const key = "injectedBy" + injectedCallbackId;
  let shouldStop = false;
  let currentElements = [];
  const observer = new MutationObserver(() => {
    currentElements = currentElements.filter((e) => {
      if (document.body.contains(e.anchor)) {
        return true;
      } else {
        e.unmount();
        e.element.parentElement?.removeChild(e.element);
        return false;
      }
    });
    const elems = document.querySelectorAll(selector);
    for (const e of elems) {
      if (!(e instanceof HTMLElement) || e.dataset[key]) continue;
      e.dataset[key] = "true";
      const r = element(e);
      e.insertAdjacentElement(position, r.element);
      currentElements.push({
        element: r.element,
        unmount: r.unmount,
        anchor: e
      });
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  return () => {
    observer.disconnect();
    shouldStop = true;
  };
}

// src/localstorage-io.ts
function registerStorageItem(name, defaultValue) {
  name = "radian628-wikidot-usertools-" + name;
  let subscriptions = /* @__PURE__ */ new Set();
  const obj = {
    get() {
      const it = localStorage.getItem(name);
      if (!it) return defaultValue;
      try {
        return JSON.parse(it);
      } catch {
        return defaultValue;
      }
    },
    set(content) {
      localStorage.setItem(name, JSON.stringify(content));
      for (const s of subscriptions) {
        s(content);
      }
    },
    subscribe(cb) {
      subscriptions.add(cb);
      return () => {
        subscriptions.delete(cb);
      };
    }
  };
  if (!obj.get() && defaultValue) obj.set(defaultValue);
  return obj;
}

// src/memo.ts
function memo(callback, serializeParams) {
  if (!serializeParams) serializeParams = (x) => x;
  const map = new ArrayMap();
  const fn = (...params) => {
    const serialized = serializeParams(params);
    let hasCached = map.has(serialized);
    if (hasCached) {
      return map.get(serialized);
    }
    const result = callback(...params);
    map.set(serialized, result);
    return result;
  };
  fn.invalidate = (...params) => {
    map.delete(serializeParams(params));
  };
  fn.getCache = () => map;
  return fn;
}

// src/quadtree.ts
function makeQuadtree(data, x1, y1, x2, y2, maxPoints, maxDepth) {
  let midX = (x1 + x2) / 2;
  let midY = (y1 + y2) / 2;
  if (maxDepth === 0 || data.length <= maxPoints) {
    return {
      data: { type: "points", points: data },
      x1,
      y1,
      x2,
      y2,
      midX,
      midY
    };
  }
  const childQuadtreeDatas = [
    [],
    [],
    [],
    []
  ];
  for (let i = 0; i < data.length; i++) {
    const pt = data[i];
    let idx = (pt.x > midX ? 1 : 0) + (pt.y > midY ? 2 : 0);
    childQuadtreeDatas[idx].push(pt);
  }
  return {
    x1,
    y1,
    x2,
    y2,
    midX,
    midY,
    data: {
      type: "children",
      children: [
        makeQuadtree(
          childQuadtreeDatas[0],
          x1,
          y1,
          midX,
          midY,
          maxPoints,
          maxDepth - 1
        ),
        makeQuadtree(
          childQuadtreeDatas[1],
          midX,
          y1,
          x2,
          midY,
          maxPoints,
          maxDepth - 1
        ),
        makeQuadtree(
          childQuadtreeDatas[2],
          x1,
          midY,
          midX,
          y2,
          maxPoints,
          maxDepth - 1
        ),
        makeQuadtree(
          childQuadtreeDatas[3],
          midX,
          midY,
          x2,
          y2,
          maxPoints,
          maxDepth - 1
        )
      ]
    }
  };
}
function doRangesIntersect(aLo, aHi, bLo, bHi) {
  return !(aHi < bLo || bHi < aLo);
}
function lookupQuadtree(qt, x1, y1, x2, y2) {
  if (!(doRangesIntersect(x1, x2, qt.x1, qt.x2) && doRangesIntersect(y1, y2, qt.y1, qt.y2)))
    return [];
  if (qt.data.type === "points") return qt.data.points;
  return [
    ...lookupQuadtree(qt.data.children[0], x1, y1, x2, y2),
    ...lookupQuadtree(qt.data.children[1], x1, y1, x2, y2),
    ...lookupQuadtree(qt.data.children[2], x1, y1, x2, y2),
    ...lookupQuadtree(qt.data.children[3], x1, y1, x2, y2)
  ];
}

// src/string-field.ts
function stringField(src) {
  const element = document.createElement("input");
  element.value = src.get();
  const unsub = src.subscribe((t) => {
    if (element.value !== t) {
      element.value = t;
    }
  });
  element.oninput = () => {
    src.set(element.value);
  };
  return {
    element,
    unmount: unsub
  };
}

// src/throttle.ts
function throttle(callback, options) {
  let queue = [];
  const requestHistorySize = options.limits.reduce(
    (prev, curr) => Math.max(prev, curr.duration),
    0
  );
  let requestHistory = [];
  const pendingRequests = /* @__PURE__ */ new Set();
  setInterval(() => {
    while (true) {
      const req = queue.at(0);
      if (!req) return;
      const time = Date.now();
      requestHistory = requestHistory.filter(
        (h) => (time - h.time) / 1e3 <= requestHistorySize
      );
      if (pendingRequests.size >= options.maxConcurrentRequests) return;
      for (const l of options.limits) {
        let reqCount = 0;
        for (const h of requestHistory) {
          const secondsAgo = (time - h.time) / 1e3;
          if (secondsAgo <= l.duration) {
            reqCount++;
          }
        }
        if (reqCount >= l.maxRequests) {
          return;
        }
      }
      queue.shift();
      requestHistory.push({
        time: Date.now()
      });
      const responsePromise = callback(...req.params);
      pendingRequests.add(responsePromise);
      (async () => {
        const response = await responsePromise;
        req.callback(response);
        pendingRequests.delete(responsePromise);
      })();
    }
  });
  const fn = (...params) => {
    return new Promise((resolve, reject) => {
      queue.push({
        params,
        callback: (rt) => {
          resolve(rt);
        }
      });
    });
  };
  fn._throttled = true;
  return fn;
}

// src/wait.ts
function waitUntil(fn) {
  return new Promise((resolve, reject) => {
    const unsub = fn((t) => {
      unsub();
      resolve(t);
    });
  });
}
function wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}
function waitForCond(fn, checkInterval = 0) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const result = fn();
      if (result !== void 0) {
        resolve(result);
        clearInterval(interval);
      }
    }, checkInterval);
  });
}

// src/workerify.ts
function workerifyServer(i, discriminator, onReceive, send) {
  let inf = i;
  const unsub = onReceive(async (req) => {
    if (!req || req._discriminator !== discriminator) {
      return;
    }
    const typedReq = req;
    const responseContents = await inf[typedReq.type](...typedReq.contents);
    send({
      contents: responseContents,
      _discriminator: discriminator,
      id: typedReq.id
    });
  });
  return {
    unsub,
    setInterface(i2) {
      inf = i2;
    }
  };
}
function workerifyClient(discriminator, onReceive, send) {
  let msgid = 0;
  return new Proxy({}, {
    get(i, prop) {
      return (...args) => {
        const id = (msgid++).toString();
        const req = {
          type: prop,
          contents: args,
          _discriminator: discriminator,
          id
        };
        return new Promise((resolve, reject) => {
          const unsub = onReceive((res) => {
            if (!res || res._discriminator !== discriminator) {
              return;
            }
            const typedRes = res;
            if (typedRes.id === id) {
              resolve(typedRes.contents);
              unsub();
            }
          });
          send(req);
        });
      };
    }
  });
}
function workerifyServerIframe(discriminator, i, target) {
  return workerifyServer(
    i,
    discriminator,
    (cb) => {
      const listener = (e) => cb(e.data);
      window.addEventListener("message", listener);
      return () => {
        window.removeEventListener("message", listener);
      };
    },
    (r) => {
      target.postMessage(r, "*");
    }
  );
}
function workerifyClientIframe(discriminator, target) {
  return workerifyClient(
    discriminator,
    (cb) => {
      const listener = (e) => cb(e.data);
      window.addEventListener("message", listener);
      return () => {
        window.removeEventListener("message", listener);
      };
    },
    (req) => {
      target.postMessage(req, "*");
    }
  );
}
export {
  ArrayMap,
  alterElements,
  injectElementsAt,
  listenForNoSelector,
  listenForSelector,
  lookupQuadtree,
  makeQuadtree,
  memo,
  registerStorageItem,
  stringField,
  throttle,
  wait,
  waitForCond,
  waitUntil,
  workerifyClient,
  workerifyClientIframe,
  workerifyServer,
  workerifyServerIframe
};
