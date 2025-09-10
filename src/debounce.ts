export type Debounced<T extends Function> = T & { _debounced: true };

// make any function finish its current execution
// before executing itself again
// unlike "throttle", this may sometimes not execute
export function debounce<Params extends any[], RetType>(
  callback: (...params: Params) => Promise<RetType>
): Debounced<(...params: Params) => Promise<RetType | undefined>> {
  let nextRequestIndex = 0;

  let currentRequest: Promise<RetType> | undefined = undefined;

  const fn = async (...params: Params) => {
    nextRequestIndex += 1;
    const myindex = nextRequestIndex;
    if (currentRequest) {
      await currentRequest;
    }

    if (nextRequestIndex === myindex) {
      const myreq = callback(...params);
      currentRequest = myreq;
      const res = await myreq;
      currentRequest = undefined;
      return res;
    }
    return undefined;
  };

  fn._debounced = true as true;

  return fn;
}
