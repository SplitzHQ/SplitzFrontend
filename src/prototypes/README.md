# Prototypes

Dev-only pages for trying design ideas with real Splitz components. Each prototype puts two or more variants side by side so you can compare them and record a decision.

Open the index on the dev server: `bun run dev`, then go to `/prototypes` (it redirects to `/src/prototypes/`).

## Folder layout

```
src/prototypes/
  index.html, index.ts, PrototypeIndex.vue   the list of all prototypes
  kit/                                       shared helpers (mount, frames, choices, status)
  2026-11-02-balance-card/                   one prototype (an example)
    index.html                               page shell: title and status meta
    main.ts                                  calls mountPrototype()
    BalanceCardPrototype.vue                 the page: choices, demo states, variants
    model.ts                                 sample data
    SplitTotalsCard.vue                      the new variant
```

## Add a prototype

1. Make a folder named `YYYY-MM-DD-<name>`, with today's date. The index finds every `<dated folder>/*.html` page. Folders without a date (such as `kit`) are not listed.
2. Copy `index.html` and `main.ts` from the example. Change the `<title>`: the index shows it.
3. Set the status in the `<head>`:

   ```html
   <head>
     <meta name="prototype-status" content="todo" />
     <meta name="prototype-status-note" content="src/pages/Foo/Foo.vue" />
   </head>
   ```

   Status values: `done`, `partial`, `todo`, `dropped`, `tool`. The note is optional. Use it to say where the app has the design, or why it was dropped. Update the status when the work lands in the app.

4. Build the page in a root component and mount it with `mountPrototype()` from `kit/mount.ts`. It installs Pinia and fluent, so real components and `$t()` work. It also adds the status badge.
5. Use the kit:
   - `PrototypeShell` for the page header, the back link and the light/dark switch.
   - `VariantFrame` for each variant, in a phone-width frame. Mark the variant that shows the app today with `current`.
   - `PrototypeChoice` for each question the viewer must decide.
6. Call `registerChoices()` from `kit/choices.ts` with the current picks. The badge then shows **Export my choices**, which writes `choices.json` into the prototype folder (dev server only) and copies it to the clipboard. Read that file when you build the chosen variant.

Keep sample data in the prototype folder. Do not call the backend. Copy that only exists in a prototype can be plain English. Move it to `src/locales` when the design goes into the app.

## Production builds

Prototype pages never ship:

- `vite build` uses only the root `index.html` as input, and no app code imports from `src/prototypes`.
- `src/assets/base.css` excludes this folder from Tailwind's class scan, so prototype-only utility classes do not reach the app CSS. `kit/prototypes.css` adds the folder back for the prototype pages.
- The `/prototypes` redirect and the `choices.json` endpoint come from `vite.config.prototypes.ts`, which runs on the dev server only.

Do not import from `src/prototypes` in app code. To reuse a prototype component, move it into `src/components` or `src/pages` first.
