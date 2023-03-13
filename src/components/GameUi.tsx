import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { MyContext } from "./DashPaintPage";
import { EditButton } from "./EditButton";
import { ProgressText } from "./ProgressText";
import { ResetButton } from "./ResetButton";
import { StuckText } from "./StuckText";

export function GameUi() {
  const { progress } = useContext(MyContext);

  const showNextLevelModel = progress.painted === progress.total;

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
        <button onClick={() => window.game.scale.toggleFullscreen()}>
          fullscreen
        </button>
      {showNextLevelModel ? <NextLevelModal></NextLevelModal> : <></>}
      </div>
    </>
  );
}

export function NextLevelModal() {
  const { nextLevel } = useContext(MyContext);

  return (
    <div
      style={{
        borderColor: "#222",
        backgroundColor: "black",
        border: "2px solid white",
        position: "absolute",
        width: "10rem",
        height: "10rem",
        color: "white",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      Good job!
      <br></br>
      <button
        style={{
          backgroundColor: "black",
          border: "2px solid white",
          padding: "0.30rem",
          margin: "0.25rem",
          width: "5rem",
          color: "white",
        }}
        onClick={nextLevel}
      >
        Next level
        <br></br>
        <FontAwesomeIcon
          icon={faCaretRight}
          style={{ color: "white" }}
          size={"3x"}
        />
      </button>
    </div>
  );
}
