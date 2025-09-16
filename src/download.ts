export function download(file: Blob, name: string) {
  const a = document.createElement("a");
  a.download = name;
  const url = URL.createObjectURL(file);
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadText(text: string, name: string) {
  const blob = new Blob([text], { type: "text/plain" });
  download(blob, name);
}
