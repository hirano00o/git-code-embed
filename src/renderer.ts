import type { RenderOptions } from "./types";
import { GITHUB_ICON_SVG } from "./icons";
import { highlight } from "./highlighter";

/**
 * Builds the embed container DOM node and replaces the anchor in the document.
 *
 * Security note on innerHTML usage:
 * - iconWrap.innerHTML: set from GITHUB_ICON_SVG, a static trusted constant in icons.ts
 * - tdCode.innerHTML: set from highlight.js output, which escapes all HTML entities
 *   in the source code before returning. Neither value originates from user input.
 */
export function renderEmbed({ parsed, content, anchor }: RenderOptions): void {
  const { owner, repo, ref, path } = parsed;
  const { lines, lineStart, lineEnd, totalLines, extension, isBinary } =
    content;

  // Encode each path/ref segment individually to preserve "/" as the path delimiter.
  const encodedRef = ref.split("/").map(encodeURIComponent).join("/");
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const fileUrl = `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/blob/${encodedRef}/${encodedPath}`;

  // --- Container ---
  const container = document.createElement("div");
  container.className = "gce-container";

  // --- Header ---
  const header = document.createElement("div");
  header.className = "gce-header";

  // Icon (static SVG constant — not user data)
  const iconWrap = document.createElement("span");
  iconWrap.className = "gce-header-icon";
  iconWrap.innerHTML = GITHUB_ICON_SVG;
  header.appendChild(iconWrap);

  // Info block
  const info = document.createElement("div");
  info.className = "gce-header-info";

  // Title: "owner/repo / path/to/file"
  const titleEl = document.createElement("div");
  titleEl.className = "gce-header-title";
  const titleLink = document.createElement("a");
  titleLink.href = fileUrl;
  titleLink.target = "_blank";
  titleLink.rel = "noopener noreferrer";
  titleLink.textContent = `${owner}/${repo}/${path}`;
  titleEl.appendChild(titleLink);
  info.appendChild(titleEl);

  // Meta: "Lines N to M in ref" or "No line"
  const metaEl = document.createElement("div");
  metaEl.className = "gce-header-meta";
  if (isBinary) {
    metaEl.textContent = "No line";
  } else if (totalLines === 0) {
    metaEl.textContent = "Empty file";
  } else {
    metaEl.textContent = `Lines ${lineStart} to ${lineEnd} in ${ref}`;
  }
  info.appendChild(metaEl);

  header.appendChild(info);
  container.appendChild(header);

  // --- Body ---
  if (isBinary) {
    const noContent = document.createElement("div");
    noContent.className = "gce-no-content";
    const viewLink = document.createElement("a");
    viewLink.href = fileUrl;
    viewLink.target = "_blank";
    viewLink.rel = "noopener noreferrer";
    viewLink.textContent = "GitHubでファイルを表示する";
    noContent.appendChild(viewLink);
    container.appendChild(noContent);
  } else {
    const wrap = document.createElement("div");
    wrap.className = "gce-code-wrap";

    const table = document.createElement("table");
    table.className = "gce-table";

    // Highlight all lines together to preserve cross-line language context
    const fullCode = lines.join("\n");
    const highlightedHtml = highlight(fullCode, extension);
    // Split highlighted HTML back into per-line chunks
    const highlightedLines = splitHighlightedLines(
      highlightedHtml,
      lines.length
    );

    for (let i = 0; i < lines.length; i++) {
      const lineNum = lineStart + i;
      const tr = document.createElement("tr");

      const tdNum = document.createElement("td");
      tdNum.className = "gce-lineno";
      tdNum.textContent = String(lineNum);
      tr.appendChild(tdNum);

      const tdCode = document.createElement("td");
      tdCode.className = "gce-code";
      // highlight.js escapes all HTML entities in source code before output
      tdCode.innerHTML = highlightedLines[i] ?? "";
      tr.appendChild(tdCode);

      table.appendChild(tr);
    }

    wrap.appendChild(table);
    container.appendChild(wrap);
  }

  // Replace anchor in DOM
  anchor.parentNode?.replaceChild(container, anchor);
}

/** Exported only for unit testing — not part of the public API. */
export { splitHighlightedLines as splitHighlightedLinesForTest };

/**
 * Splits a single highlight.js HTML output string into per-line fragments.
 * highlight.js may wrap span tokens across lines, so we track unclosed tags
 * and carry them across line boundaries to ensure valid HTML per cell.
 */
function splitHighlightedLines(html: string, lineCount: number): string[] {
  if (lineCount === 0) return [];

  const lines: string[] = [];
  const rawLines = html.split("\n");

  if (rawLines.length !== lineCount) {
    console.warn(
      `[git-code-embed] highlight line count mismatch: expected ${lineCount}, got ${rawLines.length}`
    );
  }

  // Matches open and close span tags in source order
  const tokenRe = /(<span[^>]*>)|(<\/span>)/g;

  // Tags opened in previous lines that are still unclosed at the current line boundary
  let inheritedTags: string[] = [];

  for (let i = 0; i < lineCount; i++) {
    const rawLine = rawLines[i] ?? "";
    const prefix = inheritedTags.join("");

    // Walk open/close tokens in source order to track the running stack for this line.
    // Closing tags pop from lineStack first; only when lineStack is empty do they
    // consume an inherited tag. This correctly handles patterns like </span><span>
    // where the close belongs to an inherited tag and the open starts a new one.
    const lineStack: string[] = [];
    let token: RegExpExecArray | null;
    tokenRe.lastIndex = 0;
    while ((token = tokenRe.exec(rawLine)) !== null) {
      if (token[1] !== undefined) {
        lineStack.push(token[1]);
      } else {
        if (lineStack.length > 0) {
          lineStack.pop();
        } else {
          inheritedTags.pop();
        }
      }
    }

    // lineStack holds tags opened in this line that were not closed in this line
    const nextInherited = [...inheritedTags, ...lineStack];
    const suffix = "</span>".repeat(nextInherited.length);
    lines.push(prefix + rawLine + suffix);

    inheritedTags = nextInherited;
  }

  return lines;
}
