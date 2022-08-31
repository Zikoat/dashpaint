import createGraph, { Graph, Node, NodeId } from "ngraph.graph";
import { describe, expect, test } from "vitest";
import { nba } from "ngraph.path";
import scc from "strongly-connected-components";
import { assert } from "console";

describe("graph", () => {
  test("it should create a bidirectional graph", () => {
    const g = createGraph();

    g.addNode("hello");
    g.addNode("world");

    g.addLink("space", "bar");
    g.addLink("hello", "world");

    g.addNode("world", "custom data");
    g.addNode("server", { status: "on", ip: "12345" });

    const node = g.getNode("server");
    expect(node.data.status).toBe("on");

    const worldNode = g.getNode("world");
    expect(worldNode.data).toBe("custom data");
    expect(1).toBe(1);
  });

  test.skip("it should render a graph", () => {
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
  test.skip("it should find connected components", () => {
    const g = createGraph();
    g.addLink(1, 2);

    const connectedComponents = findConnectedComponents(g);

    expect(connectedComponents).toMatchInlineSnapshot(`
      [
        [
          1,
          2,
        ],
      ]
    `);
  });
});

test("adjacency list to graph", () => {
  const nodes: NodeId[] = ["1,0", "1,1", "0,1", "2,1"];

  var adjacencyList = [
    [1], // 0
    [0, 2, 3], // 1
    [3], // 2
    [2], // 3
  ];

  const g = createGraph();
  for (const [fromNode, toNodes] of adjacencyList.entries()) {
    const fromNodeId = nodes[fromNode];
    if (fromNodeId === undefined) {
      throw new Error(`Could not find node at index ${fromNode}`);
    }

    for (const toNode of toNodes) {
      const toNodeId = nodes[toNode];
      if (toNodeId === undefined) {
        throw new Error(`Could not find node at index ${toNode}`);
      }

      g.addLink(fromNodeId, toNodeId);
    }
  }

  expect(g.getNodesCount()).toMatchInlineSnapshot("4");
  expect(g.getLinksCount()).toMatchInlineSnapshot("6");
});

test("graph to adjacency list", () => {
  const g = createGraph();

  g.addLink("a", "b");
  g.addLink("b", "c");
  g.addLink("c", "a");

  const nodes: NodeId[] = [];
  const adjacencyList: number[][] = [];

  g.forEachLink((link) => {
    let fromIndex = nodes.findIndex((node) => node === link.fromId);
    if (fromIndex === -1) {
      nodes.push(link.fromId);
      adjacencyList.push([]);
      fromIndex = nodes.length - 1;
    }
    let toIndex = nodes.findIndex((node) => node === link.toId);
    if (toIndex === -1) {
      nodes.push(link.toId);
      adjacencyList.push([]);
      toIndex = nodes.length - 1;
    }

    const newLength = adjacencyList[fromIndex]?.push(toIndex);
    if (newLength === undefined)
      throw new Error(`Could not add a link from ${fromIndex} to ${toIndex}`);
  });

  const output = { nodes, adjacencyList };

  expect(output).toStrictEqual({
    nodes: ["a", "b", "c"],
    adjacencyList: [[1], [2], [0]],
  });
});

function findConnectedComponents(graph: Graph) {}

console.log();

test("shit", () => {
  const nodes = ["1,0", "1,1", "0,1", "2,1"];

  var adjacencyList = [
    [1], // 0
    [0, 2, 3], // 1
    [3], // 2
    [2], // 3
  ];

  const sccOutput = scc(adjacencyList);

  expect(sccOutput).toMatchInlineSnapshot(`
    {
      "adjacencyList": [
        [],
        [
          0,
        ],
      ],
      "components": [
        [
          3,
          2,
        ],
        [
          1,
          0,
        ],
      ],
    }
  `);
});
