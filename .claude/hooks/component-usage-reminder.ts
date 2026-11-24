/**
 * Post-edit Claude Code hook that reminds the agent to review a component's `*.usage.ts` rules whenever implementation
 * files under `src/components/` change. Emits context only and never blocks edits.
 */
import { readFileSync } from "node:fs";

import { COMPONENT_INDEX } from "../../src/components/component-index";

/** Test, story, and usage-rule files that do not alter component behavior on their own. */
const NON_USAGE_FILE_PATTERN = /(\/__tests__\/|\.spec\.ts$|\.stories\.ts$|\.usage\.ts$)/;

const hookInput = JSON.parse(readFileSync(0, "utf8")) as { tool_input?: { file_path?: string } };
const normalizedFilePath = (hookInput.tool_input?.file_path ?? "").replaceAll("\\", "/");
const componentFolder = /\/src\/components\/([^/]+)\//.exec(normalizedFilePath)?.[1];

if (componentFolder && !NON_USAGE_FILE_PATTERN.test(normalizedFilePath)) {
  const usageFilePath = COMPONENT_INDEX.find((entry) => entry.folder === componentFolder)?.usage;
  const reminderDetail = usageFilePath
    ? `Check whether this change affects ${usageFilePath}, and update it in the same change if so.`
    : `${componentFolder} has no usage file yet. Note in your closing message if this change introduces a usage rule.`;

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        additionalContext: `You changed the ${componentFolder} component. ${reminderDetail} See .agents/skills/spz-component-use/SKILL.md.`,
        hookEventName: "PostToolUse",
      },
    })
  );
}
