import { type MaybeRefOrGetter, onScopeDispose, type Ref, toValue, watch } from "vue";

import { MOTION_EASING, motionMs } from "@/libs/motion";

/** Subpixel position and width of a tag relative to its parent element. */
interface TagPosition {
  left: number;
  top: number;
  width: number;
}

/** Inputs for {@link useTagRowAnimation}. */
export interface UseTagRowAnimationOptions {
  /** True when the row wraps across multiple lines; false when collapsed to one line. */
  isExpanded: MaybeRefOrGetter<boolean>;
  /** Outer row element whose height animates when line count changes. */
  rowContainer: Readonly<Ref<HTMLElement | null>>;
  /** Selected items watched to animate additions, removals, and height changes. */
  selectedItems: MaybeRefOrGetter<readonly unknown[]>;
  /** Rendered tag wrapper elements in the row. Captured before DOM updates to pin leaving tags. */
  tagElements: MaybeRefOrGetter<readonly HTMLElement[] | null>;
  /**
   * Elements after the tags (such as the overflow button and search input) that jump to a new line
   * when expanding or collapsing and fade in there. Null entries are skipped.
   */
  trailingElements: MaybeRefOrGetter<readonly (HTMLElement | null)[]>;
  enableMoveTransition: Ref<boolean>;
}

/** Transition bindings and animation controls returned by {@link useTagRowAnimation}. */
export interface UseTagRowAnimationReturn {
  /** `@before-leave` handler that pins a leaving tag to its position from before the DOM update. */
  pinLeavingTagPosition: (element: Element) => void;
}

/**
 * Coordinates `<TransitionGroup>` FLIP movement, leaving-tag pinning, row height animation,
 * and trailing-element fade-ins when tags change or the row expands and collapses.
 *
 * - Adding or removing an item slides remaining items with FLIP (`row-move`) and animates row
 *   height if wrapping changes.
 * - When `.row-leave-active` takes a leaving tag out of flow (`position: absolute`), `pinLeavingTag`
 *   locks it to its previous subpixel coordinates so it fades out in place.
 * - Calling `disableMoveTransition()` before expanding or collapsing turns off FLIP sliding so
 *   `trailingElements` jump straight to their new line and fade in there.
 * - Height animations set `overflow: clip` while running so wrapped tags stay clipped inside the
 *   shrinking row.
 */
export function useTagRowAnimation({
  isExpanded,
  rowContainer,
  selectedItems,
  tagElements,
  trailingElements,
  enableMoveTransition,
}: UseTagRowAnimationOptions): UseTagRowAnimationReturn {
  /** Row height (px) recorded right before Vue updates the DOM. */
  let previousRowHeight = 0;
  let rowHeightAnimation: Animation | undefined;
  /** Position and width of each rendered tag relative to its parent before Vue updates the DOM. */
  let previousTagPositions = new Map<HTMLElement, TagPosition>();

  /**
   * Records the row height and each rendered tag's subpixel position before Vue updates the DOM.
   * `@before-leave` runs after flex-wrap classes and sibling elements have already updated, so
   * leaving tags need this snapshot to fade out at their old visual position.
   */
  function captureLayoutBeforeUpdate(): void {
    previousRowHeight = rowContainer.value?.getBoundingClientRect().height ?? 0;
    previousTagPositions = new Map();
    toValue(tagElements)?.forEach((tagElement) => {
      // Read subpixel coordinates from `getBoundingClientRect()`; integer `offsetLeft` and `offsetTop` can round by 1px.
      const tagRect = tagElement.getBoundingClientRect();
      const parentRect = tagElement.parentElement?.getBoundingClientRect();
      previousTagPositions.set(tagElement, {
        left: tagRect.left - (parentRect?.left ?? 0),
        top: tagRect.top - (parentRect?.top ?? 0),
        width: tagRect.width,
      });
    });
  }

  /**
   * Animates the row height from `previousRowHeight` to its updated height.
   * Cancels any running height animation before measuring so rapid toggles continue smoothly from
   * the interrupted height captured in `previousRowHeight` to the true target height.
   * TODO: use 'calc-size()' when it becomes widely supported by modern browsers.
   */
  function animateRowHeight(): void {
    const container = rowContainer.value;
    if (!container) return;
    rowHeightAnimation?.cancel();
    container.style.overflow = "";
    const newRowHeight = container.getBoundingClientRect().height;
    const duration = motionMs("container");
    if (duration === 0 || Math.abs(newRowHeight - previousRowHeight) < 1) return;

    container.style.overflow = "clip";
    rowHeightAnimation = container.animate([{ height: `${previousRowHeight}px` }, { height: `${newRowHeight}px` }], {
      duration,
      easing: MOTION_EASING.standard,
    });
    rowHeightAnimation.onfinish = () => {
      container.style.overflow = "";
    };
  }

  /**
   * Fades in `trailingElements` at their new position after a manual expand or collapse.
   * Skips auto-collapse caused by removing tags (`enableMoveTransition` is true), where items
   * slide into place with FLIP instead. On manual collapse, `trailingElements` jump back to line 1
   * where overflowing tags are still fading out, so the fade-in waits for the exit transition first.
   */
  function fadeInTrailingElements(): void {
    if (enableMoveTransition.value) return;
    const expanded = toValue(isExpanded);
    const fadeDuration = motionMs(expanded ? "container" : "state");
    if (fadeDuration === 0) return;
    const fadeDelay = expanded ? 0 : motionMs("exit");

    toValue(trailingElements).forEach((element) => {
      if (!element) return;
      element.getAnimations().forEach((animation) => animation.cancel());
      element.animate([{ opacity: 0 }, { opacity: 1 }], {
        delay: fadeDelay,
        duration: fadeDuration,
        easing: MOTION_EASING.standard,
        fill: "backwards",
      });
    });
  }

  /**
   * Pins a leaving tag to its coordinates from before the DOM update so it fades out in place
   * once `.row-leave-active` sets `position: absolute`.
   */
  function pinLeavingTagPosition(element: Element): void {
    const tagElement = element as HTMLElement;
    const previousPosition = previousTagPositions.get(tagElement);
    tagElement.style.left = `${previousPosition?.left ?? tagElement.offsetLeft}px`;
    tagElement.style.top = `${previousPosition?.top ?? tagElement.offsetTop}px`;
    tagElement.style.width = `${previousPosition?.width ?? tagElement.offsetWidth}px`;
  }

  // Snapshot layout before Vue patches the DOM, then run height and fade animations after the patch.
  watch(() => [toValue(isExpanded), toValue(selectedItems)], captureLayoutBeforeUpdate, { flush: "pre" });
  watch(() => toValue(isExpanded), fadeInTrailingElements, { flush: "post" });
  watch(() => [toValue(isExpanded), toValue(selectedItems)], animateRowHeight, { flush: "post" });

  // Re-enable FLIP sliding when selected items change (manual expand/collapse disables it).
  watch(
    () => toValue(selectedItems),
    () => {
      enableMoveTransition.value = true;
    }
  );

  onScopeDispose(() => {
    rowHeightAnimation?.cancel();
  });

  return {
    pinLeavingTagPosition,
  };
}
