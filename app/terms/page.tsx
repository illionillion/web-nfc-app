import type { Metadata } from "next";

import { LegalArticle, LegalSection } from "@/components/legal-article";

export const metadata: Metadata = {
  title: "利用規約",
  description: "Web NFC ツールの利用条件。対応環境・役割分担・免責を記載します。",
  alternates: {
    canonical: "/terms",
  },
};

/**
 * 利用規約。法務レビュー前の下書き。
 */
export default function TermsPage() {
  return (
    <LegalArticle title="利用規約">
      <p className="text-muted">最終更新: 2026-08-09</p>
      <LegalSection title="このツールについて">
        <p>
          本サービスは、ブラウザの Web NFC（NDEF）で NFC
          タグを読み書き・消去するためのツールです。アカウント登録は不要です。
        </p>
      </LegalSection>
      <LegalSection title="対応環境">
        <p>
          Web NFC に対応した Android Chrome などでの利用を想定しています。HTTPS（または
          localhost）が必要です。iOS や多くの PC ブラウザでは動作しません。
        </p>
      </LegalSection>
      <LegalSection title="役割分担">
        <p>
          提供者は Web
          アプリの配信のみを行います。NFCタグの内容・読取履歴・書込下書きは利用者の端末内で処理され、提供者がサーバー上で保存・解析することはありません。
        </p>
      </LegalSection>
      <LegalSection title="免責">
        <p>
          タグの破損、データの消失、非対応端末での利用不能、第三者によるタグの書き換えなどについて、提供者は責任を負いません。重要なデータは別途バックアップしてください。
        </p>
      </LegalSection>
      <LegalSection title="禁止事項">
        <p>法令に違反する目的、他人のタグやデータを無断で書き換える行為には使わないでください。</p>
      </LegalSection>
      <LegalSection title="変更">
        <p>本規約は予告なく変更することがあります。最新の内容はこのページに掲載します。</p>
      </LegalSection>
    </LegalArticle>
  );
}
