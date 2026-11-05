<script setup lang="ts">
import { PhCaretUp } from "@phosphor-icons/vue";
import { useElementSize } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import { computed, nextTick, onMounted, shallowRef, useTemplateRef, watch } from "vue";

import TextInput from "@/components/TextInput/TextInput.vue";
import { MOTION_EASING, motionMs } from "@/libs/motion";

import { fitCount } from "./fit-count";
import UserTag from "./UserTag.vue";

/**
 * The row with the selected people and the search field. When the tags do not fit, the row folds the last tags into a `+N`
 * button. A tap on the button opens the row to more lines, and a tap on the arrow closes it.
 *
 * The motion uses only opacity, translation and the height of the row, so nothing stretches. A tag that leaves goes out of
 * the flow at once, so the other items move one time. A tap on `+N` or the arrow does not move the tags that stay. The row
 * changes its height and clips what it holds, so a tag on the second line fades out inside the row and not over the list.
 * The button and the field change their place on that tap, so they fade in at the new place and do not fly there.
 */
const model = defineModel<string>();
const { selectedUsers } = defineProps<{
  selectedUsers: { id: string; photo: string | null | undefined; userName: string }[];
}>();
const emit = defineEmits<{ remove: [id: string] }>();

const { $t } = useFluent();

/** The space between two items in the row, in px. It must match `gap-2`. */
const GAP = 8;
/** The smallest width of the search field, in px. It must match `min-w-20` and `basis-20`. */
const FIELD_MIN_WIDTH = 80;

/** True when the user opened the row. */
const expanded = shallowRef(false);
/** False until the first measure, so the row does not animate when the page loads. */
const ready = shallowRef(false);
/** True after a tap on `+N` or the arrow, because that change must not move the items. */
const holdItems = shallowRef(false);
/** The widths from the hidden copy. A person with no width yet counts as too wide, so a new tag does not show and then go. */
const tagWidths = shallowRef<ReadonlyMap<string, number>>(new Map());
const chipWidth = shallowRef(0);
const labelWidth = shallowRef(0);

/** The height of the row before the next render. */
let heightBefore = 0;
let heightMotion: Animation | undefined;
/** The place of each tag before the next render. */
let placesBefore = new Map<HTMLElement, { left: number; top: number; width: number }>();

const row = useTemplateRef<HTMLElement>("row");
const label = useTemplateRef<HTMLElement>("label");
const measure = useTemplateRef<HTMLElement>("measure");
const { width: rowWidth } = useElementSize(row);

/** How many tags the closed row shows. */
const shownCount = computed(() =>
  fitCount({
    available: rowWidth.value - labelWidth.value - GAP,
    chipWidth: chipWidth.value,
    gap: GAP,
    inputWidth: FIELD_MIN_WIDTH,
    tagWidths: selectedUsers.map(({ id }) => tagWidths.value.get(id) ?? Infinity),
  })
);
const shownUsers = computed(() => (expanded.value ? selectedUsers : selectedUsers.slice(0, shownCount.value)));
const hiddenCount = computed(() => selectedUsers.length - shownUsers.value.length);
const moveClass = computed(() => (ready.value && !holdItems.value ? "row-move" : "row-still"));

/** Reads the widths from the hidden copy of the tags. The last item of the copy is the `+N` button. */
function readWidths(): void {
  if (label.value) labelWidth.value = label.value.getBoundingClientRect().width;
  if (!measure.value) return;
  const widths = [...measure.value.children].map((item) => item.getBoundingClientRect().width);
  chipWidth.value = widths[widths.length - 1] ?? 0;
  tagWidths.value = new Map(selectedUsers.map(({ id }, index) => [id, widths[index]]));
}

/**
 * Reads the height of the row and the place of each tag before the next render. A leaving tag needs its old place, because
 * the render changes the row from two lines to one line before the tag leaves.
 */
function readBeforeRender(): void {
  heightBefore = row.value?.getBoundingClientRect().height ?? 0;
  placesBefore = new Map();
  row.value?.querySelectorAll<HTMLElement>("[data-row-tag]").forEach((tag) => {
    // The box gives parts of a pixel. A whole number from `offsetLeft` would make a tag jump when it starts to leave.
    const box = tag.getBoundingClientRect();
    const parentBox = tag.parentElement?.getBoundingClientRect();
    placesBefore.set(tag, {
      left: box.left - (parentBox?.left ?? 0),
      top: box.top - (parentBox?.top ?? 0),
      width: box.width,
    });
  });
}

/** Moves the height of the row from its old value to its new value. A motion in progress stops, so a fast tap continues from the current height. */
function animateRowHeight(): void {
  const element = row.value;
  if (!element || !ready.value) return;
  heightMotion?.cancel();
  element.style.overflow = "";
  const heightAfter = element.getBoundingClientRect().height;
  const duration = motionMs("container");
  if (duration === 0 || Math.abs(heightAfter - heightBefore) < 1) return;

  element.style.overflow = "clip";
  heightMotion = element.animate([{ height: `${heightBefore}px` }, { height: `${heightAfter}px` }], {
    duration,
    easing: MOTION_EASING.standard,
  });
  heightMotion.onfinish = () => (element.style.overflow = "");
}

/**
 * Fades in the button and the field after a tap on `+N` or the arrow, because that tap changes their place. When the row
 * closes, they take the place of tags that are leaving. So they wait until those tags are gone, and no text lies over other
 * text.
 */
function fadeInMovedItems(): void {
  const duration = motionMs("container");
  if (!ready.value || duration === 0 || !holdItems.value) return;
  const delay = expanded.value ? 0 : motionMs("exit");
  row.value?.querySelectorAll("[data-row-fade]").forEach((item) => {
    if (item.closest("[inert]")) return;
    item.getAnimations().forEach((motion) => motion.cancel());
    item.animate([{ opacity: 0 }, { opacity: 1 }], {
      delay,
      duration: expanded.value ? duration : motionMs("state"),
      easing: MOTION_EASING.standard,
      fill: "backwards",
    });
  });
}

/** Opens or closes the row. */
function toggleExpanded(): void {
  holdItems.value = true;
  expanded.value = !expanded.value;
}

/**
 * Keeps a leaving tag where it is. The style sheet takes the tag out of the flow, and a flex item with no position would
 * go to the start of the row.
 */
function holdPlace(element: Element): void {
  const tag = element as HTMLElement;
  const place = placesBefore.get(tag);
  tag.style.left = `${place?.left ?? tag.offsetLeft}px`;
  tag.style.top = `${place?.top ?? tag.offsetTop}px`;
  tag.style.width = `${place?.width ?? tag.offsetWidth}px`;
}

/**
 * Removes a person. A keyboard user would lose the focus with the tag, so the focus goes to the first tag or to the field.
 * A click from a keyboard has `detail` 0. A tap keeps the focus where it is, so the keyboard of a phone does not open.
 */
async function removeUser(id: string, event: MouseEvent): Promise<void> {
  emit("remove", id);
  if (event.detail !== 0) return;
  await nextTick();
  row.value
    ?.querySelector<HTMLElement>("[data-row-tag]:not(.row-leave-active) button, [data-row-fade] button, input")
    ?.focus();
}

onMounted(readWidths);
watch(() => selectedUsers, readWidths, { flush: "post" });

// The places before the render, and the motion after the render.
watch(() => [expanded.value, selectedUsers], readBeforeRender, { flush: "pre" });
watch(expanded, fadeInMovedItems, { flush: "post" });
watch(() => [expanded.value, selectedUsers], animateRowHeight, { flush: "post" });

// A change of the people is the only change that moves the items.
watch(
  () => selectedUsers,
  () => (holdItems.value = false)
);

// The row is ready after the first render with a real width.
watch(rowWidth, async (width) => {
  if (width === 0 || ready.value) return;
  await nextTick();
  ready.value = true;
});

// When everyone fits in one line, nothing is left to fold, so the open row closes and its button goes away.
watch(shownCount, (count) => {
  if (count >= selectedUsers.length) expanded.value = false;
});
</script>

<template>
  <div ref="row" class="relative my-1.5">
    <TransitionGroup
      :css="ready"
      :class="['relative flex items-center gap-2', expanded ? 'flex-wrap gap-y-1.5' : 'h-6.5']"
      :move-class="moveClass"
      name="row"
      tag="div"
      @before-leave="holdPlace"
    >
      <div key="label" ref="label" class="shrink-0 text-sm font-semibold text-base-text-quinary">
        {{ $t("new-expense-select-people-with") }}
      </div>
      <div v-for="user in shownUsers" :key="user.id" data-row-tag class="relative z-10 flex min-w-0 shrink-0">
        <UserTag :photo="user.photo" :name="user.userName" @remove="removeUser(user.id, $event)" />
      </div>
      <div v-if="hiddenCount > 0 || expanded" key="chip" data-row-fade class="relative z-10 flex shrink-0">
        <button
          type="button"
          :aria-expanded="expanded"
          :aria-label="
            expanded
              ? $t('new-expense-select-people-show-fewer')
              : $t('new-expense-select-people-show-more', { count: hiddenCount })
          "
          class="relative flex h-6.5 cursor-pointer items-center rounded-lg border border-comp-user-tag-border bg-base-bg-brand-subtle px-2 text-sm font-medium text-base-text-secondary after:absolute after:top-1/2 after:left-1/2 after:h-11 after:w-[max(100%,--spacing(11))] after:-translate-x-1/2 after:-translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-focus-ring"
          @click="toggleExpanded"
        >
          <PhCaretUp v-if="expanded" aria-hidden="true" class="size-3.5" weight="bold" />
          <template v-else>+{{ hiddenCount }}</template>
        </button>
      </div>
      <div key="field" data-row-fade class="flex h-6.5 min-w-20 grow basis-20 items-center">
        <div class="w-full shrink-0">
          <TextInput
            v-model="model"
            variant="plain"
            :label="$t('new-expense-select-people-search-placeholder')"
            :placeholder="$t('new-expense-select-people-search-placeholder')"
          />
        </div>
      </div>
    </TransitionGroup>

    <!--
      A hidden copy of all tags and the button. The closed row reads its widths from here. The outer box has no height and
      clips the copy, because a copy wider than the page would let the page scroll sideways.
    -->
    <div inert class="invisible absolute inset-x-0 top-0 h-0 overflow-hidden" aria-hidden="true">
      <div ref="measure" class="flex w-max">
        <UserTag v-for="user in selectedUsers" :key="user.id" :photo="user.photo" :name="user.userName" />
        <div class="flex h-6.5 shrink-0 items-center rounded-lg border px-2 text-sm font-medium">
          +{{ selectedUsers.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row-enter-active {
  transition: opacity var(--motion-duration-container) var(--motion-easing-standard);
}

.row-leave-active {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  transition: opacity var(--motion-duration-exit) var(--motion-easing-standard);
}

.row-enter-from,
.row-leave-to {
  opacity: 0;
}

.row-move {
  transition: transform var(--motion-duration-container) var(--motion-easing-standard);
}
</style>
