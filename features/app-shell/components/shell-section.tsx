import { clsx } from "clsx";
import type { ReactNode, Ref } from "react";

type ShellSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  ref?: Ref<HTMLElement>;
};

/**
 * `/app` 縦並びシェルの1セクション。
 * scroll-mt は追従するサイトヘッダーと操作バーの高さ分。
 */
export function ShellSection({ title, description, children, ref }: ShellSectionProps) {
  return (
    <section
      ref={ref}
      className={clsx(["scroll-mt-32", "space-y-3", "border-t", "border-border", "pt-6"])}
    >
      <header className={clsx(["space-y-1"])}>
        <h2 className={clsx(["text-base", "font-semibold", "tracking-tight"])}>{title}</h2>
        {description ? <p className={clsx(["text-sm", "text-muted"])}>{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
