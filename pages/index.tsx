import React, { useState } from "react";
import dynamic from "next/dynamic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import loadingAnimation from "../public/dashpaint/animations/loadingAnimation.gif";
import Image from "next/image";

const LoadWithoutSSR = dynamic(() => import("../src/ReactGame"), {
  ssr: false,
});

type GlobalFunctions = {
  startEdit: () => void;
  clickEdit: () => void;
  stopEdit: () => void;
  loadFinished: () => void;
  isEditing: boolean;
  clickReset: () => void;
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
  clickReset: defaultImplementation,
};

export default function DashPaintPage(): JSX.Element {
  const [loadFinished, setLoadFinished] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  htmlPhaserFunctions.loadFinished = () => {
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
        <>
          <div
            className="menu"
            style={{
              borderColor: "#222",
              position: "absolute",
              top: "1rem",
              left: "1rem",
            }}
          >
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
            <button
              style={{
                backgroundColor: "black",
                border: "2px solid white",
                padding: "0.30rem",
                margin: "0.25rem",
              }}
              onClick={htmlPhaserFunctions.clickEdit}
            >
              <FontAwesomeIcon
                icon={faPencil}
                style={{ color: pencilColor }}
                size={"3x"}
              />
            </button>
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
            }}
          >
            <Image
              src={loadingAnimation}
              alt="loading..."
              width={40}
              style={{
                imageRendering: "pixelated",
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
