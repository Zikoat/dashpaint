import seedrandom from "seedrandom";
import { forEachTileInRect, isEqual, Point, Rect } from "./GeometryHelpers";
import { MapStorage } from "./MapStorage";

export class DashMap {
  private mapStorage: MapStorage = new MapStorage();

  setWallAt(point: Point, isWall: boolean) {
    const wallNumber = isWall ? 2 : 1;

    this.mapStorage.setAt(point, wallNumber);
  }

  getWallAt(point: Point): boolean {
    const wallNumber = this.mapStorage.getAt(point);
    const isWall = wallNumber === null || wallNumber === 2;

    return isWall;
  }

  getRectAsString(rect: Rect, spawnPoint?: Point): string {
    let asciiOutput = "";
    let counter = 0;

    if (spawnPoint && this.getWallAt(spawnPoint))
      throw Error("spawnpoint is a wall");

    forEachTileInRect(rect, (point) => {
      counter++;

      let character = "#";
      if (!this.getWallAt(point)) {
        character = ".";
      }
      if (spawnPoint && isEqual(point, spawnPoint)) character = "S";

      asciiOutput += character;

      if (
        point.x === rect.x + rect.width - 1 &&
        point.y !== rect.y + rect.height - 1
      ) {
        asciiOutput += "\n";
      }
    });

    return asciiOutput;
  }

  fillWallAt(rect: Rect, isWall: boolean) {
    forEachTileInRect(rect, (point) => {
      this.setWallAt(point, isWall);
    });
  }

  fillRandom(rect: Rect, probability = 0.5, seed?: string) {
    const random = seedrandom(seed);

    forEachTileInRect(rect, (point) => {
      const isWall = random() > probability;

      this.setWallAt(point, isWall);
    });
  }

  getBounds(): Rect {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;

    const rows = this.mapStorage.getAllSaved();

    for (const row of Object.entries(rows)) {
      const [xString, column] = row;
      const x = Number(xString);

      for (const [yString, _cellValue] of Object.entries(column)) {
        const y = Number(yString);
        const isWall = this.getWallAt({ x, y });
        if (!isWall) {
          if (x < x0) x0 = x;
          if (y < y0) y0 = y;
          if (x > x1) x1 = x;
          if (y > y1) y1 = y;
        }
      }
    }

    if (x0 === Infinity) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const rect: Rect = {
      x: x0,
      y: y0,
      width: x1 - x0 + 1,
      height: y1 - y0 + 1,
    };
    return rect;
  }

  to2dString(spawnPoint: Point): string {
    const bounds = this.getBounds();
    return this.getRectAsString(bounds, spawnPoint);
  }

  static fromString(mapString: string): {
    dashMap: DashMap;
    spawnPoint: Point;
  } {
    const newMap = new DashMap();
    const rows = mapString.split("\n");
    let spawnPoint: Point | undefined;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (row === undefined) throw Error("shit");

      const cells = row.split("");
      for (let j = 0; j < cells.length; j++) {
        const cell = cells[j];
        const point = { x: j, y: i };
        if (cell === ".") {
          newMap.setWallAt(point, false);
        }
        if (cell === "S") {
          newMap.setWallAt(point, false);
          spawnPoint = point;
        }
      }
    }

    if (spawnPoint === undefined)
      throw Error("Couldnt load map. SpawnPoint is not defined");

    return { dashMap: newMap, spawnPoint: spawnPoint };
  }
}
