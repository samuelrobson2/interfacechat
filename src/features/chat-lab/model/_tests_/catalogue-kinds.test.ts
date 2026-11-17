import { describe, expect, it } from "vitest";
import { readCatalogueValue } from "@/features/interface-shells";
import { artefactCatalogueKind, artefactCatalogueValue, catalogueArtefactPatch, newCatalogueArtefact } from "../catalogue-adapters";
import type { ChatLabArtefact } from "../chat-lab-store";

/** An interface the model made, written once, then read back as the model would see it. */
function roundTrip(kind: "guide" | "schedule" | "generator", input: unknown) {
  const made = newCatalogueArtefact(kind, "Draft");
  const artefact = { id: "a", title: "Draft", content: "", filters: [], sourceUserMessageId: null, pinned: false, ...made } as ChatLabArtefact;
  const value = readCatalogueValue(kind, input)!;
  const written = { ...artefact, ...catalogueArtefactPatch(artefact, value)! } as ChatLabArtefact;
  return { kind: artefactCatalogueKind(written), back: artefactCatalogueValue(written), data: written.shell!.data };
}

describe("the model writes every P0 interface", () => {
  it("writes a Guide: facts, what's needed, steps with timers", () => {
    const { kind, back } = roundTrip("guide", {
      title: "Mushroom risotto for 8",
      facts: [{ label: "Serves", value: "8" }],
      needs: [{ text: "600g arborio rice", group: "Ingredients" }],
      steps: [{ text: "Toast the rice" }, { text: "Simmer, stirring", minutes: 18 }],
    });
    expect(kind).toBe("guide");
    expect(back).toMatchObject({ title: "Mushroom risotto for 8", steps: [{ text: "Toast the rice" }, { text: "Simmer, stirring", minutes: 18 }] });
  });

  it("writes a Schedule in clock times and reads it back the same", () => {
    const input = {
      title: "Skincare shoot",
      dayCount: 1,
      hours: ["08:00", "13:00"],
      constraints: ["Model until 1pm"],
      tasks: [
        { label: "Set up the loft", day: 1, start: "08:00", end: "08:45", type: "setup" },
        { label: "Product shots", day: 1, start: "08:45", end: "10:30", type: "shoot" },
      ],
    };
    const { kind, back, data } = roundTrip("schedule", input);
    expect(kind).toBe("schedule");
    expect((data as { hours: number[] }).hours).toEqual([8, 13]);
    expect(back).toMatchObject({ hours: ["08:00", "13:00"], tasks: [{ start: "08:00", end: "08:45", day: 1 }, { start: "08:45", end: "10:30" }] });
  });

  it("writes a Generator's prompt, controls and text variations", () => {
    const { back } = roundTrip("generator", { title: "Taglines for a calm skincare brand", mode: "text", tone: "Warm", variations: ["Skin, at ease.", "Calm, bottled.", "Less, but better."] });
    expect(back).toMatchObject({ mode: "text", tone: "Warm", variations: ["Skin, at ease.", "Calm, bottled.", "Less, but better."] });
  });

  it("drops a half-written task while it streams", () => {
    expect(readCatalogueValue("schedule", { title: "Shoot", tasks: [{ label: "Set up", day: 1, start: "08:00", end: "09:00", type: "setup" }, { label: "Prod", start: "0" }] })).toMatchObject({ tasks: [{ label: "Set up" }] });
  });
});
