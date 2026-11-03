import { copyToClipboard } from "@/libs/copy-to-clipboard";
import "@/assets/base.css";
import "@/assets/color.css";

import markdown from "../../docs/待办与暂缓.md?raw";
import "./backlog.css";
import { type Block, buildPrompt, parseBacklog } from "./parse";

/*
 * The backlog page: `docs/待办与暂缓.md` rendered as a page. The Markdown file stays the only source. The page
 * imports it with `?raw`, so the dev server reloads the page when the file changes. The page has its own HTML entry
 * (`index.html` in this folder). The app build does not include it.
 */

const copyLabel = "复制 prompt";

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);
}

/** Renders inline Markdown: `code` and **bold**. Text inside backticks is not parsed for bold. */
function inline(text: string): string {
  return text
    .split("`")
    .map((part, i) =>
      i % 2 ? `<code>${escapeHtml(part)}</code>` : escapeHtml(part).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    )
    .join("");
}

const { body, title, updated } = parseBacklog(markdown);
/** The prompt text of each numbered row, by row id. */
const prompts = new Map<string, string>();
/** The level-2 heading above the block that renders now. A row's prompt names it as the group. */
let group = "";

function renderBlock(block: Block): string {
  switch (block.kind) {
    case "h": {
      if (block.level === 2) group = block.text;
      const count = block.count ? ` <span>${block.count}</span>` : "";
      return `<h${block.level}>${inline(block.text)}${count}</h${block.level}>`;
    }
    case "p":
      return `<p>${block.lines.map(inline).join("<br>")}</p>`;
    case "ul":
      return `<ul>${block.items.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`;
    case "table": {
      // A table with "#" as its first column header is numbered: each row gets an anchor and a copy button.
      const numbered = block.head[0] === "#";
      const row = (cells: string[]) => {
        const tds = cells.map((cell) => `<td>${inline(cell)}</td>`).join("");
        if (!numbered) return `<tr>${tds}</tr>`;
        const [id = "", rowTitle = "", ...notes] = cells;
        prompts.set(
          id,
          buildPrompt(
            id,
            rowTitle,
            group,
            notes.map((note, i) => [block.head[i + 2] ?? "", note])
          )
        );
        const button = `<button type="button" data-copy="${escapeHtml(id)}">${copyLabel}</button>`;
        return `<tr id="${escapeHtml(id)}">${tds}<td class="bl-copy">${button}</td></tr>`;
      };
      const head = block.head.map((cell) => `<th>${inline(cell)}</th>`).join("") + (numbered ? "<th></th>" : "");
      return `<table><thead><tr>${head}</tr></thead><tbody>${block.rows.map(row).join("")}</tbody></table>`;
    }
  }
}

const root = document.querySelector<HTMLElement>("#root")!;
root.innerHTML = `
  <header class="bl-head">
    <h1>${title ? inline(title.text) : "待办与暂缓"} <span>${title?.count ?? ""}</span></h1>
    ${updated ? `<time>最后更新 ${escapeHtml(updated)}</time>` : ""}
  </header>
  ${body.map(renderBlock).join("")}`;

// Scroll to the row that the URL names (for example /src/backlog/#3) after the rows exist.
if (location.hash) {
  document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ block: "center" });
}

/**
 * Copies with a selected textarea and `execCommand`. The page uses this when the Clipboard API refuses: on a LAN
 * address over plain HTTP (not a secure context), or in a browser that denies the clipboard permission.
 */
function copyWithSelection(text: string): boolean {
  const textarea = Object.assign(document.createElement("textarea"), { value: text });
  document.body.append(textarea);
  textarea.select();
  // execCommand is deprecated, but it is the only fallback that does not need the Clipboard API.
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

/** Copies the prompt of the row that the button is in, then shows the result on the button for a short time. */
async function copyPrompt(button: HTMLButtonElement, text: string): Promise<void> {
  const copied = (await copyToClipboard(text)) || copyWithSelection(text);
  button.textContent = copied ? "已复制" : "复制失败";
  button.dataset.done = "";
  setTimeout(() => {
    button.textContent = copyLabel;
    delete button.dataset.done;
  }, 1500);
}

root.addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>("[data-copy]");
  const text = button?.dataset.copy ? prompts.get(button.dataset.copy) : undefined;
  if (button && text) void copyPrompt(button, text);
});
