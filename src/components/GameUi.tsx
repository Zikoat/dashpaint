import { faCaretRight, faRotateRight } from "@fortawesome/free-solid-svg-icons";
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
      </div>
      {showNextLevelModel ? <NextLevelModal></NextLevelModal> : <></>}
    </>
  );
}

export function NextLevelModal() {
  const { nextLevel, progress } = useContext(MyContext);

  return (
    <div
      className="overlay"
      style={{
        borderColor: "#222",
        backgroundColor: "black",
        border: "2px solid white",
        position: "absolute",
        width: "10rem",
        height: "10rem",
        marginLeft: "42%",
        marginTop: "100%",
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
