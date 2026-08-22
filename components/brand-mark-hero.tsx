import { clsx } from "clsx";

type BrandMarkHeroProps = {
  className?: string;
};

/**
 * トップヒーロー専用のマーク。N のパスは BrandMark / favicon と同じだが、
 * 弧はアニメ用に3本（左＝内側 → 右＝外側）へ増やした別 SVG。
 *
 * アニメ CSS は Tailwind の処理を避けるためコンポーネント内に置く。
 * `prefers-reduced-motion: reduce` では弧を常時表示する。
 */
export function BrandMarkHero({ className }: BrandMarkHeroProps) {
  return (
    <>
      <style>{HERO_ARC_STYLE}</style>
      <svg
        viewBox="0 0 32 32"
        className={clsx(["shrink-0", className])}
        data-brand-mark-hero=""
        aria-hidden
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
          {/* 左（N に近い）→ 右の順。クラス名は BEM の -- を避けて誤適用を防ぐ */}
          <path className="bmh-arc bmh-arc1" d="M20.8 12.5a5 5 0 0 1 0 7" />
          <path className="bmh-arc bmh-arc2" d="M23.1 10a8.2 8.2 0 0 1 0 12" />
          <path className="bmh-arc bmh-arc3" d="M25.4 7.8a11.6 11.6 0 0 1 0 16.4" />
        </g>
      </svg>
    </>
  );
}

/**
 * 1 → 2 → 3 の順だけが出るよう、出現開始をキーフレームでずらす（delay 不使用）。
 * linear にして ease による見かけの同時点灯を防ぐ。
 */
const HERO_ARC_STYLE = `
@keyframes bmh-arc1 {
  0%, 8% { opacity: 0; }
  10%, 68% { opacity: 1; }
  78%, 100% { opacity: 0; }
}
@keyframes bmh-arc2 {
  0%, 28% { opacity: 0; }
  30%, 68% { opacity: 1; }
  78%, 100% { opacity: 0; }
}
@keyframes bmh-arc3 {
  0%, 48% { opacity: 0; }
  50%, 68% { opacity: 1; }
  78%, 100% { opacity: 0; }
}
.bmh-arc {
  opacity: 0;
}
.bmh-arc1 {
  animation: bmh-arc1 3s linear infinite;
}
.bmh-arc2 {
  animation: bmh-arc2 3s linear infinite;
}
.bmh-arc3 {
  animation: bmh-arc3 3s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .bmh-arc {
    animation: none;
    opacity: 1;
  }
}
`;
