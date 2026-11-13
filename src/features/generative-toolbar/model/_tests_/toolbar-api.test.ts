import { describe, expect, it } from "vitest";
import { applyOperations, readBlanks, readRewrite, snapshot } from "../toolbar-api";
import { paragraphTag } from "../paragraph-tags";
import { normalizeTool } from "../tool-spec";

describe("normalizeTool", () => {
  it("trims an overlong draft to the contract instead of dropping it", () => {
    const tool = normalizeTool({
      type: "slider",
      id: "detail",
      label: "Level of detail in every single section",
      detail: "x".repeat(120),
      icon: "wand",
      steps: ["Brief", "Balanced", "In depth"],
      value: 7,
    });
    expect(tool).toMatchObject({ type: "slider", icon: "sparkles", value: 2, min: { label: "Brief" }, max: { label: "In depth" } });
    expect(tool!.label.length).toBeLessThanOrEqual(24);
    expect(tool!.detail.length).toBeLessThanOrEqual(80);
  });

  it("puts a choice on an option that exists, and drops one it can't save", () => {
    const options = [{ id: "a", label: "A" }, { id: "b", label: "B" }];
    expect(normalizeTool({ type: "choice", id: "c", label: "C", detail: "", icon: "list", options, value: "z" })).toMatchObject({ value: "a" });
    expect(normalizeTool({ type: "choice", id: "c", label: "C", detail: "", icon: "list", options: [options[0]], value: "a" })).toBeNull();
  });
});

describe("applyOperations", () => {
  const data = { title: "Shots", rows: [{ id: "r1", cells: { a: "x" } }], body: "One.", image: "data:image/png;base64,AAA" };

  it("applies small edits and leaves the original alone", () => {
    const next = applyOperations(data, [
      { op: "replace", path: "/rows/0/cells/a", value: "y" },
      { op: "add", path: "/rows/-", value: { id: "r2", cells: { a: "z" } } },
      { op: "add", path: "/body/-", value: "Two." },
    ]);
    expect(next.rows.map((row) => row.cells.a)).toEqual(["y", "z"]);
    expect(next.body).toBe("One.\n\nTwo.");
    expect(data.rows).toHaveLength(1);
  });

  it("refuses edits that would break the interface", () => {
    expect(() => applyOperations(data, [{ op: "replace", path: "/rows", value: "none" }])).toThrow(/rows/);
    expect(() => applyOperations(data, [{ op: "replace", path: "/rows/4/cells/a", value: "y" }])).toThrow();
    expect(() => applyOperations(data, [{ op: "replace", path: "/image", value: "[image]" }])).toThrow(/picture/);
  });

  it("shows the model pictures as [image]", () => {
    expect(snapshot(data)).toMatchObject({ image: "[image]", body: "One." });
  });
});

describe("readRewrite", () => {
  const paragraphs = ["# Heat", "Streets run hot.", "Trees help.", "More to come."];

  it("applies the edits and keeps every paragraph no edit names", () => {
    const raw = "SUMMARY: Added a close\n---\n@replace 2\nTrees cut 7°C.\n@delete 1\n@after 3\nIn short, plant.";
    expect(readRewrite(raw, paragraphs, true)).toEqual({
      summary: "Added a close",
      reply: null,
      text: "# Heat\n\nTrees cut 7°C.\n\nMore to come.\n\nIn short, plant.",
      blanks: {},
      misplaced: 0,
    });
  });

  it("never loses a paragraph the model leaves out", () => {
    const { text } = readRewrite("SUMMARY: x\n---\n@before 0\nA new start.", paragraphs, true);
    expect(text).toBe(["A new start.", ...paragraphs].join("\n\n"));
  });

  it("shows an edit as far as it has got, and holds a half-written edit line back", () => {
    expect(readRewrite("SUMMARY: x\n---\n@replace 1\nStreets ru", paragraphs, false).text).toBe(
      "# Heat\n\nStreets ru\n\nTrees help.\n\nMore to come.",
    );
    expect(readRewrite("SUMMARY: x\n---\n@repl", paragraphs, false).text).toBe(paragraphs.join("\n\n"));
  });

  it("puts edits past the end at the end, as an empty document's first writing", () => {
    expect(readRewrite("SUMMARY: x\n---\n@replace 0\n# Plan\n\nFirst.", [], true).text).toBe("# Plan\n\nFirst.");
  });

  it("reads an answer with no edit", () => {
    expect(readRewrite("SUMMARY: Checked the numbers\nREPLY: They add up.", paragraphs, true)).toEqual({
      summary: "Checked the numbers",
      reply: "They add up.",
      text: null,
      blanks: {},
      misplaced: 0,
    });
  });
});

describe("blanks in a rewrite", () => {
  const tag = (json: object) => `<blank>${JSON.stringify(json)}</blank>`;
  const guests = { key: "guests", ask: "How many guests?", kind: "only_you", options: ["4 people", "8 people"], placeholder: "how many", wait: true };

  it("turns each tag into a {{key}} slot with its blank", () => {
    const raw = `SUMMARY: Drafted\n---\n@replace 1\nDinner for ${tag(guests)}, then dessert.`;
    const result = readRewrite(raw, ["# Plan", "Old."], true);
    expect(result.text).toBe("# Plan\n\nDinner for {{guests}}, then dessert.");
    expect(result.blanks.guests).toMatchObject({ ask: "How many guests?", options: ["4 people", "8 people"], wait: true });
  });

  it("holds back a tag still being written, and drops one that doesn't parse", () => {
    expect(readBlanks('Dinner for <blank>{"key":"gu', {}, false).text).toBe("Dinner for ");
    expect(readBlanks("Dinner for <bla", {}, false).text).toBe("Dinner for ");
    expect(readBlanks("Dinner for <blank>{oops}</blank>.", {}, true).text).toBe("Dinner for .");
  });

  it("gives a clashing key a number, but keeps one the document already has", () => {
    const taken = { guests: { ask: "Who's coming?" } };
    expect(Object.keys(readBlanks(`For ${tag(guests)}.`, taken, true).blanks)).toEqual(["guests-2"]);
    expect(Object.keys(readBlanks(`For ${tag(guests)}.`, { guests: { ask: "How many guests?" } }, true).blanks)).toEqual(["guests"]);
  });
});

describe("paragraph tags", () => {
  const paragraphs = ["# Heat", "Streets run hot.", "Trees help."];
  const tag = (index: number) => `${index}#${paragraphTag(paragraphs[index]!)}`;

  it("applies an edit whose number and tag agree", () => {
    expect(readRewrite(`SUMMARY: x\n---\n@replace ${tag(2)}\nTrees cool by 7°C.`, paragraphs, true).text).toBe(
      "# Heat\n\nStreets run hot.\n\nTrees cool by 7°C.",
    );
  });

  it("moves an edit to the paragraph its tag names when the number is off", () => {
    const raw = `SUMMARY: x\n---\n@replace 1#${paragraphTag(paragraphs[2]!)}\nTrees cool by 7°C.`;
    expect(readRewrite(raw, paragraphs, true).text).toBe("# Heat\n\nStreets run hot.\n\nTrees cool by 7°C.");
  });

  it("leaves out an edit whose tag matches nothing, and counts it", () => {
    const result = readRewrite("SUMMARY: x\n---\n@delete 1#zzz", paragraphs, true);
    expect(result.text).toBe(paragraphs.join("\n\n"));
    expect(result.misplaced).toBe(1);
  });
});

describe("edits by id", () => {
  const data = { items: [{ id: "h1", done: false }, { id: "h2", done: false }] };
  it("names a list item by its id", () => {
    expect(applyOperations(data, [{ op: "replace", path: "/items/h2/done", value: true }]).items[1]?.done).toBe(true);
    expect(applyOperations(data, [{ op: "remove", path: "/items/h1" }]).items.map((item) => item.id)).toEqual(["h2"]);
    expect(() => applyOperations(data, [{ op: "replace", path: "/items/h9/done", value: true }])).toThrow();
  });
});
