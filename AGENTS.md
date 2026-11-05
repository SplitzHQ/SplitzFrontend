# Rules

- You must read and put all skills in '.agents' folder.

- Before you change a file, check the relevant documentation. You must use Context7 first for any library, framework, SDK, API, CLI tool, or cloud service. If Context7 is unavailable or lacks relevant documentation, use web search.

- Add doc on functions, structures, enums, modules, traits, etc. Add comments on complex / important logic. All docs must follow `humanizer` skill and `simplified-technical-english-asd-ste100` (when appropriate) skill.

- When implementing functions, first check if similar functions already existed somewhere. If appropriate, extract the functions and reuse them.

- When working with ui code, check `vue`, `vue-testing-best-practices`, `vue-router-best-practices` and `web-design-guidelines` skills for guidelines.
  These skills are in `.agents/skills/<name>/SKILL.md`.

- Before any UI change in `src/` or `devtools/`, follow `.claude/skills/component-usage/SKILL.md`. Choose the component first, then read its usage file. If the rules do not decide, ask the user and write the decision into the usage file.

- Before a design or UI task, decide if the task needs a prototype first. Follow `devtools/.claude/skills/prototype/SKILL.md`. If `devtools/` does not exist, ask the user.

- When you add a backlog card, follow the category rule in `devtools/AGENTS.md`. Ask the user before you add a category.

- When you change a component in `src/components/`, check its usage file and update it in the same change when needed. A new component needs a usage file.

- Use tailwindcss classes for styling. Use scss for custom styles only when using tailwindcss makes it too complex or impossible.

- Use `@/` import paths for files under `src` unless they are in the same folder.

- When you need components, check shadcn-vue online.

- Use flex gap (preferred) / grid gap instead of margin for spacing between elements.

- Add animations where appropriate. Check `ui-animation` skill.

- Run format and test after code changes.

- When adding or editing locale files (`src/locales/**/*.ftl`), follow the rules and glossary in `src/locales/README.md`.

- This repository is public. The private dev tools are in `devtools/`, which is a separate repository that this repository ignores. Commit tool changes there. Do not move tool files, tool docs or backlog notes into this repository. Component usage files are not tool docs: they stay next to the component in this repository. A clone without `devtools/` must build and run.
