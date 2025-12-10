import { PhAirplaneTakeoff } from "@phosphor-icons/vue";
import type { Meta, StoryFn } from "@storybook/vue3-vite";
import { fn } from "storybook/test";

import SButton from "./SButton.vue";

export default {
  title: "Components/Button",
  component: SButton,
  args: {
    onClick: fn()
  },
  argTypes: {
    color: {
      control: { type: "select" },
      options: ["neutral", "error", "brand"]
    },
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "outline", "ghost"]
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl", "xxl"]
    },
    disabled: { control: "boolean" },
    loading: { control: "boolean" }
  }
} satisfies Meta<typeof SButton>;

const Template: StoryFn<typeof SButton> = (args) => ({
  components: { SButton },
  setup() {
    return { args };
  },
  template: '<SButton v-bind="args">click me</SButton>'
});

export const Brand = Template.bind({});
Brand.args = {
  color: "brand",
  variant: "primary",
  size: "md",
  disabled: false,
  loading: false
};

export const Neutral = Template.bind({});
Neutral.args = {
  color: "neutral",
  variant: "primary",
  size: "md",
  disabled: false,
  loading: false
};

export const Error = Template.bind({});
Error.args = {
  color: "error",
  variant: "primary",
  size: "md",
  disabled: false,
  loading: false
};

const TemplateWithIcon: StoryFn<typeof SButton> = (args) => ({
  components: { SButton, PhAirplaneTakeoff },
  setup() {
    return { args };
  },
  template: '<SButton v-bind="args"><template #icon-left><PhAirplaneTakeoff /></template>take off</SButton>'
});

export const WithIcon = TemplateWithIcon.bind({});
WithIcon.args = {
  color: "brand",
  variant: "primary",
  size: "md",
  disabled: false,
  loading: false
};
