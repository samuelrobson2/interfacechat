import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { chartTypeFor } from "../chart";
import {
  SHELL_RETRIEVAL,
  copyShellRetrieval,
  routeShellDraft,
  splitRequest,
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
    ["Put the recce, the three shoot days and the rough cut review on a December calendar", "calendar"],
    ["Review this location agreement and highlight the fees, filming restrictions, cancellation terms and our responsibilities", "reader"],
    ["Show me cafés near our main location so I can shortlist options for the second scene", "map"],
    ["Create a moodboard for the film with muted colours, natural window light and intimate handheld framing", "moodboard"],
  ])("routes %s to %s", (draft, kind) => {
    expect(routeShellDraft(draft).kind).toBe(kind);
  });

  it.each([
    ["Plan the photo walk hour by hour, with travel and breaks", "schedule"],
    ["Make a packing list for the trip with who brings what", "tracker"],
    ["Add the team offsite to the calendar on the 12th of May", "calendar"],
    ["Read this lease and highlight the break clauses", "reader"],
    ["Find the nearest pharmacies near the hotel", "map"],
    ["Put together an inspiration board with a warm autumn palette", "moodboard"],
    ["Generate an image of a lighthouse at dusk in watercolour", "generator"],
    ["Give me three taglines for a coffee brand", "generator"],
    ["Make a product photo of these trainers on a marble background", "generator"],
    ["Create a logo idea for a bakery called Crumb", "generator"],
    ["Explain this paper on sleep spindles to me", "reader"],
    ["Summarise this report and show where the risks are", "reader"],
    ["Write a paper on sleep spindles", "document"],
    ["Make a document about the launch plan", "document"],
    ["Start a doc for the team offsite", "document"],
    ["Summarise this document", "reader"],
    ["Give me a timeline of the history of cinema", "chart"],
    ["Draw a decision tree for whether to reshoot", "chart"],
    ["Brainstorm names for the production company", "chart"],
    ["A recipe for lemon drizzle cake, step by step", "guide"],
    ["Make a mind map of ideas for the launch", "chart"],
    ["How do I put together a flat-pack desk?", "guide"],
    ["How do I fix a leaking radiator?", "guide"],
    ["A 20-minute yoga workout for beginners", "guide"],
    ["Install a smart thermostat, step by step", "guide"],
    ["Build a dashboard of our monthly sales by region", "dashboard"],
    ["Show me our KPIs: sign-ups, churn and revenue", "dashboard"],
    ["Turn this CSV into a dashboard with a filter for region", "dashboard"],
    ["Write an interactive article on how compound interest grows, with a slider", "article"],
    ["Make a data story about the election turnout with charts", "article"],
    ["An explorable explanation of how vaccines reach herd immunity", "article"],
    ["Write an article about remote work", "document"],
    ["Make a table comparing three cameras", "table"],
  ])("generalises: %s goes to %s", (draft, kind) => {
    expect(routeShellDraft(draft).kind).toBe(kind);
  });

  it.each([
    ["Give me a timeline of the history of cinema", "timeline"],
    ["Draw a decision tree for whether to reshoot", "flowchart"],
    ["Map out how we book a location, including what happens if it's not free", "flowchart"],
    ["Brainstorm names for the production company", "mindmap"],
    ["Make a mind map of ideas for the launch", "mindmap"],
  ] as const)("picks the chart type: %s is a %s", (draft, type) => {
    expect(chartTypeFor(draft)).toBe(type);
  });

  // Everyday phrasings that name no interface outright.
  it.each([
    ["Help me with my essays for uni applications", "document"],
    ["I'm writing a cover letter for a design job", "document"],
    ["Need a speech for my sister's wedding", "document"],
    ["What's the latest news on electric cars", "search"],
    ["Look for articles about sleep and memory", "search"],
    ["Compare iPhone vs Pixel", "table"],
    ["Comparing three laptops by price and battery", "table"],
    ["Budget breakdown for the kitchen renovation", "table"],
    ["Plan a trip to Japan for ten days", "schedule"],
    ["Revision timetable for my exams", "schedule"],
    ["Weekly meal plan for a family of four", "schedule"],
    ["Help me organise my tasks for the house move", "tracker"],
    ["What do I need to do before the wedding", "tracker"],
    ["Shopping list for a dinner party", "tracker"],
    ["Set up a meeting with the team next Tuesday", "calendar"],
    ["What have I got on this week", "calendar"],
    ["Summarise the attached contract", "reader"],
    ["Go through the pdf and pull out the fees", "reader"],
    ["Best restaurants in Lisbon", "map"],
    ["Where can I get good coffee in Shoreditch", "map"],
    ["Things to do in Rome this weekend", "map"],
    ["cafés near the pier", "map"],
    ["Diagram of how our onboarding process works", "chart"],
    ["Brainstorming names for my bakery", "chart"],
    ["The story of the Roman empire, key events", "chart"],
    ["Easy dinner I can make in 20 minutes", "guide"],
    ["How can I make sourdough bread at home", "guide"],
    ["Stretches for a stiff lower back", "guide"],
    ["Colour palette for a cosy living room", "moodboard"],
    ["Outfit inspo for a summer wedding", "moodboard"],
    ["I need pictures and colours for the brand look", "moodboard"],
  ])("hears everyday wording: %s goes to %s", (draft, kind) => {
    expect(routeShellDraft(draft).kind).toBe(kind);
  });

  it.each([
    "What time does the ferry leave?",
    "What does force majeure mean?",
    "What day of the week is Christmas?",
    "How far is Paris from London?",
    "Is it going to rain tomorrow",
    "I had a really long day today",
    "Help me prepare for a job interview",
    "Wedding planning",
    "Make it shorter",
  ])("stays quiet on %s", (draft) => {
    expect(routeShellDraft(draft).kind).toBeNull();
  });

  it("needs two related words, or one beside a trigger", () => {
    expect(shellKindScore("map", "a restaurant")).toBe(10);
    expect(shellKindScore("map", "a restaurant in town")).toBe(20);
    expect(shellKindScore("map", "restaurant near me")).toBe(30);
  });

  it("matches inflections one way: a plural trigger still needs the plural", () => {
    expect(shellKindScore("table", "comparing")).toBe(20);
    expect(chatFormatFor("a pro camera").format).toBeNull();
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

describe("a request with something pasted under it", () => {
  // A real draft: one line asking for writing, then a page of assignment text full of research words.
  const assignment = readFileSync(join(__dirname, "pasted-assignment.txt"), "utf8");
  const pasted = assignment.slice(assignment.indexOf("Please prepare"), assignment.lastIndexOf("This was our proposal")).trim();

  it("reads the request, not the pasted words", () => {
    expect(routeShellDraft(assignment).kind).toBe("document");
    expect(splitRequest(assignment).ask).toBe("help me write the parts of the presentation which we can start with:\nThis was our proposal");
  });

  it("still lets the request pick another interface", () => {
    expect(routeShellDraft(`Find sources that back up the methods in this:\n\n${pasted}`).kind).toBe("search");
    expect(routeShellDraft(`${pasted}\n\nMake a checklist of everything this asks for`).kind).toBe("tracker");
  });

  it("leaves short drafts as they were", () => {
    expect(splitRequest("Write a paper on coral reefs")).toEqual({ ask: "Write a paper on coral reefs", material: "" });
  });
});
