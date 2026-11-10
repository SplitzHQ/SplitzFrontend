---
name: spz-component-use
description: Choose the shared component and read its usage rules before any UI change in this repository. Use this skill for every change to a Vue template, a page, a layout or a component style in `src/` or `devtools/`, and every time you add or change a button, sheet, input, notice or another shared component. Use it when you pick a variant or a size, and when you change a file in `src/components/`, even if the change looks small.
---

# Component usage

Follow these steps before you change UI code. The rules exist because a guess from a code comment or from a similar screen can look correct and still break the design system.

## Before a UI change

1. Read `src/components/component-index.ts`. Use the `use` field to choose the component.
2. Read the file in the `usage` field of that entry. Do this before you write code.
3. Find the facts that the rules depend on. For example, find the real background under a button. Do not infer the surface from a word such as "card".
4. Follow the rules. After a visible change, look at the result in the browser, at phone width and at desktop width.

For the logo, an app icon or a brand color, also follow `.agents/skills/spz-brand-use/SKILL.md`.

## Text side by side uses one size

Text in one row uses one font size. This rule applies to these pairs:

- A title and its count, for example `Groups 6`.
- A number and its unit, for example `6 groups`.
- A label and its value or count, for example `To do 7/28`.

Show the difference with color or font weight. Do not make one part smaller or larger than the other part.

The rule applies in `src/` and in `devtools/`. Text on two lines is not side by side. For example, a large amount above a small caption is not in this rule.

If the text does not fit in a narrow place with one size, shorten the copy or let the row wrap. Do not make one part smaller to make it fit.

## When the rules do not decide

Stop and ask the user when one of these conditions is true:

- No rule covers the case.
- Two rules conflict.
- A rule looks wrong for this screen.
- The rule depends on an item in `OPEN_QUESTIONS` in the usage file.
- No component in the index fits. Check shadcn-vue first, and ask before you add a component.

In the question, name the rule, the case and your recommendation. After the user decides, write the decision into the usage file in the same change. Do not write a new rule without the decision of the user.

If the user corrects a choice of yours and the rules do not explain the correction, ask whether the correction is a rule. If it is a rule, write it into the usage file.

The rules are for the phone app in `src/`. `devtools/` is a set of desktop tools and follows only part of them. The `RULE_SCOPE` export of a usage file says which part. In `devtools/`, if the rules do not decide, choose and continue. Do not stop to ask, and do not add the choice to the usage file.

## When you change a component

Check the usage file when you change a file in `src/components/`. Update it in the same change when the change affects any of these items:

- A variant, a size, a prop or a slot
- Behavior, accessibility or copy
- When a person must use the component

Also check the design-system page of the component if `devtools/` exists. The page reads the usage file. Commit `devtools/` changes in the `devtools` repository.

The type check rejects an attribute that a component does not declare as a prop (`checkUnknownProps` in `tsconfig.app.json`). `data-*`, `aria-*`, `role` and `hidden` are exempt. If a component must pass native attributes such as `id`, `title` or `tabindex` to its root element, put this block at the top of its file:

```vue
<!--
  @fallthroughAttributes true
  The type check accepts the native attributes of the root element, such as `id` or `tabindex`, on this component.
-->
```

The check then accepts only the attributes of that root element. Do not use the block to hide an error. For example, SButtonBase has a `<span>` root, so `href` on it does nothing. Put a real `<a>` or `<button>` around it.

A new folder in `src/components/` needs an entry in `component-index.ts` and a usage file. The test `src/components/__tests__/component-index.spec.ts` fails without them.

## Rules for usage files

- Put one `*.usage.ts` file in the folder of the component. If the folder has more than one component, use one name for the family, for example `button.usage.ts` in `SButton/`.
- Use it as the one place for the rules. Other comments point to it and do not repeat the rules.
- Use `Record<Option, Rule>` for variants, sizes and other option lists. The type check then fails when a new option has no rule.
- Keep decisions that the user has not made in `OPEN_QUESTIONS`.
- Do not import the file in app code. Only the design-system page and tests import it.

See `src/components/SButton/button.usage.ts` for an example.
