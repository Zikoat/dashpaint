import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import DashPaintPage from "./components/DashPaintPage";
import { DashPaintConfig } from "./DashPaintConfig";
import { Game } from "phaser";

declare global {
  interface Window {
    game: Phaser.Game;
  }
}

window.addEventListener("load", () => {
  window.game = new Game(DashPaintConfig);
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <DashPaintPage />
  </React.StrictMode>,
);
