/** The color families of the tile of a person with no picture. Each family has steps that change with the theme. */
export const AVATAR_TONES = ["brand", "leaf", "waterblue", "purple", "magenta", "rosered", "yellow"] as const;

/** One color family of `AVATAR_TONES`. */
export type AvatarTone = (typeof AVATAR_TONES)[number];

/**
 * The fill and the text color of each family. The `comp-palette-avatar-*` tokens change with the theme. The generator in
 * `scripts/color-scales/` picks their steps. The names are complete, so a test can check that each token exists.
 */
export const AVATAR_TONE_STYLES: Record<AvatarTone, { backgroundColor: string; color: string }> = {
  brand: { backgroundColor: "var(--comp-palette-avatar-brand-fill)", color: "var(--comp-palette-avatar-brand-text)" },
  leaf: { backgroundColor: "var(--comp-palette-avatar-leaf-fill)", color: "var(--comp-palette-avatar-leaf-text)" },
  magenta: {
    backgroundColor: "var(--comp-palette-avatar-magenta-fill)",
    color: "var(--comp-palette-avatar-magenta-text)",
  },
  purple: {
    backgroundColor: "var(--comp-palette-avatar-purple-fill)",
    color: "var(--comp-palette-avatar-purple-text)",
  },
  rosered: {
    backgroundColor: "var(--comp-palette-avatar-rosered-fill)",
    color: "var(--comp-palette-avatar-rosered-text)",
  },
  waterblue: {
    backgroundColor: "var(--comp-palette-avatar-waterblue-fill)",
    color: "var(--comp-palette-avatar-waterblue-text)",
  },
  yellow: {
    backgroundColor: "var(--comp-palette-avatar-yellow-fill)",
    color: "var(--comp-palette-avatar-yellow-text)",
  },
};

/**
 * Returns the first character of a name, in upper case. An empty name returns null, and the avatar then shows the
 * silhouette. The array holds code points, so an emoji or a rare Chinese character stays in one piece.
 */
export function avatarInitial(name: string): string | null {
  const [first] = Array.from(name.trim());
  return first ? first.toLocaleUpperCase() : null;
}

/** Returns the same color family for the same name, so a person keeps one color on all pages. */
export function avatarTone(name: string): AvatarTone {
  let hash = 0;
  for (const character of name) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) >>> 0;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}
