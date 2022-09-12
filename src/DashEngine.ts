import { addVectors, Dir4, ORIGIN, Point, Rect } from "./Helpers";
import { MapStorage } from "./MapStorage";
import seedrandom from "seedrandom";

export interface DashEngineOptions {
  spawnPoint?: Point;
  mapStorage?: MapStorage;
}

export class DashEngine {
  spawnPoint: Point;
  playerPosition: Point;
  private mapStorage: MapStorage;

  constructor(options?: DashEngineOptions) {
    const spawnPoint = options?.spawnPoint ?? ORIGIN;

    this.spawnPoint = spawnPoint;
    this.playerPosition = spawnPoint;
    this.mapStorage = options?.mapStorage ?? new MapStorage();

    this.setCollidableAt(spawnPoint, false);
  }

  setCollidableAt(point: Point, isCollidable: boolean) {
    const collidableNumber = isCollidable ? 2 : 1;

    this.mapStorage.setAt(point, collidableNumber);
  }

  fillCollidableAt(rect: Rect, collidable: boolean) {
    this.forEachTileInRect(rect, (tile) => {
      this.setCollidableAt(tile, collidable);
    });
  }

  fillRandom(rect: Rect, probability = 0.5, seed?: string) {
    const random = seedrandom(seed);

    this.forEachTileInRect(rect, (tile) => {
      const isCollidable = random() > probability;

      this.setCollidableAt(tile, isCollidable);
    });
  }

  getCollidableAt(point: Point): boolean {
    const collidableNumber = this.mapStorage.getAt(point);
    const collidable = collidableNumber === null || collidableNumber === 2;

    return collidable;
  }

  dash(direction: Dir4): Point {
    const movement = this.directionToMovement(direction);
    const currentPosition = this.playerPosition;
    const nextPosition = addVectors(movement, currentPosition);
    const nextPositionCollidable = this.getCollidableAt(nextPosition);

    if (!nextPositionCollidable) this.playerPosition = nextPosition;
    return this.playerPosition;
  }

  private directionToMovement(direction: Dir4): Point {
    const movement = { ...ORIGIN };

    if (direction === "left") movement.x = -1;
    else if (direction === "right") movement.x = 1;
    else if (direction === "up") movement.y = -1;
    else if (direction === "down") movement.y = 1;

    return movement;
  }

  forEachTileInRect(
    rect: Rect,
    callback: (tile: { collidable: boolean } & Point) => void
  ) {
    for (let i = 0; i < rect.height; i++) {
      for (let j = 0; j < rect.width; j++) {
        const tilePosition = { x: j + rect.x, y: i + rect.y };

        const collidable = this.getCollidableAt(tilePosition);

        callback({ ...tilePosition, collidable });
      }
    }
  }

  getRectAsString(rect: Rect): string {
    let asciiOutput = "";
    let counter = 0;

    this.forEachTileInRect(rect, (tile) => {
      counter++;

      asciiOutput += tile.collidable ? "#" : ".";

      if (
        tile.x === rect.x + rect.width - 1 &&
        tile.y !== rect.y + rect.height - 1
      ) {
        asciiOutput += "\n";
      }
    });

    return asciiOutput;
  }
}
