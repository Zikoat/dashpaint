import React, { useState } from "react";
import dynamic from "next/dynamic";
import { htmlPhaserFunctions } from "./PhaserReactBridge";
import { LoadingPage } from "./LoadingPage";
import { GameUi } from "./GameUi";

const LoadWithoutSSR = dynamic(() => import("../ReactGame"), {
  ssr: false,
});

export default function DashPaintPage(): JSX.Element {
  const [loadFinished, setLoadFinished] = useState(false);
  htmlPhaserFunctions.loadFinished = () => {
    setLoadFinished(true);
  };

  return (
    <>
      {loadFinished ? <GameUi /> : <LoadingPage></LoadingPage>}
      <div id="phaser-container"></div>
      <LoadWithoutSSR></LoadWithoutSSR>
    </>
  );
}
