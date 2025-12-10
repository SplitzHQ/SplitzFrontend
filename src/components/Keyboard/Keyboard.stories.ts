import { PhBackspace } from "@phosphor-icons/vue";
import type { Meta, StoryFn } from "@storybook/vue3-vite";

import SButton from "@/components/SButton/SButtonBase.vue";

import Keyboard from "./Keyboard.vue";

export default {
  title: "Components/Keyboard",
  component: Keyboard
} satisfies Meta<typeof Keyboard>;

const Template: StoryFn<typeof Keyboard> = (args) => ({
  components: { Keyboard, SButton, PhBackspace },
  setup() {
    return { args };
  },
  template: '<Keyboard v-bind="args" />'
});

export const Default = Template.bind({});
Default.args = {
  enableCalculator: true,
  modelValue: 0
};
