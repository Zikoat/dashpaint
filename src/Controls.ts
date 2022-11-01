import { SwipeEvent } from "./DashPaintScene";
import { Point } from "./GeometryHelpers";
import { Dir4 } from "./Helpers";

export class Controls {
  movementQueue: Point[] = [];

  swipeDash(swipe: SwipeEvent) {
    if (swipe.left) this.enqueueMovement("left");
    else if (swipe.right) this.enqueueMovement("right");
    else if (swipe.up) this.enqueueMovement("up");
    else if (swipe.down) this.enqueueMovement("down");
  }

  enqueueMovement(direction: Dir4) {
    const nextMovement = { x: 0, y: 0 };

    if (direction === "left") nextMovement.x = -1;
    else if (direction === "right") nextMovement.x = 1;
    else if (direction === "up") nextMovement.y = -1;
    else if (direction === "down") nextMovement.y = 1;

    this.movementQueue.push(nextMovement);
  }
}
