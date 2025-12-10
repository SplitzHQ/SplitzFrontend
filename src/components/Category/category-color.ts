import type { MainCategory } from "@/libs/categories";

export const categoryColorMap: Record<MainCategory, string> = {
  // NOTE: Color families chosen to give visual differentiation.
  // Pattern: light (50) background + stronger (500) foreground color.
  // Adjust as design system evolves.
  food: "bg-util-color-rosered-50 text-util-color-rosered-500",
  transport: "bg-util-color-waterblue-50 text-util-color-waterblue-500",
  entertainment: "bg-util-color-purple-50 text-util-color-purple-500",
  home: "bg-util-color-brand-50 text-util-color-brand-500",
  bills: "bg-util-color-brand-alt-50 text-util-color-brand-alt-500",
  travel: "bg-util-color-clearblue-50 text-util-color-clearblue-500",
  shopping: "bg-util-color-magenta-50 text-util-color-magenta-500",
  health: "bg-util-color-success-50 text-util-color-success-500",
  personal_care: "bg-util-color-leaf-50 text-util-color-leaf-500",
  education: "bg-util-color-yellow-50 text-util-color-yellow-500",
  gifts_donations: "bg-util-color-rosered-50 text-util-color-rosered-500",
  kids: "bg-util-color-clearblue-50 text-util-color-clearblue-500",
  pets: "bg-util-color-forest-50 text-util-color-forest-500",
  sports_fitness: "bg-util-color-forest-50 text-util-color-forest-500",
  insurance: "bg-util-color-waterblue-50 text-util-color-waterblue-500",
  taxes: "bg-util-color-warning-50 text-util-color-warning-500",
  fees_charges: "bg-util-color-grey-50 text-util-color-grey-500",
  debt: "bg-util-color-error-50 text-util-color-error-500",
  other: "bg-util-color-grey-50 text-util-color-grey-500"
};
