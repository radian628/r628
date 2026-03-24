import * as fs from "node:fs/promises";

async function getFileFromCommit(filepath: string, commit: number) {
  const proc = Bun.spawn(
    ["git", "--no-pager", "show", `HEAD~${commit}:${filepath}`],
    {},
  );

  // @ts-expect-error
  const text: string = await proc.stdout.text();

  if ((await proc.exited) !== 0) {
    return undefined;
  } else {
    return text;
  }
}

async function getFilesFromCommit(commit: number) {
  const rendererHtml1 = await getFileFromCommit(
    "demos-build/webgpu/graph-renderer.html",
    commit,
  );
  const rendererJs1 = await getFileFromCommit(
    "demos-build/webgpu/graph-renderer.demo.js",
    commit,
  );
  const rendererHtml2 = await getFileFromCommit(
    "demos-build/webgpu/graph-renderer/graph-renderer.html",
    commit,
  );
  const rendererJs2 = await getFileFromCommit(
    "demos-build/webgpu/graph-renderer/graph-renderer.demo.js",
    commit,
  );

  const dirpath = "demos-build/graph-renderer-old-" + commit;

  await fs.mkdir(dirpath);
  await fs.writeFile(dirpath + "/graph-renderer.html", rendererHtml1!);
  await fs.writeFile(dirpath + "/graph-renderer.demo.js", rendererJs1!);

  if (rendererHtml2 || rendererJs2) {
    await fs.mkdir(dirpath + "/graph-renderer");
    await fs.writeFile(
      dirpath + "/graph-renderer/graph-renderer.html",
      rendererHtml2!,
    );
    await fs.writeFile(
      dirpath + "/graph-renderer/graph-renderer.demo.js",
      rendererJs2!,
    );
  }
}

(async () => {
  for (let i = 0; i < 17; i++) {
    await getFilesFromCommit(i + 1);
  }
})();
