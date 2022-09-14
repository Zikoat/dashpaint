import createGraph, { Graph, NodeId } from "ngraph.graph";
import scc from "strongly-connected-components";

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

export function findScc(graph: Graph) {
  const adjacencyListGraph = toAdjacencyList(graph);
  const sccOutput: SccOutput = scc(adjacencyListGraph.adjacencyList);

  const components = sccOutput.components.map((component) =>
    component.map((nodeIndex) => {
      const nodeId = adjacencyListGraph.nodes[nodeIndex];
      if (nodeId === undefined)
        throw new Error(`couldnt find node index ${nodeIndex}`);

      return nodeId;
    })
  );

  const sccGraph = adjacencyListToGraph(
    sccOutput.adjacencyList,
    undefined,
    components
  );

  return sccGraph;
}

export interface SccOutput {
  components: number[][];
  adjacencyList: number[][];
}

export function adjacencyListToGraph<T>(
  adjacencyList: number[][],
  nodeIds?: NodeId[],
  data?: T[]
): Graph<T> {
  const g = createGraph<T>();

  for (const [fromNode, toNodes] of adjacencyList.entries()) {
    const fromNodeId = nodeIds?.[fromNode] ?? fromNode;

    g.addNode(fromNodeId, data?.[fromNode]);

    for (const toNode of toNodes) {
      const toNodeId = nodeIds?.[toNode] ?? toNode;

      g.addLink(fromNodeId, toNodeId);
    }
  }
  return g;
}
