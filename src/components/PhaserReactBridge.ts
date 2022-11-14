import { Progress } from "./ProgressText";

export const settersToReact = {
  setProgress: (_arg: Progress) => {},
  setLoading: (_arg: boolean) => {},
  setCanGetStuck: (_arg: boolean) => {},
};

export const mutationsToPhaser = {
  setIsEditing: (_arg: boolean) => {},
  resetLevel: () => {},
};
