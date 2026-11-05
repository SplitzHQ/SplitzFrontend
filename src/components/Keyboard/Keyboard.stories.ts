import type { Meta, StoryFn } from "@storybook/vue3-vite";

import Keyboard from "./Keyboard.vue";

export default {
  title: "Components/Keyboard",
  component: Keyboard,
} satisfies Meta<typeof Keyboard>;

const Template: StoryFn<typeof Keyboard> = (args) => ({
  components: { Keyboard },
  setup() {
    return { args };
  },
  template: '<Keyboard v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {
  variant: "ghost",
  modelValue: 0,
};
