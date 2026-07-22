import { clsx } from "clsx";
import type { ReactNode } from "react";

type ShellSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

/**
 * `/app` 縦並びシェルの1セクション。
 */
export function ShellSection({ title, description, children }: ShellSectionProps) {
  return (
    <section className={clsx(["space-y-3", "border-t", "border-zinc-200", "pt-6"])}>
      <header className={clsx(["space-y-1"])}>
        <h2 className={clsx(["text-base", "font-semibold", "tracking-tight"])}>{title}</h2>
        {description ? <p className={clsx(["text-sm", "text-zinc-600"])}>{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
