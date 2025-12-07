import { download } from "../src";

const input = document.createElement("input");
input.type = "file";

const extmap: Record<string, string | undefined> = {
  woff: "font/woff",
  woff2: "font/woff2",
  otf: "font/otf",
  eot: "application/vnd.ms-fontobject",
  ttf: "font/ttf",
};

const formatmap: Record<string, string | undefined> = {
  eot: "embedded-opentype",
  otc: "collection",
  ttc: "collection",
  otf: "opentype",
  ttf: "opentype",
  svg: "svg",
  svgz: "svg",
  woff: "woff",
  woff2: "woff2",
};

input.addEventListener("input", (e) => {
  const file = input.files[0];
  const name = file.name.replace(/\.\w+$/g, "");

  const ext = file.name.match(/\.\w+$/g)?.[0];

  const mimetype = extmap[ext.slice(1)];

  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const cssfile = `@font-face {
  font-family: "${name}";
  src: url("${reader.result}") ${ext ? `format("${formatmap[ext.slice(1)] ?? ext.slice(1)}")` : ""};
}`;

    download(new Blob([cssfile], { type: "text/css" }), name + ".css");
  });
  reader.readAsDataURL(mimetype ? new Blob([file], { type: mimetype }) : file);
});

document.body.innerHTML = `
<p>Upload a font file to the field below to generate and download a CSS file that you can <code>@import</code> into your project.</p>
<p>The <code>font-family</code> value used by the font will just be the name of the font file you originally uploaded, but without the file extension. So for example if you uploaded <code>InterVariable.woff2</code>, then to use the resulting css file, you would need to use <code>font-family: "InterVariable";</code>.</p>
`;

document.body.appendChild(input);

console.log("got here");
