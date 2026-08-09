import Link from "next/link";
import { clsx } from "clsx";

/**
 * トップページ。ツールへの導線と制約の概要を示す。
 */
export default function Home() {
  return (
    <main
      className={clsx([
        "mx-auto",
        "flex",
        "w-full",
        "max-w-lg",
        "flex-1",
        "flex-col",
        "justify-center",
        "gap-8",
        "px-4",
        "py-16",
      ])}
    >
      <div className={clsx(["space-y-3"])}>
        <p
          className={clsx(["text-xs", "font-medium", "uppercase", "tracking-wider", "text-muted"])}
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
        <p className={clsx(["text-sm", "text-muted"])}>
          iOS や多くの PC ブラウザでは使えません。詳細はツール画面の案内を確認してください。
        </p>
      </div>
    </main>
  );
}
