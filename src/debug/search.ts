/** Lowercases text and removes all whitespace, so "Expire now" and "expirenow" match. */
export function squash(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

/**
 * Returns true when one of `names` contains the query. The panel finds rows by their own label and by the labels of
 * their choices and actions, in every locale. Each name is checked alone, so a query never runs from one name into
 * the next. An empty query matches everything.
 */
export function matchesQuery(names: readonly string[], query: string): boolean {
  const q = squash(query);
  if (q === "") return true;
  return names.some((name) => squash(name).includes(q));
}
