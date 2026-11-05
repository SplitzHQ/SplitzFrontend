import { computed, shallowRef, watch, type ComputedRef, type Ref } from "vue";

/** The open sheets, in the order they opened. The last one is on top. Two sheets can be open at once. */
const openSheets = shallowRef<readonly symbol[]>([]);

/**
 * Adds a sheet to the stack while it is open, and tells the sheet when another sheet opened over it.
 * The cleanup also runs on unmount, so a sheet that a route change removes does not stay in the stack.
 */
export function useSheetStack(open: Readonly<Ref<boolean>>): { isBehind: ComputedRef<boolean> } {
  const id = Symbol("sheet");

  watch(
    open,
    (isOpen, _previous, onCleanup) => {
      if (!isOpen) return;
      openSheets.value = [...openSheets.value, id];
      onCleanup(() => {
        openSheets.value = openSheets.value.filter((sheet) => sheet !== id);
      });
    },
    { immediate: true }
  );

  const isBehind = computed(() => {
    const position = openSheets.value.indexOf(id);
    return position !== -1 && position < openSheets.value.length - 1;
  });

  return { isBehind };
}
