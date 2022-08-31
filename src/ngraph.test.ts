import createGraph from "ngraph.graph";
import { expect, test } from "vitest";
import {path} from "ngraph.path"
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

test("it should render a graph", () => {
  expect(1).toBe(1);
});

test("it should find a path in the graph", () => {
  const g = createGraph();
  g.addLink(1, 2);
  g.addLink(2, 3);
  g.addLink(2, 3);
  
  g.addLink(3, 1);


});

test("it should find connected components", () => {});
