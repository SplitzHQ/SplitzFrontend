import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import SIconButton from "@/components/SButton/SIconButton.vue";

import SPopover from "./SPopover.vue";

const meta = {
  title: "Components/Popover",
  component: SPopover,
  parameters: { layout: "centered" },
  args: { label: "Notifications", modelValue: false, enabled: true },
  render: (args) => ({
    components: { SPopover, SIconButton },
    setup: () => ({ args }),
    template: `
      <SPopover v-bind="args">
        <template #trigger>
          <SIconButton variant="ghost" color="neutral" size="lg" aria-label="Open notifications">
            <span aria-hidden="true">•••</span>
          </SIconButton>
        </template>
        <div class="flex flex-col gap-3">
          <h2 class="text-lg font-semibold">Notifications</h2>
          <p class="text-sm text-base-text-secondary">You have no new notifications.</p>
          <button type="button" class="rounded-2xl px-3 py-2 text-sm hover:bg-util-alpha-black-5">
            Notification settings
          </button>
        </div>
      </SPopover>
    `,
  }),
} satisfies Meta<typeof SPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Open notifications" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(page.getByRole("dialog", { name: "Notifications" })).toBeVisible());
    await waitFor(() => expect(page.getByRole("button", { name: "Notification settings" })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const WidePanel: Story = {
  args: { class: "w-[26rem]", align: "start" },
};
