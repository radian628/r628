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
  function observerCallback() {
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
  }
  const observer = new MutationObserver(() => {
    observerCallback();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  observerCallback();
  return () => {
    observer.disconnect();
    shouldStop = true;
  };
}
export {
  alterElements,
  injectElementsAt,
  listenForNoSelector,
  listenForSelector
};
