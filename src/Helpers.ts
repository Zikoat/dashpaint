import { Graph, Node } from "ngraph.graph";

export const DIRECTIONS = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];
Object.freeze(DIRECTIONS);

export type Dir4 = "up" | "down" | "left" | "right";

export function graphtoSimpleString(graph: Graph): string {
  let output = "";

  graph.forEachNode((node) => {
    if (node.links === null) {
      output += nodeToSimpleString(node) + `\n`;
    }
  });

  graph.forEachLink((link) => {
    const fromNode = graph.getNode(link.fromId);
    const toNode = graph.getNode(link.toId);
    output += `${fromNode ? nodeToSimpleString(fromNode) : link.fromId}->${
      toNode ? nodeToSimpleString(toNode) : link.toId
    }\n`;
  });

  return output.trim();
}

export function pathToSimpleString(path: Node<unknown>[]) {
  return path.map((node) => node.id).join("->");
}

function nodeToSimpleString(node: Node): string {
  let nodeDataString = "";

  if (isStringArray(node.data)) {
    nodeDataString = node.data.join(" ").replaceAll('"', "");
  } else if (node.data) {
    nodeDataString = `${node.data}`;
  }

  return `${node.id}${node.data ? `(${nodeDataString})` : ""}`;
}

function isArray(arr: unknown): arr is unknown[] {
  return isObject(arr) && "length" in arr && (arr as unknown[]).length >= 0;
}

function isStringArray(arr: unknown): arr is string[] {
  return isArray(arr) && arr.every((item) => typeof item === "string");
}

function isObject(obj: unknown): obj is object {
  return typeof obj === "object" && obj !== null;
}


// stolen from https://gist.github.com/xposedbones/75ebaef3c10060a3ee3b246166caab56
function clamp(input: number, min: number, max: number): number {
  return input < min ? min : input > max ? max : input;
}

export function mapRange(
  current: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  if (inMax === inMin) return (outMax + outMin) / 2;
  const mapped: number =
    ((current - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  return clamp(mapped, outMin, outMax);
}
