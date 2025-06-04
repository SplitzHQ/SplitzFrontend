import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import Sheet from './Sheet.vue'

const meta: Meta<typeof Sheet> = {
  title: 'Components/Sheet',
  component: Sheet,
  argTypes: {
    detent: {
      control: 'radio',
      options: ['large', 'medium']
    },
    showHandle: {
      control: 'boolean'
    },
    showCloseButton: {
      control: 'boolean'
    },
    dismissOnBackdrop: {
      control: 'boolean'
    },
    dismissOnDrag: {
      control: 'boolean'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Large: Story = {
  render: (args) => ({
    components: { Sheet },
    setup() {
      const isOpen = ref(false)
      return { args, isOpen }
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
    `
  }),
  args: {
    detent: 'large',
    showHandle: true,
    showCloseButton: false,
    dismissOnBackdrop: true,
    dismissOnDrag: true
  }
}

export const Medium: Story = {
  render: (args) => ({
    components: { Sheet },
    setup() {
      const isOpen = ref(false)
      return { args, isOpen }
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
    `
  }),
  args: {
    detent: 'medium',
    showHandle: true,
    showCloseButton: false,
    dismissOnBackdrop: true,
    dismissOnDrag: true
  }
}

export const WithCloseButton: Story = {
  render: (args) => ({
    components: { Sheet },
    setup() {
      const isOpen = ref(false)
      return { args, isOpen }
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
    `
  }),
  args: {
    detent: 'large',
    showHandle: true,
    showCloseButton: true,
    dismissOnBackdrop: true,
    dismissOnDrag: true
  }
}

export const NoHandle: Story = {
  render: (args) => ({
    components: { Sheet },
    setup() {
      const isOpen = ref(false)
      return { args, isOpen }
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
    `
  }),
  args: {
    detent: 'medium',
    showHandle: false,
    showCloseButton: true,
    dismissOnBackdrop: true,
    dismissOnDrag: false
  }
}

export const NonDismissible: Story = {
  render: (args) => ({
    components: { Sheet },
    setup() {
      const isOpen = ref(false)
      return { args, isOpen }
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
    `
  }),
  args: {
    detent: 'medium',
    showHandle: true,
    showCloseButton: true,
    dismissOnBackdrop: false,
    dismissOnDrag: false
  }
}
