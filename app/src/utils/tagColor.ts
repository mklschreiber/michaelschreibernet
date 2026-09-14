/** Fixed channels — exported for reuse in tests, not meant to vary per tag. */
export const TAG_COLOR_SATURATION = 65
export const TAG_COLOR_LIGHTNESS = 85

/**
 * Derives a deterministic, light HSL background color for a tag value.
 * Same input string always produces the same output string.
 */
export function getTagColor(value: string): string {
  let hash = 5381
  for (let i = 0; i < value.length; i++) {
    hash = ((hash * 33) ^ value.charCodeAt(i)) >>> 0
  }

  const hue = hash % 360

  return `hsl(${hue}, ${TAG_COLOR_SATURATION}%, ${TAG_COLOR_LIGHTNESS}%)`
}
