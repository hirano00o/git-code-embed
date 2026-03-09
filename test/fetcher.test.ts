import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchContent } from "../src/fetcher";
import type { ParsedGitHubUrl } from "../src/types";

const base: ParsedGitHubUrl = {
  owner: "owner",
  repo: "repo",
  ref: "main",
  path: "src/index.ts",
};

/** Encode text to base64 the same way the GitHub API does (76-char line wrapping) */
function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = btoa(binary);
  // GitHub API wraps base64 output at 76 characters with "\n"
  return b64.replace(/(.{76})/g, "$1\n");
}

function makeApiResponse(content: string, encoding = "base64") {
  return { content: encoding === "base64" ? toBase64(content) : content, encoding };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("fetchContent", () => {
  it("fetches file and returns all lines when no line range given", async () => {
    const raw = "line1\nline2\nline3\n";
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(makeApiResponse(raw)), { status: 200 })
    );

    const result = await fetchContent(base);

    expect(result.isBinary).toBe(false);
    expect(result.lines).toEqual(["line1", "line2", "line3"]);
    expect(result.lineStart).toBe(1);
    expect(result.lineEnd).toBe(3);
    expect(result.totalLines).toBe(3);
    expect(result.extension).toBe("ts");
  });

  it("returns empty lines and lineEnd=0 for an empty file", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(makeApiResponse("")), { status: 200 })
    );

    const result = await fetchContent(base);

    expect(result.isBinary).toBe(false);
    expect(result.lines).toEqual([]);
    expect(result.totalLines).toBe(0);
    expect(result.lineStart).toBe(1);
    expect(result.lineEnd).toBe(0);
  });

  it("slices to the requested line range", async () => {
    const raw = Array.from({ length: 10 }, (_, i) => `line${i + 1}`).join(
      "\n"
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(makeApiResponse(raw)), { status: 200 })
    );

    const result = await fetchContent({ ...base, lineStart: 3, lineEnd: 5 });

    expect(result.lines).toEqual(["line3", "line4", "line5"]);
    expect(result.lineStart).toBe(3);
    expect(result.lineEnd).toBe(5);
    expect(result.totalLines).toBe(10);
  });

  it("clamps lineEnd to totalLines when it exceeds the file length", async () => {
    const raw = "a\nb\nc";
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(makeApiResponse(raw)), { status: 200 })
    );

    const result = await fetchContent({ ...base, lineStart: 2, lineEnd: 100 });

    expect(result.lines).toEqual(["b", "c"]);
    expect(result.lineEnd).toBe(3);
  });

  it("throws when encoding is not base64 (e.g. file exceeds API size limit)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ content: "", encoding: "" }),
        { status: 200 }
      )
    );

    await expect(fetchContent(base)).rejects.toThrow(/Unsupported encoding/);
  });

  it("marks the result as binary when base64 content cannot be decoded as UTF-8", async () => {
    // 0x80–0xBF are invalid as standalone UTF-8 bytes
    const binaryBase64 = btoa(String.fromCharCode(0x80, 0x81, 0x82));
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ content: binaryBase64, encoding: "base64" }),
        { status: 200 }
      )
    );

    const result = await fetchContent(base);

    expect(result.isBinary).toBe(true);
    expect(result.lines).toEqual([]);
  });

  it("throws when the API responds with 404", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Not Found" }), { status: 404 })
    );

    await expect(fetchContent(base)).rejects.toThrow(/404/);
  });

  it("throws when the API responds with 403 (rate limit)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "API rate limit exceeded" }), {
        status: 403,
      })
    );

    await expect(fetchContent(base)).rejects.toThrow(/403/);
  });

  it("constructs the correct API URL", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(makeApiResponse("hello")), { status: 200 })
      );

    await fetchContent({
      owner: "myOrg",
      repo: "myRepo",
      ref: "v2.0",
      path: "lib/util.py",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.github.com/repos/myOrg/myRepo/contents/lib/util.py?ref=v2.0",
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  it("percent-encodes spaces in path segments and ref", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(makeApiResponse("hello")), { status: 200 })
      );

    // Note: refs containing "/" cannot be parsed from GitHub blob URLs by
    // parseGitHubUrl — the regex captures the first path segment only.
    await fetchContent({
      owner: "my-org",
      repo: "my-repo",
      ref: "my branch",
      path: "src/my file.ts",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.github.com/repos/my-org/my-repo/contents/src/my%20file.ts?ref=my%20branch",
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  it("returns empty extension for files without extension", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(makeApiResponse("data")), { status: 200 })
    );

    const result = await fetchContent({ ...base, path: "Makefile" });
    expect(result.extension).toBe("");
  });
});
