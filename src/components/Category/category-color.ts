import type { MainCategory } from "@/libs/categories";

/**
 * The fill and the icon color of each main category: the `comp-palette-*-fill` and `comp-palette-*-icon` tokens of one
 * color family. The generator `scripts/color-scales/` gives the fill the 50 step and the icon the 600 step.
 * See `category.usage.ts` for why the steps are these, and which main categories share a family.
 */
export const categoryColorMap: Record<MainCategory, string> = {
  bills: "bg-comp-palette-brand-fill text-comp-palette-brand-icon",
  debt: "bg-comp-palette-error-fill text-comp-palette-error-icon",
  education: "bg-comp-palette-yellow-fill text-comp-palette-yellow-icon",
  entertainment: "bg-comp-palette-purple-fill text-comp-palette-purple-icon",
  fees_charges: "bg-comp-palette-grey-fill text-comp-palette-grey-icon",
  food: "bg-comp-palette-rosered-fill text-comp-palette-rosered-icon",
  gifts_donations: "bg-comp-palette-magenta-fill text-comp-palette-magenta-icon",
  health: "bg-comp-palette-success-fill text-comp-palette-success-icon",
  home: "bg-comp-palette-brand-fill text-comp-palette-brand-icon",
  insurance: "bg-comp-palette-warning-fill text-comp-palette-warning-icon",
  kids: "bg-comp-palette-clearblue-fill text-comp-palette-clearblue-icon",
  other: "bg-comp-palette-grey-fill text-comp-palette-grey-icon",
  personal_care: "bg-comp-palette-leaf-fill text-comp-palette-leaf-icon",
  pets: "bg-comp-palette-forest-fill text-comp-palette-forest-icon",
  shopping: "bg-comp-palette-magenta-fill text-comp-palette-magenta-icon",
  sports_fitness: "bg-comp-palette-success-fill text-comp-palette-success-icon",
  taxes: "bg-comp-palette-warning-fill text-comp-palette-warning-icon",
  transport: "bg-comp-palette-waterblue-fill text-comp-palette-waterblue-icon",
  travel: "bg-comp-palette-waterblue-fill text-comp-palette-waterblue-icon",
};
