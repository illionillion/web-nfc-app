import type { Metadata } from "next";

import { LegalArticle, LegalSection } from "@/components/legal-article";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "Web NFC ツールのプライバシー方針。端末内完結、Cookie と localStorage の役割分担を記載します。",
  alternates: {
    canonical: "/privacy",
  },
};

/**
 * プライバシーポリシー。法務レビュー前の下書き。
 */
export default function PrivacyPage() {
  return (
    <LegalArticle title="プライバシーポリシー">
      <p className="text-muted">最終更新: 2026-08-09</p>
      <LegalSection title="端末内完結">
        <p>
          NFC
          タグの読取・書込・消去、およびその履歴は、利用者の端末内のブラウザだけで処理します。提供者がこれらの内容をサーバーへ送信・保存することはありません。
        </p>
      </LegalSection>
      <LegalSection title="Cookie">
        <p>
          Cookie はテーマ設定（ライト / ダーク /
          システム）など、NFC本体以外の軽い設定にだけ使います。Secure
          属性と適切な有効期限を付けます。読取履歴や書込内容は Cookie に入れません。
        </p>
      </LegalSection>
      <LegalSection title="localStorage">
        <p>
          読取・書込の履歴（最大 100 件）と、書込中の下書きはブラウザの localStorage
          に保存します。サーバーへは送らず、端末から削除すれば消えます。
        </p>
      </LegalSection>
      <LegalSection title="サーバーへ送らないもの">
        <p>
          NFC レコードの内容、シリアル番号、履歴、下書きを、提供者のサーバーや外部 API
          に送信する機能はありません。
        </p>
      </LegalSection>
      <LegalSection title="第三者サービス">
        <p>
          現時点で広告・アクセス解析などの第三者 SDK
          は入れていません。導入する場合は本ポリシーを更新します。
        </p>
      </LegalSection>
      <LegalSection title="変更">
        <p>本ポリシーは予告なく変更することがあります。最新の内容はこのページに掲載します。</p>
      </LegalSection>
    </LegalArticle>
  );
}
