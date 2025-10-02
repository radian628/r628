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
function canvasToBlob(c, type, quality) {
  return new Promise((resolve, reject) => {
    c.toBlob(
      (blob) => {
        resolve(blob);
      },
      type,
      quality
    );
  });
}
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      resolve(reader.result);
    });
    reader.readAsDataURL(blob);
  });
}
function loadImg(url) {
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => {
      resolve(img);
    };
    img.src = url;
  });
}
export {
  blobToDataURL,
  canvasToBlob,
  download,
  downloadText,
  loadImg
};
