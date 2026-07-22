import Link from "next/link";
import { clsx } from "clsx";

/**
 * サイト共通ヘッダー。ブランド名と主要導線を置く。
 */
export function SiteHeader() {
  return (
    <header className={clsx(["border-b", "border-zinc-200", "bg-white"])}>
      <div
        className={clsx([
          "mx-auto",
          "flex",
          "h-14",
          "w-full",
          "max-w-lg",
          "items-center",
          "justify-between",
          "gap-4",
          "px-4",
        ])}
      >
        <Link
          href="/"
          className={clsx(["text-sm", "font-semibold", "tracking-tight", "text-zinc-900"])}
        >
          Web NFC
        </Link>
        <nav className={clsx(["flex", "items-center", "gap-4"])} aria-label="メイン">
          <Link href="/app" className={clsx(["text-sm", "text-zinc-600", "hover:text-zinc-900"])}>
            ツール
          </Link>
        </nav>
      </div>
    </header>
  );
}
