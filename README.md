# git-code-embed

GitHub blob URL を、シンタックスハイライト付きコードビューとしてページに埋め込むライブラリです。

## 使い方

`<script>` タグで読み込むと、ページ内の GitHub blob URL を持つ `<a>` タグを自動的に変換します。

```html
<script src="dist/git-code-embed.min.js"></script>
<a href="https://github.com/owner/repo/blob/main/src/index.ts#L1-L10"></a>
```

## はてなブログでの使い方

### 1. はてなブログにスクリプトを読み込む

管理画面の **設定 → 詳細設定** を開き、「`<head>` 要素にメタデータを追加」欄に
以下を貼り付けて保存します。これによりブログ全ページに適用されます。

```html
<script src="https://cdn.jsdelivr.net/gh/hirano00o/git-code-embed@v0/dist/git-code-embed.min.js" defer />
```

### 2. 記事に GitHub blob URL を貼る

記事の編集画面（見たままモードやMarkdownモード）でリンクを挿入するだけで動作します。
スクリプトがページ読み込み時に全リンクを自動スキャンして変換します。

Pro プランの場合は HTML 編集モードで直接 `<a>` タグを記述することもできます。

```html
<a href="https://github.com/owner/repo/blob/main/src/index.ts#L1-L10"></a>
```

行範囲（`#L1-L10`）を省略するとファイル全体を表示します。

## 既知の制限

### スラッシュを含むブランチ名（例: `feature/my-branch`）は未対応

GitHub の blob URL 形式は `…/blob/{ref}/{path}` ですが、`ref` 内の `/` と
`path` の区切りを URL だけから区別する方法がないため、当ライブラリでは
**ref に `/` を含む URL は認識されません**（リンクはそのまま残ります）。

`main`、`v1.2.3`、`abc1234`（コミットハッシュ）のような ref には完全対応しています。
