import { DashPaintScene } from "./DashPaintScene";

export const DashPaintConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  //@ts-ignore
  width: window.innerWidth,
  //@ts-ignore
  height: window.innerHeight,
  parent: "phaser-container",
  pixelArt: true,
  backgroundColor: "#000000",
  scene: [DashPaintScene],
};

export const DashPaintGame = new Phaser.Game(DashPaintConfig);
