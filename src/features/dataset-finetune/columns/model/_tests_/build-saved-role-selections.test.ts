import { describe, it, expect } from "vitest";
import { buildSavedRoleSelections } from "../build-saved-role-selections";

const roles = [{ key: "prompt" }, { key: "completion" }];

describe("buildSavedRoleSelections", () => {
  it("uses the saved selection when present", () => {
    const result = buildSavedRoleSelections(
      roles,
      { prompt: "enhanced_prompt", completion: "enhanced_completion" },
      {},
    );
    expect(result).toEqual({
      prompt: "enhanced_prompt",
      completion: "enhanced_completion",
    });
  });

  it("falls back to the backend inferred mapping when there is no saved selection (first visit)", () => {
    const result = buildSavedRoleSelections(
      roles,
      {},
      { prompt: "enhanced_prompt", completion: "enhanced_completion" },
    );
    expect(result).toEqual({
      prompt: "enhanced_prompt",
      completion: "enhanced_completion",
    });
  });

  it("prefers the saved selection over the inferred mapping", () => {
    const result = buildSavedRoleSelections(
      roles,
      { completion: "original_completion" },
      { prompt: "enhanced_prompt", completion: "enhanced_completion" },
    );
    expect(result).toEqual({
      prompt: "enhanced_prompt",
      completion: "original_completion",
    });
  });

  it("ignores non-string inferred values and leaves unmapped roles out", () => {
    const result = buildSavedRoleSelections(
      roles,
      {},
      { prompt: ["a", "b"], completion: null },
    );
    expect(result).toEqual({});
  });
});
