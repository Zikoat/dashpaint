import React, { useContext, useState } from "react";
import { MyContext } from "./DashPaintPage";

export function StuckText() {
  const { stuckable } = useContext(MyContext);

  return stuckable ? (
    <div style={{ color: "white", padding: "0.5rem 1rem" }}>
      warning: you can get stuck
    </div>
  ) : null;
}
