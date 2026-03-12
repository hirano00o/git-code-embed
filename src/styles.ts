/**
 * CSS injected into the page as a single <style> tag.
 * All class names use the `gce-` prefix to avoid collisions with host pages.
 *
 * Build-time constant __THEME__ selects the color palette.
 * Dead code elimination removes the unused palette from the bundle.
 */

declare const __THEME__: string;

export const LIGHT_COLORS = `
:root {
  --gce-bg: #f6f8fa;
  --gce-border: #d0d7de;
  --gce-header-bg: #f6f8fa;
  --gce-header-text: #24292f;
  --gce-header-link: #0969da;
  --gce-lineno-color: #6e7781;
  --gce-lineno-bg: #f6f8fa;
  --gce-code-bg: #ffffff;
  --gce-scrollbar-thumb: #afb8c1;
}

.gce-container .hljs-keyword,
.gce-container .hljs-selector-tag,
.gce-container .hljs-built_in,
.gce-container .hljs-name,
.gce-container .hljs-tag { color: #cf222e; }

.gce-container .hljs-string,
.gce-container .hljs-attr,
.gce-container .hljs-symbol,
.gce-container .hljs-bullet,
.gce-container .hljs-addition { color: #0a3069; }

.gce-container .hljs-title,
.gce-container .hljs-section,
.gce-container .hljs-type,
.gce-container .hljs-function { color: #8250df; }

.gce-container .hljs-variable,
.gce-container .hljs-template-variable { color: #953800; }

.gce-container .hljs-comment,
.gce-container .hljs-quote,
.gce-container .hljs-deletion,
.gce-container .hljs-meta { color: #6e7781; font-style: italic; }

.gce-container .hljs-number,
.gce-container .hljs-regexp,
.gce-container .hljs-literal,
.gce-container .hljs-doctag { color: #0550ae; }
`;

export const DARK_COLORS = `
:root {
  --gce-bg: #161b22;
  --gce-border: #30363d;
  --gce-header-bg: #161b22;
  --gce-header-text: #e6edf3;
  --gce-header-link: #58a6ff;
  --gce-lineno-color: #8b949e;
  --gce-lineno-bg: #161b22;
  --gce-code-bg: #0d1117;
  --gce-scrollbar-thumb: #484f58;
}

.gce-container .hljs-keyword,
.gce-container .hljs-selector-tag,
.gce-container .hljs-built_in,
.gce-container .hljs-name,
.gce-container .hljs-tag { color: #ff7b72; }

.gce-container .hljs-string,
.gce-container .hljs-attr,
.gce-container .hljs-symbol,
.gce-container .hljs-bullet,
.gce-container .hljs-addition { color: #a5d6ff; }

.gce-container .hljs-title,
.gce-container .hljs-section,
.gce-container .hljs-type,
.gce-container .hljs-function { color: #d2a8ff; }

.gce-container .hljs-variable,
.gce-container .hljs-template-variable { color: #ffa657; }

.gce-container .hljs-comment,
.gce-container .hljs-quote,
.gce-container .hljs-deletion,
.gce-container .hljs-meta { color: #8b949e; font-style: italic; }

.gce-container .hljs-number,
.gce-container .hljs-regexp,
.gce-container .hljs-literal,
.gce-container .hljs-doctag { color: #79c0ff; }
`;

const THEME_COLORS = __THEME__ === "dark" ? DARK_COLORS : LIGHT_COLORS;

export const CSS = `
:root {
  --gce-line-height: 1.5em;
  --gce-font-size: 13px;
  --gce-font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  --gce-ui-font-family: -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
}
${THEME_COLORS}
.gce-container,
.gce-container *,
.gce-container *::before,
.gce-container *::after {
  box-sizing: border-box;
}

.gce-container {
  border: 1px solid var(--gce-border);
  border-radius: 6px;
  overflow: hidden;
  font-family: var(--gce-font-family);
  font-size: var(--gce-font-size);
  margin: 1em 0;
  background: var(--gce-code-bg);
}

.gce-container .gce-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--gce-header-bg);
  border-bottom: 1px solid var(--gce-border);
  color: var(--gce-header-text);
  line-height: 1.4;
}

.gce-container .gce-header-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  fill: var(--gce-header-text);
}

.gce-container .gce-header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  font-family: var(--gce-ui-font-family);
  line-height: 1.4;
}

.gce-container .gce-header-title {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gce-container .gce-header-title a {
  color: var(--gce-header-link);
  text-decoration: unset;
}

.gce-container .gce-header-title a:hover {
  text-decoration: underline;
}

.gce-container .gce-header-meta {
  font-size: 12px;
  color: var(--gce-lineno-color);
}

.gce-container .gce-code-wrap {
  overflow-x: auto;
  overflow-y: auto;
  max-height: calc(var(--gce-line-height) * 15 + 2px);
}

/* Firefox: scrollbar-width が有効な場合 ::-webkit-scrollbar-* も無視されるため @supports で排他化 */
@supports not selector(::-webkit-scrollbar) {
  .gce-container .gce-code-wrap {
    scrollbar-color: var(--gce-scrollbar-thumb) var(--gce-code-bg);
    scrollbar-width: thin;
  }
}

/* Safari / Chrome 120 以下 */
.gce-container .gce-code-wrap::-webkit-scrollbar { width: 8px; height: 8px; }
.gce-container .gce-code-wrap::-webkit-scrollbar-track { background: var(--gce-code-bg); }
.gce-container .gce-code-wrap::-webkit-scrollbar-thumb { background-color: var(--gce-scrollbar-thumb); }
.gce-container .gce-code-wrap::-webkit-scrollbar-corner { background: var(--gce-code-bg); }

.gce-container .gce-table {
  border-collapse: collapse;
  width: 100%;
  display: table;
}

.gce-container .gce-table td.gce-lineno {
  width: 1%;
  user-select: none;
  text-align: right;
  padding: 0 12px 0 12px;
  color: var(--gce-lineno-color);
  background: var(--gce-lineno-bg);
  border-top: none;
  border-bottom: none;
  border-left: none;
  border-right: 1px solid var(--gce-border);
  line-height: var(--gce-line-height);
  white-space: nowrap;
  vertical-align: top;
}

.gce-container .gce-table td.gce-code {
  width: 100%;
  padding: 0 16px;
  line-height: var(--gce-line-height);
  white-space: pre;
  vertical-align: top;
  border: none;
}

.gce-container .gce-table td.gce-code .hljs {
  padding: 0;
  background: transparent;
}

.gce-container .gce-no-content {
  padding: 16px;
  text-align: center;
  color: var(--gce-lineno-color);
  font-family: var(--gce-ui-font-family);
}

.gce-container .gce-no-content a {
  color: var(--gce-header-link);
  font-size: .9rem;
  text-decoration: none;
}

.gce-container .hljs-emphasis { font-style: italic; }

.gce-container .hljs-strong { font-weight: bold; }
`;
