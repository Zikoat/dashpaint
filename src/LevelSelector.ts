import { DashMap } from "./DashMap";
import { Point } from "./GeometryHelpers";

export class LevelSelector {
  static getLevel(levelNumber: number): {
    dashMap: DashMap;
    spawnPoint: Point;
  } {
    const mapString = levels[levelNumber];
    if (mapString === undefined)
      throw Error(`level number ${levelNumber} doesnt exist`);
    return DashMap.fromString(mapString);
  }
}

const levels = [
  `....
S##.
###.
###.`,
  `.#..#.##....#.....
##..#..........###
.#.##...##.....#..
..####...###...###
.#.......#.#...##.
#...#.######...###
.#..#.#....#.#.#..
##..#.#..#.##..#..
..#.#...##..#..#..
....#..#.S....#...
....##.#..##......
#....#.##.#.####.#
........##.#.....#
#....##...........
...#..#.##..###..#
#.#.....###..#....
.#....#..##..###.#
..#.###.#.#.....#.`,
];
