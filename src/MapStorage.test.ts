import createGraph, { Node, NodeId } from "ngraph.graph";
import { describe, expect, test, it, vi } from "vitest";
import { nba } from "ngraph.path";
import { findScc, toGraph } from "./graphHelpers";
import { map } from "mathjs";
import { Point } from "./Point";
import { runInThisContext } from "vm";

describe("MapStorage", () => {
  it("should be instantiated", () => {
    const mapEngine = new MapStorage();
    expect(mapEngine).toBeInstanceOf(MapStorage);
  });

  it("should save a number at a position", () => {
    const mapEngine = new MapStorage();

    mapEngine.setAt({ x: 0, y: 0 }, 0);
    expect(mapEngine.getAt({ x: 0, y: 0 })).toBe(0);

    mapEngine.setAt({ x: 0, y: 0 }, 1);
    expect(mapEngine.getAt({ x: 0, y: 0 })).toBe(1);
  });

  it("should return null if the tile is not set", () => {
    const mapEngine = new MapStorage();

    expect(mapEngine.getAt({ x: 0, y: 0 })).toBe(null);
  });

  it("should run a callback whenever a cell changes", () => {
    const mapEngine = new MapStorage(vi.fn());
  });
});

class MapStorage {
  private editCallback: () => void;
  private data: Record<number, Record<number, number>> = {};

  constructor(editCallback: () => void){
    this.editCallback = editCallback;
  };

  setAt(point: Point, numberToSave: number): void {
    if (!this.data[point.x]) this.data[point.x] = {};

    this.data[point.x]![point.y] = numberToSave;
  }
  getAt(point: Point): number | null {
    return this.data[point.x]?.[point.y] ?? null;
  }
}
