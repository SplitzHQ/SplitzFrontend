<script setup lang="ts" generic="T extends string">
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from "reka-ui";
import { computed } from "vue";

/**
 * One question the viewer must decide, with a radio option for each answer.
 * The note of the picked option shows under the options.
 * Register the value with `registerChoices` so that "Export my choices" saves it.
 */
export interface ChoiceOption<V extends string> {
  value: V;
  label: string;
  /** One line about what this pick means. */
  note?: string;
  /** Marks the option that the prototype recommends. */
  recommended?: boolean;
}

const { question, options } = defineProps<{ question: string; options: ChoiceOption<T>[] }>();
const model = defineModel<T>({ required: true });

const picked = computed(() => options.find((option) => option.value === model.value));
</script>

<template>
  <div class="flex flex-col gap-2">
    <p class="text-sm font-semibold text-base-text-primary">{{ question }}</p>
    <RadioGroupRoot v-model="model" class="flex flex-wrap gap-2" :aria-label="question">
      <RadioGroupItem
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        class="flex items-center gap-2 rounded-full border border-base-border-secondary px-3 py-1.5 text-sm text-base-text-secondary transition-colors hover:border-base-border-brand data-[state=checked]:border-base-border-brand-solid data-[state=checked]:bg-core-alpha-brand-10 data-[state=checked]:text-base-text-brand"
      >
        <span class="grid size-4 place-items-center rounded-full border border-current">
          <RadioGroupIndicator class="size-2 rounded-full bg-current" />
        </span>
        {{ option.label }}
        <span
          v-if="option.recommended"
          class="rounded-full bg-core-alpha-brand-10 px-1.5 text-xs font-medium text-base-text-brand"
        >
          Recommended
        </span>
      </RadioGroupItem>
    </RadioGroupRoot>
    <Transition
      mode="out-in"
      enter-from-class="opacity-0 blur-[2px]"
      leave-to-class="opacity-0"
      enter-active-class="transition-[opacity,filter] duration-(--motion-duration-state) ease-(--motion-easing-enter)"
      leave-active-class="transition-opacity duration-(--motion-duration-hover-in) ease-(--motion-easing-exit)"
    >
      <p v-if="picked?.note" :key="picked.value" class="max-w-prose text-sm text-base-text-tertiary">
        {{ picked.note }}
      </p>
    </Transition>
  </div>
</template>
