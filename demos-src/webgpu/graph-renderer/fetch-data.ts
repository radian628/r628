import {
  add3,
  addEdge,
  addVertex,
  createGraph,
  Graph,
  scale3,
  Vec3,
  Vec4,
  Vertex,
} from "../../../src";
import { CANON_TAGS, SERIES_TAGS } from "./tags";
import { PositionedNode } from "./graph-renderer-ui";
import stringHash from "string-hash";

export type Node = {
  position: Vec3;
  color: Vec4;
  initialized: boolean;
  label: string;
  slug: string;
};

export async function fetchGraphRendererData(params: {
  positiveTags: string[];
  negativeTags: string[];
  url: string;
  positions?: Blob;
}): Promise<Graph<Node, Vec4>> {
  const { positiveTags, negativeTags } = params;

  const graph: Graph<Node, Vec4> = createGraph();

  let graphData = await (await fetch(params.url)).json();

  let shouldRandomlyInitializePositions = graphData.every(
    (g: any) => typeof g.x !== "number",
  );

  if (shouldRandomlyInitializePositions) {
    graphData = graphData.map((g: any) => ({
      x: Math.random() * 1000 - 500,
      y: Math.random() * 1000 - 500,
      z: Math.random() * 1000 - 500,
      ...g,
    }));
  }

  graphData = graphData
    .filter(
      (g: any) =>
        typeof g.x === "number" &&
        typeof g.y === "number" &&
        typeof g.z === "number" &&
        !isNaN(g.x) &&
        !isNaN(g.y) &&
        !isNaN(g.z),
    )
    .filter(
      (g: any) =>
        (positiveTags.length === 0 ||
          g.tags?.some((t: any) => positiveTags.includes(t))) &&
        (negativeTags.length === 0 ||
          !g.tags?.some((t: any) => negativeTags.includes(t))),
    );

  // remove duplicates
  graphData = [...new Map(graphData.map((g: any) => [g.url, g])).values()];

  console.log("graphData", graphData);

  let nodeMap = new Map<string, Vertex<Node, Vec4>>();

  let urlToNodeData = new Map<string, { tags: string[] }>();

  for (const n of graphData) {
    urlToNodeData.set(n.url, {
      tags: n.tags,
    });
  }

  let tagCounts = new Map<string, number>();

  for (const [url, { tags }] of urlToNodeData) {
    for (const tag of tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  function getNodeColor(url: string): Vec4 {
    const tags = urlToNodeData.get(url)?.tags ?? [];
    const tagWeights = tags.map((t) => ({
      tag: t,
      weight:
        (1 / (tagCounts.get(t) ?? 20000)) *
        (CANON_TAGS.has(t) ? 1 : SERIES_TAGS.has(t) ? 5 : 0),
    }));
    const tagWeightSum = tagWeights.reduce((a, b) => a + b.weight, 0);

    if (tagWeightSum === 0) return [180, 180, 180, 255];

    let sum: Vec3 = [0, 0, 0];

    for (const { tag, weight } of tagWeights) {
      const hash = stringHash(tag);
      sum = add3(
        sum,
        scale3(
          [
            hash % 256,
            Math.floor(hash / 256) % 256,
            Math.floor(hash / 256 / 256) % 256,
          ],
          weight / tagWeightSum,
        ),
      );
    }

    return [...sum, 255];
  }

  const customPositions = params.positions;

  const nodePositions: PositionedNode[] = customPositions
    ? JSON.parse(await customPositions.text())
    : graphData.map((g: any) => ({
        position: scale3([g.x, g.y, g.z], 0.005),
        slug: g.url.replace("http://scp-wiki.wikidot.com/", "").trim(),
      }));

  for (const { position, slug } of nodePositions) {
    const url = `http://scp-wiki.wikidot.com/${slug}`;

    nodeMap.set(
      url,
      addVertex(graph, {
        position: add3(position, [0, 0, 0]),
        color: getNodeColor(url),
        initialized: false,
        label: slug,
        slug,
      }),
    );
  }

  for (const n of graphData) {
    for (const link of n.other) {
      const src = nodeMap.get(n.url.trim());
      const dst = nodeMap.get(link.trim());

      if (!src) {
        // console.warn(`Endpoint '${n.url}' not found.`);
        continue;
      }
      if (!dst) {
        // console.warn(`Endpoint '${link}' not found.`);
        continue;
      }

      addEdge(graph, [src, dst], [127, 127, 127, 255]);
    }
  }

  return graph;
}
