import { ref, watch } from "vue";

const THEME_KEY = "splitz:design-system-theme";

/**
 * The theme of the design-system page. True means dark.
 * The app switches themes with the `dark` class on `<html>`, so this ref sets that class.
 * `design-system.html` reads the same storage key before the first paint.
 */
export const docsDark = ref(typeof document !== "undefined" && document.documentElement.classList.contains("dark"));

watch(docsDark, (value) => {
  document.documentElement.classList.toggle("dark", value);
  try {
    localStorage.setItem(THEME_KEY, value ? "dark" : "light");
  } catch {
    // Storage can be blocked. The theme then resets on reload, which is acceptable for a dev page.
  }
});
