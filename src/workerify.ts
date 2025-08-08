type InterfaceWithMethods = Record<string, (...args: any[]) => any>;

export type WorkerifyInterface<T extends InterfaceWithMethods> = {
  [K in keyof T]: (
    ...args: Parameters<T[K]>
  ) => ReturnType<T[K]> extends Promise<any>
    ? ReturnType<T[K]>
    : Promise<ReturnType<T[K]>>;
};

type WorkerifyRequest<T extends InterfaceWithMethods> = {
  [K in keyof T]: {
    type: K;
    contents: Parameters<T[K]>;
    _discriminator: string;
    id: string;
  };
}[keyof T];

type WorkerifyResponse<T extends InterfaceWithMethods> = {
  [K in keyof T]: {
    contents: ReturnType<T[K]>;
    _discriminator: string;
    id: string;
  };
}[keyof T];

export function workerifyServer<I extends InterfaceWithMethods>(
  i: I,
  discriminator: string,
  onReceive: (cb: (req: any) => any) => () => void,
  send: (res: any) => void
) {
  let inf = i;
  const unsub = onReceive(async (req: any) => {
    if (!req || req._discriminator !== discriminator) {
      return;
    }

    const typedReq: WorkerifyRequest<I> = req;

    const responseContents = await inf[typedReq.type](...typedReq.contents);

    send({
      contents: responseContents,
      _discriminator: discriminator,
      id: typedReq.id,
    });
  });

  return {
    unsub,
    setInterface(i: I) {
      inf = i;
    },
  };
}

export function workerifyClient<I extends InterfaceWithMethods>(
  discriminator: string,
  onReceive: (cb: (req: any) => any) => () => void,
  send: (req: any) => void
): WorkerifyInterface<I> {
  let msgid = 0;
  return new Proxy({} as I, {
    get(i, prop) {
      return (...args: any[]) => {
        const id = (msgid++).toString();
        const req = {
          type: prop,
          contents: args,
          _discriminator: discriminator,
          id,
        };

        return new Promise((resolve, reject) => {
          const unsub = onReceive((res) => {
            if (!res || res._discriminator !== discriminator) {
              return;
            }

            const typedRes: WorkerifyResponse<I> = res;

            if (typedRes.id === id) {
              resolve(typedRes.contents);
              unsub();
            }
          });
          send(req);
        });
      };
    },
  });
}

export function workerifyServerIframe<T extends InterfaceWithMethods>(
  discriminator: string,
  i: T,
  target: Window
) {
  return workerifyServer<T>(
    i,
    discriminator,
    (cb) => {
      const listener = (e: MessageEvent) => cb(e.data);
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

export function workerifyClientIframe<T extends InterfaceWithMethods>(
  discriminator: string,
  target: Window
) {
  return workerifyClient<T>(
    discriminator,
    (cb) => {
      const listener = (e: MessageEvent) => cb(e.data);
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
