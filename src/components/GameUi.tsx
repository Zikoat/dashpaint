import React from "react";
import { EditButton } from "./EditButton";
import { FullscreenButton } from "./FullscreenButton";
import { ProgressText } from "./ProgressText";
import { ResetButton } from "./ResetButton";
import { StuckText } from "./StuckText";

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
        <FullscreenButton></FullscreenButton>
      </div>
    </>
  );
}
