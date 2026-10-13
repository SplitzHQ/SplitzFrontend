import { onScopeDispose, readonly, ref, type Ref } from "vue";

/**
 * Reactive `window.matchMedia` result.
 * Safe during tests where `matchMedia` is missing.
 * WARNING: Avoid using this hook and prefer CSS-based solutions when possible.
 * @param query - The media query string to evaluate.
 * @returns A readonly ref that updates reactively with the match status.
 */
export function useMediaQuery(query: string): Readonly<Ref<boolean>> {
  const supported = typeof globalThis.matchMedia === "function";
  const mediaQuery = supported ? globalThis.matchMedia(query) : null;
  const matches = ref(mediaQuery?.matches ?? false);

  const onChange = (event: MediaQueryListEvent) => {
    matches.value = event.matches;
  };
  mediaQuery?.addEventListener("change", onChange);
  onScopeDispose(() => mediaQuery?.removeEventListener("change", onChange));

  return readonly(matches);
}

/**
 * Checks if the viewport is at least the Tailwind `md` breakpoint width.
 * WARNING: Avoid using this hook and prefer CSS-based solutions when possible.
 */
export function useIsDesktop(): Readonly<Ref<boolean>> {
  return useMediaQuery("(min-width: 768px)");
}
