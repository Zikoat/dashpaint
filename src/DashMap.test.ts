import { describe, expect, it } from "vitest";
import { DashMap } from "./DashMap";
import { ORIGIN } from "./GeometryHelpers";

describe("DashMap", () => {
  it("sets wall at", () => {
    const dashMap = new DashMap();

    dashMap.setWallAt(ORIGIN, false);

    const isWall = dashMap.getWallAt(ORIGIN);
    expect(isWall).toBe(false);
  });

  it("defaults a tile to wall", () => {
    const dashMap = new DashMap();

    const isWall = dashMap.getWallAt(ORIGIN);

    expect(isWall).toBe(true);
  });

  it("converts map rect to string", () => {
    const dashMap = new DashMap();
    dashMap.setWallAt(ORIGIN, false);
    dashMap.setWallAt({ x: 1, y: 0 }, false);

    const mapString = dashMap.getRectAsString({
      x: -1,
      y: -1,
      width: 4,
      height: 3,
    });
    expect(mapString).toMatchInlineSnapshot(`
      "####
      #..#
      ####"
    `);
  });

  it("sets area to wall", () => {
    const dashMap = new DashMap();

    dashMap.fillWallAt({ x: 0, y: 0, width: 3, height: 2 }, false);

    const mapString = dashMap.getRectAsString({
      x: -1,
      y: -1,
      width: 5,
      height: 4,
    });
    expect(mapString).toMatchInlineSnapshot(`
      "#####
      #...#
      #...#
      #####"
    `);
  });

  it("sets area to random using seed", () => {
    const dashMap = new DashMap();

    const rect = { x: 0, y: 0, width: 3, height: 3 };
    dashMap.fillRandom(rect, 0.5, "test");

    expect(dashMap.getRectAsString(rect)).toMatchInlineSnapshot(`
      "#.#
      ...
      ..#"
    `);
  });

  it("determines bounding box when returning string", () => {
    const dashMap = new DashMap();

    dashMap.setWallAt({ x: 0, y: 0 }, false);
    dashMap.setWallAt({ x: 2, y: 3 }, false);

    expect(dashMap.to2dString(ORIGIN)).toMatchInlineSnapshot(`
      "S##
      ###
      ###
      ##."
    `);
  });

  it("gets the bounding box", () => {
    const dashMap = new DashMap();

    dashMap.setWallAt({ x: 2, y: 3 }, false);

    expect(dashMap.getBounds()).toStrictEqual({
      x: 2,
      y: 3,
      width: 1,
      height: 1,
    });
  });

  it("gets bounding box of size 0 when there is no bounding box", () => {
    const dashMap = new DashMap();
    expect(dashMap.getBounds()).toStrictEqual({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  });

  it("includes spawnpoint in string", () => {
    const dashMap = new DashMap();
    dashMap.fillWallAt({ x: 0, y: 0, width: 2, height: 2 }, false);

    expect(dashMap.to2dString(ORIGIN)).toMatchInlineSnapshot(`
      "S.
      .."
    `);
  });

  it("throws error if spawnpoint is on a wall", () => {
    const dashMap = new DashMap();
    expect(() => dashMap.to2dString(ORIGIN)).toThrowError(
      "spawnpoint is a wall"
    );
  });

  it("converts string to dashMap", () => {
    const mapString = `S.
..`;
    const { dashMap, spawnPoint } = DashMap.fromString(mapString);

    expect(dashMap).toBeInstanceOf(DashMap);
    expect(spawnPoint).toStrictEqual(ORIGIN);
    expect(dashMap.getWallAt(ORIGIN)).toBe(false);
    expect(dashMap.to2dString(ORIGIN)).toBe(mapString);
  });
});
