import { isIndex } from "mathjs";
import createGraph, { Node, NodeId } from "ngraph.graph";
import { nba } from "ngraph.path";
import { describe, expect, it } from "vitest";
import { adjacencyListToGraph, findScc } from "./graphHelpers";
import {
  addVectors,
  isEqual,
  isInRect,
  isVector,
  normalizeVector,
  ORIGIN,
  pointInRectToIndex,
  subtractVectors,
  toSimpleString,
} from "./Helpers";

describe("Graph", () => {
  it("it should create a graph", () => {
    const g = createGraph();

    g.addNode("a");
    g.addNode("b");

    g.addLink("c", "d");
    g.addLink("a", "b");

    g.addNode("b");
    g.addNode("e");

    expect(toSimpleString(g)).toMatchInlineSnapshot(`
      "e
      c->d
      a->b"
    `);
  });

  it("should be able to convert to a simple string", () => {
    const graph = createGraph();
    graph.addLink("a", "b");
    graph.addLink("b", "c");

    expect(toSimpleString(graph)).toMatchInlineSnapshot(`
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
      expect(toSimpleString(graph)).toMatchInlineSnapshot(`
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

      expect(toSimpleString(graph)).toMatchInlineSnapshot(`
        "0->1
        1->2
        2->0"
      `);
    });
  });

  describe("Connected components", () => {
    it("it should find connected components in a simple graph", () => {
      const graph = createGraph();

      graph.addLink("a", "b");
      graph.addLink("b", "a");
      graph.addLink("b", "c");

      const connectedComponents = findScc(graph);

      expect(toSimpleString(connectedComponents)).toMatchInlineSnapshot(
        '"1(b a)->0(c)"'
      );
    });
  });

  describe("pathfinding", () => {
    it("should find a path in the graph", () => {
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
});

describe("Vectors", () => {
  it("should add vectors", () => {
    const a = { x: 1, y: 1 };
    const b = { x: 1, y: 1 };

    const result = addVectors(a, b);

    expect(result).toMatchInlineSnapshot(`
      {
        "x": 2,
        "y": 2,
      }
    `);
  });

  it("should subtract vectors", () => {
    const a = { x: 1, y: 1 };
    const b = { x: 1, y: 1 };

    const result = subtractVectors(a, b);

    expect(result).toMatchInlineSnapshot(`
      {
        "x": 0,
        "y": 0,
      }
    `);
  });

  it("should check for equality", () => {
    const a = { x: 1, y: 1 };
    const b = { x: 1, y: 1 };

    const result = isEqual(a, b);

    expect(result).toBe(true);
  });

  it("should normalize a vector", () => {
    const a = { x: 2, y: 0 };

    const result = normalizeVector(a);

    expect(result).toMatchInlineSnapshot(`
      {
        "x": 1,
        "y": 0,
      }
    `);
  });

  it("should fail to normalize a vector if it is not orthogonal", () => {
    const a = { x: 2, y: 1 };

    expect(() => normalizeVector(a)).toThrow(
      "Non-orthogonal vectors are not allowed"
    );
  });

  it("should recognise vectors", () => {
    expect(isVector({ x: 1, y: 2 })).toBe(true);
    expect(isVector({ x: "1", y: 2 })).toBe(false);
  });
});

describe("isInRect", () => {
  it("should determine if a point is in a rect", () => {
    expect(
      isInRect({ x: 0, y: 0 }, { x: -1, y: -1, width: 3, height: 3 })
    ).toBe(true);
    expect(isInRect({ x: 0, y: 0 }, { x: 0, y: 0, width: 1, height: 1 })).toBe(
      true
    );
    expect(
      isInRect({ x: 1, y: -1 }, { x: 1, y: -1, width: 1, height: 1 })
    ).toBe(true);
  });

  it("should determine if a point is outside a rect", () => {
    expect(
      isInRect({ x: 3, y: 3 }, { x: -1, y: -1, width: 3, height: 3 })
    ).toBe(false);
    expect(isInRect({ x: -1, y: 0 }, { x: 0, y: 0, width: 1, height: 1 })).toBe(
      false
    );
    expect(isInRect({ x: 0, y: 1 }, { x: 0, y: 0, width: 1, height: 1 })).toBe(
      false
    );
    expect(
      isInRect({ x: 4, y: 4 }, { x: 1, y: 1, width: 3, height: 3 })
    ).toBe(false);
  });

  it("should fail if rect has 0 or less area", () => {
    expect(() =>
      isInRect({ x: 0, y: 0 }, { x: 0, y: 0, width: -1, height: -1 })
    ).toThrowError("rect has no area");
    expect(() =>
      isInRect({ x: 0, y: 0 }, { x: 0, y: 0, width: 0, height: 0 })
    ).toThrowError("rect has no area");
    expect(() =>
      isInRect({ x: 0, y: 0 }, { x: 0, y: 0, width: 1, height: 0 })
    ).toThrowError("rect has no area");
  });
});

describe("pointToRectIndex", () => {
  it("should return the index to a 1d array of a point in a rect", () => {
    expect(
      pointInRectToIndex({ x: 0, y: 0 }, { x: 0, y: 0, width: 3, height: 3 })
    ).toBe(0);
    expect(
      pointInRectToIndex({ x: 0, y: 0 }, { x: -1, y: -1, width: 3, height: 3 })
    ).toBe(4);
    expect(
      pointInRectToIndex({ x: 3, y: 3 }, { x: 1, y: 1, width: 3, height: 3 })
    ).toBe(8);
    expect(
      pointInRectToIndex({ x: 0, y: 0 }, { x: 0, y: 0, width: 1, height: 1 })
    ).toBe(0);
  });
  it("should fail if the point is outside the rect", () => {
    expect(() =>
      pointInRectToIndex({ x: 4, y: 4 }, { x: 1, y: 1, width: 3, height: 3 })
    ).toThrowErrorMatchingInlineSnapshot('"point is outside rect"');
  });
});
