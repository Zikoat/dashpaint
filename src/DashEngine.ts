import { callbackify } from "util";
import { Dir4 } from "./Dir4";
import { addVectors, ORIGIN, Point, Rect } from "./Helpers";
import { MapStorage } from "./MapStorage";

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
    const map = this.forEachTileInRect(
      { x: -1, y: -1, width: 3, height: 3 },
      (tile) => {
        counter++;

        asciiOutput += tile.collidable ? "#" : ".";

        if (tile.x === 1) {
          asciiOutput += "\n";
        }
      }
    );
    return asciiOutput;
  }
}
