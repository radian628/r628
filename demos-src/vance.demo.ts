import {
  cartesianProduct,
  pickrand,
  rand,
  range,
  smartRange,
  Vec2,
} from "../src";

function asyncImage(src: string) {
  return new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.src = src;
  });
}

main();

type AlphaMask = {
  width: number;
  height: number;
  mask: Uint8Array;
};

function createScaledVances(vance: HTMLImageElement, scale: number) {
  const canvas = document.createElement("canvas");

  const ctx = canvas.getContext("2d");

  canvas.width = Math.ceil(vance.width * scale);
  canvas.height = Math.ceil(vance.height * scale);
  ctx.drawImage(vance, 0, 0, canvas.width, canvas.height);

  const imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height);

  return { alphaMask: createAlphaMask(imgdata), image: canvas };
}

function createAlphaMask(imgdata: ImageData): AlphaMask {
  let mask = new Uint8Array(imgdata.data.length / 4);

  for (let i = 0; i < mask.length; i++) {
    mask[i] = imgdata.data[i * 4 + 3];
  }

  return {
    width: imgdata.width,
    height: imgdata.height,
    mask,
  };
}

function sampleAlphaMaskZeroPad(mask: AlphaMask, coords: Vec2) {
  if (coords[0] < 0) return 0;
  if (coords[0] > mask.width - 1) return 0;
  if (coords[1] < 0) return 0;
  if (coords[1] > mask.height - 1) return 0;
  return sampleAlphaMask(mask, coords);
}

function sampleAlphaMask(mask: AlphaMask, coords: Vec2) {
  return mask.mask[coords[1] * mask.width + coords[0]];
}

function maskIntersectAmount(a: AlphaMask, b: AlphaMask, bOffset: Vec2) {
  let sum = 0;

  for (let y = 0; y < b.height; y++) {
    for (let x = 0; x < b.width; x++) {
      sum +=
        sampleAlphaMask(b, [x, y]) *
        sampleAlphaMaskZeroPad(a, [x + bOffset[0], y + bOffset[1]]);
    }
  }

  return sum;
}

async function main() {
  const images = await Promise.all(
    ["vance.png", "trump.png", "biden.png", "kirk.png"].map(asyncImage)
  );

  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  canvas.width = 1440;
  canvas.height = 1440;

  ctx.fillStyle = "white";
  ctx.font = "Bold 144px 'Times New Roman'";

  ctx.textAlign = "center";

  ctx.fillText("SCP-9009", canvas.width / 2, canvas.height / 2 - 80);
  ctx.fillText('"White People"', canvas.width / 2, canvas.height / 2 + 80);

  const textmask = createAlphaMask(
    ctx.getImageData(0, 0, canvas.width, canvas.height)
  );

  for (const i of range(7).reverse()) {
    const scaleFactor = 1 / Math.pow(2, i);
    const scaledImages = images.map((i) => createScaledVances(i, scaleFactor));

    const count = 5 / scaleFactor;

    const stepX = canvas.width / count;
    const stepY = canvas.height / count;

    cartesianProduct(smartRange(count), smartRange(count)).map(([i, j]) => {
      const x = i.remap(0, canvas.width) + rand(-stepX, stepX);
      const y = j.remap(0, canvas.height) + rand(-stepY, stepY);

      const rx = Math.round(x);
      const ry = Math.round(y);

      const img = pickrand(scaledImages);

      if (maskIntersectAmount(textmask, img.alphaMask, [rx, ry]) > 0) {
        return;
      }

      ctx.drawImage(img.image, x, y, img.alphaMask.width, img.alphaMask.height);
    });
  }

  ctx.fillText("SCP-9009", canvas.width / 2, canvas.height / 2 - 80);
  ctx.fillText('"White People"', canvas.width / 2, canvas.height / 2 + 80);
}
