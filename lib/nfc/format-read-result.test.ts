import { describe, expect, it } from "vitest";

import type { NfcReadResult } from "@/features/nfc-read/types";
import { formatReadResultForClipboard } from "@/lib/nfc/format-read-result";

describe("formatReadResultForClipboard", () => {
  it("シリアル・日時・レコードをプレーンテキストに整形する", () => {
    const result: NfcReadResult = {
      serialNumber: "AB:CD",
      readAt: "2026-07-25T00:00:00.000Z",
      records: [
        {
          kind: "text",
          recordType: "text",
          text: "hello",
        },
        {
          kind: "json",
          recordType: "mime",
          mediaType: "application/json",
          text: '{\n  "ok": true\n}',
        },
      ],
    };

    expect(formatReadResultForClipboard(result)).toBe(
      [
        "serialNumber: AB:CD",
        "readAt: 2026-07-25T00:00:00.000Z",
        "records:",
        "  [0] text",
        "    hello",
        "  [1] json (application/json)",
        "    {",
        '      "ok": true',
        "    }",
      ].join("\n")
    );
  });

  it("シリアルが空のときは (none) にする", () => {
    const result: NfcReadResult = {
      serialNumber: "",
      readAt: "2026-07-25T00:00:00.000Z",
      records: [],
    };

    expect(formatReadResultForClipboard(result)).toContain("serialNumber: (none)");
  });
});
