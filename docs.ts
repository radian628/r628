import * as fs from "node:fs/promises";
import { Application, ReflectionKind } from "typedoc";

export async function buildDocs() {
  const entryPoint = "./src/index.ts";
  const app = await Application.bootstrap({
    entryPoints: [entryPoint],
    compilerOptions: {
      target: "es2015",
      lib: ["dom", "es2022"],
      jsx: "react",
      allowImportingTsExtensions: true,
      moduleResolution: "bundler",
      skipLibCheck: true,
    },
    exclude: ["node_modules/**/*"],
  });
  const reflect = (await app.convert())!;
  reflect.traverse((reflection, property) => {
    if (reflection.kind === ReflectionKind.Function) {
      console.log(reflection.name);
    }
  });
}

buildDocs();
