import Link from "next/link";
import { clsx } from "clsx";

import { ThemeMenu } from "@/features/settings/components/theme-menu";
import type { ThemePreference } from "@/features/settings/types";

type SiteHeaderProps = {
  /** RSC が Cookie から読んだテーマ */
  theme: ThemePreference;
};

/**
 * サイト共通ヘッダー。ブランド名・主要導線・テーマ切替を置く。
 */
export function SiteHeader({ theme }: SiteHeaderProps) {
  return (
    <header
      className={clsx(["sticky", "top-0", "z-50", "border-b", "border-border", "bg-background"])}
    >
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
          className={clsx(["text-sm", "font-semibold", "tracking-tight", "text-foreground"])}
        >
          Web NFC
        </Link>
        <div className={clsx(["flex", "items-center", "gap-2"])}>
          <nav className={clsx(["flex", "items-center", "gap-4"])} aria-label="メイン">
            <Link href="/app" className={clsx(["text-sm", "text-muted", "hover:text-foreground"])}>
              ツール
            </Link>
          </nav>
          <ThemeMenu theme={theme} />
        </div>
      </div>
    </header>
  );
}
