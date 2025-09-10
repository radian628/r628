// src/intersect.ts
function rangeIntersects(a1, a2, b1, b2) {
  return !(a1 > b2 || b1 > a2);
}
function rectIntersects(a, b) {
  return rangeIntersects(a.left, a.right, b.left, b.right) && rangeIntersects(a.top, a.bottom, b.top, b.bottom);
}
export {
  rangeIntersects,
  rectIntersects
};
