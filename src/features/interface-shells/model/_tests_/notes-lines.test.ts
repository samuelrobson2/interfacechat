import { describe, expect, it } from "vitest";
import { inlineRuns, numberAt, parseLine, parseNotes, toggleInline, withStyle, writeLine, writeNotes } from "../notes-lines";

describe("notes lines", () => {
  it("reads every Apple Notes style from the text, and writes it back the same", () => {
    const body = ["# Dinner party", "## Menu", "### Mains", "When: Saturday 7pm", "- Olives", "  - Green ones", "– Bread", "1. Shop", "1. Prep", "[ ] Book wine", "[x] Invite everyone", "`8 guests`"].join("\n");
    const lines = parseNotes(body);
    expect(lines.map((line) => line.style)).toEqual(["title", "heading", "subheading", "body", "bullet", "bullet", "dash", "number", "number", "check", "check", "mono"]);
    expect(lines[5]!.indent).toBe(1);
    expect(lines[10]!.checked).toBe(true);
    expect(writeNotes(lines)).toBe(body);
  });

  it("takes the model's markdown habits too", () => {
    expect(parseLine("* Olives").style).toBe("bullet");
    expect(parseLine("- [ ] Book wine")).toMatchObject({ style: "check", checked: false, text: "Book wine" });
  });

  it("numbers a run of numbered lines, counting past deeper lines", () => {
    const lines = parseNotes("1. Shop\n  - Wine\n1. Prep\nBody\n1. Again");
    expect([0, 2, 4].map((i) => numberAt(lines, i))).toEqual([1, 2, 1]);
  });

  it("toggles a style off when it's set again", () => {
    expect(withStyle(parseLine("- Olives"), "bullet").style).toBe("body");
    expect(writeLine(withStyle(parseLine("Olives"), "check"))).toBe("[ ] Olives");
  });

  it("wraps and unwraps inline styles around the selection, or the whole line", () => {
    const bold = toggleInline("Buy olives", 4, 10, "bold");
    expect(bold.text).toBe("Buy **olives**");
    expect(toggleInline(bold.text, bold.start, bold.end, "bold").text).toBe("Buy olives");
    expect(toggleInline("Buy olives", 0, 0, "strike").text).toBe("~~Buy olives~~");
    expect(inlineRuns("a **b** *c* __d__ ~~e~~").filter((run) => run.text.trim()).map((run) => Object.keys(run).filter((k) => k !== "text")[0] ?? "plain")).toEqual(["plain", "bold", "italic", "underline", "strike"]);
  });
});

describe("the model's notes tools", () => {
  it("keeps one line per label: a newer When replaces the old one, Open lines add up", async () => {
    const { applyRoleTool } = await import("../interface-roles");
    const data = { title: "Dinner", body: "Goal: dinner party\nWhen: next week\nOpen: how many guests?" };
    const result = applyRoleTool("notes_add", data, { lines: ["When: Saturday at 7pm", "Guests: 8", "Open: any allergies?"] });
    expect(result.ok && result.data).toMatchObject({ body: "Goal: dinner party\nWhen: Saturday at 7pm\nOpen: how many guests?\nGuests: 8\nOpen: any allergies?" });
  });
});

describe("organising the notes", () => {
  const data = {
    title: "Dinner",
    body: "Goal: dinner party\nOpen: how many guests?\nWhen: Saturday at 7pm\nGuests: 8, one vegetarian\n[x] Choose the menu\nMenu: lasagne, salad, pavlova\n[ ] Make the shopping list",
  };

  it("lets the model reorder and prune: answered questions and done steps can go", async () => {
    const { applyRoleTool } = await import("../interface-roles");
    const body = "Goal: dinner party\nWhen: Saturday at 7pm\nGuests: 8, one vegetarian\nMenu: lasagne, salad, pavlova\n[ ] Make the shopping list";
    const result = applyRoleTool("notes_rewrite", data, { body });
    expect(result.ok && (result.data as { body: string }).body).toBe(body);
  });

  it("refuses a rewrite that loses a fact, and says which", async () => {
    const { applyRoleTool } = await import("../interface-roles");
    const result = applyRoleTool("notes_rewrite", data, { body: "Goal: dinner party\nMenu: lasagne, salad, pavlova" });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatch(/When: Saturday at 7pm; Guests: 8, one vegetarian/);
  });

  it("allows a fact to become more exact under its own label", async () => {
    const { applyRoleTool } = await import("../interface-roles");
    const result = applyRoleTool("notes_rewrite", data, { body: "Goal: dinner party\nWhen: Saturday 28 Nov, 7pm\nGuests: 8 (Sam is vegetarian)\nMenu: lasagne, salad, pavlova" });
    expect(result.ok).toBe(true);
  });
});

describe("choosing an interface", () => {
  it("is a general rule built from every interface's own description", async () => {
    const { CHOOSING_RULE } = await import("../interface-roles");
    for (const label of ["Document", "Guide", "Schedule", "Table", "Tracker", "Generator"]) expect(CHOOSING_RULE).toContain(`${label} for`);
  });
});
