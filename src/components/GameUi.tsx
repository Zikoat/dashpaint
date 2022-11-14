import React, { useState } from "react";
import { EditButton } from "./EditButton";
import { htmlPhaserFunctions } from "./PhaserReactBridge";
import { ProgressText } from "./ProgressText";
import { ResetButton } from "./ResetButton";

export function GameUi() {
  return (
    <>
      <div
        className="menu"
        style={{
          borderColor: "#222",
          position: "absolute",
          top: "1rem",
          left: "1rem",
          backgroundColor: "black",
          border: "2px solid white",
        }}
      >
        <ResetButton></ResetButton>
        <EditButton></EditButton>
        <ProgressText></ProgressText>
        <StuckText></StuckText>
      </div>
    </>
  );
}

function StuckText() {
  const [stuckable, setStuckable] = useState(false);
  htmlPhaserFunctions.setCanGetStuck = setStuckable;
  return stuckable ? <p>warning: you can get stuck</p> : null;
}
