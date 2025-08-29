import * as esbuild from "esbuild";
import * as path from "node:path";

export const bundledPrecompiledTypescript = (
  buildSettings: Parameters<typeof esbuild.build>[0]
): esbuild.Plugin => ({
  name: "bpt",
  setup(build) {
    build.onResolve({ filter: /\?.*bpt/ }, (args) => {
      return {
        path: path.join(args.resolveDir, args.path),
        namespace: "bpt-ns",
      };
    });
    build.onLoad({ filter: /.*/, namespace: "bpt-ns" }, async (args) => {
      const fspath = args.path.replace(/\?.*$/, "");

      const result = await esbuild.build({
        entryPoints: [fspath],
        bundle: true,
        outfile: "index.js",
        write: false,
        plugins: [],
        ...buildSettings,
      });

      for (const file of result.outputFiles ?? []) {
        if (file.path.endsWith("index.js")) {
          return {
            contents: new TextDecoder("utf8").decode(file.contents),
            loader: "text",
            watchFiles: [fspath],
          };
        }
      }
    });
  },
});
