import React from "react";
import dynamic from "next/dynamic";

const LoadWithoutSSR = dynamic(() => import("../src/ReactGame"), {
  ssr: false,
});

export default function DashPaintPage(): JSX.Element {
  return (
    <>
      <div id="phaser-container"></div>
      <LoadWithoutSSR></LoadWithoutSSR>
    </>
  );
}
