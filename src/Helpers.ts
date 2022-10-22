import { Graph } from "ngraph.graph";

export const DIRECTIONS = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];
Object.freeze(DIRECTIONS);

export type Dir4 = "up" | "down" | "left" | "right";




function isArray(arr: unknown): arr is unknown[] {
  return isObject(arr) && "length" in arr && (arr as unknown[]).length >= 0;
}

export function isStringArray(arr: unknown): arr is string[] {
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
