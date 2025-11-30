import * as esbuild from "esbuild";

export const buildNotifyPlugin: esbuild.Plugin = {
  name: "raw",
  setup(build) {
    let startTime;
    build.onStart(() => {
      console.log("Build starting...");
      startTime = Date.now();
    });
    build.onEnd(() => {
      console.log(`Build finished! (${Date.now() - startTime} ms)\n`);
    });
  },
};
