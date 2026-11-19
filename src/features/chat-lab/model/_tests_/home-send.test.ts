import { describe, expect, it } from "vitest";
import { sendCard } from "../home-send";
import type { HomeCard } from "../use-home-field";
import type { PromptChoice } from "../prompt-choices";

const choice = (key: string, ask: string, guess: string[], extra: Partial<PromptChoice & { picked?: string[]; skipped?: boolean }> = {}) => ({
  key,
  kind: "notes",
  ask,
  options: guess.map((label) => ({ label, phrase: label })),
  guess,
  multi: false,
  template: "{}",
  impact: 1,
  said: 0,
  ...extra,
});

const card = (kind: string, data: unknown) => ({ leader: { tileId: "t" }, interface: { kind, data }, editable: true }) as unknown as HomeCard;

describe("sending the home card", () => {
  it("sends every choice: picked, passed over, or left at its guess", () => {
    const sent = sendCard(
      card("notes", { title: "Dinner", body: "Goal: dinner party" }),
      [
        choice("guests", "How many guests?", ["6 to 8"], { picked: ["10"], options: [{ label: "10", phrase: "For 10 guests" }] }),
        choice("style", "What style?", ["Casual"], { skipped: true }),
        choice("diet", "Any diet needs?", ["Vegetarian"]),
      ],
      {},
    );
    expect((sent.interface.data as { body: string }).body.split("\n")).toEqual(["Goal: dinner party", "For 10 guests", "Vegetarian"]);
    expect(sent.brief).toContain("How many guests: 10");
    expect(sent.brief).toContain("What style: no preference");
    expect(sent.brief).toContain("Any diet needs: Vegetarian (the suggested answer, left as is)");
  });

  it("writes a value the card shows into the field it stands in, and sends what it only offers as context", () => {
    const sent = sendCard(card("guide", { title: "Easy Lasagne", facts: [{ label: "Level", value: "Easy" }], needs: [], steps: [] }), [], {
      serves: ["4"],
      time: ["1 hour"],
      steps: ["Preheat the oven", { value: "Bake until golden" }],
    });
    expect((sent.interface.data as { facts: unknown[] }).facts).toEqual([
      { label: "Level", value: "Easy" },
      { label: "Serves", value: "4" },
      { label: "Time", value: "1 hour" },
    ]);
    expect(sent.brief).toMatch(/^Settled on the home card.*Serves: 4.*Time: 1 hour/);
    expect(sent.brief).toContain("Offered on the card, not added: steps: Preheat the oven; Bake until golden");
  });

  it("writes each choice where the interface keeps it, not only into Notes", () => {
    const diet = choice("limits", "Dietary limits?", ["None"], { picked: ["Vegetarian"], options: [{ label: "Vegetarian", phrase: "without meat" }, { label: "None", phrase: "with anything" }] });
    const level = choice("level", "Your level", ["Beginner"]);
    const passed = choice("tools", "Kit you have", ["Oven"], { skipped: true });

    const guide = sendCard(card("guide", { title: "Lasagne", facts: [], needs: [], steps: [] }), [diet, level, passed], {});
    expect((guide.interface.data as { facts: unknown[] }).facts).toEqual([
      { label: "Dietary limits", value: "Vegetarian" },
      { label: "Your level", value: "Beginner" },
    ]);
    expect(guide.brief).toContain("Kit you have: no preference");

    const schedule = sendCard(card("schedule", { title: "Shoot", dayCount: 1, hours: [9, 17], tasks: [], constraints: ["Loft from 8am"] }), [choice("pace", "How packed", ["Relaxed"])], {});
    expect((schedule.interface.data as { constraints: string[] }).constraints).toEqual(["Loft from 8am", "How packed: Relaxed"]);

    const search = sendCard(card("search", { query: "lofts", filters: ["Past year"], queries: [], results: [] }), [choice("angle", "What for", ["Compare"])], {});
    expect((search.interface.data as { filters: string[] }).filters).toEqual(["Past year", "Compare"]);

    const use = choice("use", "Where it goes", ["Instagram"], { options: [{ label: "Instagram", phrase: "for an Instagram post" }, { label: "Poster", phrase: "for a poster" }] });
    const generator = sendCard(card("generator", { title: "A launch line." }), [use], {});
    expect((generator.interface.data as { title: string }).title).toBe("A launch line for an Instagram post");
  });

  it("fills an interface's own field when a choice names it", () => {
    const sent = sendCard(card("guide", { title: "Stew", facts: [], needs: [], steps: [] }), [choice("serves", "How many", ["8"])], {});
    expect((sent.interface.data as { facts: unknown[] }).facts).toEqual([{ label: "Serves", value: "8" }]);
  });

  it("keeps a choice as context where the interface has no place for it", () => {
    const doc = { title: "Memo", body: "" };
    const sent = sendCard(card("document", doc), [choice("audience", "Who it's for", ["Leadership"])], {});
    expect(sent.interface.data).toEqual(doc);
    expect(sent.brief).toContain("Who it's for: Leadership (the suggested answer, left as is)");
  });

  it("sends no brief when the card settled and offered nothing", () => {
    expect(sendCard(card("document", { title: "Memo", body: "" }), [], {}).brief).toBeUndefined();
  });
});
