import { clsx } from "clsx";

type BrandMarkHeroProps = {
  className?: string;
};

/**
 * トップヒーロー専用のマーク。BrandMark / favicon と同じパスの別 SVG。
 * 弧2本を左（内側）→右（外側）の順に出すループアニメ用。
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
          <path className="bmh-arc bmh-arc1" d="M22.2 10.8a7.2 7.2 0 0 1 0 10.4" />
          <path className="bmh-arc bmh-arc2" d="M25.4 7.8a11.6 11.6 0 0 1 0 16.4" />
        </g>
      </svg>
    </>
  );
}

/**
 * 1 → 2 の順だけが出るよう、出現開始をキーフレームでずらす（delay 不使用）。
 * reduced-motion 宣言の回帰テスト用に export する。
 */
export const HERO_ARC_STYLE = `
@keyframes bmh-arc1 {
  0%, 8% { opacity: 0; }
  12%, 62% { opacity: 1; }
  74%, 100% { opacity: 0; }
}
@keyframes bmh-arc2 {
  0%, 32% { opacity: 0; }
  36%, 62% { opacity: 1; }
  74%, 100% { opacity: 0; }
}
.bmh-arc {
  opacity: 0;
}
.bmh-arc1 {
  animation: bmh-arc1 2.8s linear infinite;
}
.bmh-arc2 {
  animation: bmh-arc2 2.8s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .bmh-arc {
    animation: none;
    opacity: 1;
  }
}
`;
