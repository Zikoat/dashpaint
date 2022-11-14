import React, { useState } from "react";
import dynamic from "next/dynamic";
import { htmlPhaserFunctions } from "./PhaserReactBridge";
import { LoadingPage } from "./LoadingPage";
import { GameUi } from "./GameUi";

const LoadWithoutSSR = dynamic(() => import("../ReactGame"), {
  ssr: false,
});

const defaultContextValues = {
  progress: {
    total: 0,
    painted: 0,
  },
  isLoading: false,
};

export const MyContext = React.createContext(defaultContextValues);

export default function DashPaintPage(): JSX.Element {
  const [progress, setProgress] = useState(defaultContextValues.progress);
  const [isLoading, setLoading] = useState(true);

  // export react setters so we can mutate the state in phaser
  htmlPhaserFunctions.setLoading = setLoading;
  htmlPhaserFunctions.setProgress = setProgress;

  return (
    <>
      <MyContext.Provider value={{ progress, isLoading }}>
        {isLoading ? <LoadingPage></LoadingPage> : <GameUi />}
      </MyContext.Provider>

      <div id="phaser-container"></div>
      <LoadWithoutSSR></LoadWithoutSSR>
    </>
  );
}
