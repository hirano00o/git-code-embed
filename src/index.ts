import { CSS } from "./styles";
import { parseGitHubUrl } from "./parser";
import { fetchContent } from "./fetcher";
import { renderEmbed } from "./renderer";

function injectStyles(): void {
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);
}

async function processAnchor(anchor: HTMLAnchorElement): Promise<void> {
  const parsed = parseGitHubUrl(anchor.href);
  if (!parsed) return;

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
  const githubAnchors = anchors.filter((a) => parseGitHubUrl(a.href) !== null);

  // Process all anchors concurrently
  return Promise.all(githubAnchors.map(processAnchor)).then(() => undefined);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => void init());
} else {
  void init();
}
