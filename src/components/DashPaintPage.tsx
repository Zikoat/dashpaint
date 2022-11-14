import React, { useState } from "react";
import dynamic from "next/dynamic";
import { mutationsToPhaser, settersToReact } from "./PhaserReactBridge";
import { LoadingPage } from "./LoadingPage";
import { GameUi } from "./GameUi";

const LoadWithoutSSR = dynamic(() => import("../ReactGame"), {
  ssr: false,
});

export const reactInitialState = {
  progress: {
    total: 0,
    painted: 0,
  },
  isLoading: true,
  isEditing: false,
  mutateEditing: (arg: boolean) => {},
  stuckable: false,
  resetLevel: () => {},
};

export const MyContext = React.createContext(reactInitialState);

export default function DashPaintPage(): JSX.Element {
  const [progress, setProgress] = useState(reactInitialState.progress);
  const [isLoading, setLoading] = useState(reactInitialState.isLoading);
  const [isEditing, setIsEditing] = useState(reactInitialState.isEditing);
  const [isStuckable, setIsStuckable] = useState(reactInitialState.stuckable);

  // export react setters so we can mutate the state in phaser
  settersToReact.setLoading = setLoading;
  settersToReact.setProgress = setProgress;
  settersToReact.setCanGetStuck = setIsStuckable;

  // pass down phaser setters so we can mutate the state in react
  function mutateEditing(newEditing: boolean) {
    setIsEditing(newEditing);
    mutationsToPhaser.setIsEditing(newEditing);
  }

  return (
    <>
      <MyContext.Provider
        value={{
          progress,
          isLoading,
          isEditing,
          mutateEditing,
          stuckable: isStuckable,
          resetLevel: mutationsToPhaser.resetLevel,
        }}
      >
        {isLoading ? <LoadingPage></LoadingPage> : <GameUi />}
      </MyContext.Provider>

      <div id="phaser-container"></div>
      <LoadWithoutSSR></LoadWithoutSSR>
    </>
  );
}
