// src/range.ts
function id(x) {
  return x;
}

// src/graph.ts
function createGraph() {
  return {
    vertices: /* @__PURE__ */ new Set(),
    edges: /* @__PURE__ */ new Set()
  };
}
function createGraphFromData(vertices, edges) {
  const graph = createGraph();
  const vertexMap = /* @__PURE__ */ new Map();
  for (const v of vertices) {
    vertexMap.set(v, addVertex(graph, v));
  }
  for (const e of edges) {
    addEdge(
      graph,
      [vertexMap.get(e.endpoints[0]), vertexMap.get(e.endpoints[1])],
      e.data
    );
  }
  return graph;
}
function addVertex(graph, data) {
  const vertex = {
    data,
    incoming: /* @__PURE__ */ new Set(),
    outgoing: /* @__PURE__ */ new Set()
  };
  graph.vertices.add(vertex);
  return vertex;
}
function addEdge(graph, endpoints, data) {
  const edge = {
    data,
    endpoints
  };
  endpoints[0].outgoing.add(edge);
  endpoints[1].incoming.add(edge);
  graph.edges.add(edge);
  return edge;
}
function deleteEdge(graph, edge) {
  edge.endpoints[0].outgoing.delete(edge);
  edge.endpoints[1].incoming.delete(edge);
  graph.edges.delete(edge);
}
function getConnectedComponents(graph) {
  const components = [];
  const vertsRemaining = new Set(graph.vertices);
  while (vertsRemaining.size > 0) {
    const foundVertices = /* @__PURE__ */ new Set();
    const foundEdges = /* @__PURE__ */ new Set();
    let queue = [vertsRemaining.values().next().value];
    while (queue.length > 0) {
      const vert = queue.shift();
      vertsRemaining.delete(vert);
      foundVertices.add(vert);
      for (const edge of vert.outgoing) {
        foundEdges.add(edge);
        if (!foundVertices.has(edge.endpoints[1])) {
          queue.push(edge.endpoints[1]);
        }
        foundVertices.add(edge.endpoints[1]);
      }
      for (const edge of vert.incoming) {
        foundEdges.add(edge);
        if (!foundVertices.has(edge.endpoints[0])) {
          queue.push(edge.endpoints[0]);
        }
        foundVertices.add(edge.endpoints[0]);
      }
    }
    components.push({
      vertices: foundVertices,
      edges: foundEdges
    });
  }
  return components;
}
function findEndpoint(graph) {
  for (const v of graph.vertices) {
    if (v.incoming.size + v.outgoing.size === 1) return v;
  }
  return void 0;
}
function getDepthFirstTraversalOrder(graph, startPoint) {
  const order = [];
  const foundVertices = /* @__PURE__ */ new Set();
  let stack = [
    startPoint ?? graph.vertices.values().next().value
  ];
  if (!stack[0]) return [];
  foundVertices.add(stack[0]);
  while (stack.length > 0) {
    const vertex = stack.pop();
    order.push(vertex);
    for (const edge of vertex.outgoing) {
      if (foundVertices.has(edge.endpoints[1])) {
        continue;
      }
      stack.push(edge.endpoints[1]);
      foundVertices.add(edge.endpoints[1]);
    }
    for (const edge of vertex.incoming) {
      if (foundVertices.has(edge.endpoints[0])) {
        continue;
      }
      stack.push(edge.endpoints[0]);
      foundVertices.add(edge.endpoints[0]);
    }
  }
  return order;
}
function subdivideEdges(graph, getAdjoiningVertices) {
  for (const edge of [...graph.edges]) {
    const adjoiningElements = getAdjoiningVertices(edge);
    if (!adjoiningElements) continue;
    const adjoiningVertices = adjoiningElements[0].map(
      (v) => addVertex(graph, v[1])
    );
    const adjoiningEdgeData = adjoiningElements[0].map((v) => v[0]).concat(adjoiningElements[1]);
    const starts = [edge.endpoints[0], ...adjoiningVertices];
    const ends = [...adjoiningVertices, edge.endpoints[1]];
    for (let i = 0; i < starts.length; i++) {
      const endpoints = [starts[i], ends[i]];
      addEdge(graph, endpoints, adjoiningEdgeData[i]);
    }
    graph.edges.delete(edge);
  }
}
function subdivideEdgesAtCuts(graph, getEdgeCuts, getVertexAlongCut) {
  subdivideEdges(graph, (edge) => {
    const cuts = getEdgeCuts(edge);
    if (!cuts) return void 0;
    return [
      cuts[0].map((c) => [
        c[0],
        getVertexAlongCut(edge.endpoints[0], edge.endpoints[1], c[1])
      ]),
      cuts[1]
    ];
  });
}
function subdivideEdgesAtCutsSimple(graph, getEdgeCuts, getVertexAlongCut, defaultEdge) {
  subdivideEdgesAtCuts(
    graph,
    (e) => {
      return [
        getEdgeCuts(e).filter((e2) => e2 < 1 && e2 > 0).sort((a, b) => a - b).map((e2) => [defaultEdge, e2]),
        defaultEdge
      ];
    },
    getVertexAlongCut
  );
}
function incidentEdges(v) {
  return /* @__PURE__ */ new Set([...v.incoming, ...v.outgoing]);
}
function compareAngle(a, b) {
  return Math.min(
    Math.abs(a - b),
    Math.abs(a - b + Math.PI * 2),
    Math.abs(a - b - Math.PI * 2)
  );
}
function getMaximumAngleDifference(edge, getAngle) {
  const myAngle = getAngle(edge);
  const edges = [
    ...incidentEdges(edge.endpoints[0]),
    ...incidentEdges(edge.endpoints[1])
  ];
  const maxAngle = Math.max(
    ...edges.map((e) => compareAngle(myAngle, getAngle(e)))
  );
  return maxAngle;
}
function subdivideEdgesByMaximumAngleDifference(graph, getAngle, subdivideBy, getVertexAlongCut) {
  subdivideEdgesAtCuts(
    graph,
    (edge) => {
      const maxAngle = getMaximumAngleDifference(edge, getAngle);
      return subdivideBy(edge, maxAngle);
    },
    getVertexAlongCut
  );
}
function subdivideEdgesByDistance(graph, maxDistance, distanceMetric, createNewSubdividedVertex, createNewSubdividedEdge) {
  subdivideEdges(graph, (edge) => {
    const dist = distanceMetric(edge);
    if (dist <= maxDistance) {
      return void 0;
    }
    const numPointsToAdd = Math.floor(dist / maxDistance);
    const verts = [];
    for (let i = 0; i < numPointsToAdd; i++) {
      const vert = createNewSubdividedVertex(
        edge,
        (i + 1) / (numPointsToAdd + 1),
        i,
        numPointsToAdd
      );
      const newEdge = createNewSubdividedEdge(
        edge,
        i / (numPointsToAdd + 1),
        (i + 1) / (numPointsToAdd + 1),
        i,
        numPointsToAdd + 1
      );
      verts.push([newEdge, vert]);
    }
    return [
      verts,
      createNewSubdividedEdge(
        edge,
        numPointsToAdd / (numPointsToAdd + 1),
        1,
        numPointsToAdd,
        numPointsToAdd + 1
      )
    ];
  });
}
function graph2json(graph, serializeVertex, serializeEdge) {
  let index = 0;
  if (!serializeVertex) serializeVertex = id;
  if (!serializeEdge) serializeEdge = id;
  const vertexIndexMap = /* @__PURE__ */ new Map();
  let json = {
    vertices: [],
    edges: []
  };
  for (const v of graph.vertices) {
    vertexIndexMap.set(v, index);
    json.vertices.push(serializeVertex(v.data));
    index++;
  }
  for (const e of graph.edges) {
    json.edges.push({
      endpoints: [
        vertexIndexMap.get(e.endpoints[0]),
        vertexIndexMap.get(e.endpoints[1])
      ],
      data: serializeEdge(e.data)
    });
  }
  return json;
}
function json2graph(json, parseVertex, parseEdge) {
  if (!parseVertex) parseVertex = id;
  if (!parseEdge) parseEdge = id;
  const graph = createGraph();
  let vertexList = [];
  for (const v of json.vertices)
    vertexList.push(addVertex(graph, parseVertex(v)));
  for (const e of json.edges) {
    addEdge(
      graph,
      [vertexList[e.endpoints[0]], vertexList[e.endpoints[1]]],
      parseEdge(e.data)
    );
  }
  return graph;
}
export {
  addEdge,
  addVertex,
  createGraph,
  createGraphFromData,
  deleteEdge,
  findEndpoint,
  getConnectedComponents,
  getDepthFirstTraversalOrder,
  getMaximumAngleDifference,
  graph2json,
  incidentEdges,
  json2graph,
  subdivideEdges,
  subdivideEdgesAtCuts,
  subdivideEdgesAtCutsSimple,
  subdivideEdgesByDistance,
  subdivideEdgesByMaximumAngleDifference
};
