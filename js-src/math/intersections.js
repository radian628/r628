// src/math/vector.ts
function pointTo(a, b) {
  return Math.atan2(b[1] - a[1], b[0] - a[0]);
}
function add2(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}
function sub2(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}
function mix2(a, b, c) {
  return add2(b, scale2(sub2(c, b), a));
}
function scale2(a, b) {
  return [a[0] * b, a[1] * b];
}

// src/math/intersections.ts
function quadraticFormula(a, b, c) {
  const bSquaredMinusFourAC = b ** 2 - 4 * a * c;
  if (bSquaredMinusFourAC < 0) return [];
  if (bSquaredMinusFourAC === 0) return [-b / (2 * a)];
  return [
    (-b - Math.sqrt(bSquaredMinusFourAC)) / (2 * a),
    (-b + Math.sqrt(bSquaredMinusFourAC)) / (2 * a)
  ];
}
function circleIntersectLine(circle, seg) {
  const bxMinusAx = seg.b[0] - seg.a[0];
  const byMinusAy = seg.b[1] - seg.a[1];
  const axMinusCx = seg.a[0] - circle.center[0];
  const ayMinusCy = seg.a[1] - circle.center[1];
  const a = bxMinusAx ** 2 + byMinusAy ** 2;
  const b = 2 * (bxMinusAx * axMinusCx + byMinusAy * ayMinusCy);
  const c = axMinusCx ** 2 + ayMinusCy ** 2 - circle.radius ** 2;
  return quadraticFormula(a, b, c);
}
function lineIntersectLine(a, b) {
  const ax = a.a[0];
  const ay = a.a[1];
  const bx = a.b[0];
  const by = a.b[1];
  const cx = b.a[0];
  const cy = b.a[1];
  const dx = b.b[0];
  const dy = b.b[1];
  return ((bx - ax) * (ay - cy) + (by - ay) * (cx - ax)) / ((bx - ax) * (dy - cy) - (by - ay) * (dx - cx));
}
function lineSegmentIntersectLineSegment(a, b) {
  const t2 = lineIntersectLine(a, b);
  const t1 = lineIntersectLine(b, a);
  if (t1 < 0 || t1 > 1) return;
  if (t2 < 0 || t2 > 1) return;
  return t2;
}
function lineIntersectRect(l, rect) {
  const topIntersect = lineSegmentIntersectLineSegment(
    {
      a: rect.a,
      b: [rect.b[0], rect.a[1]]
    },
    l
  );
  const bottomIntersect = lineSegmentIntersectLineSegment(
    {
      a: [rect.a[0], rect.b[1]],
      b: rect.b
    },
    l
  );
  const leftIntersect = lineSegmentIntersectLineSegment(
    {
      a: rect.a,
      b: [rect.a[0], rect.b[1]]
    },
    l
  );
  const rightIntersect = lineSegmentIntersectLineSegment(
    {
      a: [rect.b[0], rect.a[1]],
      b: rect.b
    },
    l
  );
  return [topIntersect, bottomIntersect, leftIntersect, rightIntersect].filter(
    (i) => i && i >= 0 && i <= 1
  );
}
function lineIntersectRectClosest(l, rect) {
  return Math.min(...lineIntersectRect(l, rect));
}
function rayIntersectLine(ray, b) {
  return lineIntersectLine(
    {
      a: ray.center,
      b: add2(ray.center, [Math.cos(ray.dir), Math.sin(ray.dir)])
    },
    b
  );
}
function getSmallestAngleDifference(a, b) {
  const minDiff = Math.min(
    Math.abs(a - b),
    Math.abs(a - b + Math.PI * 2),
    Math.abs(a - b - Math.PI * 2)
  );
  const lowest = Math.min(a, b);
  return [lowest, lowest + minDiff];
}
function getEqualAngularDivisionsOfLineSegment(center, b, interval) {
  const [angle1, angle2] = getSmallestAngleDifference(
    pointTo(center, b.a),
    pointTo(center, b.b)
  );
  const truncatedAngle1 = Math.ceil(angle1 / interval) * interval;
  let tValues = [];
  for (let i = truncatedAngle1; i < angle2; i += interval) {
    tValues.push(
      rayIntersectLine(
        {
          center,
          dir: i
        },
        b
      )
    );
  }
  return tValues;
}
function closestApproachOfLineSegmentToPoint(l, pt) {
  const ax = l.a[0];
  const ay = l.a[1];
  const bx = l.b[0];
  const by = l.b[1];
  const cx = pt[0];
  const cy = pt[1];
  return (-(bx - ax) * (ax - cx) - (by - ay) * (ay - cy)) / ((bx - ax) ** 2 + (by - ay) ** 2);
}
function sampleLineSegment(l, t) {
  return mix2(t, l.a, l.b);
}
function rangeIntersects(a1, a2, b1, b2) {
  return !(a1 > b2 || b1 > a2);
}
function rectIntersects(a, b) {
  return rangeIntersects(a.a[0], a.b[0], b.a[0], b.b[0]) && rangeIntersects(a.a[1], a.b[1], b.a[1], b.b[1]);
}
export {
  circleIntersectLine,
  closestApproachOfLineSegmentToPoint,
  getEqualAngularDivisionsOfLineSegment,
  getSmallestAngleDifference,
  lineIntersectLine,
  lineIntersectRect,
  lineIntersectRectClosest,
  lineSegmentIntersectLineSegment,
  rangeIntersects,
  rayIntersectLine,
  rectIntersects,
  sampleLineSegment
};
