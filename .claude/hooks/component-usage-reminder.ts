/**
 * A Claude Code hook that runs after Edit and Write. When a change touches a component in `src/components`, it tells the
 * agent to check the usage rules of that component. The hook only adds a reminder, and it never blocks the edit.
 */
import { COMPONENT_INDEX } from "../../src/components/component-index";

/** Files that do not change how people use a component. */
const SKIPPED_FILE = /(\/__tests__\/|\.spec\.ts$|\.stories\.ts$|\.usage\.ts$)/;

const input = (await Bun.stdin.json()) as { tool_input?: { file_path?: string } };
const path = (input.tool_input?.file_path ?? "").replaceAll("\\", "/");
const folder = /\/src\/components\/([^/]+)\//.exec(path)?.[1];

if (folder && !SKIPPED_FILE.test(path)) {
  const usage = COMPONENT_INDEX.find((entry) => entry.folder === folder)?.usage;
  const target = usage
    ? `Check if this change affects ${usage}. If it does, update that file in the same change.`
    : `${folder} has no usage file yet. Tell the user in your closing message if this change adds a rule that people must follow.`;

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        additionalContext: `You changed the ${folder} component. ${target} See .claude/skills/component-usage/SKILL.md.`,
        hookEventName: "PostToolUse",
      },
    })
  );
}
