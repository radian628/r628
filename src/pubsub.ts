export type PubSub<T> = {
  get: () => T;
  set: (t: T) => void;
  subscribe: (cb: (t: T) => void) => () => void;
};
