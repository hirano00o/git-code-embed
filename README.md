# git-code-embed

GitHub blob URL を、シンタックスハイライト付きコードビューとしてページに埋め込むライブラリです。

## 使い方

`<script>` タグで読み込むと、ページ内の GitHub blob URL を持つ `<a>` タグを自動的に変換します。

```html
<script src="https://cdn.jsdelivr.net/gh/hirano00o/git-code-embed@v0/dist/git-code-embed.min.js"></script>
<a href="https://github.com/owner/repo/blob/main/src/index.ts#L1-L10"></a>
```

行範囲（`#L1-L10`）を省略するとファイル全体を表示します。

## テーマ

ブログのデザインに合わせて 3 種類のバンドルから選択できます。

| ファイル | 挙動 | 推奨用途 |
|---|---|---|
| `git-code-embed.min.js` | `data-theme` 属性によるテーマ切り替えに追従 | テーマ切り替え機能付きのブログ |
| `git-code-embed-light.min.js` | ライトモード固定 | ライト固定デザインのブログ |
| `git-code-embed-dark.min.js` | ダークモード固定 | ダーク固定デザインのブログ |

### `git-code-embed.min.js`（data-theme 追従）の使い方

`<html>` または `<body>` 要素に `data-theme="dark"` / `data-theme="light"` 属性が設定されると、
コードビューのカラーテーマがそれに合わせて切り替わります。
`data-theme` 属性が設定されていない場合はライトテーマが適用されます。

```html
<!-- data-theme 属性でテーマを切り替えるブログ向け -->
<html data-theme="dark">
  <!-- コードビューはダークテーマで表示される -->
</html>
```

> **ライト固定・ダーク固定のブログには `-light.min.js` / `-dark.min.js` を使用してください。**
> OS のダーク設定に関わらず、コードビューのテーマをブログに合わせて固定できます。

## 変換対象の条件

**前後に他のコンテンツがない「単独」の `<a>` タグのみ**を変換します。
文中に埋め込まれたリンクや、同じ行に複数並んだリンクは変換されません。

隣接ノードの判定ルール：

| 隣接ノード | 扱い |
|---|---|
| なし（親要素の端） | 単独とみなす ✅ |
| 空白・改行のみのテキスト | 単独とみなす ✅ |
| `<br>` | 単独とみなす ✅ |
| `<p>`, `<h1>`〜`<h6>`, `<div>` 等のブロック要素 | 単独とみなす ✅ |
| 文字を含むテキスト | 文中リンクとみなし変換しない ❌ |
| 別の `<a>` 等のインライン要素 | 複数リンクとみなし変換しない ❌ |

```html
<!-- 変換される -->
<p><a href="https://github.com/owner/repo/blob/main/src/index.ts"></a></p>

<!-- 変換される（ブロック要素に挟まれた単独リンク） -->
<h2>実装例</h2>
<a href="https://github.com/owner/repo/blob/main/src/index.ts"></a>
<h2>次のセクション</h2>

<!-- 変換されない（文中リンク） -->
<p>詳細は<a href="https://github.com/owner/repo/blob/main/src/index.ts">こちら</a>を参照。</p>

<!-- 変換されない（複数リンクが並んでいる） -->
<p>
  <a href="https://github.com/owner/repo/blob/main/a.ts"></a>
  <a href="https://github.com/owner/repo/blob/main/b.ts"></a>
</p>
```

## はてなブログでの使い方

### 1. はてなブログにスクリプトを読み込む

管理画面の **設定 → 詳細設定** を開き、「`<head>` 要素にメタデータを追加」欄に
以下を貼り付けて保存します。これによりブログ全ページに適用されます。

ブログのデザインに合わせて使用するファイルを選択してください。

```html
<!-- data-theme 属性でテーマ切り替えするブログ向け -->
<script src="https://cdn.jsdelivr.net/gh/hirano00o/git-code-embed@v0/dist/git-code-embed.min.js" defer></script>

<!-- ダークモード固定 -->
<script src="https://cdn.jsdelivr.net/gh/hirano00o/git-code-embed@v0/dist/git-code-embed-dark.min.js" defer></script>

<!-- ライトモード固定 -->
<script src="https://cdn.jsdelivr.net/gh/hirano00o/git-code-embed@v0/dist/git-code-embed-light.min.js" defer></script>
```

### 2. 記事に GitHub blob URL を貼る

**単独の行に URL を貼ることが必要です。** 前後に文字が続く形で挿入すると変換されません。

#### 見たままモード・Markdownモード

リンクを単独の段落として挿入します。Markdown の場合は前後に空行を入れます。

```markdown
コードを確認してください。

https://github.com/owner/repo/blob/main/src/index.ts#L1-L10

上記がエントリーポイントです。
```

> **注意:** はてなブログの見たままモードでは、URL を貼り付けると自動的にリンクカードに変換される場合があります。変換された場合は `<a>` タグが単独行に配置されるため、git-code-embed も正しく動作します。

#### HTML編集モード（Pro プランまたは HTML モード）

`<a>` タグを `<p>` タグで囲み、単独で配置します。

```html
<!-- 正しい書き方: <p> で囲んで単独行に置く -->
<p><a href="https://github.com/owner/repo/blob/main/src/index.ts#L1-L10"></a></p>

<!-- 動作しない: 文中に埋め込む -->
<p>詳細は<a href="https://github.com/owner/repo/blob/main/src/index.ts">こちら</a>を参照。</p>

<!-- 動作しない: 複数リンクを並べる -->
<p>
  <a href="https://github.com/owner/repo/blob/main/a.ts"></a>
  <a href="https://github.com/owner/repo/blob/main/b.ts"></a>
</p>
```

## ビルド

```bash
# オートテーマ（data-theme 属性に追従） → dist/git-code-embed.min.js
npm run build

# ライトモード固定 → dist/git-code-embed-light.min.js
npm run build:light

# ダークモード固定 → dist/git-code-embed-dark.min.js
npm run build:dark

# 全バリアント同時ビルド
npm run build:all
```

## 既知の制限

### スラッシュを含むブランチ名（例: `feature/my-branch`）は未対応

GitHub の blob URL 形式は `…/blob/{ref}/{path}` ですが、`ref` 内の `/` と
`path` の区切りを URL だけから区別する方法がないため、当ライブラリでは
**ref に `/` を含む URL は認識されません**（リンクはそのまま残ります）。

`main`、`v1.2.3`、`abc1234`（コミットハッシュ）のような ref には完全対応しています。
