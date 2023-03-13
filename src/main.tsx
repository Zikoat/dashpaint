import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import "phaser";
import DashPaintPage from "./components/DashPaintPage";
import { DashPaintConfig } from "./PhaserGame";
import { Game } from "phaser";

window.addEventListener("load", () => {
  window.game = new Game(DashPaintConfig);
});

declare global {
  interface Window {
    game: Phaser.Game;
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <DashPaintPage />
  </React.StrictMode>
);
