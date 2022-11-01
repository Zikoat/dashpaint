import { SwipeEvent } from "./DashPaintScene";
import { Point } from "./GeometryHelpers";
import { Dir4 } from "./Helpers";
import { describe, expect, it } from "vitest";
import { AnalysedTile, DashEngine } from "./DashEngine";
import { ORIGIN } from "./GeometryHelpers";
import { graphtoSimpleString } from "./GraphHelpers";
import { Controls } from "./Controls";

describe("Controls", () => {
  it("can be constructed", () => {
    const controls = new Controls();
  });
  it("registers swipes", () => {
    const controls = new Controls();
    const movementQueue: Point[] = [];

    controls.swipeDash(
      { up: true, down: false, right: false, left: false },
      movementQueue // shit todo refactor
    );

    expect(movementQueue).toStrictEqual([{ x: 0, y: -1 }]);
    // expect(controls.movementQueue).toStrictEqual([{ x: 1, y: 0 }]);
    // expect(controls.popMovement()).toStrictEqual({ x: 1, y: 0 });
    // expect(controls.movementQueue).toHaveLength(0);
  });
});
