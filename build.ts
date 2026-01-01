import * as esbuild from "esbuild";
import { glob } from "glob";
import * as fs from "node:fs/promises";
import { demosPlugin } from "./src-node/esbuild-demos";
import * as path from "node:path";
import { wgslPlugin } from "./src-node/esbuild-wgsl-plugin";
import { rawQueryParamPlugin } from "./src-node/esbuild-raw-query-param";

const codegenFiles = await glob("**/*.codegen.ts", {
  ignore: "node_modules/**",
});
await Promise.all(
  codegenFiles.map((c) => {
    Bun.spawn(["bun", "run", c]);
  })
);

const libFiles = [
  ...(await glob("src/**/*.ts")),
  ...(await glob("src/**/*.tsx")),
].filter((f) => !f.match(/\.codegen\.(ts|tsx)+/));

await fs.writeFile(
  "src/index.ts",
  libFiles.map((e) => `export * from "./${path.relative("src", e)}"\n`)
);

await esbuild.build({
  entryPoints: libFiles,
  outdir: "js-src",
  minify: false,
  bundle: true,
  format: "esm",
  plugins: [rawQueryParamPlugin],
});

await esbuild.build({
  entryPoints: ["src-node/**/*.ts"],
  outdir: "js-src-node",
  minify: false,
  bundle: true,
  platform: "node",
  external: ["esbuild"],
  format: "esm",
  plugins: [rawQueryParamPlugin],
});

const reactDemos = await esbuild.build({
  entryPoints: ["demos-src/**/*.react-demo.*"],
  outdir: "demos-build",
  minify: false,
  bundle: true,
  format: "iife",
  write: false,
  loader: { ".tsx": "tsx" },
  jsx: "automatic",
  plugins: [rawQueryParamPlugin],
});

for (let out of reactDemos.outputFiles) {
  const dst =
    "./demos/react/" +
    out.path
      .split("/")
      .at(-1)!
      .replace(/\.react-demo\.js$/g, ".html");
  fs.writeFile(
    dst,
    `
<!DOCTYPE html>
<html>
<head></head> 
<body>
  <div id="root"></div>
  <script>
    ${new TextDecoder().decode(out.contents)}
  </script>
</body>
    `
  );
}

const nonReactDemos = await esbuild.build({
  entryPoints: ["demos-src/**/*.demo.*"],
  outdir: "demos-build",
  minify: false,
  bundle: true,
  format: "iife",
  // write: false,
  plugins: [demosPlugin(), wgslPlugin(), rawQueryParamPlugin],
});

// for (let out of nonReactDemos.outputFiles) {
//   const dst =
//     "./demos/" +
//     out.path
//       .split("/")
//       .at(-1)!
//       .replace(/\.demo\.js$/g, ".html");
//   fs.writeFile(
//     dst,
//     `
// <!DOCTYPE html>
// <html>
// <head></head>
// <body>
//   <script>
//     ${new TextDecoder().decode(out.contents)}
//   </script>
// </body>
//     `
//   );
// }
