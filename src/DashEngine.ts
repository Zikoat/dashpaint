import {
  addVectors,
  Dir4,
  ORIGIN,
  Point,
  Rect,
  subtractVectors,
} from "./Helpers";
import { MapStorage } from "./MapStorage";
import seedrandom from "seedrandom";
import createGraph, { Graph } from "ngraph.graph";
import { expect } from "vitest";

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

  analyzeRect(rect: Rect): AnalysedTile[] {
    const analyzedTile: AnalysedTile = {
      isWall: false,
      canReach: false,
      canCollide: false,
      canStop: false,
      numberOfDashesPassingOver: 0,
      componentId: null,
    };
    return [
      analyzedTile,
      analyzedTile,
      analyzedTile,
      analyzedTile,
      analyzedTile,
      analyzedTile,
      analyzedTile,
      analyzedTile,
      analyzedTile,
    ];
  }

  analyzePoint(point: Point): AnalysedTile {
    let isWall;
    let canReach = false;
    let canCollide = false;
    let canStop;
    let numberOfDashesPassingOver;
    let componentId;

    const graph = this.createGraph(this.spawnPoint);
    const node = graph.getNode(this.pointToString(point));
    if (node === undefined) {
      canStop = false;
    } else {
      canStop = true;
      canReach = true;
    }

    isWall = this.getCollidableAt(point);
    if (isWall) {
      const neighbors = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
      ];
      for (const neighbor of neighbors) {
        const neighborPosition = addVectors(neighbor, point);

        graph.forEachLinkedNode(
          this.pointToString(neighborPosition),
          (node, link) => {
            if (
              typeof link.fromId === "number" ||
              typeof link.toId === "number" ||
              typeof node.id === "number"
            )
              throw new Error("bug");

            const linkedNode = this.stringToPoint(node.id);
            const isInboundLink =
              linkedNode.x === neighborPosition.x &&
              linkedNode.y === neighborPosition.y;
            if (!isInboundLink) return;

            const fromPoint = this.stringToPoint(link.fromId);
            const toPoint = this.stringToPoint(link.toId);
            const dashVector = subtractVectors(toPoint, fromPoint);
            const dashDirection = {
              x: Math.sign(dashVector.x),
              y: Math.sign(dashVector.y),
            };
            if (
              dashDirection.x === -neighbor.x &&
              dashDirection.y === -neighbor.y
            )
              canCollide = true;
          },
          false
        );
      }
    }

    graph.forEachLink((link) => {
      if (typeof link.fromId === "number" || typeof link.toId === "number")
        throw Error("bug");

      const fromPoint = this.stringToPoint(link.fromId);
      const toPoint = this.stringToPoint(link.toId);

      const dash = subtractVectors(toPoint, fromPoint);
      const direction = { x: Math.sign(dash.x), y: Math.sign(dash.y) };
      const dashLength = direction.x + direction.y;

      for (let i = 0; i < dashLength; i++) {
        const currentPosition = addVectors(fromPoint, {
          x: direction.x * i,
          y: direction.y * i,
        });
        if (currentPosition.x === point.x && currentPosition.y === point.y)
          canReach = true;
      }
    });

    return {
      isWall,
      canStop,
      canReach,
      canCollide,
      numberOfDashesPassingOver: 0,
      componentId: 0,
    };
  }

  private createGraph(start: Point): Graph {
    if (this.getCollidableAt(start))
      throw Error(
        `cannot create graph from point ${this.pointToString(start)}`
      );

    const myNGraph = createGraph();
    const stack = [this.pointToString(start)];
    const visited: Record<string, boolean> = {};
    visited[this.pointToString(start)] = true;
    myNGraph.addNode(this.pointToString(start));

    let currentVertex: string | undefined;
    while ((currentVertex = stack.pop())) {
      const position = this.stringToPoint(currentVertex);

      const neighbors = this.getNeighbors(position).map(this.pointToString);

      for (const neighbor of neighbors) {
        myNGraph.addLink(currentVertex, neighbor);
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          stack.push(neighbor);
        }
      }
    }
    return myNGraph;
  }

  private pointToString(p: Point): string {
    return JSON.stringify({ x: p.x, y: p.y });
  }

  private stringToPoint(s: string): Point {
    const parsedPoint = JSON.parse(s);
    expect(typeof parsedPoint.x).toBe("number");
    expect(typeof parsedPoint.y).toBe("number");
    return parsedPoint;
  }

  getNeighbors(p: Point): Point[] {
    const neighbors: Point[] = [];

    const directions = [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
    ];

    for (const direction of directions) {
      let currentPosition = {
        x: p.x,
        y: p.y,
      };

      let positionIsCollidable = this.getCollidableAt(
        addVectors(currentPosition, direction)
      );

      let pathLength = 1;

      while (!positionIsCollidable) {
        pathLength++;

        const maxAllowedPathLength = 100;
        if (pathLength > maxAllowedPathLength)
          throw Error(
            `there is a straight dash of over ${maxAllowedPathLength} tiles. Increase max to allow large dashes`
          );

        const newPosition = {
          x: currentPosition.x + direction.x,
          y: currentPosition.y + direction.y,
        };

        currentPosition = newPosition;

        positionIsCollidable = this.getCollidableAt(
          addVectors(currentPosition, direction)
        );
      }

      if (currentPosition.x !== p.x || currentPosition.y !== p.y) {
        neighbors.push(currentPosition);
      }
    }
    return neighbors;
  }
}

export type AnalysedTile = {
  isWall: boolean;
  canReach: boolean;
  canCollide: boolean;
  canStop: boolean;
  numberOfDashesPassingOver: number;
  componentId: number | null;
};
