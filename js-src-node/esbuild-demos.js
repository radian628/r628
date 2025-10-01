// src-node/esbuild-demos.ts
import * as fs from "node:fs/promises";
var demoSuffixes = [
  ".demo.js",
  ".demo.ts",
  ".demo.jsx",
  ".demo.tsx",
  ".demo.mjs",
  ".demo.mts",
  ".demo.cjs",
  ".demo.cts"
];
function demosPlugin(_opts) {
  const opts = _opts ?? {};
  if (!opts.template)
    opts.template = (name) => `<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <script src="${name.split("/").at(-1)}"></script>
  </body>
</html>`;
  return {
    name: "demos",
    setup(build) {
      build.initialOptions.metafile = true;
      build.onEnd(async (res) => {
        await Promise.all(
          Object.entries(res.metafile.outputs).map(async ([name, output]) => {
            if (demoSuffixes.some((s) => name.endsWith(s))) {
              const html = opts.template(name);
              const htmlpath = name.replace(/\.demo\..*$/g, ".html");
              await fs.writeFile(htmlpath, html);
            }
          })
        );
      });
    }
  };
}
export {
  demosPlugin
};
