import { table } from "./array-map";

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

/*
things to implement:
- separating connected components
- A*
- dijkstra
- 
*/
