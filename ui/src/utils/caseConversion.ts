
export function toCamelCase<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) {
    return input.map((item) => toCamelCase(item)) as unknown as T
  }

  if (input !== null && typeof input === "object" && !(input instanceof Date)) {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>).map(([key, value]) => [
        key.charAt(0).toLowerCase() + key.slice(1),
        toCamelCase(value),
      ])
    ) as T
  }

  return input as T
}
