import { clsx } from "clsx";

type ActionBarProps = {
  /** 操作ボタンを無効化するか（非対応時など） */
  disabled: boolean;
};

/**
 * スキャン / 書き込み / 消去の操作ボタン枠。
 * 本実装は別 Issue のため、現状は押下しても何もしない。
 */
export function ActionBar({ disabled }: ActionBarProps) {
  return (
    <div className={clsx(["flex", "flex-wrap", "gap-2"])} role="group" aria-label="NFC 操作">
      <ActionButton disabled={disabled}>スキャン</ActionButton>
      <ActionButton disabled={disabled}>書き込む</ActionButton>
      <ActionButton disabled={disabled}>消去</ActionButton>
    </div>
  );
}

type ActionButtonProps = {
  children: string;
  disabled: boolean;
};

/**
 * シェル用の操作ボタン。後続 Issue でハンドラを接続する。
 */
function ActionButton({ children, disabled }: ActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={clsx([
        "min-h-11",
        "flex-1",
        "rounded-md",
        "border",
        "border-zinc-300",
        "bg-zinc-900",
        "px-4",
        "py-2",
        "text-sm",
        "font-medium",
        "text-white",
        "disabled:cursor-not-allowed",
        "disabled:opacity-40",
      ])}
    >
      {children}
    </button>
  );
}
