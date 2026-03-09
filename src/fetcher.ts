import type { FetchedContent, ParsedGitHubUrl } from "./types";

interface GitHubContentsResponse {
  content: string;
  encoding: string;
}

/**
 * Fetches file content from the GitHub Contents API and decodes it.
 * Throws on non-2xx responses.
 */
export async function fetchContent(
  parsed: ParsedGitHubUrl
): Promise<FetchedContent> {
  const { owner, repo, ref, path, lineStart, lineEnd } = parsed;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;

  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} for ${url}`);
  }

  const data = (await response.json()) as GitHubContentsResponse;

  const binaryResult: FetchedContent = {
    lines: [],
    lineStart: 1,
    lineEnd: 0,
    totalLines: 0,
    extension: extensionOf(path),
    isBinary: true,
  };

  if (data.encoding !== "base64") {
    return binaryResult;
  }

  let decoded: string;
  try {
    decoded = decodeBase64(data.content);
  } catch {
    // Binary files encoded as base64 contain byte sequences that cannot be
    // decoded as UTF-8 text, so we treat them as binary.
    return binaryResult;
  }
  // Split on newlines; trim trailing empty line from trailing newline
  const allLines = decoded.split("\n");
  if (allLines.at(-1) === "") allLines.pop();

  const totalLines = allLines.length;
  const start = lineStart ?? 1;
  const end = Math.min(lineEnd ?? totalLines, totalLines);

  // Convert 1-based to 0-based indices for slicing
  const lines = allLines.slice(start - 1, end);

  return {
    lines,
    lineStart: start,
    lineEnd: end,
    totalLines,
    extension: extensionOf(path),
    isBinary: false,
  };
}

function extensionOf(path: string): string {
  const dot = path.lastIndexOf(".");
  if (dot === -1 || dot === path.lastIndexOf("/")) return "";
  return path.slice(dot + 1);
}

function decodeBase64(b64: string): string {
  // GitHub API inserts newlines every 60 chars — strip them before decoding
  const clean = b64.replace(/\s/g, "");
  const bytes = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
  // fatal: true throws on invalid UTF-8 sequences (e.g. binary files)
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
