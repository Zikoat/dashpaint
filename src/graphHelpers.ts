import assert from "assert";
import createGraph, { Graph, Node, NodeId } from "ngraph.graph";
import scc from "strongly-connected-components";

function toAdjacencyList(graph: Graph) {
  const nodeIndexes: Record<NodeId, number> = {};
  const nodes: NodeId[] = [];
  const adjacencyList: number[][] = [];

  graph.forEachNode((node) => {
    const nodeIndex = nodes.push(node.id)-1;
    adjacencyList.push([]);
    nodeIndexes[node.id] = nodeIndex;
  });

  graph.forEachLink((link) => {
    let fromIndex = nodeIndexes[link.fromId]!;
    let toIndex = nodeIndexes[link.toId]!;

    adjacencyList[fromIndex]!.push(toIndex)
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
