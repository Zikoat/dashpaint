import "../src/PhaserGame";

import { DashPaintGame } from "../src/PhaserGame";

// https://nextjs.org/docs/basic-features/fast-refresh
// > If you edit a file with exports that aren't React components, Fast Refresh
// > will re-run both that file, and the other files importing it.

export const forceRefresh = DashPaintGame;

export default function ReactGame(): JSX.Element {
  return <></>;
}
