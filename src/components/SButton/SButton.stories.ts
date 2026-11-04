import { PhAirplaneTakeoff } from "@phosphor-icons/vue";
import type { Meta, StoryFn } from "@storybook/vue3-vite";
import { fn } from "storybook/test";

import { BUTTON_SIZES, BUTTON_VARIANTS } from "./button";
import SButton from "./SButton.vue";

// The full docs live on the design-system page (/devtools/design-system.html#/components/button).
export default {
  title: "Components/Button",
  component: SButton,
  args: {
    onClick: fn(),
  },
  argTypes: {
    variant: { control: { type: "select" }, options: BUTTON_VARIANTS },
    size: { control: { type: "select" }, options: BUTTON_SIZES },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
  },
} satisfies Meta<typeof SButton>;

const Template: StoryFn<typeof SButton> = (args) => ({
  components: { SButton },
  setup() {
    return { args };
  },
  template: '<SButton v-bind="args">Save changes</SButton>',
});

export const Playground = Template.bind({});
Playground.args = {
  variant: "primary",
  size: "md",
  disabled: false,
  loading: false,
};

const TemplateWithIcon: StoryFn<typeof SButton> = (args) => ({
  components: { SButton, PhAirplaneTakeoff },
  setup() {
    return { args };
  },
  template: '<SButton v-bind="args"><template #icon-left><PhAirplaneTakeoff /></template>Take off</SButton>',
});

export const WithIcon = TemplateWithIcon.bind({});
WithIcon.args = {
  variant: "primary",
  size: "md",
  disabled: false,
  loading: false,
};
