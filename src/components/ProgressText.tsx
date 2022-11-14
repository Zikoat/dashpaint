import React, { useContext } from "react";
import { MyContext } from "./DashPaintPage";

export function ProgressText() {
  const { progress } = useContext(MyContext);

  const percentage = Number(progress.painted / progress.total).toLocaleString(
    undefined,
    { style: "percent", maximumFractionDigits: 1 }
  );

  const remaining = progress.total - progress.painted;
  const shouldShowRemaining = remaining < 10 && remaining > 0;

  return (
    <>
      progress: {percentage}
      {shouldShowRemaining ? <>, only {remaining} remaining!</> : undefined}
    </>
  );
}

export type Progress = {
  total: number;
  painted: number;
};
