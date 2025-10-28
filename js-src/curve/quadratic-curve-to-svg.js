// src/curve/quadratic-curve-to-svg.ts
function quadraticCurveToPath(curve, sigfigs, offset) {
  let startPoint = curve[0].a;
  const str = (n) => n.toPrecision(sigfigs);
  let output = `M ${str(startPoint[0] + offset[0])} ${str(
    startPoint[1] + offset[1]
  )}`;
  let prevpoint = startPoint;
  for (const b of curve) {
    output += `q ${str(b.b[0] - prevpoint[0])} ${str(
      b.b[1] - prevpoint[1]
    )},${str(b.c[0] - prevpoint[0])} ${str(b.c[1] - prevpoint[1])}`;
    prevpoint = b.c;
  }
  return output;
}
function quadraticCurveToSvgPath(curve, offset, color, sigfigs) {
  const pathd = quadraticCurveToPath(curve, sigfigs, offset);
  return `<path d="${pathd}" stroke="${color}" />`;
}
function islandsToSvg(width, height, islands, sigfigs) {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${islands.map(
    (i) => quadraticCurveToSvgPath(i.curve, i.topLeftInImage, i.color, sigfigs)
  ).join("")}</svg>`;
}
export {
  islandsToSvg,
  quadraticCurveToPath,
  quadraticCurveToSvgPath
};
