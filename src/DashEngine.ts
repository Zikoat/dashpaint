import {
  addVectors,
  Dir4,
  DIRECTIONS,
  isEqual,
  isInRect,
  normalizeVector,
  ORIGIN,
  Point,
  Rect,
  scaleVector,
  subtractVectors,
  toSimpleString,
  vectorLength,
} from "./Helpers";
import { MapStorage } from "./MapStorage";
import seedrandom from "seedrandom";
import createGraph, { Graph, Link, Node, NodeId } from "ngraph.graph";
import assert from "assert";
import { findScc } from "./graphHelpers";

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

    this.setWallAt(spawnPoint, false);
  }

  setWallAt(point: Point, isCollidable: boolean) {
    const collidableNumber = isCollidable ? 2 : 1;

    this.mapStorage.setAt(point, collidableNumber);
  }

  fillWallAt(rect: Rect, collidable: boolean) {
    this.forEachTileInRect(rect, (tile) => {
      this.setWallAt(tile, collidable);
    });
  }

  fillRandom(rect: Rect, probability = 0.5, seed?: string) {
    const random = seedrandom(seed);

    this.forEachTileInRect(rect, (tile) => {
      const isCollidable = random() > probability;

      this.setWallAt(tile, isCollidable);
    });
  }

  getWallAt(point: Point): boolean {
    const collidableNumber = this.mapStorage.getAt(point);
    const collidable = collidableNumber === null || collidableNumber === 2;

    return collidable;
  }

  dash(direction: Dir4): Point {
    const movement = this.directionToMovement(direction);
    const currentPosition = this.playerPosition;
    const nextPosition = addVectors(movement, currentPosition);
    const nextPositionCollidable = this.getWallAt(nextPosition);

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

        const collidable = this.getWallAt(tilePosition);

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

  analyseRect(rect: Rect): {
    rect: AnalysedTile[];
    components: Graph<NodeId[]>;
  } {
    const analysedRect: AnalysedTile[] = [];
    const graph = this.createMapGraph(this.spawnPoint);
    const components = findScc(graph);

    this.forEachTileInRect(rect, (tile) => {
      const analysedTile = this.analyzePoint(tile, graph, components);

      // todo activeta post condition check
      // this.verifyAnalysedTilePostConditions(analysedTile)
      analysedRect.push(analysedTile);
    });

    graph.forEachLink((link) => {
      const dash = this.linkToDash(link);

      this.forEachPointInDash(dash, (pointInDash) => {
        if (isInRect(pointInDash, rect)) {
          const arrayIndex =
            rect.width * (pointInDash.y - rect.y) + pointInDash.x - rect.x;
          const tile = analysedRect[arrayIndex];

          if (!tile) {
            throw Error("not defined tile");
          }
          tile.numberOfDashesPassingOver++;
        }
      });
    });

    if (components === null) throw Error("Components is null");

    return { rect: analysedRect, components };
  }

  analyzePoint(
    pointToAnalyze: Point,
    graph = this.createMapGraph(this.spawnPoint),
    components = findScc(graph)
  ): AnalysedTile {
    let isWall;
    let canCollide = false;
    let canStop;
    let numberOfDashesPassingOver = 0;
    let componentId: number | null = null;

    const node = graph.getNode(this.pointToString(pointToAnalyze));
    if (node === undefined) {
      canStop = false;
    } else {
      canStop = true;
    }

    isWall = this.getWallAt(pointToAnalyze);

    if (graph.getNodesCount() === 1) {
      this.forEachNeighbor(this.spawnPoint, (neighbor) => {
        if (isEqual(neighbor, pointToAnalyze)) {
          canCollide = true;
        }
      });
    } else if (isWall) {
      this.forEachNeighbor(pointToAnalyze, (neighborPosition, neighbor) => {
        graph.forEachLinkedNode(
          this.pointToString(neighborPosition),
          (node, link) => {
            const linkedNode = this.nodeToPoint(node);

            const isInboundLink = isEqual(linkedNode, neighborPosition);
            if (isInboundLink) return;

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
        const canStopOnNeighbor = !!graph.getNode(
          this.pointToString(neighborPosition)
        );
        const oppositeWallOfNeighborIsWall = this.getWallAt(
          subtractVectors(neighborPosition, neighbor)
        );
        if (oppositeWallOfNeighborIsWall && canStopOnNeighbor) {
          canCollide = true;
        }
      });
    }

    components.forEachNode((node) => {
      if (node.data.includes(this.pointToString(pointToAnalyze))) {
        if (componentId !== null) throw Error("bug");
        if (typeof node.id === "string") throw Error("bug");

        componentId = node.id;
      }
    });

    return {
      isWall,
      canStop,
      canCollide,
      numberOfDashesPassingOver,
      componentId,
      x: pointToAnalyze.x,
      y: pointToAnalyze.y,
    };
  }

  private createMapGraph(start: Point) {
    if (this.getWallAt(start))
      throw Error(
        `cannot create graph from point ${this.pointToString(start)}`
      );

    const graph = createGraph<string>();

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

  private nodeToPoint(node: Node | NodeId): Point {
    let nodeId;

    if (typeof node !== "object") {
      nodeId = node;
    } else nodeId = node.id;

    if (typeof nodeId === "number") throw Error("bug");

    return this.stringToPoint(nodeId);
  }

  private pointToString(p: Point): string {
    return `${p.x},${p.y}`;
  }

  private stringToPoint(s: string): Point {
    const splitString = s.split(",");

    const parsedPoint = {
      x: parseInt(splitString[0] as string),
      y: parseInt(splitString[1] as string),
    };

    // assert(typeof parsedPoint.x === "number");
    // assert(typeof parsedPoint.y === "number");

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

    let positionIsCollidable = this.getWallAt(
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

      positionIsCollidable = this.getWallAt(
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

  private verifyAnalysedTilePostConditions(tile: AnalysedTile) {
    if (tile.canCollide) assert(tile.isWall);

    if (tile.numberOfDashesPassingOver >= 1) {
      assert(!tile.isWall);
    }

    if (tile.canStop) {
      assert(!tile.isWall);
      assert(tile.numberOfDashesPassingOver >= 2);
      assert(tile.componentId);
      assert(tile.componentId > 0);
    } else {
      assert(tile.componentId === null);
    }
  }
}

export type AnalysedTile = {
  isWall: boolean;
  canCollide: boolean;
  canStop: boolean;
  numberOfDashesPassingOver: number;
  componentId: number | null;
} & Point;
