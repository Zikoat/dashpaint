import { Progress } from "./ProgressText";

type GlobalFunctions = {
  startEdit: () => void;
  clickEdit: () => void;
  stopEdit: () => void;
  setLoading: (arg: boolean) => void;
  isEditing: boolean;
  clickReset: () => void;
  setProgress: (arg: Progress) => void;
  setCanGetStuck: (arg: boolean) => void;
};

function defaultImplementation() {
  throw new Error("game not started yet");
}

export let htmlPhaserFunctions: GlobalFunctions = {
  clickEdit: defaultImplementation,
  stopEdit: defaultImplementation,
  startEdit: defaultImplementation,
  setLoading: defaultImplementation,
  isEditing: false,
  clickReset: defaultImplementation,
  setProgress: () => {},
  setCanGetStuck: () => {},
};
