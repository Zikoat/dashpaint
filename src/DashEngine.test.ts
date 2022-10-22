import { describe, expect, it } from "vitest";
import { AnalysedTile, DashEngine } from "./DashEngine";
import { ORIGIN, graphtoSimpleString } from "./Helpers";

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

    dashEngine.setWallAt({ x: 1, y: 0 }, false);
    const newPlayerPosition = dashEngine.dash("right");

    expect(newPlayerPosition).toStrictEqual({ x: 1, y: 0 });
  });

  it("should get a rect as string", () => {
    const dashEngine = new DashEngine();
    dashEngine.setWallAt({ x: 2, y: 0 }, false);

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

  it("should fill an area as wall", () => {
    const dashEngine = new DashEngine();

    dashEngine.fillWallAt({ x: -1, y: -1, width: 3, height: 3 }, false);

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
      const spawnPoint = dashEngine.analyseRect({
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      });
      expect(spawnPoint.rect[0]).toMatchObject({
        canCollide: false,
        canStop: true,
        componentId: 0,
        isWall: false,
        numberOfDashesPassingOver: 0,
      });
    });

    it("should contain a wall to the right of spawn that is collidable", () => {
      const wallBesideSpawn = dashEngine.analyseRect({
        x: 1,
        y: 0,
        width: 1,
        height: 1,
      });
      expect(wallBesideSpawn.rect[0]).toMatchObject({
        canCollide: true,
        canStop: false,
        componentId: null,
        isWall: true,
        numberOfDashesPassingOver: 0,
      });
    });

    it("should contain walls that are not collidable", () => {
      const otherWall = dashEngine.analyseRect({
        x: 3,
        y: 3,
        width: 1,
        height: 1,
      });
      expect(otherWall.rect[0]).toMatchObject({
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
    dashEngine.fillWallAt({ x: 0, y: 0, width: 3, height: 1 }, false);

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
      const stoppableTile = dashEngine.analyseRect({
        x: 2,
        y: 0,
        width: 1,
        height: 1,
      });
      expect(stoppableTile.rect[0]).toMatchObject({
        canCollide: false,
        canStop: true,
        componentId: 0,
        isWall: false,
        numberOfDashesPassingOver: 2,
      });
    });

    it("should contain a dashable but unstoppable tile in the middle", () => {
      const reachableTile = dashEngine.analyseRect({
        x: 1,
        y: 0,
        width: 1,
        height: 1,
      });
      expect(reachableTile.rect[0]).toMatchObject({
        canCollide: false,
        canStop: false,
        componentId: null,
        isWall: false,
        numberOfDashesPassingOver: 2,
      });
    });

    it("should contain a collidable wall to the right and below", () => {
      const reachableTile = dashEngine.analyseRect({
        x: 2,
        y: 1,
        width: 1,
        height: 1,
      });
      expect(reachableTile.rect[0]).toMatchObject({
        canCollide: true,
        canStop: false,
        componentId: null,
        isWall: true,
        numberOfDashesPassingOver: 0,
      });
    });
  });

  describe("map with 2 components", () => {
    const dashEngine = new DashEngine();
    dashEngine.fillWallAt({ x: 0, y: 0, width: 1, height: 2 }, false);
    dashEngine.fillWallAt({ x: -1, y: 1, width: 3, height: 1 }, false);

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

    it("should have a spawn point which is in component with index 1", () => {
      const spawnTile = dashEngine.analyseRect({
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      });
      expect(spawnTile.rect[0]).toMatchObject({
        canCollide: false,
        canStop: true,
        componentId: 1,
        isWall: false,
        numberOfDashesPassingOver: 2,
      });
    });

    it("should contain tile that is in component with index 0", () => {
      const stoppableTile = dashEngine.analyseRect({
        x: 1,
        y: 1,
        width: 1,
        height: 1,
      });
      expect(stoppableTile.rect[0]).toMatchObject({
        canCollide: false,
        canStop: true,
        componentId: 0,
        isWall: false,
        numberOfDashesPassingOver: 3,
      });
    });

    it("should return information about how the components are linked", () => {
      const stoppableTile = dashEngine.analyseRect({
        x: 1,
        y: 1,
        width: 1,
        height: 1,
      });
      expect(stoppableTile.rect[0]).toMatchObject({
        canCollide: false,
        canStop: true,
        componentId: 0,
        isWall: false,
        numberOfDashesPassingOver: 3,
      });

      expect(stoppableTile.components).toHaveProperty("forEachNode");

      expect(
        graphtoSimpleString(stoppableTile.components)
      ).toMatchInlineSnapshot('"1(0,1 0,0)->0(-1,1 1,1)"');
    });

    it("should return multiple analysed tiles in a rect", () => {
      const { rect, components } = dashEngine.analyseRect({
        x: -1,
        y: 0,
        width: 3,
        height: 2,
      });

      expect(rect).toHaveLength(6);
      const spawnPoint = rect[1] as AnalysedTile;

      expect(spawnPoint.x).toBe(0);
      expect(spawnPoint.y).toBe(0);
      expect(components.getNodesCount()).toBe(2);
    });

    it("should have a collidable tile below", () => {
      const { rect } = dashEngine.analyseRect({
        x: 0,
        y: 2,
        width: 1,
        height: 1,
      });

      expect(rect[0]).toMatchObject({
        canCollide: true,
        canStop: false,
        componentId: null,
        isWall: true,
        numberOfDashesPassingOver: 0,
        x: 0,
        y: 2,
      });
    });

    it("should return the component count", () => {
      const components = dashEngine.getComponentCount();
      expect(components).toBe(2);
      // dashengine.getRectAsString({ x: -1, y: -1, width: 6, height: 6 });
    });
  });

  describe("map with unreachable tile", () => {
    const dashEngine = new DashEngine();
    dashEngine.setWallAt({ x: 2, y: 0 }, false);

    it("should match string", () => {
      const map = dashEngine.getRectAsString({
        x: -1,
        y: -1,
        width: 5,
        height: 3,
      });

      expect(map).toMatchInlineSnapshot(`
        "#####
        #.#.#
        #####"
      `);
    });

    it("should contain a non-reachable tile to the right", () => {
      const analysedTile = dashEngine.analyseRect({
        x: 2,
        y: 0,
        width: 1,
        height: 1,
      });
      expect(analysedTile.rect[0]).toMatchObject({
        canCollide: false,
        canStop: false,
        componentId: null,
        isWall: false,
        numberOfDashesPassingOver: 0,
      });
      expect(
        graphtoSimpleString(analysedTile.components)
      ).toMatchInlineSnapshot('"0(0,0)"');
    });

    it("should report a fixable score for the center tile", () => {
      const analysedTile = dashEngine.analyseRect({
        x: 1,
        y: 0,
        width: 1,
        height: 1,
      });

      expect(analysedTile.rect[0]).toMatchObject({
        canCollide: true,
        canStop: false,
        componentId: null,
        isWall: true,
        numberOfDashesPassingOver: 0,
        x: 1,
        y: 0,
        fixScore: 0.5,
      });
    });
  });

  it("should analyse the map, and return detailed info about each tile", () => {
    const dashEngine = new DashEngine({ spawnPoint: { x: -1, y: -1 } });

    dashEngine.fillRandom(
      { x: -1, y: -1, width: 3, height: 3 },
      undefined,
      "1"
    );

    expect(dashEngine.getRectAsString({ x: -2, y: -2, width: 5, height: 5 }))
      .toMatchInlineSnapshot(`
        "#####
        #..##
        #.###
        ##..#
        #####"
      `);

    const { rect } = dashEngine.analyseRect({
      x: -1,
      y: -1,
      width: 3,
      height: 3,
    });

    expect(rect).toHaveLength(9);

    for (const tile of rect) {
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

    const shit = dashEngine.analyseRect({ x: -1, y: -1, width: 1, height: 1 });

    const spawnPoint = shit.rect[0]!;
    expect(spawnPoint.isWall).toBe(false);
    expect(spawnPoint.canStop).toBe(true);
    expect(spawnPoint.canCollide).toBe(false);
  });

  describe("suggestFixes", () => {
    const dashEngine = new DashEngine();
    dashEngine.fillWallAt({ x: 0, y: 0, width: 1, height: 2 }, false);
    dashEngine.fillWallAt({ x: -1, y: 1, width: 3, height: 1 }, false);

    it("should return a list of tiles to edit", () => {
      expect(dashEngine.getRectAsString({ x: -2, y: -1, width: 5, height: 4 }))
        .toBe(`#####
##.##
#...#
#####`);

      const fixes = dashEngine.suggestFixes();

      expect(fixes).toMatchInlineSnapshot(`
        [
          {
            "score": 1,
            "tiles": [
              {
                "suggestWall": true,
                "x": 0,
                "y": 1,
              },
            ],
          },
          {
            "score": 3,
            "tiles": [
              {
                "suggestWall": true,
                "x": 1,
                "y": 1,
              },
            ],
          },
          {
            "score": 3,
            "tiles": [
              {
                "suggestWall": true,
                "x": -1,
                "y": 1,
              },
            ],
          },
          {
            "score": 5,
            "tiles": [
              {
                "suggestWall": false,
                "x": 1,
                "y": 0,
              },
            ],
          },
          {
            "score": 5,
            "tiles": [
              {
                "suggestWall": false,
                "x": -1,
                "y": 0,
              },
            ],
          },
          {
            "score": -1.6666666666666667,
            "tiles": [
              {
                "suggestWall": false,
                "x": 0,
                "y": -1,
              },
            ],
          },
          {
            "score": 2,
            "tiles": [
              {
                "suggestWall": false,
                "x": 0,
                "y": 2,
              },
            ],
          },
          {
            "score": 0,
            "tiles": [
              {
                "suggestWall": false,
                "x": 2,
                "y": 1,
              },
            ],
          },
          {
            "score": -0.5,
            "tiles": [
              {
                "suggestWall": false,
                "x": 1,
                "y": 2,
              },
            ],
          },
          {
            "score": -0.5,
            "tiles": [
              {
                "suggestWall": false,
                "x": -1,
                "y": 2,
              },
            ],
          },
          {
            "score": 0,
            "tiles": [
              {
                "suggestWall": false,
                "x": -2,
                "y": 1,
              },
            ],
          },
        ]
      `);
    });
  });

  describe("mapScore TODO DELETEME", () => {
    it("should return a mapScore", () => {
      const dashEngine = new DashEngine();

      const mapScoreInitial = dashEngine._mapScore();

      dashEngine.fillWallAt({ x: 0, y: 0, width: 1, height: 2 }, false);

      const mapScoreSingleDash = dashEngine._mapScore();

      dashEngine.fillWallAt({ x: -1, y: 1, width: 3, height: 1 }, false);

      const mapScoreTwoComponents = dashEngine._mapScore();

      dashEngine.setWallAt({ x: 1, y: 0 }, false);

      const mapScoreSingleComponent = dashEngine._mapScore();

      expect(
        dashEngine.getRectAsString({ x: -2, y: -1, width: 5, height: 4 })
      ).toBe(
        `#####
##..#
#...#
#####`
      );

      const shit = {
        initial: mapScoreInitial,
        singleDash: mapScoreSingleDash,
        twoComponents: mapScoreTwoComponents,
        SingleComponent: mapScoreSingleComponent,
      };

      expect(shit).toMatchInlineSnapshot(`
        {
          "SingleComponent": 5,
          "initial": 1,
          "singleDash": 2,
          "twoComponents": 0,
        }
      `);
    });
    it.todo("sigurd should move this to its own test file, and maybe make it into its own class")
  });
  
  it.todo("creates a map from a string")
  it.todo('sigurd should move the fixer into its own class')
});
