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
export {
  alterElements,
  listenForNoSelector,
  listenForSelector
};
