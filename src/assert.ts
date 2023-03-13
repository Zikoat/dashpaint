export function assert(condition: boolean): asserts condition {
  if (!condition)
    throw Error("assertion failed");
}
