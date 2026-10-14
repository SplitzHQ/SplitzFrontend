import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ref } from "vue";

import SButton from "@/components/SButton/SButton.vue";

import Sheet from "./Sheet.vue";

const meta: Meta<typeof Sheet> = {
  title: "Components/Sheet",
  component: Sheet,
  argTypes: {
    detent: {
      control: "radio",
      options: ["large", "medium"],
    },
    showHandle: {
      control: "boolean",
    },
    showCloseButton: {
      control: "boolean",
    },
    dismissOnBackdrop: {
      control: "boolean",
    },
    dismissOnDrag: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Large: Story = {
  render: (args) => ({
    components: { Sheet },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div class="p-4 text-base-text-primary">
        <button
          @click="isOpen = true"
          class="px-4 py-2 rounded-lg transition-colors"
        >
          Open Large Sheet
        </button>

        <Sheet v-model="isOpen" v-bind="args">
          <div class="space-y-4 text-base-text-primary">
            <h2 class="text-xl font-semibold">Large Sheet</h2>
            <p>
              This is a large sheet that takes up about 90% of the screen height.
              It includes a drag handle at the top and can be dismissed by dragging down,
              tapping the backdrop, or pressing the Escape key.
            </p>
            <div class="space-y-2">
              <p>• Drag the handle to dismiss</p>
              <p>• Tap outside to close</p>
              <p>• Press Escape to close</p>
              <p>• Smooth iOS-like animations</p>
            </div>
            <div class="h-96 rounded-lg flex items-center justify-center">
              <p>Content area with scrolling</p>
            </div>
            <div class="h-96 rounded-lg flex items-center justify-center">
              <p>More content to demonstrate scrolling</p>
            </div>
          </div>
        </Sheet>
      </div>
    `,
  }),
  args: {
    detent: "large",
    showHandle: true,
    showCloseButton: false,
    dismissOnBackdrop: true,
    dismissOnDrag: true,
  },
};

export const Medium: Story = {
  render: (args) => ({
    components: { Sheet },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div class="p-4 text-base-text-primary">
        <button
          @click="isOpen = true"
          class="px-4 py-2 rounded-lg transition-colors"
        >
          Open Medium Sheet
        </button>

        <Sheet v-model="isOpen" v-bind="args">
          <div class="space-y-4 text-base-text-primary">
            <h2 class="text-xl font-semibold">Medium Sheet</h2>
            <p>
              This is a medium sheet that takes up about 50% of the screen height.
              Perfect for smaller content or quick actions.
            </p>
            <div class="h-96 rounded-lg flex items-center justify-center">
              <p>Content area with scrolling</p>
            </div>
            <div class="h-96 rounded-lg flex items-center justify-center">
              <p>More content to demonstrate scrolling</p>
            </div>
          </div>
        </Sheet>
      </div>
    `,
  }),
  args: {
    detent: "medium",
    showHandle: true,
    showCloseButton: false,
    dismissOnBackdrop: true,
    dismissOnDrag: true,
  },
};

export const WithCloseButton: Story = {
  render: (args) => ({
    components: { Sheet },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div class="p-4 text-base-text-primary">
        <button
          @click="isOpen = true"
          class="px-4 py-2 rounded-lg transition-colors"
        >
          Open Sheet with Close Button
        </button>

        <Sheet v-model="isOpen" v-bind="args">
          <div class="space-y-4 text-base-text-primary">
            <h2 class="text-xl font-semibold">Sheet with Close Button</h2>
            <p>
              This sheet includes both a drag handle and a close button in the top-right corner.
              This gives users multiple ways to dismiss the sheet.
            </p>
            <div class="space-y-4">
              <div class="p-4 rounded-lg">
                <h3 class="font-medium">Information</h3>
                <p class="text-sm mt-1">
                  You can close this sheet using the X button, drag handle, backdrop tap, or Escape key.
                </p>
              </div>
              <div class="p-4 rounded-lg">
                <h3 class="font-medium">Success</h3>
                <p class="text-sm mt-1">
                  The sheet animates smoothly with iOS-like spring curves.
                </p>
              </div>
            </div>
          </div>
        </Sheet>
      </div>
    `,
  }),
  args: {
    detent: "large",
    showHandle: true,
    showCloseButton: true,
    dismissOnBackdrop: true,
    dismissOnDrag: true,
  },
};

export const NoHandle: Story = {
  render: (args) => ({
    components: { Sheet },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div class="p-4 text-base-text-primary">
        <button
          @click="isOpen = true"
          class="px-4 py-2 rounded-lg transition-colors"
        >
          Open Sheet without Handle
        </button>

        <Sheet v-model="isOpen" v-bind="args">
          <div class="space-y-4 text-base-text-primary">
            <h2 class="text-xl font-semibold">Sheet without Handle</h2>
            <p>
              This sheet doesn't show the drag handle, giving a cleaner look.
              You can still dismiss it by tapping the backdrop or pressing Escape.
            </p>
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 rounded-lg">
                <h3 class="font-medium">Feature 1</h3>
                <p class="text-sm mt-1">Description here</p>
              </div>
              <div class="p-4 rounded-lg">
                <h3 class="font-medium">Feature 2</h3>
                <p class="text-sm mt-1">Description here</p>
              </div>
            </div>
          </div>
        </Sheet>
      </div>
    `,
  }),
  args: {
    detent: "medium",
    showHandle: false,
    showCloseButton: true,
    dismissOnBackdrop: true,
    dismissOnDrag: false,
  },
};

export const NonDismissible: Story = {
  render: (args) => ({
    components: { Sheet },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div class="p-4 text-base-text-primary">
        <button
          @click="isOpen = true"
          class="px-4 py-2 rounded-lg transition-colors"
        >
          Open Non-Dismissible Sheet
        </button>

        <Sheet v-model="isOpen" v-bind="args">
          <div class="space-y-4 text-base-text-primary">
            <h2 class="text-xl font-semibold">Non-Dismissible Sheet</h2>
            <p>
              This sheet can't be dismissed by dragging or tapping the backdrop.
              You must use the close button to dismiss it.
            </p>
            <div class="p-4 rounded-lg">
              <h3 class="font-medium">Important Notice</h3>
              <p class="text-red-700 dark:text-red-300 text-sm mt-1">
                This type of sheet is useful for critical actions that require user attention.
              </p>
            </div>
            <button
              @click="isOpen = false"
              class="w-full p-3 rounded-lg transition-colors"
            >
              Close Sheet
            </button>
          </div>
        </Sheet>
      </div>
    `,
  }),
  args: {
    detent: "medium",
    showHandle: true,
    showCloseButton: true,
    dismissOnBackdrop: false,
    dismissOnDrag: false,
  },
};

/** Checks browser hit targets while the sheet covers raised page components. */
export const InFrontOfOtherComponents: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Opens the sheet over dropdown, sticky, fixed, and offcanvas layers. Browser hit tests check that the sheet and backdrop receive pointer input, then confirm that the page is reachable after dismissal.",
      },
    },
  },
  args: {
    detent: "medium",
    detentSizing: "height",
    showHandle: false,
    showCloseButton: true,
    dismissOnBackdrop: true,
    dismissOnDrag: false,
  },
  render: (args) => ({
    components: { Sheet, SButton },
    setup() {
      const isOpen = ref(false);
      const sheetClicks = ref(0);
      const pageClicks = ref(0);
      return { args, isOpen, sheetClicks, pageClicks };
    },
    template: `
      <div class="text-base-text-primary">
        <div role="group" aria-label="Dropdown layer"
          class="fixed top-0 left-0 z-dropdown flex h-1/2 w-1/2 items-center justify-center bg-base-bg-primary">
          <SButton color="brand" variant="primary" size="md" @click="isOpen = true">
            Open layering sheet
          </SButton>
        </div>
        <div role="group" aria-label="Sticky layer"
          class="fixed top-0 right-0 z-sticky flex h-1/2 w-1/2 items-center justify-center bg-base-bg-secondary">
          <SButton color="neutral" variant="secondary" size="md" @click="pageClicks++">
            Sticky action
          </SButton>
        </div>
        <div role="group" aria-label="Fixed layer"
          class="fixed bottom-0 left-0 z-fixed flex h-1/2 w-1/2 items-center justify-center bg-base-bg-secondary">
          <SButton color="neutral" variant="secondary" size="md" @click="pageClicks++">
            Fixed action
          </SButton>
        </div>
        <div role="group" aria-label="Offcanvas layer"
          class="fixed right-0 bottom-0 z-offcanvas flex h-1/2 w-1/2 items-center justify-center bg-base-bg-primary">
          <SButton color="neutral" variant="secondary" size="md" @click="pageClicks++">
            Offcanvas action
          </SButton>
        </div>
        <Sheet v-model="isOpen" v-bind="args">
          <div class="flex flex-col gap-4">
            <h2 class="text-xl font-semibold">Sheet layering</h2>
            <SButton color="brand" variant="primary" size="md" @click="sheetClicks++">
              Sheet action
            </SButton>
            <p role="status">Sheet clicks: {{ sheetClicks }}. Page clicks: {{ pageClicks }}.</p>
          </div>
        </Sheet>
      </div>
    `,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const document = canvasElement.ownerDocument;
    // Sheet content is teleported outside the story canvas.
    const body = within(document.body);
    const layers = ["Dropdown layer", "Sticky layer", "Fixed layer", "Offcanvas layer"].map((name) =>
      canvas.getByRole("group", { name })
    );

    /** Reads the actual pointer target at the center of a rendered element. */
    function hitTest(element: Element) {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      expect(rect.width).toBeGreaterThan(0);
      expect(rect.height).toBeGreaterThan(0);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(document.documentElement.clientWidth);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(document.documentElement.clientHeight);
      return { target: document.elementFromPoint(x, y), stack: document.elementsFromPoint(x, y) };
    }

    await step("Page components receive pointer input before opening", async () => {
      for (const layer of layers) {
        expect(layer.contains(hitTest(layer).target)).toBe(true);
      }
      await userEvent.click(canvas.getByRole("button", { name: "Open layering sheet" }));
    });

    const sheetAction = await body.findByRole("button", { name: "Sheet action" });
    const sheet = sheetAction.closest(".sheet")!;

    try {
      await step("Sheet and backdrop are above every overlapping page layer", async () => {
        await waitFor(() => {
          // Wait for the slide-in transition to finish before checking overlap.
          expect(sheet.getBoundingClientRect().bottom).toBeLessThanOrEqual(document.documentElement.clientHeight);
          for (const [index, layer] of layers.entries()) {
            const { target, stack } = hitTest(layer);
            expect(stack).toContain(layer);
            expect(target).not.toBeNull();
            expect(layer.contains(target)).toBe(false);
            if (index < 2) {
              expect(target!.contains(sheet)).toBe(true);
            } else {
              expect(sheet.contains(target)).toBe(true);
            }
          }
        });
      });

      await step("The sheet action receives the hit-tested click", async () => {
        const { target } = hitTest(sheetAction);
        expect(sheetAction.contains(target)).toBe(true);
        await userEvent.click(target!);
        await expect(body.getByRole("status")).toHaveTextContent("Sheet clicks: 1. Page clicks: 0.");
      });

      await step("The backdrop intercepts a page click and dismisses the sheet", async () => {
        const { target } = hitTest(layers[1]!);
        expect(target!.contains(sheet)).toBe(true);
        await userEvent.click(target!);
        await waitFor(() => expect(sheet).not.toBeInTheDocument());
        for (const layer of layers) {
          expect(layer.contains(hitTest(layer).target)).toBe(true);
        }
      });
    } finally {
      // Restore scroll and remove the teleport if an assertion fails while open.
      if (sheet.isConnected) {
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(sheet).not.toBeInTheDocument());
      }
    }
  },
};
