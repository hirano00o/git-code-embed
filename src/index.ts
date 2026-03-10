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

function isEdgeSibling(node: Node | null): boolean {
  if (node === null) return true;
  // Allow whitespace-only text nodes (e.g. newline + indent between block elements)
  if (node.nodeType === Node.TEXT_NODE) return node.textContent?.trim() === "";
  return node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "BR";
}

function isStandaloneAnchor(a: HTMLAnchorElement): boolean {
  return isEdgeSibling(a.previousSibling) && isEdgeSibling(a.nextSibling);
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
