import * as Phaser from "phaser";
import chroma from "chroma-js";
import * as dat from "dat.gui";
import { Pinch, Swipe, Tap } from "phaser3-rex-plugins/plugins/gestures.js";
import { htmlPhaserFunctions } from "../pages";
import assert from "assert";
import { DashEngine } from "./DashEngine";
import { Dir4, Point } from "./Helpers";
import { runInThisContext } from "vm";

type SwipeExtended = Swipe & {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export class DashPaintScene extends Phaser.Scene {
  player!: Phaser.GameObjects.Image;
  layer!: Phaser.Tilemaps.TilemapLayer;
  map!: Phaser.Tilemaps.Tilemap;
  tileset!: Phaser.Tilemaps.Tileset;
  connectedComponentsLayer!: Phaser.Tilemaps.TilemapLayer;
  pathLengthColorLayer!: Phaser.Tilemaps.TilemapLayer;
  scoreCounter!: Phaser.GameObjects.Text;

  swipe!: SwipeExtended;
  tap!: Tap;
  pinch!: Pinch;

  movementDirection = { x: 0, y: 0 };
  tileSize = 8;
  // maxPathLength = 0;
  // minPathLength = Infinity;
  mapSize = 40;
  maxScore = 0;
  currentScore = 0;
  zoom = 3;
  seed: number | undefined = 321;
  paintColor = 0xff44ff;
  ccLayerDefaultAlpha = 0;

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
    playerSprite.add("player", 0, 0, 24, this.tileSize, this.tileSize);

    this.player = this.add.image(0, 0, playerSprite);
    this.player.depth = 3;
    this.player.tint = 0x00ffff;

    this.pathLengthColorLayer = this.map.createBlankLayer(
      "pathLengthColorLayer",
      this.tileset
    );
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

    htmlPhaserFunctions.startEdit = () => this.startEdit();
    htmlPhaserFunctions.stopEdit = () => this.stopEdit();
    htmlPhaserFunctions.clickReset = () => {
      this.seed = undefined;
      this.resetGame();
    };

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
      color: "white",
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
    this.dashEngine.fillWallAt(
      { x: 0, y: 0, width: this.mapSize, height: this.mapSize },
      true
    );
    this.dashEngine.fillRandom(
      {
        x: 1,
        y: 1,
        width: this.mapSize - 2,
        height: this.mapSize - 2,
      },
      0.65,
      this.seed?.toString()
    );
    this.dashEngine.fillWallAt(
      {
        x: this.dashEngine.spawnPoint.x,
        y: this.dashEngine.spawnPoint.y,
        width: 2,
        height: 1,
      },
      false
    );

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
      if (currentTile.index === 0) {
        currentTile.index = 2;
        currentTile.tint = this.paintColor;
        this.currentScore++;
      }
    }

    this.scoreCounter.text = `dots: ${this.maxScore - this.currentScore}`;
  }

  enqueueMovement(direction: Dir4) {
    const nextMovement = new Phaser.Math.Vector2(0, 0);

    if (direction === "left") nextMovement.x = -1;
    else if (direction === "right") nextMovement.x = 1;
    else if (direction === "up") nextMovement.y = -1;
    else if (direction === "down") nextMovement.y = 1;

    this.movementQueue.push(nextMovement);
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

      ccTile.index = 0;
      ccTile.tint = 0xffffff;
      tile.index = 0;
      tile.tint = 0xffffff;

      if (analysedTile.isWall && analysedTile.canCollide) {
        tile.index = 2;
      } else if (analysedTile.isWall) {
        ccTile.index = 2;
        ccTile.tint = 0xffffff;
        tile.index = 0;
      } else {
        tile.index = 0;
        tile.tint = 0xffffff;
      }

      if (analysedTile.numberOfDashesPassingOver >= 1) {
        ccTile.index = 17;
        ccTile.tint = colorScale(analysedTile.numberOfDashesPassingOver).num();

        this.maxScore++;
      }

      if (analysedTile.componentId !== null) {
        const color = colors[analysedTile.componentId];
        assert(color);

        ccTile.index = 2;
        ccTile.tint = Number(color.replace("#", "0x"));
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
