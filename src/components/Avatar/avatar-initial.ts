/** The color families of the tile of a person with no picture. Each family has steps that change with the theme. */
export const AVATAR_TONES = ["brand", "leaf", "waterblue", "purple", "magenta", "rosered", "yellow"] as const;

/** One color family of `AVATAR_TONES`. */
export type AvatarTone = (typeof AVATAR_TONES)[number];

/**
 * The fill and the text color of each family. Util tokens change with the theme, so one step fits both themes.
 * Leaf, waterblue and yellow use step 600 for the text, because step 500 of these families is too pale in the light
 * theme. The names are complete, so a test can check that each token exists.
 */
export const AVATAR_TONE_STYLES: Record<AvatarTone, { backgroundColor: string; color: string }> = {
  brand: { backgroundColor: "var(--util-color-brand-100)", color: "var(--util-color-brand-500)" },
  leaf: { backgroundColor: "var(--util-color-leaf-100)", color: "var(--util-color-leaf-600)" },
  magenta: { backgroundColor: "var(--util-color-magenta-100)", color: "var(--util-color-magenta-500)" },
  purple: { backgroundColor: "var(--util-color-purple-100)", color: "var(--util-color-purple-500)" },
  rosered: { backgroundColor: "var(--util-color-rosered-100)", color: "var(--util-color-rosered-500)" },
  waterblue: { backgroundColor: "var(--util-color-waterblue-100)", color: "var(--util-color-waterblue-600)" },
  yellow: { backgroundColor: "var(--util-color-yellow-100)", color: "var(--util-color-yellow-600)" },
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
