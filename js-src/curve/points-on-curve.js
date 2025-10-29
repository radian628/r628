// src/math/vector.ts
function add2(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}
function mul2(a, b) {
  return [a[0] * b[0], a[1] * b[1]];
}
function sub2(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}
function length2(a) {
  return Math.sqrt(dot2(a, a));
}
function distance2(a, b) {
  return length2(sub2(a, b));
}
function mix2(a, b, c) {
  return add2(b, scale2(sub2(c, b), a));
}
function sum2(a) {
  return a[0] + a[1];
}
function dot2(a, b) {
  return sum2(mul2(a, b));
}
function scale2(a, b) {
  return [a[0] * b, a[1] * b];
}

// src/curve/points-on-curve.ts
function equidistantPointsOnCurve(curve, interval) {
  if (curve.length === 0) return [];
  const outPoints = [curve[0]];
  let accumDist = 0;
  for (let i = 0; i < curve.length - 1; i++) {
    const prevPoint = curve[i];
    const currPoint = curve[i + 1];
    const currLineDist = distance2(prevPoint, currPoint);
    const initLength = interval - accumDist % interval;
    accumDist += currLineDist;
    const newPointCount = Math.floor(accumDist / interval);
    for (let j = 0; j < newPointCount; j++) {
      let distAcross = initLength + j * interval;
      outPoints.push(mix2(distAcross / currLineDist, prevPoint, currPoint));
    }
    accumDist -= newPointCount * interval;
  }
  return outPoints;
}
function variableDistancePointsOnCurve(curve, nextDistance) {
  if (curve.length === 0) return [];
  const outPoints = [curve[0]];
  let interval = nextDistance(curve[0]);
  let accumDist = 0;
  for (let i = 0; i < curve.length - 1; i++) {
    const prevPoint = curve[i];
    const currPoint = curve[i + 1];
    const currLineDist = distance2(prevPoint, currPoint);
    const initLength = interval - accumDist % interval;
    accumDist += currLineDist;
    const newPointCount = Math.floor(accumDist / interval);
    let distAcross = initLength;
    while (accumDist > interval) {
      outPoints.push(mix2(distAcross / currLineDist, prevPoint, currPoint));
      accumDist -= interval;
      interval = nextDistance(outPoints.at(-1));
      distAcross += interval;
    }
  }
  return outPoints;
}
export {
  equidistantPointsOnCurve,
  variableDistancePointsOnCurve
};
