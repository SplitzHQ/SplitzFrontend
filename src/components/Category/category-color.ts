import type { MainCategory } from "@/libs/categories";

/**
 * The fill and the icon color of each main category: the 50 step and the 600 step of one color family.
 * See `category.usage.ts` for why the steps are these, and which main categories share a family.
 */
export const categoryColorMap: Record<MainCategory, string> = {
  bills: "bg-util-color-brand-50 text-util-color-brand-600",
  debt: "bg-util-color-error-50 text-util-color-error-600",
  education: "bg-util-color-yellow-50 text-util-color-yellow-600",
  entertainment: "bg-util-color-purple-50 text-util-color-purple-600",
  fees_charges: "bg-util-color-grey-50 text-util-color-grey-600",
  food: "bg-util-color-rosered-50 text-util-color-rosered-600",
  gifts_donations: "bg-util-color-magenta-50 text-util-color-magenta-600",
  health: "bg-util-color-success-50 text-util-color-success-600",
  home: "bg-util-color-brand-50 text-util-color-brand-600",
  insurance: "bg-util-color-warning-50 text-util-color-warning-600",
  kids: "bg-util-color-clearblue-50 text-util-color-clearblue-600",
  other: "bg-util-color-grey-50 text-util-color-grey-600",
  personal_care: "bg-util-color-leaf-50 text-util-color-leaf-600",
  pets: "bg-util-color-forest-50 text-util-color-forest-600",
  shopping: "bg-util-color-magenta-50 text-util-color-magenta-600",
  sports_fitness: "bg-util-color-success-50 text-util-color-success-600",
  taxes: "bg-util-color-warning-50 text-util-color-warning-600",
  transport: "bg-util-color-waterblue-50 text-util-color-waterblue-600",
  travel: "bg-util-color-waterblue-50 text-util-color-waterblue-600",
};
