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

export function canvasToBlob(
  c: HTMLCanvasElement,
  type?: string,
  quality?: number
) {
  return new Promise<Blob | null>((resolve, reject) => {
    c.toBlob(
      (blob) => {
        resolve(blob);
      },
      type,
      quality
    );
  });
}

export function blobToDataURL(blob: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      resolve(reader.result);
    });
    reader.readAsDataURL(blob);
  });
}

export function loadImg(url: string) {
  const img = new Image();
  return new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = () => {
      resolve(img);
    };
    img.src = url;
  });
}
