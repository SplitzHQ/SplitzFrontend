/**
 * A Claude Code hook that runs after Edit and Write. When a change touches a component in `src/components`, it tells the
 * agent to check the usage rules of that component. The hook only adds a reminder, and it never blocks the edit.
 */
import { readdirSync, readFileSync } from "node:fs";

/** Files that do not change how people use a component. */
const SKIPPED_FILE = /(\/__tests__\/|\.spec\.ts$|\.stories\.ts$|\.usage\.ts$)/;

const input = JSON.parse(readFileSync(0, "utf8")) as { tool_input?: { file_path?: string } };
const path = (input.tool_input?.file_path ?? "").replaceAll("\\", "/");
const match = /^(.*\/src\/components\/([^/]+))\//.exec(path);

if (match && !SKIPPED_FILE.test(path)) {
  const [, folderPath, folder] = match;
  const usage = readdirSync(folderPath).find((name) => name.endsWith(".usage.ts"));
  const target = usage
    ? `Check if this change affects src/components/${folder}/${usage}. If it does, update that file in the same change.`
    : `${folder} has no usage file yet. Tell the user in your closing message if this change adds a rule that people must follow.`;

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        additionalContext: `You changed the ${folder} component. ${target} See .agents/skills/spz-component-use/SKILL.md.`,
        hookEventName: "PostToolUse",
      },
    })
  );
}
