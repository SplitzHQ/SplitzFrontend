/**
 * Shared types and lists for the SButton family (SButtonBase, SButton, SIconButton, SLinkButton).
 * The design-system page reads the lists, so a new variant or size shows up there automatically.
 */

/** The visual role of a button. See `button.usage.ts` for when to use each variant. */
export const BUTTON_VARIANTS = ["primary", "secondary", "outline", "ghost", "destructive", "destructive-soft"] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

/**
 * The size steps, from small to large. Each step has a fixed height: sm 32px, md 40px, xl 52px.
 * The tap area is at least 44px × 44px at every step. See `button.usage.ts` for when to use each size.
 */
export const BUTTON_SIZES = ["sm", "md", "xl"] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];

/**
 * Interaction states that the design-system page can show without a pointer.
 * Set one on a button with the `data-force-state` attribute. App code must not use it.
 */
export const BUTTON_FORCED_STATES = ["hover", "pressed", "focus"] as const;
export type ButtonForcedState = (typeof BUTTON_FORCED_STATES)[number];
