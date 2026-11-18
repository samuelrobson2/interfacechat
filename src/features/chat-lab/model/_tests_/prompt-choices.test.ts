import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { briefOf, ownOption, readChoice, repeatsChoice, usePromptChoices, withBrief } from "../prompt-choices";

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

  it("reads their own answer through the choice's template", () => {
    expect(ownOption(readChoice({ ...audience, template: "for {}" })!, "my lab group")).toEqual({ label: "my lab group", phrase: "for my lab group" });
    // No template from the model: the kind's own.
    expect(ownOption(readChoice(audience)!, "the board").phrase).toBe("for the board");
    // A multi choice's items go in as typed, after its lead.
    expect(ownOption(readChoice(covers)!, "the budget").phrase).toBe("the budget");
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

  it("asks once the request has a few words, shows at most three, and a pick leaves the card for the brief, never the prompt", async () => {
    const fetch = vi.fn(async () =>
      stream([
        { choice: audience },
        { choice: covers },
        { choice: { ...audience, key: "purpose", kind: "purpose", ask: "What it should do" } },
        { choice: { ...audience, key: "voice", kind: "voice", ask: "Voice", impact: 2 } },
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

    // A pick goes into the brief sent with the interface; the prompt is never touched. It leaves the card, and
    // the next choice (here the one held back) takes its place, and the model is asked again for more.
    act(() => result.current.pick("audience", ["The team"]));
    expect(result.current.brief).toBe("For the launch team.");
    expect(result.current.shown.map((choice) => choice.key)).not.toContain("audience");
    expect(result.current.picked.find((choice) => choice.key === "audience")?.picked).toEqual(["The team"]);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2), { timeout: 3000 });

    // Picking nothing unpicks it.
    act(() => result.current.pick("audience", []));
    expect(result.current.picked.find((choice) => choice.key === "audience")).toBeUndefined();
    expect(result.current.brief).toBe("");

    // Their own words: picked, and in the brief through the template.
    act(() => result.current.pick("audience", [], "my lab group"));
    expect(result.current.brief).toBe("For my lab group.");
    act(() => result.current.pick("covers", ["Timeline"], "the budget"));
    expect(result.current.brief).toBe("For my lab group, covering the timeline and the budget.");
  });

  it("never shows a question twice: the same kind under another key, or the same words, is left out", () => {
    const rows = [{ key: "audience", kind: "audience", ask: "Who it's for" }, { key: "fact-1", kind: "fact", ask: "Budget" }];
    expect(repeatsChoice({ key: "readers", kind: "audience", ask: "Who reads it" }, rows)).toBe(true);
    expect(repeatsChoice({ key: "who", kind: "purpose", ask: "Who it’s for?" }, rows)).toBe(true);
    // Its own key is an update, not a repeat; a second fact is a different question.
    expect(repeatsChoice({ key: "audience", kind: "audience", ask: "Who it's for" }, rows)).toBe(false);
    expect(repeatsChoice({ key: "fact-2", kind: "fact", ask: "Guest count" }, rows)).toBe(false);
  });
});
