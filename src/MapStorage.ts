import { Point } from "./Point";

export class MapStorage {
  private data: Record<number, Record<number, number>> = {};

  constructor() { }

  setAt(point: Point, numberToSave: number): void {
    if (!this.data[point.x])
      this.data[point.x] = {};

    this.data[point.x]![point.y] = numberToSave;
  }
  getAt(point: Point): number | null {
    return this.data[point.x]?.[point.y] ?? null;
  }
}
