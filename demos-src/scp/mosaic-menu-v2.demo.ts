import {
  add2,
  cart2Polar,
  cartesianProduct,
  distance2,
  pickrand,
  polar2Cart,
  rand,
  range,
  remap2,
  scale2,
  smartRange,
  sub2,
  Vec2,
} from "../../src";

function getEnclosingBox(pts: Vec2[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const pt of pts) {
    minX = Math.min(pt[0], minX);
    maxX = Math.max(pt[0], maxX);
    minY = Math.min(pt[1], minY);
    maxY = Math.max(pt[1], maxY);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function getLeftEnvelope(pts: Vec2[]) {
  const box = getEnclosingBox(pts);
  const ax = box.x + box.width / 2;
  const ay = box.y + box.height / 2;
  return pts
    .filter((p) => p[1] === box.y || p[1] === box.y + box.height || p[0] < ax)
    .sort(
      (a, b) =>
        Math.atan2(ay - a[1], ax - a[0]) - Math.atan2(ay - b[1], ax - b[0])
    );
}

function getRightEnvelope(pts) {
  const box = getEnclosingBox(pts);
  const ax = box.x + box.width / 2;
  const ay = box.y + box.height / 2;
  return pts
    .filter((p) => p[1] === box.y || p[1] === box.y + box.height || p[0] >= ax)
    .sort(
      (a, b) =>
        Math.atan2(a[1] - ay, a[0] - ax) - Math.atan2(b[1] - ay, b[0] - ax)
    );
}

function voronoiRaycast(params: {
  positions: Vec2[];
  index: number;
  raysToCast: number;
  threshold: number;
}) {
  const { positions, index, raysToCast, threshold } = params;

  const center = positions[index];
  const others = positions.filter((_, i) => i !== index);

  let voronoi: Vec2[] = [];

  for (const r of smartRange(raysToCast)) {
    const angle = r.remap(0, Math.PI * 2);

    const dir = polar2Cart(1, angle);

    let pos: Vec2 = center.slice() as Vec2;

    for (const iter in range(32)) {
      const minDistFromOthers = Math.min(
        ...others.map((o) => distance2(o, pos))
      );
      const minDistFromCenter = distance2(pos, center);

      const maxSafeStep = (minDistFromOthers - minDistFromCenter) / 2;

      if (maxSafeStep < threshold) {
        break;
      }

      pos = add2(pos, scale2(dir, maxSafeStep));
    }

    voronoi.push(pos);
  }

  return voronoi;
}

function voronoiRaycastSet(params: {
  positions: Vec2[];
  raysToCast: number;
  threshold: number;
}) {
  const { positions, raysToCast, threshold } = params;

  return positions.map((p, i) => voronoiRaycast({ ...params, index: i }));
}

type Tessera = {
  name: string;
  desc: string;
  url: string;
  color: string;
};

function createTesseraLayout(tessera: Tessera[]) {
  const rowCount = Math.max(tessera.length / 3);
  const colCount = 3;

  const gridY = rowCount + 2;
  const gridX = colCount + 2;

  const gridMinX = -40;
  const gridMinY = 0;
  const gridMaxX = 140;
  const gridMaxY = 100;

  const gridDx = (gridMaxX - gridMinX) / gridX;
  const gridDy = (gridMaxY - gridMinY) / gridY;

  const randX = gridDx * 0.8;
  const randY = gridDy * 0.4;

  const grid = cartesianProduct(smartRange(gridY), smartRange(gridX)).map(
    ([y, x]) =>
      [
        x.remap(gridMinX, gridMaxX) + rand(-randX / 2, randX / 2) + gridDx / 2,
        y.remap(gridMinY, gridMaxY) + rand(-randY / 2, randY / 2) + gridDy / 2,
      ] as Vec2
  );

  const voronoiCells = voronoiRaycastSet({
    positions: grid,
    raysToCast: 30,
    threshold: 0.1,
  });

  const tesseraCellGridRanges = cartesianProduct(
    range(rowCount).map((x) => x + 1),
    range(colCount).map((x) => x + 1)
  )
    .map(([y, x]) => [x, y])
    .slice(0, tessera.length);

  console.log("help", tesseraCellGridRanges);

  const styles = tesseraCellGridRanges
    .map(([x, y], i) => {
      const tes = tessera[i];

      const voronoiList = voronoiCells[x + y * gridX];

      const minX = Math.min(...voronoiList.map((v) => v[0]));
      const maxX = Math.max(...voronoiList.map((v) => v[0]));
      const minY = Math.min(...voronoiList.map((v) => v[1]));
      const maxY = Math.max(...voronoiList.map((v) => v[1]));

      const toLocalCoords = (v: Vec2) =>
        remap2(v, [minX, minY], [maxX, maxY], [0, 0], [100, 100]);

      const localVoronoiList = voronoiList.map(toLocalCoords);

      const boundary = localVoronoiList.map(
        ([x, y]) => `${x.toPrecision(4)}% ${y.toPrecision(4)}%`
      );

      const shapeLeft = getLeftEnvelope(localVoronoiList).map(([x, y]) => [
        x * 2,
        y,
      ]);
      const shapeRight = getRightEnvelope(localVoronoiList).map(([x, y]) => [
        x * 2 - 100,
        y,
      ]);

      const shapeOutsideLeft = `polygon(
  0% 0%, 0% 100%,
  ${shapeLeft.map(([x, y]) => `${x.toPrecision(4)}% ${y.toPrecision(4)}%`)}
)`;
      const shapeOutsideRight = `polygon(
  100% 100%, 100% 0%,
  ${shapeRight.map(([x, y]) => `${x.toPrecision(4)}% ${y.toPrecision(4)}%`)}
)`;

      return `.cell-${x}-${y} {
  position: absolute;
  top: ${minY}%;
  left: ${minX}%;
  width: ${maxX - minX}%;
  height: ${maxY - minY}%;
  clip-path: polygon(${boundary});
}
  
.cell-${x}-${y}-env-l {
  float: left;
  shape-outside: ${shapeOutsideLeft};
  width: 50%;
  height: 100%;
}

.cell-${x}-${y}-env-r {
  float: right;
  shape-outside: ${shapeOutsideRight};
  width: 50%;
  height: 100%;
}`;
    })
    .join("\n\n");

  const tesseraDivs = tesseraCellGridRanges
    .map(([x, y], i) => {
      const tes = tessera[i];

      return `[[div_ class="cell-${x}-${y}" style="--color: ${tes.color}"]]
[[div_ class="cell-${x}-${y}-env-l"]]
@@ @@
[[/div]]
[[div_ class="cell-${x}-${y}-env-r"]]
@@ @@
[[/div]]
[[a class="tessera-link" href="${tes.url}"]]@@ @@[[/a]]
[[div_ class="mosaic-text"]]
${tes.name}
[[/div]]
[[/div]]`;
    })
    .join("\n\n");

  return `

[[module css]]
.mosaic-menu a {
  background-color: #bbb;
  z-index: -1;
  pointer-events: all;
}

.mosaic-menu a:visited {
  background-color: var(--color);
}

.tessera-link {
  display: block;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.mosaic-text {
  margin-top: 34cqh;
  text-align: center;
}

.mosaic-menu {
  aspect-ratio: 1 / 2;
  position: relative;
  pointer-events: none;
}

.mosaic-menu > div {
  container-type: size;
}

${styles}
[[/module]]
[[div_ class="mosaic-menu"]]
${tesseraDivs}
[[/div]]

`;
}

const COLORS = [
  "#B5005A",
  "#FF997C",
  "#F96353",
  "#00B391",
  "#0045FF",
  "#4800D5",
];

const TESSERA: Tessera[] = [
  {
    name: "Hanson Perry and the Crabmeat Loss",
    desc: "Friday was the wretched end of everybody’s week, but Hanson Perry liked it fine.",
    url: "https://scp-wiki.wikidot.com/mosaic-crabmeat",
  },
  {
    name: "The Rainbow Pebble",
    desc: "something here",
    url: "https://scp-wiki.wikidot.com/mosaic-the-rainbow-pebble",
  },
  {
    name: "The Broken Dawn",
    desc: "In which dawn breaks, and no-one will come by to fix it.",
    url: "https://scp-wiki.wikidot.com/the-broken-dawn",
  },
  {
    name: "The Beast Of Liverwort Hill",
    desc: "A metal beast appears in Liverwort Hill, but nothing steel can stay.",
    url: "https://scp-wiki.wikidot.com/the-beast-of-liverwort-hill",
  },
  {
    name: "Right of First Refuse",
    desc: "In Which a Pile of Corpses Makes a Plea to the Courts.",
    url: "https://scp-wiki.wikidot.com/right-of-first-refuse",
  },
  {
    name: "The Gizzen Kirk",
    desc: "The Proctors find a canny soul to build a church to Progress.",
    url: "https://scp-wiki.wikidot.com/the-gizzen-kirk",
  },
  {
    name: "Where Once the Canvas Fish",
    desc: "In which great beasts leave only their wake in the sky.",
    url: "https://scp-wiki.wikidot.com/canvas-fish-fly",
  },
  {
    name: "The Parcelmen's Creed",
    desc: "In which a Parcelwoman faces her greatest challenge yet: stairs.",
    url: "https://scp-wiki.wikidot.com/the-parcelmens-creed",
  },
  {
    name: "Bessie Bogan and the Crow Road Inn",
    desc: "In which the Mosaic’s favorite tavern flies into trouble.",
    url: "https://scp-wiki.wikidot.com/bessie-bogan-and-the-crow-road-inn",
  },
  {
    name: "Juni Writes A Poem",
    desc: "In which a poet finds ways to dream skyward.",
    url: "https://scp-wiki.wikidot.com/juni-writes-a-poem",
  },
  {
    name: "A Gally Fellow's Lens",
    desc: "In which we watch time pass.",
    url: "https://scp-wiki.wikidot.com/a-gally-fellows-lens",
  },
  {
    name: "Leasehold On Daylight",
    desc: "In which the light outlasts the system designed to sell it. ",
    url: "https://scp-wiki.wikidot.com/leasehold-on-daylight",
  },
].map((e) => ({ ...e, color: pickrand(COLORS) }));

const layout = createTesseraLayout(TESSERA);

const btn = document.createElement("button");

btn.innerText = "click to copy tessera to clipbaord";
document.body.appendChild(btn);
btn.onclick = () => {
  navigator.clipboard.writeText(layout);
};

// const canvas = document.createElement("canvas");
// document.body.appendChild(canvas);
// canvas.width = 1000;
// canvas.height = 1000;
// const ctx = canvas.getContext("2d");

// const grid = cartesianProduct(smartRange(10), smartRange(10)).map(
//   ([i, j]) =>
//     [i.remap(0, 1000) + rand(-25, 25), j.remap(0, 1000) + rand(-25, 25)] as Vec2
// );

// const voronoi = voronoiRaycastSet({
//   positions: grid,
//   raysToCast: 30,
//   threshold: 3,
// });

// console.log(voronoi);

// for (const cell of voronoi) {
//   ctx.beginPath();
//   for (const pos of cell) {
//     ctx.lineTo(...pos);
//   }
//   ctx.closePath();
//   ctx.stroke();
// }
