import React, { useContext } from "react";
import { colors } from "../colors";
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
    <p style={{ color: "white" }}>
      progress: {percentage}
      {shouldShowRemaining ? <>, only {remaining} remaining!</> : undefined}
    </p>
  );
}

export type Progress = {
  total: number;
  painted: number;
};
