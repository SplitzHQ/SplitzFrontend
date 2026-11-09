import type { Meta, StoryFn } from "@storybook/vue3-vite";

import { WORDMARK_SIZES } from "./brand-wordmark";
import BrandWordmark from "./BrandWordmark.vue";

export default {
  title: "Components/BrandWordmark",
  component: BrandWordmark,
  argTypes: {
    size: { control: { type: "select" }, options: WORDMARK_SIZES },
  },
} satisfies Meta<typeof BrandWordmark>;

const Template: StoryFn<typeof BrandWordmark> = (args) => ({
  components: { BrandWordmark },
  setup() {
    return { args };
  },
  template: '<BrandWordmark v-bind="args" />',
});

export const Playground = Template.bind({});
Playground.args = {
  size: "header",
};
