import {
  addVectors,
  Dir4,
  DIRECTIONS,
  isEqual,
  normalizeVector,
  ORIGIN,
  Point,
  Rect,
  scaleVector,
  subtractVectors,
  vectorLength,
} from "./Helpers";
import { MapStorage } from "./MapStorage";
import seedrandom from "seedrandom";
import createGraph, { Graph, Link, Node } from "ngraph.graph";
import assert from "assert";

export interface DashEngineOptions {
  spawnPoint?: Point;
  mapStorage?: MapStorage;
}

type Dash = {
  from: Point;
  to: Point;
};

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

  analyzePoint(pointToAnalyze: Point): AnalysedTile {
    let isWall;
    let canCollide = false;
    let canStop;
    let numberOfDashesPassingOver = 0;
    let componentId = null;

    const graph = this.createMapGraph(this.spawnPoint);
    const node = graph.getNode(this.pointToString(pointToAnalyze));
    if (node === undefined) {
      canStop = false;
    } else {
      canStop = true;
    }

    isWall = this.getCollidableAt(pointToAnalyze);

    if (graph.getNodesCount() === 1) {
      this.forEachNeighbor(this.spawnPoint, (neighbor) => {
        if (isEqual(neighbor, pointToAnalyze)) {
          canCollide = true;
        }
      });
      if (!isWall) componentId = 0;
    } else if (isWall) {
      this.forEachNeighbor(pointToAnalyze, (neighborPosition, neighbor) => {
        graph.forEachLinkedNode(
          this.pointToString(neighborPosition),
          (node, link) => {
            const linkedNode = this.nodeToPoint(node);

            const isInboundLink = isEqual(linkedNode, neighborPosition);
            if (!isInboundLink) return;

            const dash = this.linkToDash(link);

            const dashVector = subtractVectors(dash.to, dash.from);
            const dashDirection = normalizeVector(dashVector);
            const isDashInThisDirection = isEqual(
              dashDirection,
              scaleVector(neighbor, -1)
            );

            if (isDashInThisDirection) canCollide = true;
          },
          false
        );
      });
    }

    graph.forEachLink((link) => {
      const dash = this.linkToDash(link);

      this.forEachPointInDash(dash, (pointInDash) => {
        if (isEqual(pointInDash, pointToAnalyze)) {
          numberOfDashesPassingOver++;
          componentId = 0;
        }
      });
    });

    return {
      isWall,
      canStop,
      canCollide,
      numberOfDashesPassingOver,
      componentId,
    };
  }

  private createMapGraph(start: Point): Graph {
    if (this.getCollidableAt(start))
      throw Error(
        `cannot create graph from point ${this.pointToString(start)}`
      );

    const graph = createGraph();

    const stack = [this.pointToString(start)];
    const visited: Record<string, boolean> = {};
    visited[this.pointToString(start)] = true;

    graph.addNode(this.pointToString(start));

    let currentVertex: string | undefined;
    while ((currentVertex = stack.pop())) {
      const position = this.stringToPoint(currentVertex);

      const neighbors = this.getNeighbors(position).map(this.pointToString);

      for (const neighbor of neighbors) {
        graph.addLink(currentVertex, neighbor);
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          stack.push(neighbor);
        }
      }
    }
    return graph;
  }

  private linkToDash(link: Link): Dash {
    if (typeof link.fromId === "number" || typeof link.toId === "number")
      throw new Error("bug");

    return {
      from: this.stringToPoint(link.fromId),
      to: this.stringToPoint(link.toId),
    };
  }

  private forEachPointInDash(
    dash: Dash,
    callback: (pointAlongDash: Point) => void
  ) {
    const dashVector = subtractVectors(dash.to, dash.from);

    const direction = normalizeVector(dashVector);
    const dashLength = vectorLength(dashVector);

    for (let i = 0; i <= dashLength; i++) {
      const currentPosition = addVectors(dash.from, scaleVector(direction, i));

      callback(currentPosition);
    }
  }

  private nodeToPoint(node: Node): Point {
    if (typeof node.id === "number") throw new Error("bug");

    return this.stringToPoint(node.id);
  }

  private pointToString(p: Point): string {
    return JSON.stringify({ x: p.x, y: p.y });
  }

  private stringToPoint(s: string): Point {
    const parsedPoint = JSON.parse(s);
    
    assert(typeof parsedPoint.x === "number");
    assert(typeof parsedPoint.y === "number");

    return parsedPoint;
  }

  private getNeighbors(point: Point): Point[] {
    const neighbors: Point[] = [];

    this.forEachNeighbor(ORIGIN, (_neighbor, direction) => {
      const neighbor = this.getFirstCollidableInDirection(point, direction);

      if (neighbor.x !== point.x || neighbor.y !== point.y) {
        neighbors.push(neighbor);
      }
    });

    return neighbors;
  }

  private getFirstCollidableInDirection(point: Point, direction: Point): Point {
    let currentPosition = {
      x: point.x,
      y: point.y,
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

      currentPosition = addVectors(currentPosition, direction);

      positionIsCollidable = this.getCollidableAt(
        addVectors(currentPosition, direction)
      );
    }

    return currentPosition;
  }

  private forEachNeighbor(
    point: Point,
    callback: (neighbor: Point, direction: Point) => void
  ) {
    for (const direction of DIRECTIONS) {
      callback(addVectors(point, direction), direction);
    }
  }
}

export type AnalysedTile = {
  isWall: boolean;
  canCollide: boolean;
  canStop: boolean;
  numberOfDashesPassingOver: number;
  componentId: number | null;
};
