import { table } from "./array-map";
import { id } from "./range";

export type Vertex<V, E> = {
  data: V;
  incoming: Set<Edge<V, E>>;
  outgoing: Set<Edge<V, E>>;
};

export type Edge<V, E> = {
  data: E;
  endpoints: [Vertex<V, E>, Vertex<V, E>];
};

export type Graph<V, E> = {
  vertices: Set<Vertex<V, E>>;
  edges: Set<Edge<V, E>>;
};

export function createGraph<V, E>(): Graph<V, E> {
  return {
    vertices: new Set(),
    edges: new Set(),
  };
}

export function createGraphFromData<V, E>(
  vertices: V[],
  edges: { endpoints: [V, V]; data: E }[]
): Graph<V, E> {
  const graph = createGraph<V, E>();

  const vertexMap = new Map<V, Vertex<V, E>>();

  for (const v of vertices) {
    vertexMap.set(v, addVertex(graph, v));
  }

  for (const e of edges) {
    addEdge(
      graph,
      [vertexMap.get(e.endpoints[0])!, vertexMap.get(e.endpoints[1])!],
      e.data
    );
  }

  return graph;
}

export function addVertex<V, E>(graph: Graph<V, E>, data: V) {
  const vertex: Vertex<V, E> = {
    data,
    incoming: new Set(),
    outgoing: new Set(),
  };
  graph.vertices.add(vertex);
  return vertex;
}

export function addEdge<V, E>(
  graph: Graph<V, E>,
  endpoints: [Vertex<V, E>, Vertex<V, E>],
  data: E
) {
  const edge: Edge<V, E> = {
    data,
    endpoints,
  };
  endpoints[0].outgoing.add(edge);
  endpoints[1].incoming.add(edge);

  graph.edges.add(edge);

  return edge;
}

export function deleteEdge<V, E>(graph: Graph<V, E>, edge: Edge<V, E>) {
  edge.endpoints[0].outgoing.delete(edge);
  edge.endpoints[1].incoming.delete(edge);
  graph.edges.delete(edge);
}

export function getConnectedComponents<V, E>(
  graph: Graph<V, E>
): Graph<V, E>[] {
  const components: Graph<V, E>[] = [];

  const vertsRemaining = new Set(graph.vertices);

  while (vertsRemaining.size > 0) {
    const foundVertices = new Set<Vertex<V, E>>();
    const foundEdges = new Set<Edge<V, E>>();

    let queue: Vertex<V, E>[] = [vertsRemaining.values().next().value!];

    while (queue.length > 0) {
      const vert = queue.shift()!;
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
      edges: foundEdges,
    });
  }
  return components;
}

export function findEndpoint<V, E>(
  graph: Graph<V, E>
): Vertex<V, E> | undefined {
  for (const v of graph.vertices) {
    if (v.incoming.size + v.outgoing.size === 1) return v;
  }
  return undefined;
}

export function getDepthFirstTraversalOrder<V, E>(
  graph: Graph<V, E>,
  startPoint?: Vertex<V, E>
): Vertex<V, E>[] {
  const order: Vertex<V, E>[] = [];

  const foundVertices = new Set<Vertex<V, E>>();

  let stack: Vertex<V, E>[] = [
    startPoint ?? graph.vertices.values().next().value!,
  ];
  if (!stack[0]) return [];
  foundVertices.add(stack[0]);

  while (stack.length > 0) {
    const vertex = stack.pop()!;
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

export function subdivideEdges<V, E>(
  graph: Graph<V, E>,
  getAdjoiningVertices: (edge: Edge<V, E>) => [[E, V][], E] | undefined
) {
  for (const edge of [...graph.edges]) {
    const adjoiningElements = getAdjoiningVertices(edge);
    if (!adjoiningElements) continue;

    const adjoiningVertices = adjoiningElements[0].map((v) =>
      addVertex(graph, v[1])
    );

    const adjoiningEdgeData = adjoiningElements[0]
      .map((v) => v[0])
      .concat(adjoiningElements[1]);

    const starts: Vertex<V, E>[] = [edge.endpoints[0], ...adjoiningVertices];
    const ends: Vertex<V, E>[] = [...adjoiningVertices, edge.endpoints[1]];

    for (let i = 0; i < starts.length; i++) {
      const endpoints: [Vertex<V, E>, Vertex<V, E>] = [starts[i], ends[i]];
      addEdge(graph, endpoints, adjoiningEdgeData[i]);
    }

    graph.edges.delete(edge);
  }
}

export function subdivideEdgesAtCuts<V, E>(
  graph: Graph<V, E>,
  getEdgeCuts: (edge: Edge<V, E>) => [[E, number][], E] | undefined,
  getVertexAlongCut: (a: Vertex<V, E>, b: Vertex<V, E>, factor: number) => V
) {
  subdivideEdges(graph, (edge) => {
    const cuts = getEdgeCuts(edge);
    if (!cuts) return undefined;

    return [
      cuts[0].map((c) => [
        c[0],
        getVertexAlongCut(edge.endpoints[0], edge.endpoints[1], c[1]),
      ]),
      cuts[1],
    ];
  });
}

export function subdivideEdgesAtCutsSimple<V, E>(
  graph: Graph<V, E>,
  getEdgeCuts: (edge: Edge<V, E>) => number[],
  getVertexAlongCut: (a: Vertex<V, E>, b: Vertex<V, E>, factor: number) => V,
  defaultEdge: E
) {
  subdivideEdgesAtCuts(
    graph,
    (e) => {
      return [
        getEdgeCuts(e)
          .filter((e) => e < 1 && e > 0)
          .sort((a, b) => a - b)
          .map((e) => [defaultEdge, e]),
        defaultEdge,
      ];
    },
    getVertexAlongCut
  );
}

export function incidentEdges<V, E>(v: Vertex<V, E>): Set<Edge<V, E>> {
  return new Set([...v.incoming, ...v.outgoing]);
}

function compareAngle(a: number, b: number) {
  return Math.min(
    Math.abs(a - b),
    Math.abs(a - b + Math.PI * 2),
    Math.abs(a - b - Math.PI * 2)
  );
}

export function getMaximumAngleDifference<V, E>(
  edge: Edge<V, E>,
  getAngle: (edge: Edge<V, E>) => number
) {
  const myAngle = getAngle(edge);

  const edges = [
    ...incidentEdges(edge.endpoints[0]),
    ...incidentEdges(edge.endpoints[1]),
  ];

  const maxAngle = Math.max(
    ...edges.map((e) => compareAngle(myAngle, getAngle(e)))
  );

  return maxAngle;
}

export function subdivideEdgesByMaximumAngleDifference<V, E>(
  graph: Graph<V, E>,
  getAngle: (edge: Edge<V, E>) => number,
  subdivideBy: (
    edge: Edge<V, E>,
    maxAngle: number
  ) => [[E, number][], E] | undefined,
  getVertexAlongCut: (a: Vertex<V, E>, b: Vertex<V, E>, factor: number) => V
) {
  subdivideEdgesAtCuts(
    graph,
    (edge) => {
      const maxAngle = getMaximumAngleDifference(edge, getAngle);

      return subdivideBy(edge, maxAngle);
    },
    getVertexAlongCut
  );
}

export function subdivideEdgesByDistance<V, E>(
  graph: Graph<V, E>,
  maxDistance: number,
  distanceMetric: (edge: Edge<V, E>) => number,
  createNewSubdividedVertex: (
    edge: Edge<V, E>,
    fractionAcross: number,
    index: number,
    count: number
  ) => V,
  createNewSubdividedEdge: (
    originalEdge: Edge<V, E>,
    startEndpointFraction: number,
    endEndpointFraction: number,
    index: number,
    count: number
  ) => E
) {
  subdivideEdges(graph, (edge) => {
    const dist = distanceMetric(edge);
    if (dist <= maxDistance) {
      return undefined;
    }

    const numPointsToAdd = Math.floor(dist / maxDistance);

    const verts: [E, V][] = [];

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
      ),
    ];
  });
}

export type GraphJSON<V, E> = {
  vertices: V[];
  edges: {
    endpoints: [number, number];
    data: E;
  }[];
};

export function graph2json<V, E, SV = V, SE = E>(
  graph: Graph<V, E>,
  serializeVertex?: (v: V) => SV,
  serializeEdge?: (e: E) => SE
) {
  let index = 0;

  // @ts-expect-error
  if (!serializeVertex) serializeVertex = id;
  // @ts-expect-error
  if (!serializeEdge) serializeEdge = id;

  const vertexIndexMap = new Map<Vertex<V, E>, number>();

  let json: GraphJSON<SV, SE> = {
    vertices: [],
    edges: [],
  };

  for (const v of graph.vertices) {
    vertexIndexMap.set(v, index);
    json.vertices.push(serializeVertex!(v.data));
    index++;
  }

  for (const e of graph.edges) {
    json.edges.push({
      endpoints: [
        vertexIndexMap.get(e.endpoints[0])!,
        vertexIndexMap.get(e.endpoints[1])!,
      ],
      data: serializeEdge!(e.data),
    });
  }

  return json;
}

export function json2graph<V, E, SV = V, SE = E>(
  json: GraphJSON<SV, SE>,
  parseVertex?: (v: SV) => V,
  parseEdge?: (e: SE) => E
): Graph<V, E> {
  // @ts-expect-error
  if (!parseVertex) parseVertex = id;
  // @ts-expect-error
  if (!parseEdge) parseEdge = id;

  const graph: Graph<V, E> = createGraph();

  let vertexList: Vertex<V, E>[] = [];

  for (const v of json.vertices)
    vertexList.push(addVertex(graph, parseVertex!(v)));

  for (const e of json.edges) {
    addEdge(
      graph,
      [vertexList[e.endpoints[0]], vertexList[e.endpoints[1]]],
      parseEdge!(e.data)
    );
  }

  return graph;
}

/*
things to implement:
- separating connected components
- A*
- dijkstra
- 
*/
