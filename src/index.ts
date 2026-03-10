import type { ParsedGitHubUrl } from "./types";
import { CSS } from "./styles";
import { parseGitHubUrl } from "./parser";
import { fetchContent } from "./fetcher";
import { renderEmbed } from "./renderer";

function injectStyles(): void {
  if (document.querySelector("style[data-gce]")) return;
  const style = document.createElement("style");
  style.setAttribute("data-gce", "");
  style.textContent = CSS;
  document.head.appendChild(style);
}

// Block-level elements that act as line boundaries in normal HTML flow.
const BLOCK_TAGS = new Set([
  "ADDRESS", "ARTICLE", "ASIDE", "BLOCKQUOTE", "DD", "DETAILS", "DIALOG",
  "DIV", "DL", "DT", "FIELDSET", "FIGCAPTION", "FIGURE", "FOOTER", "FORM",
  "H1", "H2", "H3", "H4", "H5", "H6", "HEADER", "HGROUP", "HR", "LI",
  "MAIN", "NAV", "OL", "P", "PRE", "SECTION", "SUMMARY", "TABLE", "UL",
  "BR",
]);

// Returns the nearest non-whitespace sibling node, skipping whitespace-only text nodes.
function nonWhitespaceSibling(
  node: Node | null,
  direction: "previous" | "next"
): Node | null {
  let cur = node;
  while (cur !== null) {
    if (cur.nodeType === Node.TEXT_NODE) {
      if (cur.textContent?.trim() !== "") return cur;
    } else {
      return cur;
    }
    cur = direction === "previous" ? cur.previousSibling : cur.nextSibling;
  }
  return null;
}

function isStandaloneAnchor(a: HTMLAnchorElement): boolean {
  const prev = nonWhitespaceSibling(a.previousSibling, "previous");
  const next = nonWhitespaceSibling(a.nextSibling, "next");
  // null (edge of parent) or a block-level element both act as line boundaries
  const isLineBoundary = (n: Node | null): boolean =>
    n === null ||
    (n.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has((n as Element).tagName));
  return isLineBoundary(prev) && isLineBoundary(next);
}

async function processAnchor(
  anchor: HTMLAnchorElement,
  parsed: ParsedGitHubUrl
): Promise<void> {
  try {
    const content = await fetchContent(parsed);
    renderEmbed({ parsed, content, anchor });
  } catch (err) {
    // Progressive Enhancement: keep original link on error
    console.warn("[git-code-embed] Failed to embed", anchor.href, err);
  }
}

export function init(): Promise<void> {
  injectStyles();

  // Exclude links inside already-rendered containers to prevent re-processing
  // when init() is called more than once (e.g., after dynamic content insertion).
  // Use closest() rather than :not(.gce-container a) — complex :not() selectors
  // (those with descendant combinators) are unsupported before Chrome 88.
  const anchors = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("a[href]")
  ).filter((a) => !a.closest(".gce-container"));
  const githubAnchors = anchors.flatMap((a) => {
    if (!isStandaloneAnchor(a)) return [];
    const parsed = parseGitHubUrl(a.href);
    return parsed ? [{ anchor: a, parsed }] : [];
  });

  // Process all anchors concurrently
  return Promise.all(
    githubAnchors.map(({ anchor, parsed }) => processAnchor(anchor, parsed))
  ).then(() => undefined);
}
