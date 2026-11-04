import { PhAirplaneTakeoff } from "@phosphor-icons/vue";
import type { Meta, StoryFn } from "@storybook/vue3-vite";
import { fn } from "storybook/test";

import { BUTTON_SIZES, BUTTON_VARIANTS } from "./button";
import SIconButton from "./SIconButton.vue";

// The full docs live on the design-system page (/devtools/design-system.html#/components/button).
export default {
  title: "Components/IconButton",
  component: SIconButton,
  args: {
    onClick: fn(),
  },
  argTypes: {
    variant: { control: { type: "select" }, options: BUTTON_VARIANTS },
    size: { control: { type: "select" }, options: BUTTON_SIZES },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
  },
} satisfies Meta<typeof SIconButton>;

const Template: StoryFn<typeof SIconButton> = (args) => ({
  components: { SIconButton, PhAirplaneTakeoff },
  setup() {
    return { args };
  },
  template: '<SIconButton v-bind="args" aria-label="Take off"><PhAirplaneTakeoff /></SIconButton>',
});

export const Playground = Template.bind({});
Playground.args = {
  variant: "ghost",
  size: "md",
  disabled: false,
  loading: false,
};
