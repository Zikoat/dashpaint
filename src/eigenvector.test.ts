import { adjacencyListToSteadyState } from ".";

const nodes = ["1,0", "1,1", "0,1", "2,1", "1,2"];

var adjacencyList = [
  [1, 4], // 0
  [0, 2, 3], // 1
  [3], // 2
  [2, 4], // 3
  [0, 3], //4
];


export function testEigenvector() {
  //   const transitionMatrix = math.matrix([
  //     [0.6, 0.4],
  //     [0.15, 0.85],
  //   ])

  console.log("steady state", adjacencyListToSteadyState(adjacencyList));
  //   transitionMatrix.expm1(5).;
  //   console.log("Powered", shit.toArray());

  //   var e = new EigenvalueDecomposition(transitionMatrix);
  //   console.log(e);
  //   var real = e.realEigenvalues;
  //   var imaginary = e.imaginaryEigenvalues;
  //   var vectors = e.eigenvectorMatrix;
  //   console.log("real", real);
  //   console.log("imaginary", imaginary);
  //   console.log("vectors", vectors.to2DArray());

  //   const v = Matrix.rowVector([1, 0, 0, 0]);
}
