export async function injectFunction<Args extends any[], Ret>(
  get: () => ((...args: Args) => Ret) | undefined,
  set: (fn: (...args: Args) => Ret) => void,
  injector: (ogfn: (...args: Args) => Ret) => (...args: Args) => Ret
) {
  return new Promise<void>((resolve, reject) => {
    const interval = setInterval(() => {
      const fn = get();
      if (!fn) return;
      set(injector(fn));
      clearInterval(interval);
      resolve();
    });
  });
}
