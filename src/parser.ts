import type { ParsedGitHubUrl } from "./types";

const GITHUB_BLOB_RE =
  /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+?)(?:#L(\d+)(?:-L(\d+))?)?$/;

/**
 * Parses a GitHub blob URL into its components.
 * Returns null if the URL does not match the expected pattern.
 */
export function parseGitHubUrl(url: string): ParsedGitHubUrl | null {
  const m = GITHUB_BLOB_RE.exec(url);
  if (!m) return null;

  const [, owner, repo, ref, path, startStr, endStr] = m;

  const lineStart = startStr !== undefined ? parseInt(startStr, 10) : undefined;
  const lineEnd =
    endStr !== undefined
      ? parseInt(endStr, 10)
      : lineStart !== undefined
        ? lineStart
        : undefined;

  // Reject non-positive line numbers or reversed ranges
  if (lineStart !== undefined && lineStart < 1) return null;
  if (lineEnd !== undefined && lineEnd < 1) return null;
  if (lineStart !== undefined && lineEnd !== undefined && lineEnd < lineStart) return null;

  return {
    owner: owner!,
    repo: repo!,
    ref: ref!,
    path: path!,
    ...(lineStart !== undefined && { lineStart }),
    ...(lineEnd !== undefined && { lineEnd }),
  };
}
