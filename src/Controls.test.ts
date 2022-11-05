import { describe, expect, it } from "vitest";
import { Controls } from "./Controls";

describe("Controls", () => {
  it("enqueues movement", () => {
    const controls = new Controls();

    controls.enqueueMovement("up");

    expect(controls.movementQueue).toStrictEqual([{ x: 0, y: -1 }]);
  });

  it("should dash if panned more than 10 pixels", () => {
    const controls = new Controls();
    controls.pan({ dx: 10, dy: 0 });
    expect(controls.movementQueue).toHaveLength(0);

    controls.pan({ dx: 60, dy: 10 });
    expect(controls.movementQueue).toHaveLength(1);
    expect(controls.movementQueue[0]?.x).toBe(1);

    controls.pan({ dx: 40, dy: 10 });
    controls.panEnd();
    controls.pan({ dx: 40, dy: 10 });
    expect(controls.movementQueue).toHaveLength(1);
  });
});
