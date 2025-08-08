import { PubSub } from "./pubsub.js";

export function registerStorageItem<T>(name: string, defaultValue: T) {
  name = "radian628-wikidot-usertools-" + name;
  let subscriptions = new Set<(t: T) => void>();
  const obj: PubSub<T> = {
    get(): T {
      const it = localStorage.getItem(name);
      if (!it) return defaultValue;
      try {
        return JSON.parse(it);
      } catch {
        return defaultValue;
      }
    },
    set(content: T) {
      localStorage.setItem(name, JSON.stringify(content));
      for (const s of subscriptions) {
        s(content);
      }
    },
    subscribe(cb) {
      subscriptions.add(cb);
      return () => {
        subscriptions.delete(cb);
      };
    },
  };

  if (!obj.get() && defaultValue) obj.set(defaultValue);

  return obj;
}
