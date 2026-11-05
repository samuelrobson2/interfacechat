import { describe, expect, it } from "vitest";
import type {
  SearchShellData,
  TableShellData,
} from "@/features/interface-shells";
import {
  applyCardEdit,
  parsePrompt,
  reframePrompt,
  writePromptField,
} from "../prompt-fields";

describe("parsePrompt", () => {
  it("reads a document's title, length and context", () => {
    const { data } = parsePrompt(
      "document",
      "Write a paper on urban heat islands, about 1,500 words, covering tree cover and cool roofs",
    );
    expect(data.title).toBe("Urban heat islands");
    expect(data.length).toBe("~1,500 words");
    expect(data.body).toBe("tree cover and cool roofs");
  });

  it("keeps a '~' length out of the title", () => {
    const { data } = parsePrompt(
      "document",
      "Write a paper on urban heat islands, ~1,500 words",
    );
    expect(data.title).toBe("Urban heat islands");
    expect(data.length).toBe("~1,500 words");
  });

  it("reads a search's query, sources and filters", () => {
    const { data } = parsePrompt(
      "search",
      "Find papers on sleep and memory on scholar.google.com and pubmed.gov, since 2020",
    );
    expect(data.query).toBe("sleep and memory");
    expect(data.sources).toEqual(["scholar.google.com", "pubmed.gov"]);
    expect(data.filters).toEqual(["since 2020"]);
  });

  it("reads a place as a filter", () => {
    const { data } = parsePrompt(
      "search",
      "Search for coffee roasters in North Beach",
    );
    expect(data.query).toBe("coffee roasters");
    expect(data.filters).toEqual(["in North Beach"]);
  });

  it("reads a table's title and columns, with the 'each' word first", () => {
    const { data } = parsePrompt(
      "table",
      "Make a shot list with framing, cast and equipment for each shot",
    );
    expect(data.title).toBe("Shot list");
    expect(data.columns.map((column) => column.label)).toEqual([
      "Shot",
      "Framing",
      "Cast",
      "Equipment",
    ]);
  });

  it("turns '3-day' into a Day column and three rows", () => {
    const { data } = parsePrompt(
      "table",
      "Help me plan for a 3-day marketing film shoot",
    );
    expect(data.title).toBe("3-day marketing film shoot");
    expect(data.columns.map((column) => column.label)).toEqual(["Day"]);
    expect(data.rowCount).toBe(3);
  });
});

describe("writePromptField", () => {
  it("rewrites the title in place", () => {
    expect(
      writePromptField(
        "document",
        "Write a paper on urban heat islands",
        "title",
        "Urban cooling",
      ),
    ).toBe("Write a paper on urban cooling");
  });

  it("seeds an empty prompt from the title", () => {
    expect(writePromptField("search", "", "title", "tide pools")).toBe(
      "Search for tide pools",
    );
  });

  it("adds, changes and removes a length", () => {
    const added = writePromptField(
      "document",
      "Write a paper on heat.",
      "length",
      "~1,500 words",
    );
    expect(added).toBe("Write a paper on heat, about 1,500 words.");
    const changed = writePromptField("document", added, "length", "~800 words");
    expect(changed).toBe("Write a paper on heat, about 800 words.");
    expect(writePromptField("document", changed, "length", undefined)).toBe(
      "Write a paper on heat.",
    );
  });

  it("adds and removes filters one at a time", () => {
    const added = writePromptField(
      "search",
      "Search for coffee roasters",
      "filters",
      ["in North Beach"],
    );
    expect(added).toBe("Search for coffee roasters, in North Beach");
    expect(writePromptField("search", added, "filters", [])).toBe(
      "Search for coffee roasters",
    );
  });

  it("rewrites a table's columns as a 'with' clause, keeping the 'each' word", () => {
    const prompt = "Make a shot list with framing and cast for each shot";
    expect(
      writePromptField("table", prompt, "columns", [
        "Shot",
        "Framing",
        "Cast",
        "Lens",
      ]),
    ).toBe("Make a shot list with framing, cast and lens for each shot");
  });
});

describe("applyCardEdit", () => {
  it("writes a changed query and source back into the prompt", () => {
    const prompt = "Search for coffee roasters";
    const before = parsePrompt("search", prompt).data;
    const after: SearchShellData = {
      ...before,
      query: "tea houses",
      sources: ["yelp.com"],
    };
    expect(applyCardEdit("search", prompt, before, after).prompt).toBe(
      "Search for tea houses on yelp.com",
    );
  });

  it("keeps typed rows on the card, since the prompt can't hold them", () => {
    const prompt = "Make a tracker with owner and status";
    const before = parsePrompt("table", prompt).data;
    const rows: TableShellData["rows"] = [
      { id: "r1", cells: { "col-0": "Sam" } },
    ];
    const edit = applyCardEdit("table", prompt, before, { ...before, rows });
    expect(edit.prompt).toBe(prompt);
    expect(edit.extras).toEqual({ rows });
  });
});

describe("reframePrompt", () => {
  it("rewrites an interface's own verb and keeps the rest", () => {
    expect(
      reframePrompt(
        "Write a paper on urban heat islands, since 2020",
        "search",
      ),
    ).toBe("Search for urban heat islands, since 2020");
  });

  it("leaves prompts that don't open with an interface verb alone", () => {
    const prompt = "Help me plan for a 3-day marketing film shoot";
    expect(reframePrompt(prompt, "table")).toBe(prompt);
  });

  it("seeds an empty prompt", () => {
    expect(reframePrompt("", "document")).toBe("Write a paper on ");
  });
});
