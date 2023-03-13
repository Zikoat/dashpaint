import React from "react";

export function FullscreenButton() {
  return (
    <button onClick={() => window.game.scale.toggleFullscreen()}>
      fullscreen
    </button>
  );
}
