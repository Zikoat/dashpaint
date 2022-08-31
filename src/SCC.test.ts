import scc from "strongly-connected-components";
import { expect, test } from "vitest";

const nodes = ["1,0", "1,1", "0,1", "2,1"];

var adjacencyList = [
  [1], // 0
  [0, 2, 3], // 1
  [3], // 2
  [2], // 3
];

console.log(scc(adjacencyList));

test("shit", () => {
  expect(1).toBe(1);
});
