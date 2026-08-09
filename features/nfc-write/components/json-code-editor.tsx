"use client";

import { clsx } from "clsx";
import CodeEditor from "@uiw/react-textarea-code-editor";

import { useResolvedTheme } from "@/lib/theme/use-resolved-theme";

type JsonCodeEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
};

/**
 * JSON 用のハイライト付きエディタ。
 */
export function JsonCodeEditor({ id, value, onChange, invalid = false }: JsonCodeEditorProps) {
  const theme = useResolvedTheme();

  return (
    <div
      className={clsx([
        "overflow-hidden",
        "rounded-md",
        "border",
        invalid ? "border-red-400" : "border-border",
        "bg-background",
      ])}
    >
      <CodeEditor
        id={id}
        value={value}
        language="json"
        placeholder='{ "hello": "world" }'
        onChange={(event) => onChange(event.target.value)}
        padding={12}
        data-color-mode={theme}
        aria-invalid={invalid}
        style={{
          fontSize: 13,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          backgroundColor: "var(--background)",
          minHeight: 160,
        }}
      />
    </div>
  );
}
