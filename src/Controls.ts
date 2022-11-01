import { SwipeEvent } from "./DashPaintScene";
import { Point } from "./GeometryHelpers";
import { Dir4 } from "./Helpers";

export class Controls {
//   movementQueue: Point[] = [];

  swipeDash(swipe: SwipeEvent, movementQueue: Point[]) {
    if (swipe.left) this.enqueueMovement("left", movementQueue);
    else if (swipe.right) this.enqueueMovement("right", movementQueue);
    else if (swipe.up) this.enqueueMovement("up", movementQueue);
    else if (swipe.down) this.enqueueMovement("down", movementQueue);
  }

  enqueueMovement(direction: Dir4, movementQueue: Point[]) {
    const nextMovement = { x: 0, y: 0 };

    if (direction === "left") nextMovement.x = -1;
    else if (direction === "right") nextMovement.x = 1;
    else if (direction === "up") nextMovement.y = -1;
    else if (direction === "down") nextMovement.y = 1;

    movementQueue.push(nextMovement);
  }
}
