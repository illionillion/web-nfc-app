import Link from "next/link";
import { clsx } from "clsx";

import { BrandMark } from "@/components/brand-mark";
import { ThemeMenu } from "@/features/settings/components/theme-menu";
import type { ThemePreference } from "@/features/settings/types";
import { GITHUB_REPO_URL } from "@/lib/site";

type SiteHeaderProps = {
  /** RSC が Cookie から読んだテーマ */
  theme: ThemePreference;
};

/**
 * GitHub のマーク（lucide は商標理由で GitHub アイコンを削除済み）。
 */
function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

/**
 * サイト共通ヘッダー。ブランド名・主要導線・GitHub・テーマ切替を置く。
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
          className={clsx([
            "inline-flex",
            "items-center",
            "gap-2",
            "text-sm",
            "font-semibold",
            "tracking-tight",
            "text-foreground",
          ])}
        >
          <BrandMark decorative className={clsx(["size-7"])} />
          Web NFC
        </Link>
        <div className={clsx(["flex", "items-center", "gap-1"])}>
          <nav className={clsx(["flex", "items-center", "gap-4"])} aria-label="メイン">
            <Link href="/app" className={clsx(["text-sm", "text-muted", "hover:text-foreground"])}>
              ツール
            </Link>
          </nav>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx([
              "inline-flex",
              "size-9",
              "items-center",
              "justify-center",
              "rounded-md",
              "text-muted",
              "hover:bg-surface",
              "hover:text-foreground",
            ])}
            aria-label="GitHub リポジトリ（スター歓迎）"
          >
            <GitHubMark className={clsx(["size-4"])} />
          </a>
          <ThemeMenu theme={theme} />
        </div>
      </div>
    </header>
  );
}
