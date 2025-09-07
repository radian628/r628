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
  workerifyClient,
  workerifyClientIframe,
  workerifyServer,
  workerifyServerIframe
};
