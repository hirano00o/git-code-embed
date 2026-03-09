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

import type { ParsedGitHubUrl } from "./types";

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

  const anchors = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("a[href]")
  );
  const githubAnchors = anchors.flatMap((a) => {
    const parsed = parseGitHubUrl(a.href);
    return parsed ? [{ anchor: a, parsed }] : [];
  });

  // Process all anchors concurrently
  return Promise.all(
    githubAnchors.map(({ anchor, parsed }) => processAnchor(anchor, parsed))
  ).then(() => undefined);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => void init());
} else {
  void init();
}
