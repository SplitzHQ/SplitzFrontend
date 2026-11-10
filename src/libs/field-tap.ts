/** Returns true when a press hits an input or a button, which handle the press themselves. */
function hitsOwnControl(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("input, button") !== null;
}

/**
 * Pointer handlers for a field frame that is larger than its input. The whole frame is the tap target, but only the input
 * takes the focus.
 * - `onMouseDown` stops the browser from moving the focus away from the input, so a phone keeps its keyboard open.
 * - `onClick` then gives the focus to the input. iOS opens the keyboard only in a user gesture, and `click` is one.
 * - A press on an input or a button in the frame goes to that control.
 *
 * The handlers are only for a pointer. The input stays in the tab order, so a keyboard or a screen reader does not use the
 * frame. That is why the frame needs no role or key handlers.
 */
export function fieldTapHandlers(getInput: () => HTMLInputElement | null | undefined) {
  return {
    onClick(event: MouseEvent): void {
      if (!hitsOwnControl(event.target)) getInput()?.focus();
    },
    onMouseDown(event: MouseEvent): void {
      if (!hitsOwnControl(event.target)) event.preventDefault();
    },
  };
}
