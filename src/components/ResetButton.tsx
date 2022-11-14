import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { htmlPhaserFunctions } from "./PhaserReactBridge";

export function ResetButton() {
  return (
    <button
      style={{
        backgroundColor: "black",
        border: "2px solid white",
        padding: "0.30rem",
        margin: "0.25rem",
      }}
      onClick={htmlPhaserFunctions.clickReset}
    >
      <FontAwesomeIcon
        icon={faRotateRight}
        style={{ color: "white" }}
        size={"3x"}
      />
    </button>
  );
}
