console.log(" helle");
import * as Phaser from "phaser";
import { Graph } from "./Graph";
import * as scc from "strongly-connected-components";
import chroma from "chroma-js";
import * as dat from "dat.gui";
import { testEigenvector } from "./eigenvector.test";
import math, {
  abs,
  isComplex,
  MathArray,
  MathNumericType,
  Matrix,
  max,
} from "mathjs";

type Point = { x: number; y: number };

class MyScene extends Phaser.Scene {
  movementDirection = { x: 0, y: 0 };
  player: Phaser.GameObjects.Image;
  layer: Phaser.Tilemaps.TilemapLayer;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  passBotAgents: { x: number; y: number; velX: number; velY: number }[];
  graph: Graph;

  counter = 0;
  tileSize: number;
  gui: dat.GUI;
  map: Phaser.Tilemaps.Tilemap;
  tileset: Phaser.Tilemaps.Tileset;
  connectedComponentsLayer: Phaser.Tilemaps.TilemapLayer;
  pathLengthColorLayer: Phaser.Tilemaps.TilemapLayer;
  walkableTiles: Point[] = [];
  maxPathLength = 0;
  minPathLength = Infinity;

  preload() {
    this.load.image("tiles", "../public/images/DashpaintTilesetV2.png");
    this.load.image("character", "../public/images/DashpaintCharacter.png");
    // this.load.tilemapCSV("map", "../public/phaser3examples/grid.csv");
  }

  create() {
    console.log("---start eigenvector test");

    // testEigenvector();
    console.log("---stop eigenvector test");

    const mapSize = 30;
    this.tileSize = 8;
    this.map = this.make.tilemap({
      // key: "map",
      width: mapSize,
      height: mapSize,
      tileWidth: this.tileSize,
      tileHeight: this.tileSize,
    });

    const playerSprite = this.textures.get("tiles");
    const playerFrame = playerSprite.add("player", 0, 0, 24, 8, 8);
    // console.log(playerSprite)

    this.tileset = this.map.addTilesetImage(
      "tiles",
      null,
      this.tileSize,
      this.tileSize,
      0,
      0
    );

    // this.layer = map.createLayer(0, tileset, 0, 0);
    this.layer = this.map.createBlankLayer("ShitLayer1", this.tileset);

    this.layer.fill(2, 0, 0, mapSize, mapSize);
    this.layer.fill(1, 1, 1, mapSize - 2, mapSize - 2);
    this.layer.weightedRandomize(
      [
        { index: 0, weight: 4 }, // walkable
        { index: 2, weight: 1 }, // not walkable
      ],
      1,
      1,
      mapSize - 2,
      mapSize - 2
    );
    this.layer.fill(0, 1, 1, 2, 1);

    this.player = this.add.image(
      this.tileSize + this.tileSize / 2,
      this.tileSize + this.tileSize / 2,
      playerSprite
    );

    this.gui = new dat.GUI();

    this.pathLengthColorLayer = this.map.createBlankLayer(
      "pathLengthColorLayer",
      this.tileset
    );

    this.colorMapConnectedComponents();
    // this.colorMapSteadyState();
    this.colorMapPathLengthMinMax();

    this.cameras.main.startFollow(this.player, true, 0.14, 0.14);
    this.cameras.main.zoomTo(4, 1000, "Quad");

    this.cursors = this.input.keyboard.createCursorKeys();

    const myValueToEdit = {
      playerTint: "#FFFFFF",
    };

    const playerColor = this.gui.addColor(myValueToEdit, "playerTint");
    playerColor.onChange((color) => {
      console.log("changing player color to ", color);
      this.player.tint = chroma(color).num();
    });
    playerColor.setValue("#00ffff");

    this.gui.add(this.connectedComponentsLayer, "alpha", 0, 1);

    // const showConComps = this.gui.add(conCompLayer, "alpha",0,1,0.01)
    // showConComps.onChange((alphaValue)=>conCompLayer.alpha = alphaValue)
  }
  colorMapPathLengthMinMax() {
    const colorScale = chroma.scale(["green", "yellow", "red"]);
    colorScale.domain([this.minPathLength, this.maxPathLength]);

    for (const point of this.walkableTiles) {
      const tile = this.pathLengthColorLayer.getTileAtWorldXY(
        point.x,
        point.y,
        true
      );
      tile.index = 2;
      const maxPathLength = tile.properties.maxPathLength;
      if (typeof maxPathLength !== "number")
        throw new Error("maxPathLength is undefined on a walkable tile");

      tile.tint = colorScale(maxPathLength).num();
    }
    this.pathLengthColorLayer.alpha = 0.5;
    this.pathLengthColorLayer.depth = -2;
    this.gui.add(this.pathLengthColorLayer, "alpha", 0, 1);
  }

  update() {
    if (this.movementDirection.x === 0 && this.movementDirection.y === 0) {
      if (this.input.keyboard.checkDown(this.cursors.left, 100)) {
        this.movementDirection.x = -this.tileSize;
        this.updateAngle();
      } else if (this.input.keyboard.checkDown(this.cursors.right, 100)) {
        this.movementDirection.x = this.tileSize;
        this.updateAngle();
      } else if (this.input.keyboard.checkDown(this.cursors.up, 100)) {
        this.movementDirection.y = -this.tileSize;
        this.updateAngle();
      } else if (this.input.keyboard.checkDown(this.cursors.down, 100)) {
        this.movementDirection.y = this.tileSize;
        this.updateAngle();
      }
    }

    var tile = this.layer.getTileAtWorldXY(
      this.player.x + this.movementDirection.x,
      this.player.y + this.movementDirection.y,
      true
    );

    if (tile.index === 2) {
      this.movementDirection = { x: 0, y: 0 };
    } else {
      this.player.x += this.movementDirection.x;
      this.player.y += this.movementDirection.y;
      // when walking over a tile, set the index to 0 to remove dots
      tile.index = 0;
      // tile.tint = 0xffff00;
    }
  }

  colorMapSteadyState() {
    this.graph = this.createGraph({
      x: this.player.x - this.tileSize / 2,
      y: this.player.y - this.tileSize / 2,
    });

    this.graph.adjacencyList;

    const processedAdjacencyList = this.toNumberAdjacencyList({
      adjacencyList: this.graph.adjacencyList,
    });

    const steadyState2 = adjacencyListToSteadyState(
      processedAdjacencyList.numberAdjacencyList
    );
    const steadyState = math.multiply(
      math.divide(steadyState2, math.max(steadyState2)),
      5
    ) as number[];
    console.log(steadyState);
    const sccInput: number[][] = processedAdjacencyList.numberAdjacencyList;
    // const tileConnectedComponents = sccOutput.components.map((component) =>
    //   component.map((sourceNumber) =>
    //   )
    // );
    // console.log(tileConnectedComponents);

    const colors = chroma.scale(["red", "green"]);

    for (const [index, nodeDifficulty] of steadyState.entries()) {
      const color = colors(nodeDifficulty);
      const tilePosition = this.stringToPoint(
        processedAdjacencyList.values[index]
      );

      const tile = this.layer.getTileAtWorldXY(tilePosition.x, tilePosition.y);
      tile.index = 18;
      tile.tint = color.num();
    }
  }

  colorMapConnectedComponents() {
    this.graph = this.createGraph({
      x: this.player.x - this.tileSize / 2,
      y: this.player.y - this.tileSize / 2,
    });

    console.log(
      // this.simplifyAdjacencyList(
      this.graph.adjacencyList
      // )
    );

    const processedAdjacencyList = this.toNumberAdjacencyList({
      adjacencyList: this.graph.adjacencyList,
    });

    const sccInput: number[][] = processedAdjacencyList.numberAdjacencyList;
    const sccOutput: { adjacencyList: number[][]; components: number[][] } =
      scc(sccInput);
    const tileConnectedComponents = sccOutput.components.map((component) =>
      component.map((sourceNumber) =>
        this.stringToPoint(processedAdjacencyList.values[sourceNumber])
      )
    );
    console.log(tileConnectedComponents);

    const colors = chroma
      .scale(["yellow", "008ae5"])
      .colors(tileConnectedComponents.length);

    this.connectedComponentsLayer = this.map.createBlankLayer(
      "connectedComponents",
      this.tileset
    );
    this.connectedComponentsLayer.alpha = 0.5;
    this.connectedComponentsLayer.depth = -1;

    this.setDefaultLayer();

    for (const [
      index,
      tileConnectedComponent,
    ] of tileConnectedComponents.entries()) {
      const color = colors[index];
      for (const tileInComponent of tileConnectedComponent) {
        const tile = this.connectedComponentsLayer.getTileAtWorldXY(
          tileInComponent.x,
          tileInComponent.y,
          true
        );
        // Set tiles that are nodes in the connected component to a big dot
        tile.index = 2;
        tile.tint = Number(color.replace("#", "0x"));
      }
    }
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

  stringToPoint(s: string): Point {
    return JSON.parse(s);
  }

  getNeighbors(p: Point): Point[] {
    const neighbors: Point[] = [];

    const directions = [
      { x: -this.tileSize, y: 0 },
      { x: this.tileSize, y: 0 },
      { x: 0, y: -this.tileSize },
      { x: 0, y: this.tileSize },
    ];

    this.setPathLength(p.x, p.y, 0);

    for (const direction of directions) {
      const currentPosition = {
        x: p.x,
        y: p.y,
      };

      let tile = this.layer.getTileAtWorldXY(
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

        this.setPathLength(
          currentPosition.x + direction.x,
          currentPosition.y + direction.y,
          pathLength
        );
        currentPosition.x += direction.x;
        currentPosition.y += direction.y;

        tile = this.layer.getTileAtWorldXY(
          currentPosition.x + direction.x,
          currentPosition.y + direction.y,
          true
        );

        if (tile.index === 0) {
          // When building the graph, set the tile to a small dot when dashing
          tile.index = 17;
          // tile.tint = 0xffff00
        }
      }

      if (currentPosition.x !== p.x || currentPosition.y !== p.y) {
        neighbors.push(currentPosition);
      }
    }
    return neighbors;
  }
  setPathLength(worldPosX: number, worldPosY: number, pathLength: number) {
    this.walkableTiles.push({ x: worldPosX, y: worldPosY });

    const tile = this.pathLengthColorLayer.getTileAtWorldXY(
      worldPosX,
      worldPosY,
      true
    );

    console.log("setting path length");

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

  createGraph(start: Point): Graph {
    const result = new Graph();
    const stack = [this.pointToString(start)];
    const visited = {};
    visited[this.pointToString(start)] = true;
    let currentVertex: string;
    while (stack.length) {
      currentVertex = stack.pop();
      const neighbors = this.getNeighbors(
        this.stringToPoint(currentVertex)
      ).map(this.pointToString);

      for (const neighbor of neighbors) {
        result.addEdge(currentVertex, neighbor);
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          stack.push(neighbor);
        }
      }
    }
    return result;
  }
  simplifyAdjacencyList(adjacencyList: { [x: string]: any }): any {
    function toSimpleString(p: Point): string {
      return "" + p.x / this.tileSize + "," + p.y / this.tileSize;
    }
    const output = {};
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

function adjacencyListToTransitionMatrix(adjacencyList: number[][]) {
  //   const amountOfNodes = adjacencyList.length;

  const matrix = math.matrix("dense"); //amountOfNodes, amountOfNodes);

  for (const [fromNode, edges] of adjacencyList.entries()) {
    for (const toNode of edges) {
      matrix.set([fromNode, toNode], 1 / edges.length);
    }
  }
  return matrix;
}

export function adjacencyListToSteadyState(
  adjacencyList: number[][]
): number[] {
  const transitionMatrix = adjacencyList;
  // const transitionMatrix = adjacencyListToTransitionMatrix(adjacencyList);
  // console.log(JSON.stringify(transitionMatrix.toArray()));
  const shit = math.pow(transitionMatrix, 10) as math.Matrix;
  const eigs = math.eigs(math.transpose(transitionMatrix));

  if (!math.isMatrix(eigs.vectors))
    throw Error("type of eigenvectors is not matrix");
  const vectors = eigs.vectors;
  // window.vectors = vectors;
  // window.math = math;
  let correctVector: number[];

  eigs.values.forEach((val, index, array) => {
    console.log(JSON.stringify(val), abs(abs(val) - 1) < 0.0001);
    console.log("not comple ", !isComplex(val));
    if (!isComplex(val) && abs(abs(val) - 1) < 0.0001) {
      const shit = math.row(vectors, index[0]).toArray()[0];
      if (!Array.isArray(shit)) throw Error("entry in matrix is not an array");
      if (typeof shit[0] !== "number")
        throw Error("entry in vector is nut number");

      console.log(index[0], vectors, shit);
      correctVector = shit as number[];
    }
  });

  console.log(eigs);
  const normalizationScale = math.sum(correctVector);
  console.log(normalizationScale, correctVector);

  const normalizedVector = correctVector.map((val) => val / normalizationScale);
  console.log(normalizedVector);

  // eigs.values.map((val) => console.log(val));
  // console.log("eig vals",  );
  console.log("eig vecs", eigs.vectors.toString());
  const shit2 = shit.toArray()[0];
  if (Array.isArray(shit2)) return shit2 as number[];
  else throw Error("shit");
  // return shit.toArray()[0] as number[];
  // const shit2 = transitionMatrix.toArray()[0];
}

var config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  //@ts-ignore
  width: window.innerWidth,
  //@ts-ignore
  height: window.innerHeight,
  parent: "phaser-example",
  pixelArt: true,
  backgroundColor: "#000000",
  scene: [MyScene],
};

const game = new Phaser.Game(config);
