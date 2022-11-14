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
    <div style={{ color: "white", padding: "0.5rem 1rem"  }}>
      progress: {percentage}
      {shouldShowRemaining ? <>, only {remaining} remaining!</> : undefined}
    </div>
  );
}

export type Progress = {
  total: number;
  painted: number;
};
