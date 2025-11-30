// src-node/esbuild-build-notify.ts
var buildNotifyPlugin = {
  name: "raw",
  setup(build) {
    let startTime;
    build.onStart(() => {
      console.log("Build starting...");
      startTime = Date.now();
    });
    build.onEnd(() => {
      console.log(`Build finished! (${Date.now() - startTime} ms)
`);
    });
  }
};
export {
  buildNotifyPlugin
};
