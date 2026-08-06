"use client";

import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ConfirmApi = {
  /**
   * 確認ダイアログを開き、ユーザーの応答を Promise で返す。
   *
   * @param message - 表示するメッセージ
   * @returns OK なら true、キャンセルなら false
   */
  confirm: (message: string) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmApi | null>(null);

type ConfirmProviderProps = {
  children: ReactNode;
};

type ConfirmDialogViewProps = {
  message: string;
  onClose: (value: boolean) => void;
};

/**
 * 確認ダイアログ本体。マウント時に showModal し、アンマウントで閉じる。
 */
function ConfirmDialogView({ message, onClose }: ConfirmDialogViewProps) {
  const messageId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
    }
    cancelButtonRef.current?.focus();

    const onCancel = (event: Event) => {
      event.preventDefault();
      onClose(false);
    };
    dialog.addEventListener("cancel", onCancel);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      if (dialog.open) {
        dialog.close();
      }
      dialog.removeAttribute("open");
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={messageId}
      className={clsx([
        "m-auto",
        "w-[min(100%,24rem)]",
        "rounded-lg",
        "border",
        "border-zinc-200",
        "bg-white",
        "p-0",
        "text-zinc-900",
        "shadow-lg",
        "backdrop:bg-zinc-900/40",
      ])}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose(false);
        }
      }}
    >
      <div className={clsx(["space-y-5", "p-5"])}>
        <p id={messageId} className={clsx(["text-sm", "leading-6", "text-zinc-800"])}>
          {message}
        </p>
        <div className={clsx(["flex", "justify-end", "gap-2"])}>
          <button
            ref={cancelButtonRef}
            type="button"
            className={clsx([
              "min-h-11",
              "rounded-md",
              "border",
              "border-zinc-300",
              "bg-white",
              "px-4",
              "py-2",
              "text-sm",
              "font-medium",
              "text-zinc-700",
            ])}
            onClick={() => onClose(false)}
          >
            キャンセル
          </button>
          <button
            type="button"
            className={clsx([
              "min-h-11",
              "rounded-md",
              "bg-red-600",
              "px-4",
              "py-2",
              "text-sm",
              "font-medium",
              "text-white",
            ])}
            onClick={() => onClose(true)}
          >
            OK
          </button>
        </div>
      </div>
    </dialog>
  );
}

/**
 * 確認ダイアログの Provider。
 * ルートに 1 つ置き、`useConfirm().confirm(message)` で呼び出す。
 * ネイティブ `<dialog>` + `showModal()` で ESC・フォーカストラップをブラウザに任せる。
 * ルート遷移時は開いている確認をキャンセルし、離脱後の OK で副作用が走らないようにする。
 */
export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const close = useCallback((value: boolean) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    setMessage(null);
    resolve?.(value);
  }, []);

  const confirm = useCallback((nextMessage: string) => {
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }

    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setMessage(nextMessage);
    });
  }, []);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return;
    }
    previousPathnameRef.current = pathname;

    if (!resolveRef.current) {
      return;
    }

    // ルート離脱後に OK されてもシェルの副作用が走らないようキャンセルする。
    // setState は effect 同期内で呼ばない（react-hooks/set-state-in-effect）。
    queueMicrotask(() => {
      close(false);
    });
  }, [pathname, close]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {message !== null ? <ConfirmDialogView message={message} onClose={close} /> : null}
    </ConfirmContext.Provider>
  );
}

/**
 * 確認ダイアログを開く hook。
 *
 * @returns `confirm(message)` API
 */
export function useConfirm(): ConfirmApi {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm は ConfirmProvider 内で使ってください。");
  }
  return context;
}
