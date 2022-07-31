import * as Phaser from "phaser";

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "phaser-example",
  pixelArt: true,
  backgroundColor: "#000000",
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var player: { x: number; y: number; angle: number };
var layer: {
  getTileAtWorldXY: (arg0: number, arg1: number, arg2: boolean) => any;
};
var cursors: { left: any; right: any; up: any; down: any };

new Phaser.Game(config);

class MyGame extends Phaser.Scene {
  
}

function preload() {
  this.load.image("tiles", [
    "../public/phaser3examples/drawtiles1.png",
    "../public/phaser3examples/drawtiles1_n.png",
  ]);
  this.load.image("car", "../public/phaser3examples/car90.png");
  this.load.tilemapCSV("map", "../public/phaser3examples/grid.csv");
}

function create() {
  var map = this.make.tilemap({ key: "map", tileWidth: 32, tileHeight: 32 });

  var tileset = map.addTilesetImage("tiles", null, 32, 32, 1, 2);

  layer = map.createLayer(0, tileset, 0, 0);
  player = this.add.image(32 + 16, 32 + 16, "car");

  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  
  if (this.input.keyboard.checkDown(cursors.left, 100)) {
    var tile = layer.getTileAtWorldXY(player.x - 32, player.y, true);

    if (tile.index === 2) {
      //  Blocked, we can't move
    } else {
      player.x -= 32;
      player.angle = 180;
    }
  } else if (this.input.keyboard.checkDown(cursors.right, 100)) {
    var tile = layer.getTileAtWorldXY(player.x + 32, player.y, true);

    if (tile.index === 2) {
      //  Blocked, we can't move
    } else {
      player.x += 32;
      player.angle = 0;
    }
  } else if (this.input.keyboard.checkDown(cursors.up, 100)) {
    var tile = layer.getTileAtWorldXY(player.x, player.y - 32, true);

    if (tile.index === 2) {
      //  Blocked, we can't move
    } else {
      player.y -= 32;
      player.angle = -90;
    }
  } else if (this.input.keyboard.checkDown(cursors.down, 100)) {
    var tile = layer.getTileAtWorldXY(player.x, player.y + 32, true);

    if (tile.index === 2) {
      //  Blocked, we can't move
    } else {
      player.y += 32;
      player.angle = 90;
    }
  }
}
