import { Graph, Node } from "ngraph.graph";

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

export function floorVector(vector: Point): Point {
  return { x: Math.floor(vector.x), y: Math.floor(vector.y) };
}

export type Point = { x: number; y: number };
export type Rect = Point & { width: number; height: number };
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

export function isInRect(point: Point, rect: Rect) {
  if (rect.width <= 0 || rect.height <= 0) throw Error("rect has no area");
  return (
    point.x >= rect.x &&
    point.y >= rect.y &&
    point.x < rect.x + rect.width &&
    point.y < rect.y + rect.height
  );
}

export function pointInRectToIndex(point: Point, rect: Rect) {
  if (!isInRect(point, rect)) throw Error("point is outside rect");
  return rect.width * (point.y - rect.y) + point.x - rect.x;
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
