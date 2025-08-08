import * as esbuild from "esbuild";
import * as path from "node:path";
import * as fs from "node:fs/promises";

export const rawQueryParamPlugin: esbuild.Plugin = {
  name: "raw",
  setup(build) {
    build.onResolve({ filter: /\?.*raw/ }, (args) => {
      console.log("raw start");
      return {
        path: path.join(args.resolveDir, args.path),
        namespace: "raw-ns",
      };
    });
    build.onLoad({ filter: /.*/, namespace: "raw-ns" }, async (args) => {
      console.log("raw end");
      const fspath = args.path.replace(/\?.*$/, "");
      return {
        contents: (await fs.readFile(fspath)).toString(),
        loader: "text",
        watchFiles: [fspath],
      };
    });
  },
};
