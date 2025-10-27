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
export {
  addEdge,
  addVertex,
  createGraph,
  createGraphFromData,
  findEndpoint,
  getConnectedComponents,
  getDepthFirstTraversalOrder
};
