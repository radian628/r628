// src-node/esbuild-precompiled-ts.ts
import * as esbuild from "esbuild";
import * as path from "node:path";
var bundledPrecompiledTypescript = (buildSettings) => ({
  name: "bpt",
  setup(build2) {
    build2.onResolve({ filter: /\?.*bpt/ }, (args) => {
      return {
        path: path.join(args.resolveDir, args.path),
        namespace: "bpt-ns"
      };
    });
    build2.onLoad({ filter: /.*/, namespace: "bpt-ns" }, async (args) => {
      const fspath = args.path.replace(/\?.*$/, "");
      const result = await esbuild.build({
        entryPoints: [fspath],
        bundle: true,
        outfile: "index.js",
        write: false,
        plugins: [],
        metafile: true,
        ...buildSettings
      });
      for (const file of result.outputFiles ?? []) {
        if (file.path.endsWith("index.js")) {
          return {
            contents: new TextDecoder("utf8").decode(file.contents),
            loader: "text",
            watchFiles: [fspath, ...Object.keys(result.metafile?.inputs ?? {})]
          };
        }
      }
    });
  }
});
export {
  bundledPrecompiledTypescript
};
