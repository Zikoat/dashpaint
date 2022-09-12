import { exp } from "mathjs";
import { describe, expect, it } from "vitest";
import { AnalysedTile, DashEngine } from "./DashEngine";
import { ORIGIN } from "./Helpers";

describe("DashEngine", () => {
  it("should be instantiated", () => {
    const dashEngine = new DashEngine();
    expect(dashEngine).toBeInstanceOf(DashEngine);
  });

  it("should contain the current player position", () => {
    const dashEngine = new DashEngine({ spawnPoint: ORIGIN });
    expect(dashEngine.playerPosition).toBe(ORIGIN);
  });

  it("should create a map of size n*n, and print it", () => {
    const dashEngine = new DashEngine();

    expect(dashEngine.playerPosition).toStrictEqual(ORIGIN);
  });

  it("should be able to dash to the right, if the left block is walkable", () => {
    const dashEngine = new DashEngine();

    dashEngine.setCollidableAt({ x: 1, y: 0 }, false);
    const newPlayerPosition = dashEngine.dash("right");

    expect(newPlayerPosition).toStrictEqual({ x: 1, y: 0 });
  });

  it("should get map data so we can create an ascii image of the map", () => {
    const dashEngine = new DashEngine();
    let asciiOutput = "";
    let counter = 0;
    const map = dashEngine.forEachTileInRect(
      { x: -1, y: -1, width: 3, height: 3 },
      (tile) => {
        counter++;
        expect(typeof tile.collidable).toBe("boolean");
        expect(typeof tile.x).toBe("number");
        expect(typeof tile.y).toBe("number");
        asciiOutput += tile.collidable ? "#" : ".";
        if (tile.x === 1) {
          asciiOutput += "\n";
        }
      }
    );

    expect(counter).toBe(9);
    expect(asciiOutput).toMatchInlineSnapshot(`
      "###
      #.#
      ###
      "
    `);
  });

  it("should get a rect as string", () => {
    const dashEngine = new DashEngine();
    dashEngine.setCollidableAt({ x: 2, y: 0 }, false);

    const map = dashEngine.getRectAsString({
      x: -1,
      y: -1,
      width: 5,
      height: 3,
    });

    expect(map).toMatchInlineSnapshot(
      `
      "#####
      #.#.#
      #####"
    `
    );
  });

  it("should fill an area as collidable", () => {
    const dashEngine = new DashEngine();

    dashEngine.fillCollidableAt({ x: -1, y: -1, width: 3, height: 3 }, false);

    const map = dashEngine.getRectAsString({
      x: -2,
      y: -2,
      width: 5,
      height: 5,
    });

    expect(map).toMatchInlineSnapshot(
      `
      "#####
      #...#
      #...#
      #...#
      #####"
    `
    );
  });

  it("should fill an area randomly with probability and seeding", () => {
    const dashEngine = new DashEngine();

    dashEngine.fillRandom(
      { x: -1, y: -1, width: 3, height: 3 },
      undefined,
      "1"
    );

    const map = dashEngine.getRectAsString({
      x: -2,
      y: -2,
      width: 5,
      height: 5,
    });

    expect(map).toMatchInlineSnapshot(
      `
      "#####
      #..##
      #.###
      ##..#
      #####"
    `
    );
  });

  describe("simplest map", () => {
    const dashEngine = new DashEngine();

    it("should match string", () => {
      const map = dashEngine.getRectAsString({
        x: -1,
        y: -1,
        width: 3,
        height: 3,
      });

      expect(map).toMatchInlineSnapshot(`
        "###
        #.#
        ###"
      `);
    });

    it("should contain a floor tile on the spawn point", () => {
      const spawnPoint = dashEngine.analyzePoint({ x: 0, y: 0 });
      expect(spawnPoint).toStrictEqual({
        canCollide: false,
        canStop: true,
        componentId: 0,
        isWall: false,
        numberOfDashesPassingOver: 0,
      });
    });

    it("should contain a wall to the right of spawn that is collidable", () => {
      const wallBesideSpawn = dashEngine.analyzePoint({ x: 1, y: 0 });
      expect(wallBesideSpawn).toStrictEqual({
        canCollide: true,
        canStop: false,
        componentId: null,
        isWall: true,
        numberOfDashesPassingOver: 0,
      });
    });

    it("should contain walls that are not collidable", () => {
      const otherWall = dashEngine.analyzePoint({ x: 3, y: 3 });
      expect(otherWall).toStrictEqual({
        canCollide: false,
        canStop: false,
        componentId: null,
        isWall: true,
        numberOfDashesPassingOver: 0,
      });
    });
  });

  describe("map with single dash", () => {
    const dashEngine = new DashEngine();
    dashEngine.fillCollidableAt({ x: 0, y: 0, width: 3, height: 1 }, false);

    it("should match string", () => {
      const map = dashEngine.getRectAsString({
        x: -1,
        y: -1,
        width: 5,
        height: 3,
      });

      expect(map).toMatchInlineSnapshot(`
        "#####
        #...#
        #####"
      `);
    });

    it("should contain a stoppable tile to the right", () => {
      const stoppableTile = dashEngine.analyzePoint({ x: 2, y: 0 });
      expect(stoppableTile).toStrictEqual({
        canCollide: false,
        canStop: true,
        componentId: 0,
        isWall: false,
        numberOfDashesPassingOver: 2,
      });
    });

    it("should contain a dashable but unstoppable tile in the middle", () => {
      const reachableTile = dashEngine.analyzePoint({ x: 1, y: 0 });
      expect(reachableTile).toStrictEqual({
        canCollide: false,
        canStop: false,
        componentId: 0,
        isWall: false,
        numberOfDashesPassingOver: 2,
      });
    });
  });

  describe("map with 2 components", () => {
    const dashEngine = new DashEngine();
    dashEngine.fillCollidableAt({ x: 0, y: 0, width: 1, height: 2 }, false);
    dashEngine.fillCollidableAt({ x: -1, y: 1, width: 3, height: 1 }, false);

    it("should match string", () => {
      const map = dashEngine.getRectAsString({
        x: -2,
        y: -1,
        width: 5,
        height: 4,
      });

      expect(map).toMatchInlineSnapshot(`
        "#####
        ##.##
        #...#
        #####"
      `);
    });

    it("should contain tile that is in another component", () => {
      const stoppableTile = dashEngine.analyzePoint({ x: 1, y: 1 });
      expect(stoppableTile).toStrictEqual({
        canCollide: false,
        canStop: true,
        componentId: 1,
        isWall: false,
        numberOfDashesPassingOver: 3,
      });
    });
  });

  it("should analyse the map, and return detailed info about each tile", () => {
    /*
    a wall: if you walk into it, you stop
    a floor: if you walk into it, you continue to walk in the same direction
    a direction: a unit-length vector in one of the cardinal directions

    to collide: to impact with a wall
    to dash: to walk from a tile to another
    to stop: to be able go from moving to standing still on a tile
    to reach: to be able to be at a tile
    to walk: to move from one tile to another
    */

    const dashEngine = new DashEngine({ spawnPoint: { x: -1, y: -1 } });

    dashEngine.fillRandom(
      { x: -1, y: -1, width: 3, height: 3 },
      undefined,
      "1"
    );

    const analyzedMap: AnalysedTile[] = dashEngine.analyzeRect({
      x: -1,
      y: -1,
      width: 3,
      height: 3,
    });

    expect(analyzedMap).toHaveLength(9);

    for (const tile of analyzedMap) {
      if (tile.canCollide) expect(tile.isWall).toBe(true);

      if (tile.numberOfDashesPassingOver >= 1) {
        expect(tile.isWall).toBe(false);
      }

      if (tile.canStop) {
        expect(tile.isWall).toBe(false);
        expect(tile.numberOfDashesPassingOver).toBeGreaterThanOrEqual(2);
        expect(tile.componentId).toBeGreaterThanOrEqual(0);
      } else {
        expect(tile.componentId).toBeNull();
      }
    }

    // spawn point
    const spawnPoint = dashEngine.analyzePoint({ x: -1, y: -1 });
    expect(spawnPoint.isWall).toBe(false);
    expect(spawnPoint.canStop).toBe(true);
    expect(spawnPoint.canCollide).toBe(false);

    const p = dashEngine.analyzePoint({ x: -2, y: -1 });

    // expect(p.canReach).toBe(true);
    // expect(p.componentId).toBe(0);
    // expect(p.numberOfDashesPassingOver).toBe(4);
    // expect(p).toStrictEqual(analyzedMap[0]);
  });
});
