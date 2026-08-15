# Web NFC

ブラウザだけで NFC タグ（NDEF）を読み書きするツール。

本番: [https://web-nfc-app.illionillion.workers.dev/](https://web-nfc-app.illionillion.workers.dev/)

## 開発

```bash
pnpm install
pnpm dev
```

HTTPS が必要な実機確認:

```bash
pnpm dev:https
```

## デプロイ

Cloudflare Workers（OpenNext）:

```bash
pnpm cf:deploy
```

## Search Console

1. [Google Search Console](https://search.google.com/search-console) で URL プレフィックスプロパティを追加  
   `https://web-nfc-app.illionillion.workers.dev`
2. 所有権確認は **HTML タグ**（`google-site-verification` は `app/layout.tsx` に済み）
3. 本番デプロイ後に Search Console で「確認」を押す
4. サイトマップ  
   `https://web-nfc-app.illionillion.workers.dev/sitemap.xml` を登録する

確認コードは HTML に出るため秘密情報ではない。

## シェアプレビュー

OGP / Twitter Card は `public/og.png`（1200×630）を使う。デプロイ後の確認例:

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [X Card Validator](https://cards-dev.twitter.com/validator)（利用可能な場合）

## PWA

Android Chrome でホーム画面に追加できる。Manifest は `/manifest.webmanifest`、シェル用 SW は `/sw.js`。
`start_url` は `/app`。アイコンはブランドマーク由来（`public/icons/`）。

SW は install 時に `/app` の HTML と、それが参照する `/_next/static` の JS/CSS をまとめてキャッシュする。
そのため**初回はオンラインで開く**必要があるが、以降はオフラインでも UI が起動する。
新しいデプロイ後も同じ手順で新旧のシェルが混ざらないように更新される。

## 技術

- Next.js（App Router）/ Cloudflare Workers
- Web NFC は Client のみ。履歴は localStorage、テーマは Cookie
