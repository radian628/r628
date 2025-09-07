// src/quadtree.ts
function makeQuadtree(data, x1, y1, x2, y2, maxPoints, maxDepth) {
  let midX = (x1 + x2) / 2;
  let midY = (y1 + y2) / 2;
  if (maxDepth === 0 || data.length <= maxPoints) {
    return {
      data: { type: "points", points: data },
      x1,
      y1,
      x2,
      y2,
      midX,
      midY
    };
  }
  const childQuadtreeDatas = [
    [],
    [],
    [],
    []
  ];
  for (let i = 0; i < data.length; i++) {
    const pt = data[i];
    let idx = (pt.x > midX ? 1 : 0) + (pt.y > midY ? 2 : 0);
    childQuadtreeDatas[idx].push(pt);
  }
  return {
    x1,
    y1,
    x2,
    y2,
    midX,
    midY,
    data: {
      type: "children",
      children: [
        makeQuadtree(
          childQuadtreeDatas[0],
          x1,
          y1,
          midX,
          midY,
          maxPoints,
          maxDepth - 1
        ),
        makeQuadtree(
          childQuadtreeDatas[1],
          midX,
          y1,
          x2,
          midY,
          maxPoints,
          maxDepth - 1
        ),
        makeQuadtree(
          childQuadtreeDatas[2],
          x1,
          midY,
          midX,
          y2,
          maxPoints,
          maxDepth - 1
        ),
        makeQuadtree(
          childQuadtreeDatas[3],
          midX,
          midY,
          x2,
          y2,
          maxPoints,
          maxDepth - 1
        )
      ]
    }
  };
}
function doRangesIntersect(aLo, aHi, bLo, bHi) {
  return !(aHi < bLo || bHi < aLo);
}
function lookupQuadtree(qt, x1, y1, x2, y2) {
  if (!(doRangesIntersect(x1, x2, qt.x1, qt.x2) && doRangesIntersect(y1, y2, qt.y1, qt.y2)))
    return [];
  if (qt.data.type === "points") return qt.data.points;
  return [
    ...lookupQuadtree(qt.data.children[0], x1, y1, x2, y2),
    ...lookupQuadtree(qt.data.children[1], x1, y1, x2, y2),
    ...lookupQuadtree(qt.data.children[2], x1, y1, x2, y2),
    ...lookupQuadtree(qt.data.children[3], x1, y1, x2, y2)
  ];
}
export {
  lookupQuadtree,
  makeQuadtree
};
