---
name: spz-brand-use
description: Read the Splitz brand rules before changing the logo, glyph, app icons, brand colors, logo motion, or brand patterns. Use this skill for every change to `src/components/BrandWordmark/`, `public/favicon.svg`, the PNG and ICO icons in `public/`, `pwa-assets.config.ts`, or the brand tokens in `src/assets/`. Also use it when adding the logo or a brand pattern to a screen, splash view, store graphic, or exported image, even when the change looks small.
---

# Brand use

`src/components/BrandWordmark/brand.usage.ts` is the single source of truth for Splitz brand rules: logo anatomy, logo forms, colorways, brand colors, clear space, minimum sizes, misuse cases, source files, app icons, motion principles, and brand patterns.

`src/components/BrandWordmark/brand-wordmark.usage.ts` holds the component-level rules: size presets, which component to mount on each screen, internal motion behavior, and accessibility requirements.

## Before a change

1. Read `src/components/BrandWordmark/brand.usage.ts` and locate the section affected by your change.
2. When mounting or editing a logo component, also read `src/components/BrandWordmark/brand-wordmark.usage.ts`.
3. Check `OPEN_QUESTIONS` in both files. Ask the user before proceeding if the change depends on an unresolved question.
4. Follow the rules, and follow `.agents/skills/spz-component-use/SKILL.md` for surrounding UI components.
5. After any visible change, inspect the logo in the browser at mobile width in both light and dark themes.

## Common changes

| Change                        | What to do                                                                                                                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Show the logo on a page       | Use `BrandWordmark` with a size from `SIZE_GUIDE`, respecting clear space and minimum size. Never render the brand logo as plain HTML text.                                                                                  |
| Change the shape of the glyph | Update `brand-glyph.ts`, the matching metrics in `brand-motion.ts`, and `public/favicon.svg` together, then run `bun run generate-pwa-assets` (see `GLYPH_RULES`).                                                           |
| Change a brand color          | Update every file listed in the "Change a value" rule of `COLOR_RULES` together, then regenerate the PWA icons.                                                                                                              |
| Change an app icon            | Edit only `public/favicon.svg`, then run `bun run generate-pwa-assets`. Keep the glyph inside the maskable safe zone, and remind the user to re-add the home-screen shortcut on iOS because iOS caches existing icons.       |
| Show a brand pattern          | Read `PATTERN_USE_GUIDE` and `PATTERN_RULES`, start from the matching preset in the devtools Patterns tool, and ask the user if no existing use case fits.                                                                   |
| Change the logo motion        | Update `brand-motion.ts`. Because the cold-start opening and both tap animations share the same glyph assembly sequence, keep them synchronized and follow `MOTION_RULES`.                                                   |

## When the rules do not decide

Stop and ask the user when any of these apply:

- No rule covers the case.
- Two rules conflict.
- A rule looks wrong for the target surface.
- The rule depends on an entry in `OPEN_QUESTIONS`.

State the relevant rule, the specific case, and your recommendation. Once the user decides, record the decision in the usage file and remove any resolved item from `OPEN_QUESTIONS` in the same change. Never invent a new rule without user confirmation.

If the user corrects a brand choice that is not yet covered, ask whether the correction should become a rule, and record it in the usage file if so.

## Updating the rules

- Keep every rule in a single usage file; reference that file from code comments instead of duplicating rules.
- Type option maps as `Record<Option, Rule>` (for logo forms, colorways, and misuse cases) so TypeScript catches missing rules when new options are added.
- Never import `*.usage.ts` files from application runtime code.
- When `devtools/` is present, verify the Brand page in devtools, which renders `brand.usage.ts` directly.
