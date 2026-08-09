import { clsx } from "clsx";

type BrandMarkProps = {
  /** 見出し横など、装飾のみのときは true */
  decorative?: boolean;
  className?: string;
};

/**
 * サイト内のブランドマーク。favicon / OGP と同じライトタイルで統一する。
 */
export function BrandMark({ decorative = false, className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={clsx(["shrink-0", className])}
      data-brand-mark=""
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": "Web NFC" })}
    >
      <rect width="32" height="32" rx="8" fill="var(--mark-tile)" />
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="7.25"
        fill="none"
        stroke="var(--mark-tile-stroke)"
        strokeWidth="1.5"
      />
      <path fill="var(--mark-glyph)" d="M5 25.5V6.5h4.2l6.4 9.6V6.5H20v19h-4.2l-6.4-9.6v9.6H5z" />
      <g fill="none" stroke="var(--mark-arc)" strokeWidth="2.4" strokeLinecap="round">
        <path d="M22.2 10.8a7.2 7.2 0 0 1 0 10.4" />
        <path d="M25.4 7.8a11.6 11.6 0 0 1 0 16.4" />
      </g>
    </svg>
  );
}
