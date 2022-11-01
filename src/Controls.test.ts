import { SwipeEvent } from "./DashPaintScene";
import { Point } from "./GeometryHelpers";
import { Dir4 } from "./Helpers";
import { describe, expect, it } from "vitest";
import { AnalysedTile, DashEngine } from "./DashEngine";
import { ORIGIN } from "./GeometryHelpers";
import { graphtoSimpleString } from "./GraphHelpers";
import { Controls } from "./Controls";

describe("Controls", () => {
  it("enqueues movement", () => {
    const controls = new Controls();

    controls.enqueueMovement("up");

    expect(controls.movementQueue).toStrictEqual([{ x: 0, y: -1 }]);
  });

  it("registers swipes", () => {
    const controls = new Controls();

    controls.swipeDash({ up: true, down: false, right: false, left: false });

    expect(controls.movementQueue).toStrictEqual([{ x: 0, y: -1 }]);
  });
});
