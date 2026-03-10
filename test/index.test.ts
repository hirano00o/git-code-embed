import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { FetchedContent } from "../src/types";

// vi.mock is hoisted to the top of the file by vitest.
// Factories must use vi.fn() directly — no references to outer variables.
vi.mock("../src/fetcher", () => ({ fetchContent: vi.fn() }));
vi.mock("../src/renderer", () => ({ renderEmbed: vi.fn() }));
vi.mock("../src/styles", () => ({ CSS: ".gce-container {}" }));

import { fetchContent } from "../src/fetcher";
import { renderEmbed } from "../src/renderer";
import { init } from "../src/index";

const mockFetchContent = vi.mocked(fetchContent);
const mockRenderEmbed = vi.mocked(renderEmbed);

function makeFetchResult(): FetchedContent {
  return {
    lines: ["const x = 1;"],
    lineStart: 1,
    lineEnd: 1,
    totalLines: 1,
    extension: "ts",
    isBinary: false,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = "";
  document.head.innerHTML = "";
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("index", () => {
  it("injects a <style> tag into <head>", async () => {
    mockFetchContent.mockResolvedValue(makeFetchResult());
    await init();
    const style = document.querySelector("style");
    expect(style).not.toBeNull();
  });

  it("injects only one <style> tag even when init() is called multiple times", async () => {
    mockFetchContent.mockResolvedValue(makeFetchResult());
    await init();
    await init();
    expect(document.querySelectorAll("style[data-gce]")).toHaveLength(1);
  });

  it("does not re-process links inside already-rendered gce-containers", async () => {
    const a = document.createElement("a");
    a.href = "https://github.com/owner/repo/blob/main/src/index.ts";
    document.body.appendChild(a);

    // Simulate renderEmbed replacing the anchor with a gce-container that has
    // an internal blob link (the header title link).
    mockRenderEmbed.mockImplementation(({ anchor }) => {
      const container = document.createElement("div");
      container.className = "gce-container";
      const innerLink = document.createElement("a");
      innerLink.href = "https://github.com/owner/repo/blob/main/src/index.ts";
      container.appendChild(innerLink);
      anchor.parentNode!.replaceChild(container, anchor);
    });
    mockFetchContent.mockResolvedValue(makeFetchResult());

    await init();
    expect(mockFetchContent).toHaveBeenCalledTimes(1);

    // Second call: the internal link must not trigger another fetch.
    mockFetchContent.mockClear();
    await init();
    expect(mockFetchContent).not.toHaveBeenCalled();
  });

  it("detects a GitHub blob anchor and calls fetchContent", async () => {
    const a = document.createElement("a");
    a.href = "https://github.com/owner/repo/blob/main/src/index.ts";
    a.textContent = a.href;
    document.body.appendChild(a);

    mockFetchContent.mockResolvedValue(makeFetchResult());

    await init();

    expect(mockFetchContent).toHaveBeenCalledOnce();
    expect(mockFetchContent).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: "owner",
        repo: "repo",
        ref: "main",
        path: "src/index.ts",
      })
    );
  });

  it("calls renderEmbed with the fetched content", async () => {
    const a = document.createElement("a");
    a.href = "https://github.com/owner/repo/blob/main/src/index.ts";
    document.body.appendChild(a);

    const fetchResult = makeFetchResult();
    mockFetchContent.mockResolvedValue(fetchResult);

    await init();

    expect(mockRenderEmbed).toHaveBeenCalledOnce();
    expect(mockRenderEmbed).toHaveBeenCalledWith(
      expect.objectContaining({
        content: fetchResult,
        anchor: a,
      })
    );
  });

  it("ignores anchors that are not GitHub blob URLs", async () => {
    const a = document.createElement("a");
    a.href = "https://example.com/some/page";
    document.body.appendChild(a);

    await init();

    expect(mockFetchContent).not.toHaveBeenCalled();
    expect(mockRenderEmbed).not.toHaveBeenCalled();
  });

  it("leaves the anchor intact when fetchContent throws", async () => {
    const a = document.createElement("a");
    a.href = "https://github.com/owner/repo/blob/main/src/index.ts";
    document.body.appendChild(a);

    mockFetchContent.mockRejectedValue(new Error("API error"));

    await init();

    expect(mockRenderEmbed).not.toHaveBeenCalled();
    expect(document.contains(a)).toBe(true);
  });

  it("processes multiple GitHub anchors on the page", async () => {
    const urls = [
      "https://github.com/owner/repo/blob/main/a.ts",
      "https://github.com/owner/repo/blob/main/b.py",
    ];
    for (const url of urls) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = url;
      p.appendChild(a);
      document.body.appendChild(p);
    }

    mockFetchContent.mockResolvedValue(makeFetchResult());

    await init();

    expect(mockFetchContent).toHaveBeenCalledTimes(2);
    expect(mockRenderEmbed).toHaveBeenCalledTimes(2);
  });

  it("converts an anchor flanked by block-level elements (body-level pattern)", async () => {
    const h2 = document.createElement("h2");
    h2.textContent = "Section";
    const a = document.createElement("a");
    a.href = "https://github.com/owner/repo/blob/main/src/index.ts";
    const h2after = document.createElement("h2");
    h2after.textContent = "Next";
    document.body.appendChild(h2);
    document.body.appendChild(a);
    document.body.appendChild(h2after);

    mockFetchContent.mockResolvedValue(makeFetchResult());

    await init();

    expect(mockFetchContent).toHaveBeenCalledOnce();
  });

  it("converts a standalone anchor surrounded by whitespace-only text nodes", async () => {
    const p = document.createElement("p");
    p.appendChild(document.createTextNode("\n  "));
    const a = document.createElement("a");
    a.href = "https://github.com/owner/repo/blob/main/src/index.ts";
    p.appendChild(a);
    p.appendChild(document.createTextNode("\n"));
    document.body.appendChild(p);

    mockFetchContent.mockResolvedValue(makeFetchResult());

    await init();

    expect(mockFetchContent).toHaveBeenCalledOnce();
  });

  it("converts a standalone anchor inside a <p> tag", async () => {
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = "https://github.com/owner/repo/blob/main/src/index.ts";
    p.appendChild(a);
    document.body.appendChild(p);

    mockFetchContent.mockResolvedValue(makeFetchResult());

    await init();

    expect(mockFetchContent).toHaveBeenCalledOnce();
  });

  it("converts an anchor that is immediately preceded by a <br>", async () => {
    const p = document.createElement("p");
    const br = document.createElement("br");
    const a = document.createElement("a");
    a.href = "https://github.com/owner/repo/blob/main/src/index.ts";
    p.appendChild(br);
    p.appendChild(a);
    document.body.appendChild(p);

    mockFetchContent.mockResolvedValue(makeFetchResult());

    await init();

    expect(mockFetchContent).toHaveBeenCalledOnce();
  });

  it("does not convert an anchor with surrounding text", async () => {
    const p = document.createElement("p");
    p.appendChild(document.createTextNode("See "));
    const a = document.createElement("a");
    a.href = "https://github.com/owner/repo/blob/main/src/index.ts";
    a.textContent = "this file";
    p.appendChild(a);
    p.appendChild(document.createTextNode(" for details."));
    document.body.appendChild(p);

    await init();

    expect(mockFetchContent).not.toHaveBeenCalled();
  });

  it("does not convert either anchor when two anchors are on the same line", async () => {
    const p = document.createElement("p");
    const a1 = document.createElement("a");
    a1.href = "https://github.com/owner/repo/blob/main/a.ts";
    const a2 = document.createElement("a");
    a2.href = "https://github.com/owner/repo/blob/main/b.ts";
    p.appendChild(a1);
    p.appendChild(a2);
    document.body.appendChild(p);

    await init();

    expect(mockFetchContent).not.toHaveBeenCalled();
  });

  it("does not convert either anchor when two anchors are separated only by whitespace", async () => {
    const p = document.createElement("p");
    const a1 = document.createElement("a");
    a1.href = "https://github.com/owner/repo/blob/main/a.ts";
    const a2 = document.createElement("a");
    a2.href = "https://github.com/owner/repo/blob/main/b.ts";
    p.appendChild(document.createTextNode("\n  "));
    p.appendChild(a1);
    p.appendChild(document.createTextNode("\n  "));
    p.appendChild(a2);
    p.appendChild(document.createTextNode("\n"));
    document.body.appendChild(p);

    await init();

    expect(mockFetchContent).not.toHaveBeenCalled();
  });

  it("does not convert an anchor with preceding text and no following sibling", async () => {
    const p = document.createElement("p");
    p.appendChild(document.createTextNode("link: "));
    const a = document.createElement("a");
    a.href = "https://github.com/owner/repo/blob/main/src/index.ts";
    p.appendChild(a);
    document.body.appendChild(p);

    await init();

    expect(mockFetchContent).not.toHaveBeenCalled();
  });
});
