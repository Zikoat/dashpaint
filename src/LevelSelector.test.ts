import { describe, expect, it } from "vitest";
import { DashMap } from "./DashMap";
import { LevelSelector } from "./LevelSelector";

describe("LevelSelector", () => {
  it("should contain a static map", () => {
    const { dashMap, spawnPoint } = LevelSelector.getLevel(0);
    expect(dashMap).toBeInstanceOf(DashMap);
    expect(spawnPoint).toStrictEqual({ x: 0, y: 1 });
    expect(dashMap.getWallAt({ x: 3, y: 0 })).toBe(false);
    expect(dashMap.getWallAt({ x: 2, y: 1 })).toBe(true);
    expect(dashMap.to2dString(spawnPoint)).toMatchInlineSnapshot(`
      "....
      S##.
      ###.
      ###."
    `);
  });
});
