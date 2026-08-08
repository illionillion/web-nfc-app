"use client";

import { clsx } from "clsx";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { applyThemeToDocument } from "@/features/settings/lib/apply-theme";
import { writeThemeCookie } from "@/features/settings/lib/theme-cookie";
import type { ThemePreference } from "@/features/settings/types";

type ThemeMenuProps = {
  /** RSC が Cookie から読んだ初期テーマ */
  theme: ThemePreference;
};

type ThemeOption = {
  value: ThemePreference;
  label: string;
  Icon: typeof Sun;
};

const THEME_OPTIONS: ThemeOption[] = [
  { value: "light", label: "ライト", Icon: Sun },
  { value: "dark", label: "ダーク", Icon: Moon },
  { value: "system", label: "システム", Icon: Monitor },
];

/**
 * 現在のテーマに対応するアイコンを返す。
 *
 * @param theme - テーマ設定
 * @returns lucide アイコン
 */
function ThemeIcon({ theme }: { theme: ThemePreference }) {
  if (theme === "dark") {
    return <Moon aria-hidden="true" className="size-4" />;
  }
  if (theme === "system") {
    return <Monitor aria-hidden="true" className="size-4" />;
  }
  return <Sun aria-hidden="true" className="size-4" />;
}

/**
 * テーマ設定のラベルを返す。
 *
 * @param theme - テーマ設定
 * @returns 日本語ラベル
 */
function getThemeLabel(theme: ThemePreference): string {
  const option = THEME_OPTIONS.find((item) => item.value === theme);
  return option?.label ?? "ライト";
}

/**
 * ヘッダー右上のテーマ切替。ライト / ダーク / システムを選ぶ自作プルダウン。
 */
export function ThemeMenu({ theme: initialTheme }: ThemeMenuProps) {
  const [theme, setTheme] = useState<ThemePreference>(initialTheme);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    applyThemeToDocument(theme);

    if (theme !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyThemeToDocument("system");
    };
    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
    };
  }, [theme]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectTheme = (next: ThemePreference) => {
    setTheme(next);
    writeThemeCookie(next);
    applyThemeToDocument(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
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
        aria-label={`テーマ: ${getThemeLabel(theme)}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <ThemeIcon theme={theme} />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="テーマ"
          className={clsx([
            "absolute",
            "right-0",
            "z-50",
            "mt-1",
            "min-w-36",
            "rounded-md",
            "border",
            "border-border",
            "bg-surface",
            "p-1",
            "shadow-lg",
          ])}
        >
          {THEME_OPTIONS.map((option) => {
            const selected = option.value === theme;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                className={clsx([
                  "flex",
                  "w-full",
                  "items-center",
                  "gap-2",
                  "rounded-sm",
                  "px-2",
                  "py-2",
                  "text-left",
                  "text-sm",
                  selected ? "text-foreground" : "text-muted",
                  "hover:bg-background",
                ])}
                onClick={() => selectTheme(option.value)}
              >
                <option.Icon aria-hidden="true" className="size-4 shrink-0" />
                <span className="flex-1">{option.label}</span>
                {selected ? <Check aria-hidden="true" className="size-4" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
