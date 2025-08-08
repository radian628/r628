import { PubSub } from "./pubsub.js";

export function stringField(src: PubSub<string>) {
  const element = document.createElement("input");
  element.value = src.get();
  const unsub = src.subscribe((t) => {
    if (element.value !== t) {
      element.value = t;
    }
  });
  element.oninput = () => {
    src.set(element.value);
  };
  return {
    element,
    unmount: unsub,
  };
}
