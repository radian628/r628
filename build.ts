import * as esbuild from "esbuild";
import * as fs from "node:fs/promises";

await esbuild.build({
  entryPoints: ["src/**/*"],
  outdir: "js-src",
  minify: false,
  bundle: true,
  format: "esm",
});

await esbuild.build({
  entryPoints: ["src-node/**/*"],
  outdir: "js-src-node",
  minify: false,
  bundle: true,
  platform: "node",
  external: ["esbuild"],
  format: "esm",
});

const reactDemos = await esbuild.build({
  entryPoints: ["demos-src/react/**/*.demo.*"],
  outdir: "demos-build",
  minify: false,
  bundle: true,
  format: "iife",
  write: false,
  loader: { ".tsx": "tsx" },
  jsx: "automatic",
});

for (let out of reactDemos.outputFiles) {
  const dst =
    "./demos/react/" +
    out.path
      .split("/")
      .at(-1)!
      .replace(/\.demo\.js$/g, ".html");
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
