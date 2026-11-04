# Rules

- Before you change a file, check the relevant documentation. You must use Context7 first for any library, framework, SDK, API, CLI tool, or cloud service. If Context7 is unavailable or lacks relevant documentation, use web search.

- Add doc on functions, structures, enums, modules, traits, etc. Add comments on complex / important logic. All docs must follow `humanizer` skill and `simplified-technical-english-asd-ste100` (when appropriate) skill.

- When implementing functions, first check if similar functions already existed somewhere. If appropriate, extract the functions and reuse them.

- When working with ui code, check `vue`, `vue-testing-best-practices`, `vue-router-best-practices` and `web-design-guidelines` skills for guidelines.

- Use `@/` import paths for files under `src` unless they are in the same folder.

- When you need components, check shadcn-vue online.

- Use flex gap (preferred) / grid gap instead of margin for spacing between elements.

- Add animations where appropriate. Check `ui-animation` skill.

- Run format and test after code changes.

- When adding or editing locale files (`src/locales/**/*.ftl`), follow the rules and glossary in `src/locales/README.md`.

- This repository is public. The private dev tools are in `devtools/`, which is a separate repository that this repository ignores. Commit tool changes there. Do not move tool files, tool docs or backlog notes into this repository. A clone without `devtools/` must build and run.
