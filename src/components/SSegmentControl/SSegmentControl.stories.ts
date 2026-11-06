import type { Meta, StoryFn } from "@storybook/vue3-vite";

import { SEGMENT_SIZES } from "./segment";
import SSegmentControl from "./SSegmentControl.vue";

export default {
  title: "Components/SegmentControl",
  component: SSegmentControl,
  argTypes: {
    modelValue: {
      control: { type: "number" },
      description: "Index of the active segment",
    },
    size: {
      control: { type: "select" },
      options: SEGMENT_SIZES,
    },
  },
} satisfies Meta<typeof SSegmentControl>;

const Template: StoryFn<typeof SSegmentControl> = (args) => ({
  components: { SSegmentControl },
  setup() {
    return { args };
  },
  template: '<SSegmentControl v-bind="args"><template #default="{ item }">{{ item }}</template></SSegmentControl>',
});

export const Default = Template.bind({});
Default.args = {
  items: ["Segment 1", "Segment 2", "Segment 3"],
  label: "Sample choice",
  size: "md",
  modelValue: 0,
};

/** The segments do not fit, so the track scrolls and fades at the edge that has more segments. */
export const Overflow: StoryFn<typeof SSegmentControl> = (args) => ({
  components: { SSegmentControl },
  setup() {
    return { args };
  },
  template: '<div class="w-85.75"><SSegmentControl v-bind="args" /></div>',
});
Overflow.args = {
  items: ["Balances", "Trend", "History", "Members", "Receipts", "Export"],
  label: "Sample choice",
  size: "md",
  modelValue: 0,
};
