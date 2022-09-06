import React, { useState } from "react";
import dynamic from "next/dynamic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import loadingAnimation from "../public/dashpaint/animations/loadingAnimation.gif";

const LoadWithoutSSR = dynamic(() => import("../src/ReactGame"), {
  ssr: false,
});

type GlobalFunctions = {
  startEdit: () => void;
  clickEdit: () => void;
  stopEdit: () => void;
  loadFinished: () => void;
  isEditing: boolean;
};

function defaultImplementation() {
  throw new Error("game not started yet");
}

export let htmlPhaserFunctions: GlobalFunctions = {
  clickEdit: defaultImplementation,
  stopEdit: defaultImplementation,
  startEdit: defaultImplementation,
  loadFinished: defaultImplementation,
  isEditing: false,
};

export default function DashPaintPage(): JSX.Element {
  const [loadFinished, setLoadFinished] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  htmlPhaserFunctions.loadFinished = () => {
    console.log("loading finished");
    setLoadFinished(true);
  };
  htmlPhaserFunctions.clickEdit = () => {
    if (isEditing) {
      htmlPhaserFunctions.stopEdit();
    } else {
      htmlPhaserFunctions.startEdit();
    }
    setIsEditing(!isEditing);
    htmlPhaserFunctions.isEditing = !isEditing;
  };

  const pencilColor = isEditing ? "white" : "gray";

  return (
    <>
      {loadFinished ? (
        <div
          style={{
            backgroundColor: "black",
            border: "2px solid white",
            position: "absolute",
            top: "1rem",
            left: "1rem",
            padding: "0.30rem",
          }}
          onClick={htmlPhaserFunctions.clickEdit}
        >
          <FontAwesomeIcon
            icon={faPencil}
            style={{ color: pencilColor }}
            size={"3x"}
          />
        </div>
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
            }}
          >
            <img
              src={loadingAnimation.src}
              alt="loading..."
              style={{
                imageRendering: "pixelated",
                width: "3rem",
                height: "3rem",
              }}
            />
          </div>
        </>
      )}

      <div id="phaser-container"></div>
      <LoadWithoutSSR></LoadWithoutSSR>
    </>
  );
}
