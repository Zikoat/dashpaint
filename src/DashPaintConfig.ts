import { DashPaintScene, theme } from "./DashPaintScene";

export const DashPaintConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  //@ts-ignore
  width: window.innerWidth,
  //@ts-ignore
  height: window.innerHeight,
  parent: "phaser-container",
  pixelArt: true,
  backgroundColor: theme.colors[theme.index]?.[0],
  scene: [DashPaintScene],
  input: {
    // shit is this needed?
    keyboard: true,
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    // `fullscreenTarget` must be defined for phones to not have a small margin during fullscreen.
    fullscreenTarget: "app",
  },
};
