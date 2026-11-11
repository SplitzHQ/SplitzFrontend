import { afterEach, describe, expect, it } from "vitest";

import { preventPageZoom } from "../prevent-page-zoom";

/** Sends a cancelable event to the document and returns true when a listener canceled it. */
function isCanceled(event: Event): boolean {
  document.dispatchEvent(event);
  return event.defaultPrevented;
}

/** Makes a `touchmove` event with the given number of fingers. jsdom has no `Touch`, so the list is a plain array. */
function touchMove(fingers: number): Event {
  const event = new Event("touchmove", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", { value: Array.from({ length: fingers }) });
  return event;
}

describe("preventPageZoom", () => {
  let stop: (() => void) | undefined;

  afterEach(() => {
    stop?.();
    stop = undefined;
  });

  it("cancels the zoom gesture of Safari", () => {
    stop = preventPageZoom();

    expect(isCanceled(new Event("gesturestart", { cancelable: true }))).toBe(true);
    expect(isCanceled(new Event("gesturechange", { cancelable: true }))).toBe(true);
  });

  it("cancels a move with two fingers", () => {
    stop = preventPageZoom();

    expect(isCanceled(touchMove(2))).toBe(true);
  });

  it("lets one finger scroll the page", () => {
    stop = preventPageZoom();

    expect(isCanceled(touchMove(1))).toBe(false);
  });

  it("removes the listeners when the returned function runs", () => {
    preventPageZoom()();

    expect(isCanceled(new Event("gesturestart", { cancelable: true }))).toBe(false);
    expect(isCanceled(touchMove(2))).toBe(false);
  });
});
