import math from "mathjs";
import { adjacencyListToSteadyState } from "./DashPaintScene";

const nodes = ["1,0", "1,1", "0,1", "2,1", "1,2"];

var adjacencyList = [
  [1, 4], // 0
  [0, 2, 3], // 1
  [3], // 2
  [2, 4], // 3
  [0, 3], //4
];

export function testEigenvector() {

  const transitionMatrix = [
    [0.6, 0.4],
    [0.15, 0.85],
  ];

  console.log("steady state", adjacencyListToSteadyState(transitionMatrix));
  const matrix = math.matrix();
}
