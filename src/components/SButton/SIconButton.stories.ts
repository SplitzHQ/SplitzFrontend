import { PhAirplaneTakeoff } from '@phosphor-icons/vue'
import { fn } from 'storybook/test'
import type { Meta, StoryFn } from '@storybook/vue3-vite'

import SIconButton from './SIconButton.vue'

export default {
  title: 'Components/IconButton',
  component: SIconButton,
  args: {
    onClick: fn()
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['neutral', 'error', 'brand']
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost']
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' }
  }
} satisfies Meta<typeof SIconButton>

const Template: StoryFn<typeof SIconButton> = (args) => ({
  components: { SIconButton, PhAirplaneTakeoff },
  setup() {
    return { args }
  },
  template: '<SIconButton v-bind="args"><PhAirplaneTakeoff /></SIconButton>'
})

export const Brand = Template.bind({})
Brand.args = {
  color: 'brand',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
}

export const Neutral = Template.bind({})
Neutral.args = {
  color: 'neutral',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
}

export const Error = Template.bind({})
Error.args = {
  color: 'error',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
}
