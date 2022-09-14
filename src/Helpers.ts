import { Graph, Node, NodeId } from "ngraph.graph";

export const ORIGIN = { x: 0, y: 0 };
Object.freeze(ORIGIN);

export const DIRECTIONS = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];
Object.freeze(DIRECTIONS);

export function addVectors(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subtractVectors(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function isEqual(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

export function normalizeVector(vector: Point): Point {
  const normalized = {
    x: Math.sign(vector.x),
    y: Math.sign(vector.y),
  };

  if (Math.abs(normalized.x) + Math.abs(normalized.y) !== 1)
    throw Error("Non-orthogonal vectors are not allowed");

  return normalized;
}

export function scaleVector(vector: Point, scalar: number): Point {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar,
  };
}

export function vectorLength(vector: Point): number {
  return Math.abs(vector.x + vector.y);
}

export function isVector(vector: unknown): vector is Point {
  return (
    typeof vector === "object" &&
    vector !== null &&
    "x" in vector &&
    "y" in vector &&
    typeof (vector as Point).x === "number" &&
    typeof (vector as Point).y === "number"
  );
}

export type Point = { x: number; y: number };
export type Rect = Point & { width: number; height: number };
export type Dir4 = "up" | "down" | "left" | "right";

export function toSimpleString(graph: Graph): string {
  let output = "";

  graph.forEachNode((node) => {
    if (node.links === null) {
      let nodeDataString = node.data
        ? `(${nodeToSimpleString(node.data)})`
        : "";
      output += `${node.id}${nodeDataString}\n`;
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

function nodeToSimpleString(node: Node): string {
  let nodeDataString = "";

  if (isStringArray(node.data)) {
    nodeDataString = node.data.join(",").replaceAll('"', "");
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
