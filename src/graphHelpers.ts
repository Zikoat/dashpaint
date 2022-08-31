import createGraph, { Graph, NodeId } from "ngraph.graph";
import scc from "strongly-connected-components";

export function toAdjacencyList(graph: Graph) {
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

export function findScc(graph: Graph): {
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

export interface SccOutput {
  components: number[][];
  adjacencyList: number[][];
}

export function toGraph(adjacencyList: number[][], nodes: NodeId[]): Graph {
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
