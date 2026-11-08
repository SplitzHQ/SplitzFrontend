---
name: spz-brand-use
description: Read the Splitz brand rules before you change the logo, the glyph, an app icon, a brand color, the logo motion or a brand pattern. Use this skill for every change to `src/components/BrandWordmark/`, `public/favicon.svg`, `public/app-icon-masked.svg`, the PNG and ICO icons in `public/`, the `pwa-assets*.config.ts` files or the brand tokens in `src/assets/`. Also use it when a page starts to show the logo or a pattern, and when you add a splash screen, a store image or another surface with the brand. Use it even when the change looks small.
---

# Brand use

The brand rules are in `src/components/BrandWordmark/brand.usage.ts`. This file is the one place for them: the parts of the logo, the logo forms, the colorways, the brand colors, the clear space, the minimum size, the misuse, the source files, the app icons, the principles of the motion and the brand patterns.

The rules for the logo components are in `src/components/BrandWordmark/brand-wordmark.usage.ts`: the sizes, the component for each page, the motion inside each component and the accessibility.

## Before a change

1. Read `src/components/BrandWordmark/brand.usage.ts`. Find the part that the change touches.
2. If the change uses a logo component, read `src/components/BrandWordmark/brand-wordmark.usage.ts`.
3. Read `OPEN_QUESTIONS` in both files. If the change depends on an open question, ask the user before you start.
4. Follow the rules. For the rest of the UI, follow `.agents/skills/spz-component-use/SKILL.md`.
5. After a visible change, look at the logo in the browser at phone width, in the light and the dark theme.

## Common changes

| Change                        | What to do                                                                                                                                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Show the logo on a page       | Use `BrandWordmark` with a size from `SIZE_GUIDE`. Keep the clear space and the minimum size. Do not write the name as text in place of the logo.                                                              |
| Change the shape of the glyph | Change `brand-glyph.ts`, the numbers in `brand-motion.ts` and `public/favicon.svg` together. Then run `bun run generate-pwa-assets`. The full list is in `GLYPH_RULES`.                                         |
| Change a brand color          | Change all files in the "Change a value" rule of `COLOR_RULES` together. Then generate the icons again.                                                                                                        |
| Change an app icon            | Change only `public/favicon.svg` and `public/app-icon-masked.svg`, together. Then run `bun run generate-pwa-assets`. Keep the depth in `ICON_RULES`. Keep the glyph in the maskable safe zone. Tell the user to check the icon on a phone, because iOS keeps an icon that a person added. |
| Show a brand pattern          | Read `PATTERN_USE_GUIDE` and `PATTERN_RULES`. Pick the use that fits the surface and start from its preset. Make the pattern in the Patterns tool of the dev tools, which shows each use on a sample screen. If no use fits, ask the user. |
| Change the logo motion        | Change `brand-motion.ts`. The opening and the two taps use one small motion, so change them together. Keep the principles in `MOTION_RULES`.                                                                   |

## When the rules do not decide

Stop and ask the user when one of these conditions is true:

- No rule covers the case.
- Two rules conflict.
- A rule looks wrong for this surface.
- The rule depends on an item in `OPEN_QUESTIONS`.

In the question, name the rule, the case and your recommendation. After the user decides, write the decision into the usage file in the same change, and remove the question from `OPEN_QUESTIONS`. Do not write a new rule without the decision of the user.

If the user corrects a brand choice and the rules do not explain the correction, ask whether the correction is a rule. If it is a rule, write it into the usage file.

## When you change the rules

- Keep each rule in one usage file. Other comments point to the file and do not repeat the rule.
- Use `Record<Option, Rule>` for an option list, for example the forms, the colorways and the misuse cases. The type check then fails when a new option has no rule.
- Do not import a usage file in app code.
- If `devtools/` exists, check the Brand page of the dev tools. The page reads `brand.usage.ts`.
