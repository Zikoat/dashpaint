import { Node } from "ngraph.graph";
import { Point } from "./GeometryHelpers";

export type Dash = {
  from: Point;
  to: Point;
};


export function pathToSimpleString(path: Node<unknown>[]) {
  return path.map((node) => node.id).join("->");
}
