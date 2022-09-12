import { describe, expect, it } from "vitest";
import { DashEngine } from "./DashEngine";
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

  it("should analyse the map, and return detailed info about each tile", () => {
    /*
a wall: if you walk into it, you stop

to collide: to impact with a wall
to dash: to walk from a tile to another
to stop: to be able go from moving to standing still on a tile
to reach: to be able to be at a tile
to walk: to move from one tile to another
*/

    type AnalysedTile = {
      isWall: boolean;
      canReach: boolean;
      canCollide: boolean;
      canStop: boolean;
      numberOfDashesPassingOver: number;
      componentId: number | null;
    };

    let tile!: AnalysedTile;

    if (tile.canCollide) assert(tile.isWall);

    if (tile.canReach) {
      assert(!tile.isWall);
      assert(tile.numberOfDashesPassingOver >= 1);
    }

    if (tile.canStop) {
      assert(!tile.isWall);
      assert(tile.canReach);
      assert(tile.numberOfDashesPassingOver >= 2);
      assert(tile.componentId !== null && tile.componentId >= 0);
    } else {
      assert(tile.componentId === null);
    }
  });
});
