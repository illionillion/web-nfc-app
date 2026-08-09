import type { ReactNode } from "react";
import { clsx } from "clsx";

type LegalArticleProps = {
  title: string;
  children: ReactNode;
};

/**
 * 利用規約・プライバシーポリシーなどの静的文書ページ枠。
 */
export function LegalArticle({ title, children }: LegalArticleProps) {
  return (
    <main className={clsx(["mx-auto", "w-full", "max-w-lg", "flex-1", "px-4", "py-10"])}>
      <h1 className={clsx(["text-2xl", "font-semibold", "tracking-tight"])}>{title}</h1>
      <div className={clsx(["mt-6", "space-y-6", "text-sm", "leading-7"])}>{children}</div>
    </main>
  );
}

type LegalSectionProps = {
  title: string;
  children: ReactNode;
};

/**
 * 文書内の 1 節。
 */
export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className={clsx(["space-y-2"])}>
      <h2 className={clsx(["text-base", "font-semibold", "tracking-tight"])}>{title}</h2>
      <div className={clsx(["space-y-2", "text-muted"])}>{children}</div>
    </section>
  );
}
