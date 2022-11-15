import { addVectors, normalizeVector, Point } from "./GeometryHelpers";
import { Dir4 } from "./Helpers";

export class Controls {
  movementQueue: Point[] = [];
  panThreshold = 50;

  constructor(private panPosition: Point = { x: 0, y: 0 }) {}

  panEnd() {
    this.panPosition = { x: 0, y: 0 };
  }

  pan(pan: Point) {
    this.panPosition = addVectors({ x: pan.x, y: pan.y }, this.panPosition);

    if (
      Math.abs(this.panPosition.x) > this.panThreshold ||
      Math.abs(this.panPosition.y) > this.panThreshold
    ) {
      const dashHorisontally =
        Math.abs(this.panPosition.x) > Math.abs(this.panPosition.y);

      const dash = normalizeVector({
        x: dashHorisontally ? this.panPosition.x : 0,
        y: dashHorisontally ? 0 : this.panPosition.y,
      });

      this.movementQueue.push(dash);

      this.panPosition = { x: 0, y: 0 };
    }
  }

  enqueueMovement(direction: Dir4) {
    const movement = this.directionToMovement(direction);
    this.movementQueue.push(movement);
  }

  directionToMovement(direction: Dir4) {
    const movement = { x: 0, y: 0 };

    if (direction === "left") movement.x = -1;
    else if (direction === "right") movement.x = 1;
    else if (direction === "up") movement.y = -1;
    else if (direction === "down") movement.y = 1;

    return movement;
  }
  movementToDirection(movement: Point): Dir4 {
    const normalized = normalizeVector(movement);

    if (normalized.x === -1) return "left";
    else if (normalized.x === 1) return "right";
    else if (normalized.y === -1) return "up";
    else if (normalized.y === 1) return "down";
    else throw Error(`movement ${movement} not recognized as direction`);
  }
}
