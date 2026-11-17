import { describe, expect, it } from "vitest";
import { isGoalRequest } from "@/features/interface-shells";
import { rankHome } from "../home-ranking";
import { libraryTiles } from "../home-tiles";

/** The chat home's routing rules, as rules: not tuned to any one request. */
const lead = (draft: string) => rankHome({ tiles: libraryTiles({} as never), draft }).leader?.interface.kind ?? null;

describe("a goal request opens Notes first", () => {
  it.each([
    "Help me organize food for a dinner party next week",
    "Help me plan a half-day marketing shoot for our skincare brand next Thursday. We’re shooting 3 product shots and 2 lifestyle scenes with one model. Location is a rented loft in the mission",
    "Can you help me organise my sister's wedding",
    "We need to plan the move to Lisbon",
  ])("%s → notes", (draft) => {
    expect(isGoalRequest(draft)).toBe(true);
    expect(lead(draft)).toBe("notes");
  });

  it.each([
    ["Help me plan a shoot schedule for Thursday", "schedule"],
    ["Make a checklist for the dinner party", "tracker"],
    ["Help me organise my tasks for the house move", "tracker"],
  ])("a request that names the thing routes to it: %s", (draft, kind) => {
    expect(isGoalRequest(draft)).toBe(false);
    expect(lead(draft)).toBe(kind);
  });
});

it("a conversation isn't a goal to plan: 'prepare for an interview' stays in the chat", () => {
  expect(isGoalRequest("Help me prepare for a job interview")).toBe(false);
});

describe("only P0 interfaces are picked from what's typed", () => {
  it("never leads with a P1 interface (Calendar, Map, Canvas, Chart)", () => {
    for (const draft of ["What's on next week?", "Coffee shops near me on a map", "A mood board for the brand", "Chart revenue by month"]) {
      expect(["calendar", "map", "moodboard", "chart"]).not.toContain(lead(draft));
    }
  });
});

describe("notes read off the request", () => {
  it("pulls the facts out of a specified request, one line each", async () => {
    const { notesFromPrompt } = await import("../prompt-fields");
    const { title, body } = notesFromPrompt(
      "Help me plan a half-day marketing shoot for our skincare brand next Thursday. We’re shooting 3 product shots and 2 lifestyle scenes with one model. Location is a rented loft in the mission",
    );
    expect(title).toMatch(/marketing shoot/i);
    expect(body.split("\n")).toEqual(
      expect.arrayContaining(["When: next Thursday", "Length: half day", "For: our skincare brand", "Includes: 3 product shots, 2 lifestyle scenes, one model", "Where: a rented loft in the mission"]),
    );
  });

  it("keeps an underspecified request to the goal and what it does say", async () => {
    const { notesFromPrompt } = await import("../prompt-fields");
    const { title, body } = notesFromPrompt("Help me organize food for a dinner party next week");
    expect(title).toBe("Food for a dinner party");
    expect(body.split("\n")).toEqual(["Goal: organize food for a dinner party", "When: next week"]);
  });
});
