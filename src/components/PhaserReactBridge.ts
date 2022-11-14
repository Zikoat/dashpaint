import { Progress } from "./ProgressText";

type GlobalFunctions = {
  startEdit: () => void;
  stopEdit: () => void;
  clickReset: () => void;
};

export type SettersToReact = {
  setProgress: (arg: Progress) => void;
  setLoading: (arg: boolean) => void;
  setCanGetStuck: (arg: boolean) => void;
};

export const settersToReact: SettersToReact = {
  setProgress: defaultImplementation,
  setLoading: defaultImplementation,
  setCanGetStuck: defaultImplementation,
};

type MutationsToPhaser = {
  setIsEditing: (arg: boolean) => void;
};
export const mutationsToPhaser: MutationsToPhaser = {
  setIsEditing: defaultImplementation,
};

function defaultImplementation() {
  throw new Error("game not started yet");
}

export let htmlPhaserFunctions: GlobalFunctions = {
  stopEdit: defaultImplementation,
  startEdit: defaultImplementation,
  clickReset: defaultImplementation,
};
