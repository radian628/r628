import * as esbuild from "esbuild";
import { WgslReflect } from "wgsl_reflect";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export function wgslPlugin(): esbuild.Plugin {
  return {
    name: "wgsl",
    setup(build) {
      build.onResolve({ filter: /\.wgsl$/ }, (args) => {
        return {
          path: path.join(args.resolveDir, args.path),
          namespace: "wgsl",
          pluginData: {
            originalPath: args.path,
          },
        };
      });

      build.onLoad({ filter: /.*/, namespace: "wgsl" }, async (args) => {
        const file = (await fs.readFile(args.path)).toString();

        const reflect = new WgslReflect(file);

        const json = {
          bindGroups: reflect.getBindGroups(),
        };

        fs.writeFile(
          args.path + ".d.ts",
          `declare module "${
            args.pluginData.originalPath
          }" {\n  const data: ${JSON.stringify(
            json,
            undefined,
            2
          )};\n export default data; \n}`
        );

        return {
          loader: "json",
          contents: JSON.stringify(json),
        };
      });
    },
  };
}
