import { afterEach, describe, expect, it } from "vitest";
import {
  SHELL_RETRIEVAL,
  copyShellRetrieval,
  routeShellDraft,
  setShellRetrieval,
  shellKindScore,
  chatFormatFor,
  chatPersonaFor,
} from "../shell-retrieval";

afterEach(() => {
  setShellRetrieval("document", copyShellRetrieval(SHELL_RETRIEVAL.document));
  setShellRetrieval("table", copyShellRetrieval(SHELL_RETRIEVAL.table));
});

describe("chat formats", () => {
  it.each([
    ["Teach me how tides work, in simple terms", "explainer"],
    ["Should we hire a steadicam operator? Weigh up the pros and cons", "proscons"],
    ["Rank these three lenses for handheld work", "ranked"],
  ])("sends %s to chat, laid out as %s", (draft, format) => {
    expect(routeShellDraft(draft).kind).toBe("chat");
    expect(chatFormatFor(draft).format).toBe(format);
  });

  it.each([
    ["Be honest, does the opening of my script work?", "critic"],
    ["I'm new to this, teach me how lenses work", "tutor"],
    ["Throw some ideas at me for the trailer", "brainstormer"],
  ])("hears %s as %s", (draft, persona) => {
    expect(chatPersonaFor(draft)).toBe(persona);
  });

  it("uses the default voice when nobody in particular is asked for", () => {
    expect(chatPersonaFor("What time does the ferry leave?")).toBeNull();
  });

  it("leaves an ordinary question as plain chat", () => {
    expect(chatFormatFor("Do you think the title works?").format).toBeNull();
  });
});

describe("shell retrieval", () => {
  it("routes a clear prompt to its interface", () => {
    expect(routeShellDraft("Write a paper on coral reefs").kind).toBe("document");
    expect(routeShellDraft("Find studies on coral bleaching").kind).toBe("search");
    expect(routeShellDraft("Make a comparison table of hotels with price and rating").kind).toBe("table");
  });

  it.each([
    ["Build a three-day shoot schedule from this shot list, allowing for setups, travel, breaks and cast availability", "schedule"],
    ["Create a checklist of everything we need to arrange before the shoot, with owners and deadlines", "tracker"],
    ["Find three shoot dates when our cast, crew and location are all available", "calendar"],
    ["Review this location agreement and highlight the fees, filming restrictions, cancellation terms and our responsibilities", "reader"],
    ["Show me cafés near our main location so I can shortlist options for the second scene", "map"],
    ["Create a moodboard for the film with muted colours, natural window light and intimate handheld framing", "moodboard"],
  ])("routes %s to %s", (draft, kind) => {
    expect(routeShellDraft(draft).kind).toBe(kind);
  });

  it.each([
    ["Plan the photo walk hour by hour, with travel and breaks", "schedule"],
    ["Make a packing list for the trip with who brings what", "tracker"],
    ["Which dates is the team available for an offsite in May?", "calendar"],
    ["Read this lease and highlight the break clauses", "reader"],
    ["Find the nearest pharmacies near the hotel", "map"],
    ["Put together an inspiration board with a warm autumn palette", "moodboard"],
    ["Explain this paper on sleep spindles to me", "reader"],
    ["Summarise this report and show where the risks are", "reader"],
    ["Write a paper on sleep spindles", "document"],
    ["Give me a timeline of the history of cinema", "timeline"],
    ["Draw a decision tree for whether to reshoot", "flowchart"],
    ["Brainstorm names for the production company", "mindmap"],
    ["A recipe for lemon drizzle cake, step by step", "guide"],
    ["Make a mind map of ideas for the launch", "mindmap"],
    ["How do I put together a flat-pack desk?", "guide"],
    ["How do I fix a leaking radiator?", "guide"],
    ["A 20-minute yoga workout for beginners", "guide"],
    ["Install a smart thermostat, step by step", "guide"],
  ])("generalises: %s goes to %s", (draft, kind) => {
    expect(routeShellDraft(draft).kind).toBe(kind);
  });

  it("sends a greeting to chat, and leaves noise unrouted", () => {
    expect(routeShellDraft("hi there").kind).toBe("chat");
    expect(routeShellDraft("asdf qwerty").kind).toBeNull();
  });

  it("pushes a draft away when it reads like a 'should not open' example", () => {
    const base = { description: "", notFor: "", queries: [], triggers: ["paper"] };
    setShellRetrieval("document", { ...base, avoidQueries: [] });
    expect(shellKindScore("document", "Find a paper on heat")).toBe(20);
    setShellRetrieval("document", { ...base, avoidQueries: ["Find a paper on heat"] });
    expect(shellKindScore("document", "Find a paper on heat")).toBe(0);
  });
});
