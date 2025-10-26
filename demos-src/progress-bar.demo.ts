import { simpleProgressBar } from "../src/ui/progress-bar";

function wait(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

simpleProgressBar([
  "a",
  async () => await wait(100),
  async () => await wait(100),
  async () => await wait(100),
  async () => await wait(100),
  async () => await wait(100),
  async () => await wait(100),
  async () => await wait(100),
  async () => await wait(100),
  async () => await wait(100),
  "b",
  async () => await wait(100),
  async () => await wait(100),
  async () => await wait(100),
  async () => await wait(100),
  async () => await wait(100),
  async () => await wait(100),
  async () => await wait(100),
  async () => await wait(100),
  async () => await wait(100),
]);
