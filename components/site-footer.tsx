import Link from "next/link";
import { clsx } from "clsx";

/**
 * サイト共通フッター。利用規約・プライバシーへの導線を置く。
 */
export function SiteFooter() {
  return (
    <footer className={clsx(["mt-auto", "border-t", "border-border", "bg-background"])}>
      <div
        className={clsx([
          "mx-auto",
          "flex",
          "w-full",
          "max-w-lg",
          "flex-wrap",
          "items-center",
          "gap-4",
          "px-4",
          "py-4",
        ])}
      >
        <nav className={clsx(["flex", "flex-wrap", "items-center", "gap-4"])} aria-label="フッター">
          <Link href="/terms" className={clsx(["text-sm", "text-muted", "hover:text-foreground"])}>
            利用規約
          </Link>
          <Link
            href="/privacy"
            className={clsx(["text-sm", "text-muted", "hover:text-foreground"])}
          >
            プライバシー
          </Link>
        </nav>
      </div>
    </footer>
  );
}
