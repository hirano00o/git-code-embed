import { describe, expect, it } from "vitest";
import { buildThemeCSS, CSS, DARK_COLORS, LIGHT_COLORS } from "../src/styles";

describe("LIGHT_COLORS", () => {
  it("ライトテーマの背景色を含む", () => {
    expect(LIGHT_COLORS).toContain("--gce-bg: #f6f8fa");
    expect(LIGHT_COLORS).toContain("--gce-code-bg: #ffffff");
  });

  it("ライトテーマのボーダー色を含む", () => {
    expect(LIGHT_COLORS).toContain("--gce-border: #d0d7de");
  });

  it("ライトテーマのヘッダー色を含む", () => {
    expect(LIGHT_COLORS).toContain("--gce-header-text: #24292f");
    expect(LIGHT_COLORS).toContain("--gce-header-link: #0969da");
  });

  it("ライトテーマの行番号色を含む", () => {
    expect(LIGHT_COLORS).toContain("--gce-lineno-color: #6e7781");
    expect(LIGHT_COLORS).toContain("--gce-lineno-bg: #f6f8fa");
  });

  it("ライトテーマの hljs キーワード色を含む", () => {
    expect(LIGHT_COLORS).toContain("color: #cf222e");
  });

  it("ライトテーマの hljs 文字列色を含む", () => {
    expect(LIGHT_COLORS).toContain("color: #0a3069");
  });

  it("ライトテーマの hljs タイトル色を含む", () => {
    expect(LIGHT_COLORS).toContain("color: #8250df");
  });

  it("ライトテーマの hljs 変数色を含む", () => {
    expect(LIGHT_COLORS).toContain("color: #953800");
  });

  it("ライトテーマの hljs コメント色を含む", () => {
    expect(LIGHT_COLORS).toContain("color: #6e7781");
  });

  it("ライトテーマの hljs 数値色を含む", () => {
    expect(LIGHT_COLORS).toContain("color: #0550ae");
  });

  it("ライトテーマの基本テキスト色を含む", () => {
    expect(LIGHT_COLORS).toContain("--gce-code-text: #24292f");
  });

  it("ライトテーマのスクロールバー thumb 色を含む", () => {
    expect(LIGHT_COLORS).toContain("--gce-scrollbar-thumb: #afb8c1");
  });
});

describe("DARK_COLORS", () => {
  it("ダークテーマの背景色を含む", () => {
    expect(DARK_COLORS).toContain("--gce-bg: #161b22");
    expect(DARK_COLORS).toContain("--gce-code-bg: #0d1117");
  });

  it("ダークテーマのボーダー色を含む", () => {
    expect(DARK_COLORS).toContain("--gce-border: #30363d");
  });

  it("ダークテーマのヘッダー色を含む", () => {
    expect(DARK_COLORS).toContain("--gce-header-text: #e6edf3");
    expect(DARK_COLORS).toContain("--gce-header-link: #58a6ff");
  });

  it("ダークテーマの行番号色を含む", () => {
    expect(DARK_COLORS).toContain("--gce-lineno-color: #8b949e");
    expect(DARK_COLORS).toContain("--gce-lineno-bg: #161b22");
  });

  it("ダークテーマの hljs キーワード色を含む", () => {
    expect(DARK_COLORS).toContain("color: #ff7b72");
  });

  it("ダークテーマの hljs 文字列色を含む", () => {
    expect(DARK_COLORS).toContain("color: #a5d6ff");
  });

  it("ダークテーマの hljs タイトル色を含む", () => {
    expect(DARK_COLORS).toContain("color: #d2a8ff");
  });

  it("ダークテーマの hljs 変数色を含む", () => {
    expect(DARK_COLORS).toContain("color: #ffa657");
  });

  it("ダークテーマの hljs コメント色を含む", () => {
    expect(DARK_COLORS).toContain("color: #8b949e");
  });

  it("ダークテーマの hljs 数値色を含む", () => {
    expect(DARK_COLORS).toContain("color: #79c0ff");
  });

  it("ダークテーマの基本テキスト色を含む", () => {
    expect(DARK_COLORS).toContain("--gce-code-text: #e6edf3");
  });

  it("ダークテーマのスクロールバー thumb 色を含む", () => {
    expect(DARK_COLORS).toContain("--gce-scrollbar-thumb: #484f58");
  });
});

describe("buildThemeCSS", () => {
  it('"light" → LIGHT_COLORS のみ返す', () => {
    expect(buildThemeCSS("light")).toBe(LIGHT_COLORS);
  });

  it('"dark" → DARK_COLORS のみ返す', () => {
    expect(buildThemeCSS("dark")).toBe(DARK_COLORS);
  });

  it('"auto" → LIGHT_COLORS を含む', () => {
    expect(buildThemeCSS("auto")).toContain(LIGHT_COLORS);
  });

  it('"auto" → DARK_COLORS が @media (prefers-color-scheme: dark) で囲まれている', () => {
    const css = buildThemeCSS("auto");
    const mediaStart = css.indexOf("@media (prefers-color-scheme: dark)");
    expect(mediaStart).toBeGreaterThan(-1);
    // DARK_COLORS はメディアクエリブロック内に含まれる
    const afterMedia = css.slice(mediaStart);
    expect(afterMedia).toContain(DARK_COLORS);
  });

  it('"auto" → LIGHT_COLORS が DARK_COLORS より前に現れる', () => {
    const css = buildThemeCSS("auto");
    expect(css.indexOf(LIGHT_COLORS)).toBeLessThan(css.indexOf(DARK_COLORS));
  });

  it('不明な値 → LIGHT_COLORS にフォールバック', () => {
    expect(buildThemeCSS("unknown")).toBe(LIGHT_COLORS);
    expect(buildThemeCSS("")).toBe(LIGHT_COLORS);
  });
});

describe("CSS (テーマ: light)", () => {
  it("テーマ非依存の font-family 変数を含む", () => {
    expect(CSS).toContain("--gce-font-family:");
    expect(CSS).toContain("--gce-ui-font-family:");
  });

  it("テーマ非依存の line-height と font-size を含む", () => {
    expect(CSS).toContain("--gce-line-height: 1.5em");
    expect(CSS).toContain("--gce-font-size: 13px");
  });

  it("vitest の define により __THEME__ が light に解決され、ライトカラーを含む", () => {
    expect(CSS).toContain("--gce-bg: #f6f8fa");
    expect(CSS).not.toContain("--gce-bg: #161b22");
  });

  it("構造 CSS（box-sizing, flex 等）を含む", () => {
    expect(CSS).toContain("box-sizing: border-box");
    expect(CSS).toContain("display: flex");
  });

  it("td.gce-code に基本テキスト色の CSS 変数を含む", () => {
    expect(CSS).toContain("color: var(--gce-code-text)");
  });

  it("scrollbar-color サポートブラウザ向けの @supports ブロックを含む", () => {
    expect(CSS).toContain("@supports (scrollbar-color: auto)");
    expect(CSS).toContain("scrollbar-color: var(--gce-scrollbar-thumb) var(--gce-code-bg)");
    expect(CSS).toContain("scrollbar-width: thin");
  });

  it("scrollbar-color 非対応ブラウザ向けの @supports not ブロックに webkit ルールを含む", () => {
    expect(CSS).toContain("@supports not (scrollbar-color: auto)");
    expect(CSS).toContain("::-webkit-scrollbar");
    expect(CSS).toContain("::-webkit-scrollbar-track");
    expect(CSS).toContain("::-webkit-scrollbar-thumb");
    expect(CSS).toContain("::-webkit-scrollbar-corner");
  });
});
