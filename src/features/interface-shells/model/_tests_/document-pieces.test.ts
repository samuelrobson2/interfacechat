import { describe, expect, it } from "vitest";
import { HEAT_PIECES } from "../../apps/app-fixtures";
import { piecesToCatalogue } from "../../apps/app-catalogue";
import { newEmbed } from "../../document/document-embeds";
import { countWords, parseBlocks, serializeBlocks } from "../markdown-blocks";
import { CATALOGUE, readCatalogueValue } from "../shell-catalogue";

describe("a document's live pieces", () => {
  it("are placed by a ::id line, which round-trips and isn't counted as words", () => {
    const body = "Opening line.\n\n::scatter\n\n## Next\n\nMore words here.";
    const blocks = parseBlocks(body);
    expect(blocks.map((block) => block.type)).toEqual(["paragraph", "embed", "heading2", "paragraph"]);
    expect(blocks[1]!.text).toBe("scatter");
    expect(serializeBlocks(blocks)).toBe(body);
    expect(countWords(blocks)).toBe(6);
  });

  it("go through the catalogue with the document, and plain writing stays plain", () => {
    const value = { title: "Heat", body: "Intro.\n\n::scatter", ...piecesToCatalogue(HEAT_PIECES) };
    expect(CATALOGUE.document.schema.safeParse(value).success).toBe(true);
    const read = readCatalogueValue("document", value)!;
    expect(read.blocks?.map((block) => block.id)).toEqual(HEAT_PIECES.blocks.map((block) => block.id));
    expect(readCatalogueValue("document", { title: "Memo", body: "Hi." })).toEqual({ title: "Memo", body: "Hi." });
  });

  it("insert over the first dataset, drawn from its columns", () => {
    const data = { title: "", body: "", ...HEAT_PIECES };
    expect(newEmbed("stat", data)).toMatchObject({ type: "stat", dataset: "heat", field: "treeCover", op: "sum" });
    expect(newEmbed("chart", data)).toMatchObject({ type: "chart", dataset: "heat", x: "neighbourhood", y: "treeCover" });
    expect(newEmbed("table", data)).toMatchObject({ type: "table", dataset: "heat" });
    expect(newEmbed("chart", { title: "", body: "" })).toBeNull();
  });
});
