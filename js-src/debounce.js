// src/debounce.ts
function debounce(callback) {
  let nextRequestIndex = 0;
  let currentRequest = void 0;
  const fn = async (...params) => {
    nextRequestIndex += 1;
    const myindex = nextRequestIndex;
    if (currentRequest) {
      await currentRequest;
    }
    if (nextRequestIndex === myindex) {
      const myreq = callback(...params);
      currentRequest = myreq;
      const res = await myreq;
      currentRequest = void 0;
      return res;
    }
    return void 0;
  };
  fn._debounced = true;
  return fn;
}
export {
  debounce
};
