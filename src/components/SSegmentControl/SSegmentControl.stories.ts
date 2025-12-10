import type { Meta, StoryFn } from "@storybook/vue3-vite";

import SSegmentControl from "./SSegmentControl.vue";

export default {
  title: "Components/SegmentControl",
  component: SSegmentControl,
  argTypes: {
    modelValue: {
      control: { type: "number" },
      description: "Index of the active segment"
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"]
    }
  }
} satisfies Meta<typeof SSegmentControl>;

const Template: StoryFn<typeof SSegmentControl> = (args) => ({
  components: { SSegmentControl },
  setup() {
    return { args };
  },
  template: '<SSegmentControl v-bind="args"><template #default="{ item }">{{ item }}</template></SSegmentControl>'
});

export const Default = Template.bind({});
Default.args = {
  items: ["Segment 1", "Segment 2", "Segment 3"],
  size: "md",
  modelValue: 0
};
