import createGraph from "ngraph.graph";
import { describe, expect, it } from "vitest";
import {
  adjacencyListToGraph,
  findScc,
  graphtoSimpleString,
  pathToSimpleString,
} from "./GraphHelpers";
import { mapRange } from "./Helpers";
import { MyPathFinder } from "./PathFinder";

describe("Graph", () => {
  it("it should create a graph", () => {
    const g = createGraph();

    g.addNode("a");
    g.addNode("b");

    g.addLink("c", "d");
    g.addLink("a", "b");

    g.addNode("b");
    g.addNode("e");

    expect(graphtoSimpleString(g)).toMatchInlineSnapshot(`
      "e
      c->d
      a->b"
    `);
  });

  it("should be able to convert to a simple string", () => {
    const graph = createGraph();
    graph.addLink("a", "b");
    graph.addLink("b", "c");

    expect(graphtoSimpleString(graph)).toMatchInlineSnapshot(`
    "a->b
    b->c"
  `);
  });

  describe("adjacency list to graph", () => {
    it("should create a graph from an adjacency list and node ids", () => {
      const nodes = ["a", "b", "c", "d"];
      const adjacencyList = [[1], [0, 2, 3], [3], [2]];

      const graph = adjacencyListToGraph(adjacencyList, nodes);

      expect(graph.getNodesCount()).toMatchInlineSnapshot("4");
      expect(graph.getLinksCount()).toMatchInlineSnapshot("6");
      expect(graphtoSimpleString(graph)).toMatchInlineSnapshot(`
        "a->b
        b->a
        b->c
        b->d
        c->d
        d->c"
      `);
    });

    it("should auto-assign node ids if they are not given", () => {
      const adjacencyList = [[1], [2], [0]];

      const graph = adjacencyListToGraph(adjacencyList);

      expect(graphtoSimpleString(graph)).toMatchInlineSnapshot(`
        "0->1
        1->2
        2->0"
      `);
    });
  });

  describe.each([{ type: MyPathFinder, name: "MyPathFinder" }])(
    "pathfinder $name",
    () => {
      it("a graph with only 1 node should not find a path because there are no edges", () => {
        const g = createGraph();
        const nodeName = "a";
        g.addNode(nodeName);

        const pathfinder = new MyPathFinder(g, { oriented: true });

        let foundPath = pathfinder.find(nodeName, nodeName);

        const str = pathToSimpleString(foundPath);

        expect(str).toMatchInlineSnapshot('""');
      });

      it("should find a path in a directed graph", () => {
        const g = createGraph();
        g.addLink(1, 2);
        g.addLink(2, 3);
        g.addLink(3, 4);
        g.addLink(4, 1);

        const pathfinder = new MyPathFinder(g);
        const fromNodeId = 1;
        const toNodeId = 4;
        let foundPath = pathfinder.find(fromNodeId, toNodeId);

        expect(pathToSimpleString(foundPath)).toBe("1->2->3->4");
      });

      it("a graph with 2 nodes should return a path with 2 nodes", () => {
        const g = createGraph();

        g.addLink("a", "b");

        const pathfinder = new MyPathFinder(g);

        let foundPath = pathfinder.find("a", "b");

        expect(pathToSimpleString(foundPath)).toBe("a->b");
      });

      it("should not find a path if there is none", () => {
        const g = createGraph();

        g.addLink("a", "b");

        const pathfinder = new MyPathFinder(g);

        let foundPath = pathfinder.find("b", "a");

        expect(pathToSimpleString(foundPath)).toBe("");
      });
    }
  );

  it("deletes the edges connected to a node if the node is deleted", () => {
    const g = createGraph();
    g.addLink(1, 2);
    expect(g.getLinksCount()).toBe(1);
    expect(g.getNodesCount()).toBe(2);
    const wasRemoved = g.removeNode(1);
    expect(wasRemoved).toBe(true);
    expect(g.getLinksCount()).toBe(0);
    expect(g.getNodesCount()).toBe(1);
  });
});

describe("Connected components", () => {
  it("should find connected components in a simple graph", () => {
    const graph = createGraph();

    graph.addLink("a", "b");
    graph.addLink("b", "a");
    graph.addLink("b", "c");

    const connectedComponents = findScc(graph);

    expect(graphtoSimpleString(connectedComponents)).toMatchInlineSnapshot(
      '"1(b a)->0(c)"'
    );
  });

  it("works when there are disconnected components in the graph", () => {
    const graph = createGraph();

    graph.addLink("a", "b");
    graph.addLink("b", "a");
    graph.addLink("b", "c");
    graph.addLink("d", "e");
    graph.addLink("e", "d");

    const connectedComponents = findScc(graph);

    expect(graphtoSimpleString(connectedComponents)).toMatchInlineSnapshot(
      `
      "2(e d)
      1(b a)->0(c)"
    `
    );
  });

  it("returns a single node if there is only 1 node", () => {
    const graph = createGraph();

    graph.addNode("a");

    const connectedComponents = findScc(graph);

    expect(graphtoSimpleString(connectedComponents)).toMatchInlineSnapshot(
      '"0(a)"'
    );
  });

  it.todo("move this to its own unit test file");
});

describe("mapNumberRange", () => {
  it("should map range -1,1 to 1,2", () => {
    expect(mapRange(0, -1, 1, 1, 2)).toBe(1.5);
  });
  it("should not fail if the range is 2,2 to 0,1 when the current value is 2", () => {
    expect(mapRange(2, 2, 2, 0, 1));
  });
});
