import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PwaRegister } from "@/components/pwa-register";

describe("PwaRegister", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("/sw.js を登録する", () => {
    const register = vi.fn().mockResolvedValue({});
    vi.stubGlobal("navigator", {
      serviceWorker: { register },
    });

    render(<PwaRegister />);

    expect(register).toHaveBeenCalledWith("/sw.js");
  });

  it("Service Worker 非対応なら何もしない", () => {
    vi.stubGlobal("navigator", {});

    expect(() => render(<PwaRegister />)).not.toThrow();
  });
});
