export function legacyHashPath(hash: string): string | null {
  if (!hash.startsWith('#/')) return null

  const path = hash.slice(1)

  // '//host' and '/\host' would resolve to another origin and make replaceState throw.
  if (path.startsWith('//') || path.startsWith('/\\')) return null

  return path
}

export function translateLegacyHashUrl(): void {
  const path = legacyHashPath(window.location.hash)

  if (path === null) return

  try {
    window.history.replaceState(window.history.state, '', path)
  } catch {
    // A failed translation must never keep the app from mounting.
  }
}
