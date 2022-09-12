import { describe, expect, it } from "vitest";
import { MapStorage } from "./MapStorage";

describe("MapStorage", () => {
  it("should be instantiated", () => {
    const mapStorage = new MapStorage();
    expect(mapStorage).toBeInstanceOf(MapStorage);
  });

  it("should save a number at a position", () => {
    const mapStorage = new MapStorage();

    mapStorage.setAt({ x: 0, y: 0 }, 0);
    expect(mapStorage.getAt({ x: 0, y: 0 })).toBe(0);

    mapStorage.setAt({ x: 0, y: 0 }, 1);
    expect(mapStorage.getAt({ x: 0, y: 0 })).toBe(1);
  });

  it("should return null if the tile is not set", () => {
    const mapStorage = new MapStorage();

    expect(mapStorage.getAt({ x: 0, y: 0 })).toBe(null);
  });
});


