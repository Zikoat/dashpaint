export function assert(
  condition: unknown,
  message?: string,
): asserts condition {
  if (!condition) throw Error(message ?? "assertion failed");
}
