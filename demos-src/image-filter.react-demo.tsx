import { useEffect, useRef, useState } from "react";
import { mount } from "./react-boilerplate";
import { StringField } from "../src/ui/react-string-field";
import {
  blobToDataURL,
  canvasToBlob,
  download,
  loadImg,
} from "../src/download";

function fail(msg: string): never {
  window.alert(msg);
  throw new Error(msg);
}

mount(() => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasBeforeRef = useRef<HTMLCanvasElement | null>(null);

  const [filters, setFilters] = useState("invert(1)");

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      if (!file) return;
      const canvas = canvasRef.current;
      const canvasBefore = canvasBeforeRef.current;
      if (!canvas || !canvasBefore) fail("No canvas :(");
      const url = await blobToDataURL(file);
      const imgBefore = await createImageBitmap(file);
      const imgAfter = await loadImg(
        `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${imgBefore.width} ${imgBefore.height}">
  <image x="0" y="0" width="100%" height="100%" xlink:href="${url}" style="filter: ${filters}"/>
</svg>
`)}`
      );

      canvasBefore.width = imgBefore.width;
      canvasBefore.height = imgBefore.height;
      canvas.width = imgBefore.width;
      canvas.height = imgBefore.height;

      const ctxBefore = canvasBefore.getContext("2d");
      const ctxAfter = canvas.getContext("2d");
      if (!ctxBefore || !ctxAfter) fail("No canvas context :(");

      ctxBefore.drawImage(imgBefore, 0, 0, canvas.width, canvas.height);
      ctxAfter.drawImage(imgAfter, 0, 0, canvas.width, canvas.height);
    })();
  }, [file, filters]);

  return (
    <div>
      <input
        type="file"
        onChange={async (e) => {
          const file = e.currentTarget.files?.[0];
          if (file && file.type.startsWith("image")) {
            setFile(file);
          } else {
            fail("Wrong file format!");
          }
        }}
      ></input>
      <br></br>
      <StringField
        value={filters}
        setValue={setFilters}
        isTextarea
      ></StringField>
      <br></br>
      <button
        onClick={async () => {
          const canvas = canvasRef.current;
          if (!canvas) fail("No canvas :(");
          const blob = await canvasToBlob(canvas, "image/webp", 1);
          if (!blob) fail("Failed to convert canvas to file :(");
          if (!file) fail("No file :(");
          download(blob, file.name.replaceAll(/\.[\s\S]*?$/g, "") + ".webp");
        }}
      >
        Download
      </button>
      <br></br>
      <div style={{ display: "flex", width: "100vw" }}>
        <canvas style={{ width: "50vw" }} ref={canvasBeforeRef}></canvas>
        <canvas style={{ width: "50vw" }} ref={canvasRef}></canvas>
      </div>
    </div>
  );
});
