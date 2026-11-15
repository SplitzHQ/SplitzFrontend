import { useElementSize } from "@vueuse/core";
import {
  computed,
  type ComputedRef,
  type MaybeRefOrGetter,
  onMounted,
  type Ref,
  shallowRef,
  type ShallowRef,
  toValue,
  watch,
} from "vue";

/** Horizontal flex gap (px) between items in the row; must match Tailwind `gap-2`. */
const ITEM_GAP_PX = 8;
/** Minimum width (px) reserved for the search input; must match Tailwind `min-w-20` and `basis-20`. */
const MIN_SEARCH_INPUT_WIDTH_PX = 80;

/** Inputs for {@link useTagOverflow}. */
export interface UseTagOverflowOptions<T extends { id: string }> {
  /** Leading "With" label element whose width is subtracted from the row width. */
  labelElement: Readonly<Ref<HTMLElement | null>>;
  /** Offscreen row holding full-size copies of every tag followed by a worst-case `+N` button. */
  measurementRow: Readonly<Ref<HTMLElement | null>>;
  /** Outer bar element whose width limits how many tags fit on one line. */
  rowContainer: Readonly<Ref<HTMLElement | null>>;
  /** Selected items in display order. */
  selectedItems: MaybeRefOrGetter<readonly T[]>;
}

/** Reactive overflow state and controls returned by {@link useTagOverflow}. */
export interface UseTagOverflowReturn<T extends { id: string }> {
  /** Number of selected items hidden behind the `+N` button. */
  hiddenTagCount: ComputedRef<number>;
  /** True when the bar is expanded to wrap all tags across multiple lines. */
  isExpanded: Readonly<ShallowRef<boolean>>;
  /** Toggles `isExpanded` between collapsed single-line and expanded multi-line layout. */
  toggleExpanded: () => void;
  /** Subset of `selectedItems` currently rendered as tags. */
  visibleTags: ComputedRef<readonly T[]>;
}

/** Options for {@link countFittingTags}. */
export interface CountFittingTagsOptions {
  /** Horizontal space available for tags, the optional `+N` button, and the search input. */
  availableWidth: number;
  /** Horizontal flex gap between adjacent items in the row. */
  gap: number;
  /** Minimum width reserved for the search input at the end of the row. */
  minInputWidth: number;
  /** Measured width of the `+N` overflow button. */
  overflowButtonWidth: number;
  /** Measured width of each selected tag, in display order. */
  tagWidths: readonly number[];
}

/**
 * Measures tag and label widths from the DOM, calculates how many tags fit on one collapsed line,
 * and manages single-line and multi-line expansion.
 */
export function useTagOverflow<T extends { id: string }>({
  labelElement,
  measurementRow,
  rowContainer,
  selectedItems,
}: UseTagOverflowOptions<T>): UseTagOverflowReturn<T> {
  const isExpanded = shallowRef(false);
  /**
   * Measured width (px) of each tag by ID, read from `measurementRow`.
   * Unmeasured items default to `Infinity` so a newly added tag stays hidden until its width is known
   * and never flashes in the collapsed bar before folding into `+N`.
   */
  const tagWidthsById = shallowRef<ReadonlyMap<string, number>>(new Map());
  const overflowButtonWidth = shallowRef(0);

  const { width: rowWidth } = useElementSize(rowContainer);
  const { width: labelWidth } = useElementSize(labelElement);

  /** How many tags fit on one collapsed line. */
  const fittingTagCount = computed(() => {
    const items = toValue(selectedItems);
    return countFittingTags({
      availableWidth: rowWidth.value - labelWidth.value - ITEM_GAP_PX,
      gap: ITEM_GAP_PX,
      minInputWidth: MIN_SEARCH_INPUT_WIDTH_PX,
      overflowButtonWidth: overflowButtonWidth.value,
      tagWidths: items.map(({ id }) => tagWidthsById.value.get(id) ?? Infinity),
    });
  });

  const visibleTags = computed(() => {
    const tags = toValue(selectedItems);
    return isExpanded.value ? tags : tags.slice(0, fittingTagCount.value);
  });

  const hiddenTagCount = computed(() => toValue(selectedItems).length - visibleTags.value.length);

  /** Measures element widths of all tags and the `+N` button. */
  function measureElementWidths(): void {
    if (!measurementRow.value) return;
    const childWidths = [...measurementRow.value.children].map((item) => item.getBoundingClientRect().width);
    overflowButtonWidth.value = childWidths[childWidths.length - 1] ?? 0;
    tagWidthsById.value = new Map(toValue(selectedItems).map(({ id }, index) => [id, childWidths[index] ?? Infinity]));
  }

  /** Toggles between the collapsed single-line view and the expanded multi-line view. */
  function toggleExpanded(): void {
    isExpanded.value = !isExpanded.value;
  }

  onMounted(measureElementWidths);
  watch(() => toValue(selectedItems), measureElementWidths, { flush: "post" });

  // Auto-collapse once all selected tags fit on one line so the collapse button does not stay visible.
  watch([fittingTagCount, () => toValue(selectedItems).length], ([count, total]) => {
    if (count >= total) isExpanded.value = false;
  });

  return {
    hiddenTagCount: hiddenTagCount,
    isExpanded,
    toggleExpanded,
    visibleTags,
  };
}

/**
 * Returns how many tags fit on one line while keeping `minInputWidth` for the search input.
 * When not all tags fit, it also reserves space for the `+N` overflow button and its gap.
 */
export function countFittingTags({
  availableWidth,
  gap,
  minInputWidth,
  overflowButtonWidth,
  tagWidths,
}: CountFittingTagsOptions): number {
  // Every visible tag is followed by either the `+N` button or the search input,
  // so each visible tag occupies its own width plus one trailing gap.
  // TODO: optimize performance
  const getTagsWidthWithTrailingGaps = (count: number): number =>
    tagWidths.slice(0, count).reduce((sum, tagWidth) => sum + tagWidth + gap, 0);

  if (getTagsWidthWithTrailingGaps(tagWidths.length) + minInputWidth <= availableWidth) {
    return tagWidths.length;
  }

  const overflowButtonWithGap = overflowButtonWidth + gap;
  for (let count = tagWidths.length - 1; count > 0; count--) {
    if (getTagsWidthWithTrailingGaps(count) + overflowButtonWithGap + minInputWidth <= availableWidth) {
      return count;
    }
  }
  return 0;
}
