import { describe, it, expect } from "vitest";
import { parseGitHubUrl } from "../src/parser";

describe("parseGitHubUrl", () => {
  describe("valid URLs", () => {
    it("parses a basic blob URL without line numbers", () => {
      const result = parseGitHubUrl(
        "https://github.com/owner/repo/blob/main/src/index.ts"
      );
      expect(result).toEqual({
        owner: "owner",
        repo: "repo",
        ref: "main",
        path: "src/index.ts",
        lineStart: undefined,
        lineEnd: undefined,
      });
    });

    it("parses a blob URL with a single line anchor", () => {
      const result = parseGitHubUrl(
        "https://github.com/owner/repo/blob/main/src/index.ts#L10"
      );
      expect(result).toEqual({
        owner: "owner",
        repo: "repo",
        ref: "main",
        path: "src/index.ts",
        lineStart: 10,
        lineEnd: 10,
      });
    });

    it("parses a blob URL with a line range anchor", () => {
      const result = parseGitHubUrl(
        "https://github.com/owner/repo/blob/main/src/index.ts#L10-L30"
      );
      expect(result).toEqual({
        owner: "owner",
        repo: "repo",
        ref: "main",
        path: "src/index.ts",
        lineStart: 10,
        lineEnd: 30,
      });
    });

    it("parses a URL with a commit SHA as ref", () => {
      const result = parseGitHubUrl(
        "https://github.com/owner/repo/blob/abc1234/README.md"
      );
      expect(result).toEqual({
        owner: "owner",
        repo: "repo",
        ref: "abc1234",
        path: "README.md",
        lineStart: undefined,
        lineEnd: undefined,
      });
    });

    it("parses a URL with a nested path", () => {
      const result = parseGitHubUrl(
        "https://github.com/org/project/blob/v1.0.0/src/utils/helper.ts"
      );
      expect(result).toEqual({
        owner: "org",
        repo: "project",
        ref: "v1.0.0",
        path: "src/utils/helper.ts",
        lineStart: undefined,
        lineEnd: undefined,
      });
    });

    it("parses a URL where lineStart equals lineEnd in a range", () => {
      const result = parseGitHubUrl(
        "https://github.com/owner/repo/blob/main/file.ts#L5-L5"
      );
      expect(result).toEqual({
        owner: "owner",
        repo: "repo",
        ref: "main",
        path: "file.ts",
        lineStart: 5,
        lineEnd: 5,
      });
    });
  });

  describe("invalid URLs", () => {
    it("returns null for a non-GitHub URL", () => {
      expect(
        parseGitHubUrl("https://gitlab.com/owner/repo/blob/main/file.ts")
      ).toBeNull();
    });

    it("returns null for a GitHub URL that is not a blob path", () => {
      expect(
        parseGitHubUrl("https://github.com/owner/repo/tree/main/src")
      ).toBeNull();
    });

    it("returns null for a GitHub root URL", () => {
      expect(parseGitHubUrl("https://github.com/owner/repo")).toBeNull();
    });

    it("returns null for a plain string", () => {
      expect(parseGitHubUrl("not a url")).toBeNull();
    });

    it("returns null for an empty string", () => {
      expect(parseGitHubUrl("")).toBeNull();
    });

    it("returns null for a GitHub pull request URL", () => {
      expect(
        parseGitHubUrl("https://github.com/owner/repo/pull/123")
      ).toBeNull();
    });

    it("returns null when lineEnd is less than lineStart", () => {
      expect(
        parseGitHubUrl("https://github.com/owner/repo/blob/main/file.ts#L10-L5")
      ).toBeNull();
    });

    it("returns null when lineStart is zero", () => {
      expect(
        parseGitHubUrl("https://github.com/owner/repo/blob/main/file.ts#L0")
      ).toBeNull();
    });
  });
});
