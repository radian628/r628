import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/*"],
  outdir: "js-src",
  minify: false,
  bundle: true,
  format: "esm",
});

await esbuild.build({
  entryPoints: ["src-node/*"],
  outdir: "js-src-node",
  minify: false,
  bundle: true,
  platform: "node",
  external: ["esbuild"],
  format: "esm",
});
