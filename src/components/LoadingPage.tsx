import React from "react";
import loadingAnimation from "../assets/loadingAnimation.gif";

export function LoadingPage() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
        }}
      >
        <img
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
  );
}
