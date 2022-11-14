import React from "react";
import { EditButton } from "./EditButton";
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
      </div>
    </>
  );
}

function ProgressText() {
  return <p>progress: 1</p>;
}
