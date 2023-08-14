export const ORIGIN = { x: 0, y: 0 };
Object.freeze(ORIGIN);

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

export function forEachTileInRect(
  rect: Rect,
  callback: (point: Point) => void,
) {
  for (let i = 0; i < rect.height; i++) {
    for (let j = 0; j < rect.width; j++) {
      callback({ x: j + rect.x, y: i + rect.y });
    }
  }
}
