import { DashMap } from "./DashMap";
import { Point } from "./GeometryHelpers";
import { levels } from "./LevelSelector.test";

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
