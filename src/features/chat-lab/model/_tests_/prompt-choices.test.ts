import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { briefOf, readChoice, usePromptChoices, withBrief } from "../prompt-choices";

const audience = {
  key: "audience",
  kind: "audience",
  ask: "Who it's for",
  options: [
    { label: "Leadership", phrase: "for leadership" },
    { label: "The team", phrase: "for the launch team" },
  ],
  guess: ["Leadership"],
  multi: false,
  impact: 4,
  said: 0.1,
};
const covers = {
  key: "covers",
  kind: "coverage",
  ask: "Covers",
  options: [
    { label: "Timeline", phrase: "the timeline" },
    { label: "Risks", phrase: "risks" },
    { label: "Budget", phrase: "the budget" },
  ],
  guess: ["Timeline"],
  multi: true,
  lead: "covering",
  impact: 3,
  said: 0,
};

describe("the brief the choices write", () => {
  it("is one sentence, in the order the choices came", () => {
    expect(
      briefOf([
        { ...readChoice(audience)!, order: 0, picked: ["The team"] },
        { ...readChoice(covers)!, order: 1, picked: ["Timeline", "Risks"] },
      ]),
    ).toBe("For the launch team, covering the timeline and risks.");
  });

  it("goes after the request, and replaces itself when a pick changes", () => {
    const once = withBrief("Write a document about our Q3 launch plan", "", "For leadership.");
    expect(once).toBe("Write a document about our Q3 launch plan. For leadership.");
    expect(withBrief(once, "For leadership.", "For the launch team.")).toBe("Write a document about our Q3 launch plan. For the launch team.");
    // Edited away by hand: the new brief is added again rather than lost.
    expect(withBrief("Write a document about the plan.", "For leadership.", "For customers.")).toBe("Write a document about the plan. For customers.");
  });

  it("drops a choice it can't show", () => {
    expect(readChoice({ ...audience, options: [audience.options[0]] })).toBeNull();
    expect(readChoice({ ...audience, guess: ["Nobody"] })?.guess).toEqual(["Leadership"]);
  });
});

describe("usePromptChoices", () => {
  afterEach(() => vi.unstubAllGlobals());

  const stream = (lines: unknown[]) =>
    new Response(lines.map((line) => JSON.stringify(line)).join("\n") + "\n", { status: 200 });

  it("asks once the request has a few words, shows at most three, and writes picks into the prompt", async () => {
    const fetch = vi.fn(async () =>
      stream([
        { choice: audience },
        { choice: covers },
        { choice: { ...audience, key: "purpose", ask: "What it should do" } },
        { choice: { ...audience, key: "voice", ask: "Voice", impact: 2 } },
        { done: { ms: 10 } },
      ]),
    );
    vi.stubGlobal("fetch", fetch);
    const { result, rerender } = renderHook(({ draft }) => usePromptChoices("document", "Document", draft), {
      initialProps: { draft: "Write a" },
    });
    expect(result.current.shown).toEqual([]);
    rerender({ draft: "Write a document about our Q3 launch plan" });
    await waitFor(() => expect(result.current.shown).toHaveLength(3), { timeout: 3000 });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.current.shown.map((choice) => choice.key)).not.toContain("voice");

    let prompt = "";
    act(() => {
      prompt = result.current.pick("audience", ["The team"], "Write a document about our Q3 launch plan");
    });
    expect(prompt).toBe("Write a document about our Q3 launch plan. For the launch team.");
    expect(result.current.shown.find((choice) => choice.key === "audience")?.picked).toEqual(["The team"]);
  });
});
