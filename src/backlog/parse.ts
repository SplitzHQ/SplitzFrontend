/**
 * Parser for `docs/待办与暂缓.md`. It reads only the Markdown that the document uses: headings, paragraphs, tables
 * and `- ` lists. Inline `code` and **bold** stay in the text. The page renders them.
 */

export interface Heading {
  kind: "h";
  level: number;
  text: string;
  /** The number of entries under this heading, sub-headings included. An entry is a table row or a list item. */
  count: number;
}

export interface Paragraph {
  kind: "p";
  lines: string[];
}

export interface Table {
  kind: "table";
  head: string[];
  rows: string[][];
}

export interface List {
  kind: "ul";
  items: string[];
}

export type Block = Heading | Paragraph | Table | List;

/** The parsed document. The title and the `最后更新` line are taken out of `body`. */
export interface Backlog {
  title: Heading | undefined;
  updated: string;
  body: Block[];
}

/** A line that starts a heading, a table or a list. Such a line ends a paragraph. */
const blockStart = /^(#{1,6}\s|\||- )/;
const updatedLine = /^最后更新[：:]\s*(.+)$/;

/** Splits one table line into trimmed cells. The outer pipes are optional. */
function cells(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

/** Splits Markdown into blocks. Each heading has a count of 0. Call `countEntries` to fill the counts. */
export function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({ count: 0, kind: "h", level: heading[1].length, text: heading[2].trim() });
      i++;
    } else if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) tableLines.push(lines[i++]);
      // The second line is the |---| separator.
      blocks.push({ head: cells(tableLines[0]), kind: "table", rows: tableLines.slice(2).map(cells) });
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      // An indented line continues the item above it.
      while (i < lines.length && (lines[i].startsWith("- ") || (items.length > 0 && /^\s+\S/.test(lines[i])))) {
        const current = lines[i++];
        if (current.startsWith("- ")) items.push(current.slice(2));
        else items[items.length - 1] += ` ${current.trim()}`;
      }
      blocks.push({ items, kind: "ul" });
    } else if (line.trim()) {
      const paragraph: string[] = [];
      while (i < lines.length && lines[i].trim() && !blockStart.test(lines[i])) paragraph.push(lines[i++]);
      blocks.push({ kind: "p", lines: paragraph });
    } else {
      i++;
    }
  }
  return blocks;
}

/**
 * Sets the count of each heading to the number of entries under it. A heading contains all blocks up to the next
 * heading of the same or a higher level, so a parent heading also counts the entries of its sub-headings.
 */
export function countEntries(blocks: Block[]): void {
  const open: Heading[] = [];
  for (const block of blocks) {
    if (block.kind === "h") {
      block.count = 0;
      while (open.length > 0 && open[open.length - 1].level >= block.level) open.pop();
      open.push(block);
    } else if (block.kind === "table" || block.kind === "ul") {
      const entries = block.kind === "table" ? block.rows.length : block.items.length;
      for (const heading of open) heading.count += entries;
    }
  }
}

/** Parses the document, fills the counts, and takes out the level-1 title and the `最后更新` line. */
export function parseBacklog(markdown: string): Backlog {
  const blocks = parseBlocks(markdown);
  countEntries(blocks);
  let updated = "";
  const body = blocks.filter((block) => {
    const match = block.kind === "p" && block.lines.length === 1 ? updatedLine.exec(block.lines[0]) : null;
    if (match) updated = match[1].trim();
    return !match;
  });
  const first = body[0];
  const title = first?.kind === "h" && first.level === 1 ? first : undefined;
  if (title) body.shift();
  return { body, title, updated };
}

/**
 * Builds the text that the `复制 prompt` button copies for one numbered row. The user pastes it into a new Claude
 * session. The text tells that session to ask questions and to get approval before it starts the work.
 * `notes` holds the other cells of the row as [column header, cell text] pairs.
 */
export function buildPrompt(id: string, title: string, group: string, notes: [string, string][]): string {
  return `接手 docs/待办与暂缓.md 里的 #${id}：${title}

分组：${group}
${notes.map(([label, text]) => `${label}：${text}`).join("\n")}

做法：
1. 先读 docs/待办与暂缓.md 的 #${id}，以及上面提到的文件，弄清现状。这一步不改任何文件。
2. 用 AskUserQuestion 问我一系列问题，确认你理解了我的需求：目标、范围、交互和细节、和已有决定的冲突（如果有）、做到什么程度算完成。一次问几个，根据回答继续追问，直到没有不确定的地方。
3. 用几句话复述你理解的需求和计划，等我确认后再开始推进。推进时照 AGENTS.md 里的规则走。
4. 开始推进时，在文档 #${id} 的备注后面标上「进行中：<这个 session 的标题>」；做完后把这一条从文档里删掉，其他条目不重新编号。`;
}
