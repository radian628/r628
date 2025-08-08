export function waitUntil<T>(
  fn: (cb: T extends void ? () => void : (t: T) => void) => () => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    // @ts-expect-error
    const unsub = fn((t) => {
      unsub();
      resolve(t);
    });
  });
}

export function wait(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

export function waitForCond<T>(
  fn: () => T | undefined,
  checkInterval: number = 0
) {
  return new Promise<T>((resolve, reject) => {
    const interval = setInterval(() => {
      const result = fn();
      if (result !== undefined) {
        resolve(result);
        clearInterval(interval);
      }
    }, checkInterval);
  });
}
