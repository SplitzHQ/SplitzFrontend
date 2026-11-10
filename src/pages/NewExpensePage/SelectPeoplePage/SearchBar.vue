<script setup lang="ts">
import { PhMagnifyingGlass } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { nextTick, onMounted, shallowRef, useTemplateRef, watch } from "vue";

import TextInput from "@/components/TextInput/TextInput.vue";
import { fieldTapHandlers } from "@/libs/field-tap";
import { MOTION_EASING, motionMs } from "@/libs/motion";

import UserTag from "./UserTag.vue";

/**
 * The selected people and the search field of SelectPeoplePage, on two lines. The user picked this layout in the prototype
 * `2026-11-08-people-search-focus` (SPZ-48).
 * - The first line has the `With:` label and a tag for each selected person. The tags wrap to more lines. The line does
 *   not show when nobody is selected.
 * - The second line is the search field. It has a frame like the outlined TextInput, so the focus is easy to see.
 *
 * The motion uses only opacity, translation and the height of the block, so nothing stretches. A tag that leaves goes out
 * of the flow at once, so the other tags move one time. The block changes its height smoothly, so the list below does not
 * jump when a tag line opens or closes.
 */
const model = defineModel<string>();
const { selectedUsers } = defineProps<{
  selectedUsers: { id: string; photo: string | null | undefined; userName: string }[];
}>();
const emit = defineEmits<{ remove: [id: string] }>();

const { $t } = useFluent();

/** False until after the first render, so nothing animates when the page loads. */
const ready = shallowRef(false);

const block = useTemplateRef<HTMLElement>("block");
const field = useTemplateRef<HTMLElement>("field");

/** The height of the block before the next render. */
let heightBefore = 0;
let heightMotion: Animation | undefined;
/** The place of each tag before the next render. */
let placesBefore = new Map<HTMLElement, { left: number; top: number; width: number }>();

/**
 * Reads the height of the block and the place of each tag before the next render. A leaving tag needs its old place,
 * because the render can move the tags after it before the tag leaves.
 */
function readBeforeRender(): void {
  heightBefore = block.value?.getBoundingClientRect().height ?? 0;
  placesBefore = new Map();
  block.value?.querySelectorAll<HTMLElement>("[data-row-tag]").forEach((tag) => {
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

/** Moves the height of the block from its old value to its new value. A motion in progress stops, so a fast tap continues from the current height. */
function animateHeight(): void {
  const element = block.value;
  if (!element || !ready.value) return;
  heightMotion?.cancel();
  element.style.overflow = "";
  const heightAfter = element.getBoundingClientRect().height;
  const duration = motionMs("container");
  if (duration === 0 || Math.abs(heightAfter - heightBefore) < 1) return;

  // The block clips during the motion, so a tag on a line that closes fades out inside the block and not over the list.
  element.style.overflow = "clip";
  heightMotion = element.animate([{ height: `${heightBefore}px` }, { height: `${heightAfter}px` }], {
    duration,
    easing: MOTION_EASING.standard,
  });
  heightMotion.onfinish = () => (element.style.overflow = "");
}

/**
 * Keeps a leaving tag where it is. The style sheet takes the tag out of the flow, and a flex item with no position would
 * go to the start of the line.
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
  block.value?.querySelector<HTMLElement>("[data-row-tag]:not(.row-leave-active) button, input")?.focus();
}

const { onClick: onFieldClick, onMouseDown: onFieldMouseDown } = fieldTapHandlers(() =>
  field.value?.querySelector("input")
);

onMounted(async () => {
  await nextTick();
  ready.value = true;
});

// The places before the render, and the motion after the render.
watch(() => selectedUsers, readBeforeRender, { flush: "pre" });
watch(() => selectedUsers, animateHeight, { flush: "post" });
</script>

<template>
  <div ref="block" class="flex flex-col gap-3">
    <TransitionGroup
      v-if="selectedUsers.length > 0"
      :css="ready"
      class="relative flex flex-wrap items-center gap-2 gap-y-1.5"
      move-class="row-move"
      name="row"
      tag="div"
      @before-leave="holdPlace"
    >
      <div key="label" class="shrink-0 text-sm font-semibold text-base-text-muted">
        {{ $t("new-expense-select-people-with") }}
      </div>
      <div v-for="user in selectedUsers" :key="user.id" data-row-tag class="relative z-10 flex min-w-0 shrink-0">
        <UserTag :photo="user.photo" :name="user.userName" @remove="removeUser(user.id, $event)" />
      </div>
    </TransitionGroup>

    <!--
      The frame looks like the outlined TextInput. The ring is `ring-0` and inset in each state, so it can fade. The whole
      frame is the tap target of the field, see `fieldTapHandlers`. A keyboard or a screen reader uses the input, so the
      frame needs no role or key handlers.
    -->
    <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
    <div
      ref="field"
      class="flex h-11.5 cursor-text items-center gap-2 rounded-xl border border-base-border-secondary px-3 ring-0 ring-transparent transition-[border-color,box-shadow] duration-exit ease-standard ring-inset has-[input:focus]:border-base-border-brand-solid has-[input:focus]:ring-1 has-[input:focus]:ring-base-border-brand-solid has-[input:focus]:duration-hover-in"
      @mousedown="onFieldMouseDown"
      @click="onFieldClick"
    >
      <PhMagnifyingGlass aria-hidden="true" class="size-5 shrink-0 text-base-fg-placeholder" />
      <div class="min-w-0 grow">
        <TextInput
          v-model="model"
          variant="plain"
          :label="$t('new-expense-select-people-search-label')"
          :placeholder="$t('new-expense-select-people-search-placeholder')"
        />
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
