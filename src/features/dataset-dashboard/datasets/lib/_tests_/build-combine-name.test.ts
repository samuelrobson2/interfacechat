import { describe, it, expect } from "vitest";
import {
  buildCombineName,
  COMBINE_NAME_MAX_LENGTH,
} from "../build-combine-name";

describe("buildCombineName", () => {
  it("joins names with ' & '", () => {
    expect(buildCombineName(["Medical QA", "Support QA"])).toBe(
      "Medical QA & Support QA",
    );
  });

  it("trims and drops empty / whitespace-only entries", () => {
    expect(buildCombineName(["  Alpha  ", "", "   ", "Beta", null, undefined])).toBe(
      "Alpha & Beta",
    );
  });

  it("returns empty string when nothing usable is supplied", () => {
    expect(buildCombineName([])).toBe("");
    expect(buildCombineName(["", "  ", null, undefined])).toBe("");
  });

  it("truncates with an ellipsis at the max-length boundary", () => {
    const longName = "a".repeat(COMBINE_NAME_MAX_LENGTH);
    const result = buildCombineName([longName, "b".repeat(50)]);
    expect(result.length).toBe(COMBINE_NAME_MAX_LENGTH);
    expect(result.endsWith("…")).toBe(true);
  });

  it("respects a custom max length", () => {
    const result = buildCombineName(["Alpha", "Beta", "Gamma"], 10);
    expect(result.length).toBe(10);
    expect(result).toBe("Alpha & B…");
  });

  it("leaves names alone when total length fits within the limit", () => {
    const result = buildCombineName(["Short", "Names"], COMBINE_NAME_MAX_LENGTH);
    expect(result).toBe("Short & Names");
    expect(result.endsWith("…")).toBe(false);
  });
});
