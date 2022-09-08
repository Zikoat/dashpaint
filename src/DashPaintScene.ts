import * as Phaser from "phaser";
import chroma from "chroma-js";
import * as dat from "dat.gui";
import { max } from "mathjs";
import { Pan, Swipe, Tap } from "phaser3-rex-plugins/plugins/gestures.js";
import { findScc } from "./graphHelpers";
import createGraph, { Graph as NGraph } from "ngraph.graph";
import { htmlPhaserFunctions } from "../pages";
import assert from "assert";

type Point = { x: number; y: number };

type SwipeExtended = Swipe & {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export class DashPaintScene extends Phaser.Scene {
  movementDirection = { x: 0, y: 0 };
  player!: Phaser.GameObjects.Image;
  layer!: Phaser.Tilemaps.TilemapLayer;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  passBotAgents!: { x: number; y: number; velX: number; velY: number }[];

  counter = 0;
  tileSize = 8;
  gui = new dat.GUI();
  map!: Phaser.Tilemaps.Tilemap;
  tileset!: Phaser.Tilemaps.Tileset;
  connectedComponentsLayer!: Phaser.Tilemaps.TilemapLayer;
  pathLengthColorLayer!: Phaser.Tilemaps.TilemapLayer;
  walkableTiles: Point[] = [];
  maxPathLength = 0;
  minPathLength = Infinity;
  mapSize = 20;
  swipe!: SwipeExtended;
  pan!: Pan;
  tap!: Tap;
  startButton!: Phaser.GameObjects.Text;
  spawnPoint = { x: 1, y: 1 };
  movementQueue: Point[] = [];
  maxScore = 0;
  currentScore = 0;
  scoreCounter!: Phaser.GameObjects.Text;

  preload() {
    this.load.image("tiles", "../dashpaint/images/DashpaintTilesetV2.png");
  }

  create() {
    htmlPhaserFunctions.loadFinished();

    this.map = this.make.tilemap({
      width: this.mapSize,
      height: this.mapSize,
      tileWidth: this.tileSize,
      tileHeight: this.tileSize,
    });

    this.tileset = this.map.addTilesetImage(
      "tiles",
      undefined,
      this.tileSize,
      this.tileSize,
      0,
      0
    );

    this.layer = this.map.createBlankLayer("ShitLayer1", this.tileset);

    const playerSprite = this.textures.get("tiles");
    playerSprite.add("player", 0, 0, 24, this.tileSize, this.tileSize);

    this.player = this.add.image(0, 0, playerSprite);
    this.player.tint = 0x00ffff;

    this.pathLengthColorLayer = this.map.createBlankLayer(
      "pathLengthColorLayer",
      this.tileset
    );
    this.connectedComponentsLayer = this.map.createBlankLayer(
      "connectedComponents",
      this.tileset
    );
    this.connectedComponentsLayer.alpha = 0.75;
    this.connectedComponentsLayer.depth = -1;
    this.setDefaultLayer();

    this.cursors = this.input.keyboard.createCursorKeys();

    this.gui
      .add(this.connectedComponentsLayer, "alpha", 0, 1)
      .name("Show reachability");

    htmlPhaserFunctions.startEdit = () => this.startEdit();
    htmlPhaserFunctions.stopEdit = () => this.stopEdit();
    htmlPhaserFunctions.clickReset = () => this.resetGame();

    this.input.keyboard.on("keydown-UP", () => {
      this.enqueueMovement("up");
    });
    this.input.keyboard.on("keydown-DOWN", () => {
      this.enqueueMovement("down");
    });
    this.input.keyboard.on("keydown-LEFT", () => {
      this.enqueueMovement("left");
    });
    this.input.keyboard.on("keydown-RIGHT", () => {
      this.enqueueMovement("right");
    });

    this.swipe = new Swipe(this, { dir: "4dir" }) as SwipeExtended;

    this.pan = new Pan(this);
    this.tap = new Tap(this, {
      tapInterval: 0,
    });

    this.tap.on("tap", this.handleTap);

    this.scoreCounter = this.add.text(0, -15, "test", {
      color: "white",
      fontStyle: "strong",
      resolution: 10,
    });

    this.resetGame();
  }

  resetGame() {
    this.layer.fill(2, 0, 0, this.mapSize, this.mapSize);
    this.layer.fill(1, 1, 1, this.mapSize - 2, this.mapSize - 2);
    this.layer.weightedRandomize(
      [
        { index: 0, weight: 4 }, // walkable
        { index: 2, weight: 1 }, // not walkable
      ],
      1,
      1,
      this.mapSize - 2,
      this.mapSize - 2
    );
    this.layer.fill(0, 1, 1, 2, 1);

    this.setPlayerPosition(this.spawnPoint);

    this.analyzeMap();
    // this.colorMapSteadyState();
    // this.colorMapPathLengthMinMax();

    this.cameras.main.startFollow(this.player, true, 0.14, 0.14);
    this.cameras.main.zoomTo(3, 1000, "Quad");
  }

  handleTap(
    tap: Tap & { scene: DashPaintScene; worldX: number; worldY: number },
    _gameObject: Phaser.GameObjects.GameObject,
    _lastPointer: Phaser.Input.Pointer
  ) {
    const scene = tap.scene as DashPaintScene;
    const tapPoint = scene.layer.worldToTileXY(tap.worldX, tap.worldY);

    const isOutOfBounds =
      tapPoint.x < 1 ||
      tapPoint.y < 1 ||
      tapPoint.x >= this.mapSize ||
      tapPoint.x >= this.mapSize;

    if (!isOutOfBounds && htmlPhaserFunctions.isEditing) {
      const tile: Phaser.Tilemaps.Tile | null = scene.layer.getTileAt(
        tapPoint.x,
        tapPoint.y,
        true
      );

      if (tile === null) {
        console.warn("Pressed tile was null");
        return;
      }

      if (tile.index === 2) tile.index = 0;
      else tile.index = 2;

      scene.analyzeMap();
    }
  }

  colorMapPathLengthMinMax() {
    const colorScale = chroma.scale(["green", "yellow", "red"]);
    colorScale.domain([this.minPathLength, this.maxPathLength]);

    for (const point of this.walkableTiles) {
      const tile = this.pathLengthColorLayer.getTileAt(point.x, point.y, true);
      tile.index = 2;
      const maxPathLength = tile.properties.maxPathLength;
      if (typeof maxPathLength !== "number")
        throw new Error("maxPathLength is undefined on a walkable tile");

      tile.tint = colorScale(maxPathLength).num();
    }
    this.pathLengthColorLayer.alpha = 0;
    this.pathLengthColorLayer.depth = -2;
    this.gui
      .add(this.pathLengthColorLayer, "alpha", 0, 1)
      .name("Show dash length");
  }

  update() {
    this.validateMovement();
    if (!htmlPhaserFunctions.isEditing) {
      if (this.swipe.isSwiped) {
        console.log("swiped");
        if (this.swipe.left) this.enqueueMovement("left");
        else if (this.swipe.right) this.enqueueMovement("right");
        else if (this.swipe.up) this.enqueueMovement("up");
        else if (this.swipe.down) this.enqueueMovement("down");
      }

      if (this.movementDirection.x === 0 && this.movementDirection.y === 0) {
        let validMovement = false;

        while (!validMovement && this.movementQueue.length > 0) {
          const nextMovement = this.movementQueue.shift();
          assert(nextMovement, "Tried dequeueing while queue is empty");

          const nextPosition = this.getPlayerPosition().add(nextMovement);
          if (this.isWalkable(nextPosition)) {
            validMovement = true;
            this.movementDirection = nextMovement;
          }
        }
      } else {
        this.updateAngle();
        const nextPosition = this.getPlayerPosition().add(
          this.movementDirection
        );
        if (this.isWalkable(nextPosition)) {
          this.setPlayerPosition(nextPosition);
        } else {
          this.movementDirection = { x: 0, y: 0 };
        }
      }
      const currentTile = this.layer.getTileAt(
        this.getPlayerPosition().x,
        this.getPlayerPosition().y
      );
      if (currentTile.index === 17) {
        currentTile.index = 0;
        this.currentScore++;
      }
    }

    this.scoreCounter.text = `dots: ${this.maxScore - this.currentScore}`;
  }

  isWalkable(p: Point) {
    const tile = this.layer.getTileAt(
      p.x,
      p.y,
      true
    ) as Phaser.Tilemaps.Tile | null;

    if (!tile) return true;

    return tile.index !== 2;
  }

  enqueueMovement(direction: "up" | "down" | "left" | "right") {
    const nextMovement = new Phaser.Math.Vector2(0, 0);

    if (direction === "left") nextMovement.x = -1;
    else if (direction === "right") nextMovement.x = 1;
    else if (direction === "up") nextMovement.y = -1;
    else if (direction === "down") nextMovement.y = 1;

    this.movementQueue.push(nextMovement);
  }

  simplifyMovement = (p: Point) => `${p.x},${p.y}`;

  validateMovement() {
    assert(
      this.isValidMovementVector(this.movementDirection),
      "movement direction is invalid"
    );
    for (const movement of this.movementQueue) {
      assert(
        this.isValidMovementVector(movement),
        "an entry in movementQueue is invalid"
      );
    }
  }

  isValidMovementVector(p: Point) {
    const length = Math.abs(p.x) + Math.abs(p.y);
    if (!(length === 1 || length === 0)) return false;
    if (p.x !== 0 && p.y !== 0) return false;
    return true;
  }

  setPlayerPosition(point: Point) {
    const worldPosition = this.layer.tileToWorldXY(point.x, point.y);
    this.player.setPosition(
      worldPosition.x + this.tileSize / 2,
      worldPosition.y + this.tileSize / 2
    );
  }

  getPlayerPosition(): Phaser.Math.Vector2 {
    return this.layer.worldToTileXY(this.player.x, this.player.y);
  }

  startEdit() {
    this.setPlayerPosition(this.spawnPoint);
    this.player.alpha = 0.5;
    this.currentScore = 0;
    this.analyzeMap();
  }

  stopEdit() {
    this.player.alpha = 1;
  }

  // colorMapSteadyState() {
  //   this.graph = this.createGraph({
  //     x: this.player.x - this.tileSize / 2,
  //     y: this.player.y - this.tileSize / 2,
  //   });

  //   this.graph.adjacencyList;

  //   const processedAdjacencyList = this.toNumberAdjacencyList({
  //     adjacencyList: this.graph.adjacencyList,
  //   });

  //   const steadyState2 = adjacencyListToSteadyState(
  //     processedAdjacencyList.numberAdjacencyList
  //   );
  //   const steadyState = math.multiply(
  //     math.divide(steadyState2, math.max(steadyState2)),
  //     5
  //   ) as number[];
  //   console.log(steadyState);
  //   const sccInput: number[][] = processedAdjacencyList.numberAdjacencyList;
  //   // const tileConnectedComponents = sccOutput.components.map((component) =>
  //   //   component.map((sourceNumber) =>
  //   //   )
  //   // );
  //   // console.log(tileConnectedComponents);

  //   const colors = chroma.scale(["red", "green"]);

  //   for (const [index, nodeDifficulty] of steadyState.entries()) {
  //     const color = colors(nodeDifficulty);
  //     const tilePosition = this.stringToPoint(
  //       processedAdjacencyList.values[index]
  //     );

  //     const tile = this.layer.getTileAtWorldXY(tilePosition.x, tilePosition.y);
  //     tile.index = 18;
  //     tile.tint = color.num();
  //   }
  // }

  analyzeMap() {
    const graph = this.createGraph(this.getPlayerPosition());

    const sccOutput = findScc(graph);
    const tileConnectedComponents = sccOutput.components.map((component) =>
      component.map((sourceNumber) => {
        if (typeof sourceNumber === "number")
          throw new Error("A node id is a number, but it should be a string");
        return this.stringToPoint(sourceNumber);
      })
    );

    const colors = chroma
      .scale(["yellow", "008ae5"])
      .colors(tileConnectedComponents.length);

    this.connectedComponentsLayer.replaceByIndex(
      2,
      0,
      0,
      0,
      this.mapSize,
      this.mapSize
    );
    for (const [
      index,
      tileConnectedComponent,
    ] of tileConnectedComponents.entries()) {
      const color = colors[index];
      if (typeof color !== "string")
        throw new Error(`could not get color of index ${index}`);
      for (const tileInComponent of tileConnectedComponent) {
        const tile = this.connectedComponentsLayer.getTileAt(
          tileInComponent.x,
          tileInComponent.y,
          true
        );

        tile.index = 2;
        tile.tint = Number(color.replace("#", "0x"));
      }
    }

    this.layer.replaceByIndex(17, 0, 0, 0, this.mapSize, this.mapSize);

    this.maxScore = 0;
    graph.forEachLink((link) => {
      assert(typeof link.fromId === "string");
      assert(typeof link.toId === "string");
      const fromPoint = this.stringToPoint(link.fromId);
      const toPoint = this.stringToPoint(link.toId);

      const dash = toPoint.subtract(fromPoint);
      const movementDirection = new Phaser.Math.Vector2(dash).normalize();
      assert(
        this.isValidMovementVector(movementDirection),
        `${this.simplifyMovement(
          movementDirection
        )} is not a valid movement vector`
      );
      for (let i = 0; i < dash.length(); i++) {
        const currentPosition = new Phaser.Math.Vector2(movementDirection)
          .scale(i)
          .add(fromPoint);
        const tile = this.layer.getTileAt(
          currentPosition.x,
          currentPosition.y,
          true
        ) as Phaser.Tilemaps.Tile | null;
        if (tile && tile.index !== 17) {
          tile.index = 17;
          this.maxScore++;
        }
      }
    });
  }

  setDefaultLayer() {
    this.map.currentLayerIndex = this.map.getLayerIndexByName("ShitLayer1");
  }

  toNumberAdjacencyList({
    adjacencyList,
  }: {
    adjacencyList: { [x: string]: any };
  }) {
    const sources = Object.keys(adjacencyList);
    const output: number[][] = [];
    for (const [index, source] of sources.entries()) {
      const destinations: Set<string> = adjacencyList[source];
      const mappedDestinations = [...destinations].map((d) =>
        sources.indexOf(d)
      );
      output[index] = mappedDestinations;
    }
    return { numberAdjacencyList: output, values: sources };
  }

  pointToString(p: Point): string {
    return JSON.stringify({ x: p.x, y: p.y });
  }

  stringToPoint(s: string): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(JSON.parse(s));
  }

  getNeighbors(p: Point): Point[] {
    const neighbors: Point[] = [];

    const directions = [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
    ];

    this.setPathLength(p.x, p.y, 0);

    for (const direction of directions) {
      let currentPosition = {
        x: p.x,
        y: p.y,
      };

      let tile = this.layer.getTileAt(
        currentPosition.x + direction.x,
        currentPosition.y + direction.y,
        true
      );

      let pathLength = 1;
      // this.setPathLength(
      //   currentPosition.x + direction.x,
      //   currentPosition.y + direction.y,
      //   pathLength
      // );

      if (tile === null || tile.index === -1) {
        console.error(
          tile,
          "is not defined, but was queried currentPosition:",
          currentPosition,
          direction
        );
        throw new Error("see error above");
      }

      while (tile.index !== 2) {
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

        this.setPathLength(newPosition.x, newPosition.y, pathLength);

        currentPosition = newPosition;

        tile = this.layer.getTileAt(
          currentPosition.x + direction.x,
          currentPosition.y + direction.y,
          true
        );
      }

      if (currentPosition.x !== p.x || currentPosition.y !== p.y) {
        neighbors.push(currentPosition);
      }
    }
    return neighbors;
  }

  setPathLength(tilePosX: number, tilePosY: number, pathLength: number) {
    this.walkableTiles.push({ x: tilePosX, y: tilePosY });

    const tile = this.pathLengthColorLayer.getTileAt(tilePosX, tilePosY, true);

    tile.properties.maxPathLength =
      tile.properties.maxPathLength === undefined
        ? pathLength
        : max(tile.properties.maxPathLength, pathLength);
    tile.properties.minPathLength =
      tile.properties.minPathLength === undefined
        ? pathLength
        : max(tile.properties.minPathLength, pathLength);

    this.maxPathLength = Math.max(
      this.maxPathLength,
      tile.properties.maxPathLength
    );
    this.minPathLength = Math.min(
      this.minPathLength,
      tile.properties.minPathLength
    );
  }

  createGraph(start: Point): NGraph {
    const myNGraph = createGraph();
    const stack = [this.pointToString(start)];
    const visited: Record<string, boolean> = {};
    visited[this.pointToString(start)] = true;

    let currentVertex: string | undefined;
    while ((currentVertex = stack.pop())) {
      const position = this.stringToPoint(currentVertex);
      const tile = this.layer.getTileAt(
        position.x,
        position.y,
        true
      ) as Phaser.Tilemaps.Tile | null;

      const neighbors = this.getNeighbors(
        this.stringToPoint(currentVertex)
      ).map(this.pointToString);

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

  simplifyAdjacencyList(adjacencyList: { [x: string]: any }): any {
    function toSimpleString(p: Point): string {
      return "" + p.x + "," + p.y;
    }
    const output: Record<string, string[]> = {};
    for (const sourcePoint in adjacencyList) {
      if (Object.prototype.hasOwnProperty.call(adjacencyList, sourcePoint)) {
        const destinationPoints: string[] = adjacencyList[sourcePoint];
        const sourcePointPoint = this.stringToPoint(sourcePoint);
        const sourcePointSimpleString = toSimpleString(sourcePointPoint);
        const destinationPointsSimpleString = destinationPoints.map((p) =>
          toSimpleString(this.stringToPoint(p))
        );
        output[sourcePointSimpleString] = destinationPointsSimpleString;
      }
    }
    return output;
  }

  updateAngle() {
    this.player.angle =
      this.getAngle(this.movementDirection.x, this.movementDirection.y) - 90;
  }

  getAngle(x: number, y: number): number {
    // stackoverflow.com/a/35271543
    var angle = Math.atan2(y, x);
    var degrees = (180 * angle) / Math.PI;
    return (360 + Math.round(degrees)) % 360;
  }
}

// function adjacencyListToTransitionMatrix(adjacencyList: number[][]) {
//   //   const amountOfNodes = adjacencyList.length;

//   const matrix = math.matrix("dense"); //amountOfNodes, amountOfNodes);

//   for (const [fromNode, edges] of adjacencyList.entries()) {
//     for (const toNode of edges) {
//       matrix.set([fromNode, toNode], 1 / edges.length);
//     }
//   }
//   return matrix;
// }

// export function adjacencyListToSteadyState(
//   adjacencyList: number[][]
// ): number[] {
//   const transitionMatrix = adjacencyList;
//   // const transitionMatrix = adjacencyListToTransitionMatrix(adjacencyList);
//   // console.log(JSON.stringify(transitionMatrix.toArray()));
//   const shit = math.pow(transitionMatrix, 10) as math.Matrix;
//   const eigs = math.eigs(math.transpose(transitionMatrix));

//   if (!math.isMatrix(eigs.vectors))
//     throw Error("type of eigenvectors is not matrix");
//   const vectors = eigs.vectors;
//   // window.vectors = vectors;
//   // window.math = math;
//   let correctVector: number[];

//   eigs.values.forEach((val, index, array) => {
//     console.log(JSON.stringify(val), abs(abs(val) - 1) < 0.0001);
//     console.log("not comple ", !isComplex(val));
//     if (!isComplex(val) && abs(abs(val) - 1) < 0.0001) {
//       const shit = math.row(vectors, index[0]).toArray()[0];
//       if (!Array.isArray(shit)) throw Error("entry in matrix is not an array");
//       if (typeof shit[0] !== "number")
//         throw Error("entry in vector is nut number");

//       console.log(index[0], vectors, shit);
//       correctVector = shit as number[];
//     }
//   });

//   console.log(eigs);
//   const normalizationScale = math.sum(correctVector);
//   console.log(normalizationScale, correctVector);

//   const normalizedVector = correctVector.map((val) => val / normalizationScale);
//   console.log(normalizedVector);

//   // eigs.values.map((val) => console.log(val));
//   // console.log("eig vals",  );
//   console.log("eig vecs", eigs.vectors.toString());
//   const shit2 = shit.toArray()[0];
//   if (Array.isArray(shit2)) return shit2 as number[];
//   else throw Error("shit");
//   // return shit.toArray()[0] as number[];
//   // const shit2 = transitionMatrix.toArray()[0];
// }
