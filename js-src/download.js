// src/download.ts
function download(file, name) {
  const a = document.createElement("a");
  a.download = name;
  const url = URL.createObjectURL(file);
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}
function downloadText(text, name) {
  const blob = new Blob([text], { type: "text/plain" });
  download(blob, name);
}
export {
  download,
  downloadText
};
