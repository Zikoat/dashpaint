import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { MyContext } from "./DashPaintPage";

export function ResetButton() {
  const { resetLevel } = useContext(MyContext);
  return (
    <button
      style={{
        backgroundColor: "black",
        border: "2px solid white",
        padding: "0.30rem",
        margin: "0.25rem",
      }}
      onClick={resetLevel}
    >
      <FontAwesomeIcon
        icon={faRotateRight}
        style={{ color: "white" }}
        size={"3x"}
      />
    </button>
  );
}
