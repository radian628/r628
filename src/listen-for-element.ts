export function listenForSelector(selector: string) {
  const elem = document.querySelector(selector);
  if (elem) return Promise.resolve(elem);

  return new Promise<Element>((resolve, reject) => {
    const observer = new MutationObserver(() => {
      const elem = document.querySelector(selector);
      if (elem) {
        observer.disconnect();
        resolve(elem);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

export function listenForNoSelector(selector: string) {
  const elem = document.querySelector(selector);
  if (!elem) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const observer = new MutationObserver(() => {
      const elem = document.querySelector(selector);
      if (!elem) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

let alterElementsCallbackId = 0;
export function alterElements(
  selector: string,
  callback: (elem: HTMLElement) => () => void
) {
  const id = alterElementsCallbackId++;
  const alteredByKey = "alteredby" + id;

  let unmountCallbacks: (() => void)[] = [];

  function alter() {
    const elems = document.querySelectorAll(selector);
    for (const e of Array.from(elems) as HTMLElement[]) {
      if (e.dataset[alteredByKey]) continue;
      const unmount = callback(e as HTMLElement);
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
    subtree: true,
  });

  return () => {
    observer.disconnect();
    for (const cb of unmountCallbacks) cb();
  };
}
