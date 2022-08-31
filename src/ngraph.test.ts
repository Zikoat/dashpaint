import createGraph, { Graph, Node, NodeId } from "ngraph.graph";
import { describe, expect, test } from "vitest";
import { nba } from "ngraph.path";
import scc from "strongly-connected-components";

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
    expect(node?.data.status).toBe("on");

    const worldNode = g.getNode("world");
    expect(worldNode?.data).toBe("custom data");
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

  test("it should find strongly connected components in a graph", () => {
    const g = createGraph();
    g.addLink("1,0", "1,1");
    g.addLink("1,1", "1,0");
    g.addLink("1,1", "0,1");
    g.addLink("1,1", "2,1");
    g.addLink("0,1", "2,1");
    g.addLink("2,1", "0,1");

    const graphSccOutput = findScc(g);

    expect(graphSccOutput).toMatchInlineSnapshot(`
      {
        "componentAdjacencyList": [
          [],
          [
            0,
          ],
        ],
        "components": [
          [
            "2,1",
            "0,1",
          ],
          [
            "1,1",
            "1,0",
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

function toGraph(adjacencyList: number[][], nodes: NodeId[]): Graph {
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
  return g;
}

function toAdjacencyList(graph: Graph) {
  const nodes: NodeId[] = [];
  const adjacencyList: number[][] = [];

  graph.forEachLink((link) => {
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

  return { nodes, adjacencyList };
}

interface SccOutput {
  components: number[][];
  adjacencyList: number[][];
}

function findScc(graph: Graph): {
  components: NodeId[][];
  componentAdjacencyList: number[][];
} {
  const adjacencyListGraph = toAdjacencyList(graph);
  const sccOutput: SccOutput = scc(adjacencyListGraph.adjacencyList);

  const components = sccOutput.components.map((component) =>
    component.map((nodeIndex) => {
      const node = adjacencyListGraph.nodes[nodeIndex];
      if (node === undefined)
        throw new Error(`couldnt find node index ${nodeIndex}`);
      return node;
    })
  );

  return { componentAdjacencyList: sccOutput.adjacencyList, components };
}
