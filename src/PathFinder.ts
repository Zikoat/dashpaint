import { Graph, NodeId } from "ngraph.graph";
import { nba, PathFinder, PathFinderOptions } from "ngraph.path";

export class MyPathFinder implements PathFinder<unknown> {
  private _pathFinder: PathFinder<unknown>;

  constructor(graph: Graph, options?: PathFinderOptions<unknown, unknown>) {
    this._pathFinder = nba(graph, { ...options, oriented: true });
  }

  find(from: NodeId, to: NodeId) {
    const path = this._pathFinder.find(from, to).reverse();
    return path;
  }
}
