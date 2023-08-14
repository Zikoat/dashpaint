import { describe, expect, it } from "vitest";
import {
  addVectors,
  subtractVectors,
  isEqual,
  normalizeVector,
  isVector,
  isInRect,
  pointInRectToIndex,
} from "./GeometryHelpers";

describe("Vectors", () => {
  it("should add vectors", () => {
    const a = { x: 1, y: 1 };
    const b = { x: 1, y: 1 };

    const result = addVectors(a, b);

    expect(result).toMatchInlineSnapshot(`
      {
        "x": 2,
        "y": 2,
      }
    `);
  });

  it("should subtract vectors", () => {
    const a = { x: 1, y: 1 };
    const b = { x: 1, y: 1 };

    const result = subtractVectors(a, b);

    expect(result).toMatchInlineSnapshot(`
      {
        "x": 0,
        "y": 0,
      }
    `);
  });

  it("should check for equality", () => {
    const a = { x: 1, y: 1 };
    const b = { x: 1, y: 1 };

    const result = isEqual(a, b);

    expect(result).toBe(true);
  });

  it("should normalize a vector", () => {
    const a = { x: 2, y: 0 };

    const result = normalizeVector(a);

    expect(result).toMatchInlineSnapshot(`
      {
        "x": 1,
        "y": 0,
      }
    `);
  });

  it("should fail to normalize a vector if it is not orthogonal", () => {
    const a = { x: 2, y: 1 };

    expect(() => normalizeVector(a)).toThrow(
      "Non-orthogonal vectors are not allowed",
    );
  });

  it("should recognise vectors", () => {
    expect(isVector({ x: 1, y: 2 })).toBe(true);
    expect(isVector({ x: "1", y: 2 })).toBe(false);
  });
});

describe("isInRect", () => {
  it("should determine if a point is in a rect", () => {
    expect(
      isInRect({ x: 0, y: 0 }, { x: -1, y: -1, width: 3, height: 3 }),
    ).toBe(true);
    expect(isInRect({ x: 0, y: 0 }, { x: 0, y: 0, width: 1, height: 1 })).toBe(
      true,
    );
    expect(
      isInRect({ x: 1, y: -1 }, { x: 1, y: -1, width: 1, height: 1 }),
    ).toBe(true);
  });

  it("should determine if a point is outside a rect", () => {
    expect(
      isInRect({ x: 3, y: 3 }, { x: -1, y: -1, width: 3, height: 3 }),
    ).toBe(false);
    expect(isInRect({ x: -1, y: 0 }, { x: 0, y: 0, width: 1, height: 1 })).toBe(
      false,
    );
    expect(isInRect({ x: 0, y: 1 }, { x: 0, y: 0, width: 1, height: 1 })).toBe(
      false,
    );
    expect(isInRect({ x: 4, y: 4 }, { x: 1, y: 1, width: 3, height: 3 })).toBe(
      false,
    );
  });

  it("should fail if rect has 0 or less area", () => {
    expect(() =>
      isInRect({ x: 0, y: 0 }, { x: 0, y: 0, width: -1, height: -1 }),
    ).toThrowError("rect has no area");
    expect(() =>
      isInRect({ x: 0, y: 0 }, { x: 0, y: 0, width: 0, height: 0 }),
    ).toThrowError("rect has no area");
    expect(() =>
      isInRect({ x: 0, y: 0 }, { x: 0, y: 0, width: 1, height: 0 }),
    ).toThrowError("rect has no area");
  });
});

describe("pointToRectIndex", () => {
  it("should return the index to a 1d array of a point in a rect", () => {
    expect(
      pointInRectToIndex({ x: 0, y: 0 }, { x: 0, y: 0, width: 3, height: 3 }),
    ).toBe(0);
    expect(
      pointInRectToIndex({ x: 0, y: 0 }, { x: -1, y: -1, width: 3, height: 3 }),
    ).toBe(4);
    expect(
      pointInRectToIndex({ x: 3, y: 3 }, { x: 1, y: 1, width: 3, height: 3 }),
    ).toBe(8);
    expect(
      pointInRectToIndex({ x: 0, y: 0 }, { x: 0, y: 0, width: 1, height: 1 }),
    ).toBe(0);
  });
  it("should fail if the point is outside the rect", () => {
    expect(() =>
      pointInRectToIndex({ x: 4, y: 4 }, { x: 1, y: 1, width: 3, height: 3 }),
    ).toThrowErrorMatchingInlineSnapshot('"point is outside rect"');
  });
});
