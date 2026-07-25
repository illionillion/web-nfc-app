import { clsx } from "clsx";

type ActionBarProps = {
  /** 非対応時など全体を無効化するか */
  disabled: boolean;
  /** スキャン中か */
  isScanning?: boolean;
  /** 書込中か */
  isWriting?: boolean;
  /** 書き込み可能か（下書きが妥当なときなど） */
  canWrite?: boolean;
  /** スキャン開始 */
  onScan?: () => void;
  /** スキャンキャンセル */
  onCancelScan?: () => void;
  /** 書込開始 */
  onWrite?: () => void;
  /** 書込キャンセル */
  onCancelWrite?: () => void;
};

/**
 * スキャン / 書き込み / 消去の操作ボタン。
 * 消去の本実装は後続 Issue。
 */
export function ActionBar({
  disabled,
  isScanning = false,
  isWriting = false,
  canWrite = false,
  onScan,
  onCancelScan,
  onWrite,
  onCancelWrite,
}: ActionBarProps) {
  const busy = isScanning || isWriting;

  return (
    <div className={clsx(["flex", "flex-wrap", "gap-2"])} role="group" aria-label="NFC 操作">
      {isScanning ? (
        <ActionButton disabled={!onCancelScan} onClick={onCancelScan}>
          キャンセル
        </ActionButton>
      ) : (
        <ActionButton disabled={disabled || busy || !onScan} onClick={onScan}>
          スキャン
        </ActionButton>
      )}
      {isWriting ? (
        <ActionButton disabled={!onCancelWrite} onClick={onCancelWrite}>
          書込キャンセル
        </ActionButton>
      ) : (
        <ActionButton disabled={disabled || busy || !canWrite || !onWrite} onClick={onWrite}>
          書き込む
        </ActionButton>
      )}
      <ActionButton disabled>消去</ActionButton>
    </div>
  );
}

type ActionButtonProps = {
  children: string;
  disabled: boolean;
  onClick?: () => void;
};

/**
 * シェル用の操作ボタン。
 */
function ActionButton({ children, disabled, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
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
