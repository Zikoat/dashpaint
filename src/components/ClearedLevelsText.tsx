import React, { useContext } from "react";
import { MyContext } from "./DashPaintPage";

export function ClearedLevelsText() {
  // just to trigger rerenders, dont know how to subscribe to localstorage yet
  useContext(MyContext);

  const clearedLevels = Number(window.localStorage.getItem("clearedLevels")) ?? 0;

  return (
    <div style={{ color: "white", padding: "0.5rem 1rem" }}>
      Total score: {clearedLevels}
    </div>
  );
}
