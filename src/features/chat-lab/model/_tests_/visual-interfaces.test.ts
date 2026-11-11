import { describe, expect, it } from "vitest";
import { routeShellDraft } from "@/features/interface-shells";
import { matchVisualInterface, opensAsOf, retrieveInterfaces } from "../visual-interfaces";

describe("interface retrieval in a thread", () => {
  it.each([
    "Make a tracker for moving house",
    "I need a project tracker with owners and deadlines",
    "Track the launch to-dos and who owns each one",
    "Make a checklist for moving house",
  ])("asks for a tracker: %s", (draft) => {
    expect(matchVisualInterface(draft)).toBe("checklist");
    expect(retrieveInterfaces(draft)[0]?.opensAs).toBe("tracker");
  });

  it("reads a change to an open tracker as being about the tracker", () => {
    const asked = matchVisualInterface("add booking the van to the tracker");
    expect(asked && opensAsOf(asked)).toBe("tracker");
  });

  it.each([
    ["Make a table comparing three cameras", "table"],
    ["Build a spreadsheet for my budget", "spreadsheet"],
    ["Write a paper on AI ethics", "document"],
    ["Search for papers on climate and farming", "search"],
    ["Plan the shoot day hour by hour", "schedule"],
    ["Build a timeline of the Roman empire", "timeline"],
    ["Make a flowchart of the hiring process", "flowchart"],
    ["What are the pros and cons of remote work", "proscons"],
  ] as const)("still routes %s", (draft, kind) => {
    expect(matchVisualInterface(draft)).toBe(kind);
  });

  it("agrees with the chat home on which library interface a draft asks for", () => {
    for (const draft of [
      "Make a tracker for moving house",
      "Make a table comparing three cameras",
      "Put the recce on a December calendar",
      "Give me a recipe for banana bread",
      "Best restaurants in Lisbon on a map",
    ]) {
      const home = routeShellDraft(draft).kind;
      const thread = retrieveInterfaces(draft)[0];
      expect(thread && opensAsOf(thread.id) === "tracker" ? "tracker" : thread?.id, draft).toBe(home);
    }
  });

  it.each(["hi", "make it shorter", "update the major impacts section to be more concise", "what's the capital of France"])(
    "asks for no interface: %s",
    (draft) => {
      expect(matchVisualInterface(draft)).toBeNull();
    },
  );
});
