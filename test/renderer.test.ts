import { describe, it, expect, beforeEach } from "vitest";
import { renderEmbed, splitHighlightedLinesForTest } from "../src/renderer";
import type { FetchedContent, ParsedGitHubUrl } from "../src/types";

function makeParsed(overrides?: Partial<ParsedGitHubUrl>): ParsedGitHubUrl {
  return {
    owner: "owner",
    repo: "repo",
    ref: "main",
    path: "src/index.ts",
    ...overrides,
  };
}

function makeContent(overrides?: Partial<FetchedContent>): FetchedContent {
  return {
    lines: ["const x = 1;", "const y = 2;"],
    lineStart: 1,
    lineEnd: 2,
    totalLines: 2,
    extension: "ts",
    isBinary: false,
    ...overrides,
  };
}

function makeAnchor(href: string): HTMLAnchorElement {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = href;
  document.body.appendChild(a);
  return a;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("renderEmbed", () => {
  describe("header", () => {
    it("renders the GitHub icon in the header", () => {
      const anchor = makeAnchor(
        "https://github.com/owner/repo/blob/main/src/index.ts"
      );
      renderEmbed({
        parsed: makeParsed(),
        content: makeContent(),
        anchor,
      });

      const container = document.querySelector(".gce-container");
      expect(container).not.toBeNull();
      const icon = container!.querySelector(".gce-header-icon svg");
      expect(icon).not.toBeNull();
    });

    it("renders a link with owner/repo/path text", () => {
      const anchor = makeAnchor(
        "https://github.com/owner/repo/blob/main/src/index.ts"
      );
      renderEmbed({
        parsed: makeParsed(),
        content: makeContent(),
        anchor,
      });

      const title = document.querySelector(".gce-header-title");
      expect(title).not.toBeNull();
      expect(title!.textContent).toContain("owner/repo");
      expect(title!.textContent).toContain("src/index.ts");

      const link = title!.querySelector("a");
      expect(link).not.toBeNull();
      expect(link!.href).toContain("github.com/owner/repo/blob/main/src/index.ts");
    });

    it("renders 'Lines {start} to {end} in {ref}' in meta", () => {
      const anchor = makeAnchor(
        "https://github.com/owner/repo/blob/main/src/index.ts#L5-L10"
      );
      renderEmbed({
        parsed: makeParsed({ lineStart: 5, lineEnd: 10 }),
        content: makeContent({ lineStart: 5, lineEnd: 10, totalLines: 20 }),
        anchor,
      });

      const meta = document.querySelector(".gce-header-meta");
      expect(meta!.textContent).toContain("Lines 5 to 10");
      expect(meta!.textContent).toContain("main");
    });

    it("renders 'Empty file' in meta for an empty file", () => {
      const anchor = makeAnchor(
        "https://github.com/owner/repo/blob/main/empty.ts"
      );
      renderEmbed({
        parsed: makeParsed({ path: "empty.ts" }),
        content: makeContent({ lines: [], lineStart: 1, lineEnd: 0, totalLines: 0 }),
        anchor,
      });

      const meta = document.querySelector(".gce-header-meta");
      expect(meta!.textContent).toBe("Empty file");
    });

    it("renders 'Lines 1 to {total} in {ref}' when no line range given", () => {
      const anchor = makeAnchor(
        "https://github.com/owner/repo/blob/main/src/index.ts"
      );
      renderEmbed({
        parsed: makeParsed(),
        content: makeContent({ lineStart: 1, lineEnd: 2, totalLines: 2 }),
        anchor,
      });

      const meta = document.querySelector(".gce-header-meta");
      expect(meta!.textContent).toContain("Lines 1 to 2");
    });
  });

  describe("code area", () => {
    it("renders a row for each line", () => {
      const anchor = makeAnchor(
        "https://github.com/owner/repo/blob/main/src/index.ts"
      );
      renderEmbed({
        parsed: makeParsed(),
        content: makeContent({
          lines: ["a", "b", "c"],
          lineStart: 1,
          lineEnd: 3,
          totalLines: 3,
        }),
        anchor,
      });

      const rows = document.querySelectorAll(".gce-table tr");
      expect(rows.length).toBe(3);
    });

    it("renders line numbers starting from lineStart", () => {
      const anchor = makeAnchor(
        "https://github.com/owner/repo/blob/main/src/index.ts#L10-L12"
      );
      renderEmbed({
        parsed: makeParsed({ lineStart: 10, lineEnd: 12 }),
        content: makeContent({
          lines: ["x", "y", "z"],
          lineStart: 10,
          lineEnd: 12,
          totalLines: 20,
        }),
        anchor,
      });

      const lineNos = document.querySelectorAll(".gce-lineno");
      expect(lineNos[0]!.textContent?.trim()).toBe("10");
      expect(lineNos[1]!.textContent?.trim()).toBe("11");
      expect(lineNos[2]!.textContent?.trim()).toBe("12");
    });

    it("applies max-height for scroll via gce-code-wrap class", () => {
      const anchor = makeAnchor(
        "https://github.com/owner/repo/blob/main/src/index.ts"
      );
      renderEmbed({
        parsed: makeParsed(),
        content: makeContent(),
        anchor,
      });

      const wrap = document.querySelector(".gce-code-wrap");
      expect(wrap).not.toBeNull();
    });
  });

  describe("binary file", () => {
    it("renders 'No line' in meta for binary files", () => {
      const anchor = makeAnchor(
        "https://github.com/owner/repo/blob/main/image.png"
      );
      renderEmbed({
        parsed: makeParsed({ path: "image.png" }),
        content: makeContent({
          isBinary: true,
          lines: [],
          lineStart: 1,
          lineEnd: 0,
          totalLines: 0,
        }),
        anchor,
      });

      const meta = document.querySelector(".gce-header-meta");
      expect(meta!.textContent).toContain("No line");
    });

    it("renders a 'view on GitHub' link for binary files instead of code", () => {
      const anchor = makeAnchor(
        "https://github.com/owner/repo/blob/main/image.png"
      );
      renderEmbed({
        parsed: makeParsed({ path: "image.png" }),
        content: makeContent({
          isBinary: true,
          lines: [],
          lineStart: 1,
          lineEnd: 0,
          totalLines: 0,
        }),
        anchor,
      });

      const noContent = document.querySelector(".gce-no-content");
      expect(noContent).not.toBeNull();
      const link = noContent!.querySelector("a");
      expect(link).not.toBeNull();
      expect(link!.href).toContain("github.com");
    });
  });

  describe("splitHighlightedLinesForTest", () => {
    it("closes inherited open tags at each line boundary", () => {
      // Simulates highlight.js output where a span opens on line 1 and
      // closes on line 2, crossing the line boundary.
      const html = '<span class="hljs-keyword">foo\nbar</span>';
      const result = splitHighlightedLinesForTest(html, 2);

      // Line 1: span opened but not closed in rawLine → suffix added
      expect(result[0]).toBe('<span class="hljs-keyword">foo</span>');
      // Line 2: prefix re-opens the inherited span, rawLine closes it
      expect(result[1]).toBe('<span class="hljs-keyword">bar</span>');
    });

    it("handles nested spans crossing line boundaries", () => {
      // Outer span opens on line 1, inner span opens and closes on line 2,
      // outer span closes on line 3.
      const html =
        '<span class="a">line1\n<span class="b">line2</span>\nline3</span>';
      const result = splitHighlightedLinesForTest(html, 3);

      expect(result[0]).toBe('<span class="a">line1</span>');
      expect(result[1]).toBe('<span class="a"><span class="b">line2</span></span>');
      expect(result[2]).toBe('<span class="a">line3</span>');
    });

    it("correctly handles close-then-open at line start with inherited open span", () => {
      // Inherited span 'a' closes at the start of line 2, new span 'b' opens on line 2.
      // The close must consume the inherited tag (popped from inheritedTags), not 'b'.
      // prefix re-opens 'a' so the rawLine </span> properly closes it in the output.
      const html = '<span class="a">line1\n</span><span class="b">line2</span>';
      const result = splitHighlightedLinesForTest(html, 2);

      expect(result[0]).toBe('<span class="a">line1</span>');
      // prefix adds '<span class="a">', rawLine closes it, then 'b' opens and closes
      expect(result[1]).toBe('<span class="a"></span><span class="b">line2</span>');
    });

    it("returns lines unchanged when no spans cross boundaries", () => {
      const html =
        '<span class="hljs-keyword">const</span> x = 1;\n' +
        '<span class="hljs-keyword">const</span> y = 2;';
      const result = splitHighlightedLinesForTest(html, 2);

      expect(result[0]).toBe('<span class="hljs-keyword">const</span> x = 1;');
      expect(result[1]).toBe('<span class="hljs-keyword">const</span> y = 2;');
    });
  });

  describe("DOM replacement", () => {
    it("replaces the anchor element with the container", () => {
      const anchor = makeAnchor(
        "https://github.com/owner/repo/blob/main/src/index.ts"
      );
      renderEmbed({
        parsed: makeParsed(),
        content: makeContent(),
        anchor,
      });

      expect(document.contains(anchor)).toBe(false);
      expect(document.querySelector(".gce-container")).not.toBeNull();
    });
  });
});
