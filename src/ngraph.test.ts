import createGraph, { Node, NodeId } from "ngraph.graph";
import { describe, expect, test } from "vitest";
import { nba } from "ngraph.path";
import { findScc, toGraph } from "./graphHelpers";

describe("graph", () => {
  test("it should create a graph", () => {
    const g = createGraph();

    g.addNode("hello");
    g.addNode("world");

    g.addLink("space", "bar");
    g.addLink("hello", "world");

    g.addNode("world", "custom data");
    g.addNode("server", { status: "on", ip: "12345" });

    const node = g.getNode("server");
    expect(node?.data.status).toBe("on");

    const worldNode = g.getNode("world");
    expect(worldNode?.data).toBe("custom data");
    expect(1).toBe(1);
  });

});

describe("path", () => {
  test("it should find a path in the graph", () => {
    const g = createGraph();
    g.addLink(1, 2);
    g.addLink(2, 3);
    g.addLink(2, 4);

    g.addLink(4, 1);

    const pathfinder = nba(g, { oriented: true });
    const fromNodeId = 1;
    const toNodeId = 4;
    let foundPath = pathfinder.find(fromNodeId, toNodeId);

    const toSimplePath = (path: Node[]) => {
      return path.map((node) => node.id).join("->");
    };

    expect(toSimplePath(foundPath)).toBe("4->2->1");
  });
});

describe("connected components", () => {
  test("it should find connected components in a simple graph", () => {
    const g = createGraph();
    g.addLink(1, 2);

    const connectedComponents = findScc(g);

    expect(connectedComponents).toMatchInlineSnapshot(`
      {
        "componentAdjacencyList": [
          [],
          [
            0,
          ],
        ],
        "components": [
          [
            2,
          ],
          [
            1,
          ],
        ],
      }
    `);
  });
});

test("adjacency list to graph", () => {
  const nodes: NodeId[] = ["1,0", "1,1", "0,1", "2,1"];

  var adjacencyList = [[1], [0, 2, 3], [3], [2]];

  const graph2 = toGraph(adjacencyList, nodes);

  expect(graph2.getNodesCount()).toMatchInlineSnapshot("4");
  expect(graph2.getLinksCount()).toMatchInlineSnapshot("6");
});
