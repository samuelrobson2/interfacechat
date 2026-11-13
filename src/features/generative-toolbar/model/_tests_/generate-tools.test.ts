import { describe, expect, it } from "vitest";
import { generateTools, TOOLBAR_KINDS } from "../generate-tools";
import { toolbarFixture } from "../toolbar-fixtures";
import { toolSpecSchema } from "../tool-spec";

/** The stand-in generator has to keep to the contract the model will be held to. */
describe("generateTools", () => {
  const selections = [null, "Shade does most of the work", "Wide", "Send call sheets", "lighthouse"];

  for (const kind of TOOLBAR_KINDS) {
    for (const state of ["empty", "suggestion", "history"] as const) {
      for (const selection of selections) {
        it(`${kind} · ${state} · ${selection ?? "no selection"} fits the schema`, () => {
          const data = toolbarFixture(kind, state);
          const tools = generateTools(kind, data as never, { selection });
          expect(tools.length).toBeGreaterThan(0);
          expect(new Set(tools.map((tool) => tool.id)).size).toBe(tools.length);
          for (const tool of tools) {
            const result = toolSpecSchema.safeParse(tool);
            expect(result.success, `${tool.id}: ${result.error?.message}`).toBe(true);
          }
        });
      }
    }
  }

  it("offers controls, not only actions, on a filled document", () => {
    const tools = generateTools("document", toolbarFixture("document", "history"), { selection: null });
    expect(tools.slice(0, 2).map((tool) => tool.type)).toEqual(["grid", "slider"]);
  });
});
