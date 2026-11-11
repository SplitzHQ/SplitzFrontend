/**
 * The listeners are not passive. A passive listener cannot cancel the event, and WebKit can make a touch listener on
 * `document` passive when the options do not say otherwise.
 */
const BLOCKING_LISTENER: AddEventListenerOptions = { passive: false };

/** Cancels the default action of the event, so the browser does not start a zoom. */
function cancelZoom(event: Event): void {
  event.preventDefault();
}

/** Cancels a move with two or more fingers. One finger still scrolls the page. */
function cancelMultiTouchMove(event: TouchEvent): void {
  if (event.touches.length > 1) event.preventDefault();
}

/**
 * Stops the pinch zoom of iOS Safari, which ignores `maximum-scale` and `user-scalable` in the viewport. This is the
 * last of three layers. The viewport tag in `index.html` stops the zoom on Android, and `touch-action` in `base.css`
 * stops most pinch zooms on iOS. Reports say that a pinch during a scroll can still start a zoom, so this function
 * cancels the zoom gesture and a move with more than one finger.
 *
 * Only Safari sends `gesturestart` and `gesturechange`. Other browsers get only the `touchmove` listener.
 *
 * @returns A function that removes the listeners.
 */
export function preventPageZoom(target: Document = document): () => void {
  target.addEventListener("gesturestart", cancelZoom, BLOCKING_LISTENER);
  target.addEventListener("gesturechange", cancelZoom, BLOCKING_LISTENER);
  target.addEventListener("touchmove", cancelMultiTouchMove, BLOCKING_LISTENER);

  return () => {
    target.removeEventListener("gesturestart", cancelZoom, BLOCKING_LISTENER);
    target.removeEventListener("gesturechange", cancelZoom, BLOCKING_LISTENER);
    target.removeEventListener("touchmove", cancelMultiTouchMove, BLOCKING_LISTENER);
  };
}
