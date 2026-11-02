<script setup lang="ts">
import {
  PhArrowRight,
  PhCheck,
  PhCheckCircle,
  PhInfo,
  PhPlus,
  PhTrash,
  PhWarning,
  PhWarningCircle,
  PhX,
} from "@phosphor-icons/vue";
import { ref } from "vue";
import { toast } from "vue-sonner";

import Avatar from "@/components/Avatar/Avatar.vue";
import Notice from "@/components/Notice/Notice.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import SPopover from "@/components/SPopover/SPopover.vue";
import SSegmentControl from "@/components/SSegmentControl/SSegmentControl.vue";
import SSwitch from "@/components/SSwitch/SSwitch.vue";
import StatusBadge from "@/components/StatusBadge/StatusBadge.vue";
import TextInput from "@/components/TextInput/TextInput.vue";

import DocExample from "../components/DocExample.vue";
import DocSection from "../components/DocSection.vue";

const COLORS = ["brand", "neutral", "error"] as const;
const VARIANTS = ["primary", "secondary", "outline", "ghost"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl", "xxl"] as const;
const TONES = ["info", "success", "warning", "error"] as const;

const segment = ref(0);
const switchOn = ref(true);
const switchOff = ref(false);
const name = ref("");
const email = ref("not-an-email");
const password = ref("hunter22");
const popoverOpen = ref(false);
const sheetOpen = ref(false);

const people = [
  { alt: "Alex", src: null },
  { alt: "Bo", src: null },
  { alt: "Chen", src: null },
  { alt: "Dana", src: null },
];
</script>

<template>
  <div class="flex flex-col gap-10">
    <DocSection
      title="SButton"
      source="src/components/SButton/SButton.vue"
      summary="The main action button. Use brand primary for the one main action of a screen, and error for actions that delete."
    >
      <DocExample v-for="color in COLORS" :key="color" :title="`color=&quot;${color}&quot;`">
        <SButton v-for="variant in VARIANTS" :key="variant" :color="color" :variant="variant" size="md">
          {{ variant }}
        </SButton>
      </DocExample>
      <DocExample title="size">
        <SButton v-for="size in SIZES" :key="size" color="brand" variant="primary" :size="size">{{ size }}</SButton>
      </DocExample>
      <DocExample title="icons, loading, disabled">
        <SButton color="brand" variant="primary" size="md">
          Add expense
          <template #icon-left><PhPlus /></template>
        </SButton>
        <SButton color="neutral" variant="secondary" size="md">
          Continue
          <template #icon-right><PhArrowRight /></template>
        </SButton>
        <SButton color="brand" variant="primary" size="md" loading>Saving</SButton>
        <SButton color="brand" variant="primary" size="md" disabled>Disabled</SButton>
      </DocExample>
    </DocSection>

    <DocSection
      title="SIconButton"
      source="src/components/SButton/SIconButton.vue"
      summary="A button with only an icon. Always give it an aria-label."
    >
      <DocExample title="variants">
        <SIconButton
          v-for="variant in VARIANTS"
          :key="variant"
          color="neutral"
          :variant="variant"
          size="md"
          :aria-label="`Add (${variant})`"
        >
          <PhPlus />
        </SIconButton>
        <SIconButton color="error" variant="secondary" size="md" aria-label="Delete">
          <PhTrash />
        </SIconButton>
        <SIconButton color="neutral" variant="ghost" size="md" aria-label="Close" disabled>
          <PhX />
        </SIconButton>
      </DocExample>
    </DocSection>

    <DocSection
      title="SSegmentControl"
      source="src/components/SSegmentControl/SSegmentControl.vue"
      summary="Picks one of a few options. The selected background slides between segments."
    >
      <DocExample title="v-model is the selected index">
        <SSegmentControl v-model="segment" size="md" :items="['Equally', 'Exact amounts', 'Shares']">
          <template #default="{ item }">{{ item }}</template>
        </SSegmentControl>
      </DocExample>
    </DocSection>

    <DocSection
      title="SSwitch"
      source="src/components/SSwitch/SSwitch.vue"
      summary="Turns one setting on or off. The change takes effect at once, so do not use it in a form with a submit button."
    >
      <DocExample title="on, off, disabled, inherited">
        <SSwitch v-model="switchOn" label="On" />
        <SSwitch v-model="switchOff" label="Off" />
        <SSwitch v-model="switchOn" label="Disabled" disabled />
        <SSwitch v-model="switchOn" label="Inherited" inherited />
      </DocExample>
    </DocSection>

    <DocSection
      title="TextInput"
      source="src/components/TextInput/TextInput.vue"
      summary="A text field with an optional label and hint. Password fields get a show and hide button."
    >
      <DocExample title="label, hint, invalid, password">
        <div class="grid w-full gap-4 sm:grid-cols-3">
          <TextInput v-model="name" label="Group name" placeholder="Trip to Kyoto" hint="You can change it later." />
          <TextInput v-model="email" label="Email" type="email" placeholder="you@example.com" invalid />
          <TextInput v-model="password" label="Password" type="password" placeholder="Password" />
        </div>
      </DocExample>
    </DocSection>

    <DocSection
      title="Notice"
      source="src/components/Notice/Notice.vue"
      summary="An inline message in the page flow. Use a toast for messages that go away."
    >
      <DocExample title="tone">
        <div class="grid w-full gap-3 sm:grid-cols-2">
          <Notice v-for="tone in TONES" :key="tone" :tone="tone" :title="`${tone[0]!.toUpperCase()}${tone.slice(1)}`">
            <template #icon>
              <PhInfo v-if="tone === 'info'" />
              <PhCheckCircle v-else-if="tone === 'success'" />
              <PhWarning v-else-if="tone === 'warning'" />
              <PhWarningCircle v-else />
            </template>
            Receipt scanning is slower than usual right now.
          </Notice>
        </div>
      </DocExample>
    </DocSection>

    <DocSection
      title="StatusBadge"
      source="src/components/StatusBadge/StatusBadge.vue"
      summary="A large icon with rings for result screens, for example after a settle-up."
    >
      <DocExample title="tone">
        <div class="flex flex-wrap gap-14 p-6">
          <StatusBadge tone="brand"><PhInfo /></StatusBadge>
          <StatusBadge tone="success"><PhCheck /></StatusBadge>
          <StatusBadge tone="warning"><PhWarning /></StatusBadge>
          <StatusBadge tone="error"><PhX /></StatusBadge>
        </div>
      </DocExample>
    </DocSection>

    <DocSection
      title="Avatar"
      source="src/components/Avatar/Avatar.vue"
      summary="A user picture, or up to four pictures for a group. Without a picture it shows the default user."
    >
      <DocExample title="sizes, one person and a group">
        <Avatar v-for="size in ['xxs', 'xs', 'sm', 'lg'] as const" :key="size" :size="size" :images="[people[0]!]" />
        <Avatar size="lg" :images="people" />
      </DocExample>
    </DocSection>

    <DocSection
      title="SPopover"
      source="src/components/SPopover/SPopover.vue"
      summary="A panel anchored to a trigger, built on reka-ui. It moves focus into the panel and stays inside the screen."
    >
      <DocExample title="trigger slot and content">
        <SPopover v-model="popoverOpen" label="Split details" side="bottom" align="start" class="w-72">
          <template #trigger>
            <SButton color="neutral" variant="outline" size="sm">Show split</SButton>
          </template>
          <div class="flex flex-col gap-2 text-sm">
            <p class="font-semibold">Split equally</p>
            <p class="text-base-text-tertiary">4 people · ¥ 320.00 each</p>
          </div>
        </SPopover>
      </DocExample>
    </DocSection>

    <DocSection
      title="Sheet"
      source="src/components/Sheet/Sheet.vue"
      summary="A bottom sheet for tasks on top of a page. Drag down or tap the backdrop to close it."
    >
      <DocExample title="medium detent">
        <SButton color="brand" variant="primary" size="sm" @click="sheetOpen = true">Open sheet</SButton>
        <Sheet v-model="sheetOpen" detent="medium" show-close-button>
          <div class="flex flex-col gap-3 p-6">
            <h3 class="text-lg font-bold">Add details</h3>
            <p class="text-sm text-base-text-tertiary">Sheets slide up with --motion-easing-sheet.</p>
          </div>
        </Sheet>
      </DocExample>
    </DocSection>

    <DocSection
      title="Toast"
      source="src/components/Sonner/Sonner.vue"
      summary="A short message that goes away by itself. Call toast() from vue-sonner. The app mounts one Sonner."
    >
      <DocExample title="types">
        <SButton color="neutral" variant="outline" size="sm" @click="toast.success('Expense saved')">Success</SButton>
        <SButton color="neutral" variant="outline" size="sm" @click="toast.info('Alex joined the group')">
          Info
        </SButton>
        <SButton color="neutral" variant="outline" size="sm" @click="toast.warning('You are offline')">
          Warning
        </SButton>
        <SButton color="neutral" variant="outline" size="sm" @click="toast.error('Couldn\'t save. Try again.')">
          Error
        </SButton>
      </DocExample>
    </DocSection>
  </div>
</template>
