import "./style.css";
import "phaser";

class DashPaintScene extends Phaser.Scene {
  create() {
    const text = this.add.text(0, 0, "🎉", {
      resolution: 10,
    });
    this.cameras.main.startFollow(text);
    this.cameras.main.zoom = 5;
  }
}

const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  scene: [DashPaintScene],
  input: {
    keyboard: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  render: { pixelArt: false, antialias: true },
  scale: {
    mode: Phaser.Scale.RESIZE,
    // `fullscreenTarget` must be defined for phones to not have
    // a small margin during fullscreen.
    fullscreenTarget: "app",
    // expandParent: false,
  },
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.addEventListener("load", () => {
  window.game = new Game(GameConfig);
});

declare global {
  interface Window {
    game: Phaser.Game;
  }
}
