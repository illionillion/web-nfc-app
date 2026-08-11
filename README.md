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
2. 所有権確認は **HTML タグ** を選ぶ
3. 表示された `content` の値を、Cloudflare Workers の環境変数  
   `GOOGLE_SITE_VERIFICATION` に設定して再デプロイする  
   （ローカルなら `.dev.vars` に `GOOGLE_SITE_VERIFICATION=...`）
4. 確認後、サイトマップとして  
   `https://web-nfc-app.illionillion.workers.dev/sitemap.xml` を登録する

確認コードは HTML に出るため秘密情報ではない。リポジトリには直書きしない。

## 技術

- Next.js（App Router）/ Cloudflare Workers
- Web NFC は Client のみ。履歴は localStorage、テーマは Cookie
