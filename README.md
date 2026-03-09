# git-code-embed

GitHub blob URL を、シンタックスハイライト付きコードビューとしてページに埋め込むライブラリです。

## 使い方

`<script>` タグで読み込むと、ページ内の GitHub blob URL を持つ `<a>` タグを自動的に変換します。

```html
<script src="dist/git-code-embed.min.js"></script>
<a href="https://github.com/owner/repo/blob/main/src/index.ts#L1-L10"></a>
```

## 既知の制限

### スラッシュを含むブランチ名（例: `feature/my-branch`）は未対応

GitHub の blob URL 形式は `…/blob/{ref}/{path}` ですが、`ref` 内の `/` と
`path` の区切りを URL だけから区別する方法がないため、当ライブラリでは
**ref に `/` を含む URL は認識されません**（リンクはそのまま残ります）。

`main`、`v1.2.3`、`abc1234`（コミットハッシュ）のような ref には完全対応しています。