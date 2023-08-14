import math from "mathjs";
import { test } from "vitest";
// shit

// import { adjacencyListToSteadyState } from "./DashPaintScene";

// shit
// @ts-expect-error unused file
const nodes = ["1,0", "1,1", "0,1", "2,1", "1,2"];
// @ts-expect-error unused file
const adjacencyList = [
  [1, 4], // 0
  [0, 2, 3], // 1
  [3], // 2
  [2, 4], // 3
  [0, 3], //4
];

test("shit", () => {
  // @ts-expect-error unused file
  const transitionMatrix = [
    [0.6, 0.4],
    [0.15, 0.85],
  ];

  // shit
  // console.log("steady state", adjacencyListToSteadyState(transitionMatrix));
  // shit
  // @ts-expect-error unused file
  const matrix = math.matrix();
});
