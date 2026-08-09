import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LegalArticle, LegalSection } from "@/components/legal-article";

describe("LegalArticle", () => {
  it("見出しと本文を出す", () => {
    render(
      <LegalArticle title="利用規約">
        <LegalSection title="適用">
          <p>このツールの利用条件です。</p>
        </LegalSection>
      </LegalArticle>
    );

    expect(screen.getByRole("heading", { level: 1, name: "利用規約" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "適用" })).toBeInTheDocument();
    expect(screen.getByText("このツールの利用条件です。")).toBeInTheDocument();
  });
});
