import * as Phaser from "phaser";
import chroma from "chroma-js";
import * as dat from "dat.gui";
import { Pan, Pinch, Tap } from "phaser3-rex-plugins/plugins/gestures.js";
import { htmlPhaserFunctions } from "../pages";
import assert from "assert";
import { DashEngine } from "./DashEngine";
import { Point } from "./GeometryHelpers";
import { Controls } from "./Controls";

export type PanEvent = {
  dx: number;
  dy: number;
  worldX: number;
  worldY: number;
  x: number;
  y: number;

  // gameObject: Phaser.GameObjects.GameObject;
  // lastPointer: Phaser.Input.Pointer;
  // scene:number;
};

export type PanEndEvent = {
  endWorldX: number;
  endWorldY: number;
  endX: number;
  endY: number;
};

export type PanStartEvent = {
  startWorldX: number;
  startWorldY: number;
  startX: number;
  startY: number;
};

export class DashPaintScene extends Phaser.Scene {
  player!: Phaser.GameObjects.Image;
  layer!: Phaser.Tilemaps.TilemapLayer;
  map!: Phaser.Tilemaps.Tilemap;
  tileset!: Phaser.Tilemaps.Tileset;
  connectedComponentsLayer!: Phaser.Tilemaps.TilemapLayer;
  pathLengthColorLayer!: Phaser.Tilemaps.TilemapLayer;
  fixSuggestionsLayer!: Phaser.Tilemaps.TilemapLayer;
  scoreCounter!: Phaser.GameObjects.Text;

  controls: Controls = new Controls();
  tap!: Tap;
  pinch!: Pinch;
  pan!: Pan;

  movementDirection = { x: 0, y: 0 };
  tileSize = 8;
  mapSize = 20;
  maxScore = 0;
  currentScore = 0;
  zoom = 3;
  seed: number | undefined = 321;
  paintColor = 0xff44ff;
  ccLayerDefaultAlpha = 0;
  fixLayerDefaultAlpha = 0;

  movementQueue: Point[] = [];

  gui = new dat.GUI();

  dashEngine = new DashEngine({
    spawnPoint: {
      // x: 1,
      // y: 1,
      x: this.mapSize / 2,
      y: this.mapSize / 2,
    },
  });

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
    playerSprite.add(
      "player",
      0,
      0,
      this.tileSize * 3,
      this.tileSize,
      this.tileSize
    );
    playerSprite.add(
      "wall",
      0,
      this.tileSize * 2,
      0,
      this.tileSize,
      this.tileSize
    );

    this.player = this.add.image(0, 0, playerSprite);
    this.player.depth = 3;
    this.player.tint = 0x00ffff;

    this.pathLengthColorLayer = this.map.createBlankLayer(
      "pathLengthColorLayer",
      this.tileset
    );

    this.fixSuggestionsLayer = this.map.createBlankLayer(
      "fixSuggestionsLayer",
      this.tileset
    );
    this.fixSuggestionsLayer.alpha = this.fixLayerDefaultAlpha;

    this.connectedComponentsLayer = this.map.createBlankLayer(
      "connectedComponents",
      this.tileset
    );

    this.connectedComponentsLayer.alpha = this.ccLayerDefaultAlpha;
    this.connectedComponentsLayer.depth = 1;
    this.setDefaultLayer();

    this.gui
      .add(this.connectedComponentsLayer, "alpha", 0, 1)
      .name("Show analysis");
    this.gui.add(this.fixSuggestionsLayer, "alpha", 0, 1).name("Show fixes");
    this.gui.add(this.controls, "panThreshold", 20, 200);

    htmlPhaserFunctions.startEdit = () => this.startEdit();
    htmlPhaserFunctions.stopEdit = () => this.stopEdit();
    htmlPhaserFunctions.clickReset = () => {
      this.seed = undefined;
      this.resetGame();
    };

    this.input.keyboard.on("keydown-UP", () => {
      this.controls.enqueueMovement("up");
    });
    this.input.keyboard.on("keydown-DOWN", () => {
      this.controls.enqueueMovement("down");
    });
    this.input.keyboard.on("keydown-LEFT", () => {
      this.controls.enqueueMovement("left");
    });
    this.input.keyboard.on("keydown-RIGHT", () => {
      this.controls.enqueueMovement("right");
    });

    this.pan = new Pan(this, {
      threshold: 0,
    });

    this.pan.on("pan", (pan: PanEvent) => this.controls.pan(pan));

    this.pan.on("panend", () => this.controls.panEnd());

    this.tap = new Tap(this, {
      tapInterval: 0,
    });
    this.tap.on("tap", this.handleTap);

    this.pinch = new Pinch(this);
    this.pinch.on("pinch", (pinch: Pinch) => {
      this.zoom *= pinch.scaleFactor;

      this.cameras.main.setScroll(
        this.cameras.main.scrollX - pinch.movementCenterX / 2,
        this.cameras.main.scrollY - pinch.movementCenterY / 2
      );
      this.cameras.main.zoom = this.zoom;

      this.cameras.main.stopFollow();
    });

    this.scoreCounter = this.add.text(0, -15, "test", {
      color: "black",
      fontStyle: "strong",
      resolution: 10,
    });

    const myValueToEdit = {
      playerTint: this.paintColor,
    };

    const playerColor = this.gui.addColor(myValueToEdit, "playerTint");
    playerColor.onChange((color) => {
      console.log("changing player color to ", color);
      this.paintColor = chroma(color).num();
    });

    this.gui.close();

    this.resetGame();
  }

  resetGame() {
    this.dashEngine.generateMap(this.mapSize, this.seed);

    this.dashEngine.forEachTileInRect(
      { x: 0, y: 0, width: this.mapSize, height: this.mapSize },
      (tile) => {
        this.layer.putTileAt(tile.collidable ? 2 : 0, tile.x, tile.y);
      }
    );

    this.analyzeMap();
    // this.colorMapSteadyState();
    // this.colorMapPathLengthMinMax();

    this.cameras.main.startFollow(this.player, true, 0.14, 0.14);
    this.cameras.main.setZoom(this.zoom);
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

      console.log(tapPoint);

      const isWall = scene.dashEngine.getWallAt(tapPoint);
      console.log("is wall:", isWall);

      scene.dashEngine.setWallAt(tapPoint, !isWall);

      scene.analyzeMap();
    }
  }

  // colorMapPathLengthMinMax() {f

  //   for (const point of this.walkableTiles) {
  //     const tile = this.pathLengthColorLayer.getTileAt(point.x, point.y, true);
  //     tile.index = 2;
  //     const maxPathLength = tile.properties.maxPathLength;
  //     if (typeof maxPathLength !== "number")
  //       throw new Error("maxPathLength is undefined on a walkable tile");

  //   f
  //   }
  //   this.pathLengthColorLayer.alpha = 0;
  //   this.pathLengthColorLayer.depth = -2;
  //   this.gui
  //     .add(this.pathLengthColorLayer, "alpha", 0, 1)
  //     .name("Show dash length");
  // }

  update() {
    if (!htmlPhaserFunctions.isEditing) {
      if (this.movementDirection.x === 0 && this.movementDirection.y === 0) {
        let validMovement = false;

        while (!validMovement && this.controls.movementQueue.length > 0) {
          const nextMovement = this.controls.movementQueue.shift();
          assert(nextMovement, "Tried dequeueing while queue is empty");

          const nextPosition = this.getPlayerPosition().add(nextMovement);
          if (!this.dashEngine.getWallAt(nextPosition)) {
            validMovement = true;
            this.movementDirection = nextMovement;
          }
        }
      } else {
        this.updateAngle();
        const nextPosition = this.getPlayerPosition().add(
          this.movementDirection
        );
        if (!this.dashEngine.getWallAt(nextPosition)) {
          this.setPlayerPosition(nextPosition);
        } else {
          this.movementDirection = { x: 0, y: 0 };
        }
      }

      const currentTile = this.layer.getTileAt(
        this.getPlayerPosition().x,
        this.getPlayerPosition().y
      );

      if (currentTile.tint === 0) {
        currentTile.tint = this.paintColor;
        this.currentScore++;

        this.createPaintingAnimation(currentTile);
      }
    }
    // map size: ${this.dashEngine._mapScore()},
    const canGetStuckText =
      this.dashEngine.getComponentCount() === 1
        ? ""
        : ", warning: you can get stuck";
    this.scoreCounter.text = `paint left: ${
      this.maxScore - this.currentScore
    }${canGetStuckText}`;
  }

  createPaintingAnimation(tile: Point) {
    const worldPosition = this.layer.tileToWorldXY(tile.x, tile.y);

    const newSprite = this.add.sprite(
      worldPosition.x + this.tileSize / 2,
      worldPosition.y + this.tileSize / 2,
      "tiles",
      "wall"
    );
    newSprite.tint = 0xffff88;
    const animationDuration = 300;

    this.tweens.add({
      targets: newSprite,
      duration: animationDuration,
      alpha: 0,
    });
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
    this.player.alpha = 0.5;
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
    console.time("analyseMap");

    this.setPlayerPosition(this.dashEngine.spawnPoint);

    console.time("analyseRect");

    const { rect: analysedRect, components: analysedComponents } =
      this.dashEngine.analyseRect({
        x: 0,
        y: 0,
        width: this.mapSize,
        height: this.mapSize,
      });

    console.timeEnd("analyseRect");

    this.currentScore = 0;

    const colors = chroma
      .scale(["yellow", "008ae5"])
      .colors(analysedComponents.getNodesCount());

    this.connectedComponentsLayer.replaceByIndex(
      2,
      0,
      0,
      0,
      this.mapSize,
      this.mapSize
    );

    this.layer.replaceByIndex(17, 0, 0, 0, this.mapSize, this.mapSize);

    this.maxScore = 0;
    const colorScale = chroma.scale(["green", "yellow", "red"]);
    colorScale.domain([1, 4]);

    const fixColorScale = chroma
      .scale([
        "#440154",
        "#482777",
        "#3f4a8a",
        "#31678e",
        "#26838f",
        "#1f9d8a",
        "#6cce5a",
        "#b6de2b",
        "#fee825",
      ])
      .domain([0.5, 1]);

    analysedRect.forEach((analysedTile) => {
      const tile = this.layer.getTileAt(
        analysedTile.x,
        analysedTile.y,
        true
      ) as Phaser.Tilemaps.Tile | null;

      assert(tile);

      const ccTile = this.connectedComponentsLayer.getTileAt(
        analysedTile.x,
        analysedTile.y,
        true
      );
      assert(ccTile);

      const fixTile = this.fixSuggestionsLayer.getTileAt(
        analysedTile.x,
        analysedTile.y,
        true
      );

      assert(fixTile);

      ccTile.index = 0;
      ccTile.tint = 0xffffff;
      tile.index = 0;
      tile.tint = 0xffffff;
      fixTile.index = 0;
      fixTile.tint = 0xffffff;

      if (analysedTile.isWall && analysedTile.canCollide) {
        tile.index = 2;
      } else if (analysedTile.isWall) {
        tile.index = 2;
      } else if (analysedTile.numberOfDashesPassingOver > 0) {
        tile.index = 2;
        tile.tint = 0;
      }

      if (analysedTile.numberOfDashesPassingOver >= 1) {
        ccTile.index = 17;
        // ccTile.tint = colorScale(analysedTile.numberOfDashesPassingOver).num();

        this.maxScore++;
      }

      if (analysedTile.componentId !== null) {
        const color = colors[analysedTile.componentId];
        assert(color);

        ccTile.index = 2;
        ccTile.tint = Number(color.replace("#", "0x"));
        // ccTile.tint = 0x888888;
      }
      if (analysedTile.fixScore) {
        fixTile.index = 1;
        fixTile.tint = fixColorScale(analysedTile.fixScore).num();
      }
    });

    console.timeEnd("analyseMap");
  }

  setDefaultLayer() {
    this.map.currentLayerIndex = this.map.getLayerIndexByName("ShitLayer1");
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
