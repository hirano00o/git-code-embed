/** Parsed result of a GitHub blob URL */
export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
  ref: string;
  path: string;
  /** 1-based start line, undefined if not specified */
  lineStart?: number;
  /** 1-based end line, undefined if not specified. When only lineStart is given, equals lineStart. */
  lineEnd?: number;
}

/** Result of fetching file content from GitHub Contents API */
export interface FetchedContent {
  /** Decoded text lines (already sliced to requested range) */
  lines: string[];
  /** Actual 1-based start line number shown (equals requested lineStart or 1) */
  lineStart: number;
  /** Actual 1-based end line number shown (equals requested lineEnd or total lines) */
  lineEnd: number;
  /** Total lines in the full file */
  totalLines: number;
  /** File extension used for language detection (e.g. "ts", "py") */
  extension: string;
  /** True when the file is binary/non-text and cannot be displayed */
  isBinary: boolean;
}

/** Rendering options passed to the renderer */
export interface RenderOptions {
  parsed: ParsedGitHubUrl;
  content: FetchedContent;
  /** Original anchor element to be replaced */
  anchor: HTMLAnchorElement;
}
