import type { Meta, StoryFn } from "@storybook/vue3-vite";

import Avatar from "./Avatar.vue";

export default {
  title: "Components/Avatar",
  component: Avatar
} satisfies Meta<typeof Avatar>;

const Template: StoryFn<typeof Avatar> = (args) => ({
  components: { Avatar },
  setup() {
    return { args };
  },
  template: '<Avatar v-bind="args" />'
});

export const Default = Template.bind({});
Default.args = {
  images: [{ src: "https://picsum.photos/seed/picsum1/200", alt: "Placeholder Image 1" }],
  size: "lg"
};

export const TwoImage = Template.bind({});
TwoImage.args = {
  images: [
    { src: "https://picsum.photos/seed/picsum1/200", alt: "Placeholder Image 1" },
    { src: "https://picsum.photos/seed/picsum2/200", alt: "Placeholder Image 2" }
  ],
  size: "lg"
};

export const ThreeImage = Template.bind({});
ThreeImage.args = {
  images: [
    { src: "https://picsum.photos/seed/picsum1/200", alt: "Placeholder Image 1" },
    { src: "https://picsum.photos/seed/picsum2/200", alt: "Placeholder Image 2" },
    { src: "https://picsum.photos/seed/picsum3/200", alt: "Placeholder Image 3" }
  ],
  size: "lg"
};

export const FourImage = Template.bind({});
FourImage.args = {
  images: [
    { src: "https://picsum.photos/seed/picsum1/200", alt: "Placeholder Image 1" },
    { src: "https://picsum.photos/seed/picsum2/200", alt: "Placeholder Image 2" },
    { src: "https://picsum.photos/seed/picsum3/200", alt: "Placeholder Image 3" },
    { src: "https://picsum.photos/seed/picsum4/200", alt: "Placeholder Image 4" }
  ],
  size: "lg"
};
