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
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`;

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
    // GitHub API returns encoding "" with empty content for files > 1 MB.
    // These are not binary — they are simply too large to serve via this endpoint.
    // Throw so processAnchor leaves the original link intact.
    throw new Error(
      `Unsupported encoding "${data.encoding}" — file may exceed the API size limit`
    );
  }

  let decoded: string;
  try {
    decoded = decodeBase64(data.content);
  } catch {
    // Binary files encoded as base64 contain byte sequences that cannot be
    // decoded as UTF-8 text, so we treat them as binary.
    return binaryResult;
  }
  // Split on newlines; handle both LF and CRLF (Windows) line endings.
  // Trim the trailing empty entry that split() produces for a trailing newline.
  const allLines = decoded.split(/\r?\n/);
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
  const slash = path.lastIndexOf("/");
  const filename = path.slice(slash + 1);
  const dot = filename.lastIndexOf(".");
  // dot <= 0 covers no-extension files and dot-files like .gitignore
  if (dot <= 0) return "";
  return filename.slice(dot + 1);
}

function decodeBase64(b64: string): string {
  // GitHub API inserts line breaks in the base64 payload — strip all whitespace before decoding
  const clean = b64.replace(/\s/g, "");
  const bytes = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
  // fatal: true throws on invalid UTF-8 sequences (e.g. binary files)
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
