import Link from "next/link";
import { clsx } from "clsx";

import { BrandMark } from "@/components/brand-mark";

const HOW_TO_STEPS = [
  {
    title: "読む",
    body: "「スキャン」を押し、対応タグを端末にかざします。シリアル番号と text / url / json レコードが表示されます。",
  },
  {
    title: "書く",
    body: "text / url / json レコードを追加・編集し、「書き込む」でタグへ保存します。読取結果や履歴から引き継ぐこともできます。",
  },
  {
    title: "消す",
    body: "「消去」でタグの NDEF を空に上書きします。実行前に確認ダイアログが出ます。",
  },
] as const;

/**
 * トップページの案内。ツールへの導線・使い方・制約を示す。
 */
export function HomeLanding() {
  return (
    <main
      className={clsx([
        "mx-auto",
        "flex",
        "w-full",
        "max-w-lg",
        "flex-1",
        "flex-col",
        "gap-10",
        "px-4",
        "py-12",
      ])}
    >
      <div className={clsx(["space-y-6"])}>
        <BrandMark decorative className={clsx(["mx-auto", "block", "size-20"])} />
        <div className={clsx(["space-y-3"])}>
          <p
            className={clsx([
              "text-xs",
              "font-medium",
              "uppercase",
              "tracking-wider",
              "text-muted",
            ])}
          >
            Web NFC
          </p>
          <h1 className={clsx(["text-3xl", "font-semibold", "tracking-tight"])}>
            ブラウザだけで NFC を読み書き
          </h1>
          <p className={clsx(["text-base", "leading-7", "text-muted"])}>
            NDEF タグの読取・書込・消去を端末内で完結するツールです。Android Chrome と HTTPS（または
            localhost）が必要です。
          </p>
        </div>
      </div>

      <div className={clsx(["flex", "flex-col", "gap-3"])}>
        <Link
          href="/app"
          className={clsx([
            "inline-flex",
            "min-h-11",
            "items-center",
            "justify-center",
            "rounded-md",
            "bg-foreground",
            "px-5",
            "text-sm",
            "font-medium",
            "text-background",
          ])}
        >
          ツールを開く
        </Link>
        <p className={clsx(["text-sm", "text-muted"])}>iOS や多くの PC ブラウザでは使えません。</p>
      </div>

      <section className={clsx(["space-y-4"])} aria-labelledby="how-to-heading">
        <h2 id="how-to-heading" className={clsx(["text-lg", "font-semibold", "tracking-tight"])}>
          使い方
        </h2>
        <ol className={clsx(["space-y-4"])}>
          {HOW_TO_STEPS.map((step, index) => (
            <li key={step.title} className={clsx(["space-y-1"])}>
              <p className={clsx(["text-sm", "font-medium"])}>
                {index + 1}. {step.title}
              </p>
              <p className={clsx(["text-sm", "leading-6", "text-muted"])}>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={clsx(["space-y-3"])} aria-labelledby="limits-heading">
        <h2 id="limits-heading" className={clsx(["text-lg", "font-semibold", "tracking-tight"])}>
          制約
        </h2>
        <ul
          className={clsx(["list-disc", "space-y-1", "pl-5", "text-sm", "leading-6", "text-muted"])}
        >
          <li>Web NFC 対応の Android Chrome などでのみ動作します</li>
          <li>HTTPS（または localhost）の Secure Context が必要です</li>
          <li>読取・書込・履歴は端末内のみ。サーバーには送りません</li>
        </ul>
      </section>
    </main>
  );
}
