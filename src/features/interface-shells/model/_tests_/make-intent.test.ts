import { describe, expect, it } from "vitest";
import { asksToMake } from "../make-intent";
import { rulesFor } from "../interface-roles";

const OFFER = "Great, I have the basics: 6 guests, no dietary restrictions, fancy style, medium budget, meat main. Next I can draft a menu for you, then turn it into a shopping list.";
const MADE_AS_TEXT = "Done. Menu: smoked salmon crostini, beef tenderloin. Shopping list: salmon, baguette. If you want, I can next turn this into a timed prep plan.";

describe("a turn that asks for something to be made", () => {
  it("is a plain request to make it", () => {
    for (const text of ["Make the menu", "Can you draft a brief", "Now give me the recipe", "Yes, write the shopping list"]) expect(asksToMake(text), text).toBe(true);
  });

  it("is agreeing to something the assistant offered to make", () => {
    expect(asksToMake("Yes sounds good. can you do both?", OFFER)).toBe(true);
    expect(asksToMake("Sure", OFFER)).toBe(true);
    expect(asksToMake("go ahead", MADE_AS_TEXT)).toBe(true);
    // As offers are really worded.
    expect(asksToMake("Yes sounds good. can you do both?", "Got it, a fancy menu for 6. Next I’d turn that into the shopping list.")).toBe(true);
    expect(asksToMake("Sure", "Want me to suggest a menu?")).toBe(true);
  });

  it("is asking for something to go into an interface", () => {
    for (const text of ["can you add these to interfaces", "put that in a list", "Turn it into a document", "Can you put the menu and shopping list in their own interfaces?"]) {
      expect(asksToMake(text, MADE_AS_TEXT), text).toBe(true);
    }
  });

  it("is not agreeing when nothing was offered, nor a question or a fact", () => {
    expect(asksToMake("Yes", "Do you have an oven?")).toBe(false);
    expect(asksToMake("What wine goes with beef?", OFFER)).toBe(false);
    expect(asksToMake("8 of us, one vegetarian", OFFER)).toBe(false);
    expect(asksToMake("thanks!")).toBe(false);
  });
});

describe("the rules when a turn can make interfaces", () => {
  it("hold before anything is open: content goes in interfaces, and the model never asks which one", () => {
    const rules = rulesFor([{ kind: "notes", role: "track", label: "Notes" }], { making: true });
    expect(rules).toMatch(/never written in your reply/);
    expect(rules).toMatch(/When they say yes to something you offered to make, make it/);
    expect(rules).toMatch(/Never ask which interface to use/);
    expect(rulesFor([{ kind: "notes", role: "track", label: "Notes" }])).not.toMatch(/Never ask which interface/);
  });
});

describe("why a turn asks to make something", () => {
  it("tells a plain request from agreeing to an offer or asking for an interface", async () => {
    const { makeIntent } = await import("../make-intent");
    expect(makeIntent("Write me a haiku")).toBe("request");
    expect(makeIntent("can you add a prep plan for the day too")).toBe("request");
    expect(makeIntent("can you add these to interfaces")).toBe("into");
    expect(makeIntent("Yes sounds good. can you do both?", OFFER)).toBe("offer");
    expect(makeIntent("Why is the sky blue?")).toBeNull();
  });
});

describe("a message that only tells", () => {
  it("gives facts, asks for nothing, so it makes nothing new", async () => {
    const { onlyTells } = await import("../make-intent");
    for (const text of ["8 of us, one vegetarian, relaxed. Saturday at 7pm.", "6 guests, no dietary restrictions, fancy, medium budget, meat main"]) expect(onlyTells(text), text).toBe(true);
    for (const text of ["Make the menu", "What would you put on the menu?", "I need a packing list for Japan", "Yes sounds good. can you do both?", "Help me organize food"]) expect(onlyTells(text), text).toBe(false);
  });
});

describe("what an offer names", () => {
  it("finds each thing offered, where its words are", async () => {
    const { offeredThings } = await import("../make-intent");
    const cases: [string, string[]][] = [
      ["If you want, I can turn this into a tighter shoot schedule or a shot list next.", ["tighter shoot schedule", "shot list"]],
      ["Next I can draft a menu for you, then turn it into a shopping list.", ["menu", "shopping list"]],
      ["If you want, I can next turn this into a timed prep plan so the cooking is easier on the day.", ["timed prep plan"]],
      ["Want me to make a menu and a shopping list?", ["menu", "shopping list"]],
      ["Got it, a fancy menu for 6. Next I’d turn that into the shopping list.", ["shopping list"]],
      ["The menu is set. Have a lovely dinner!", []],
      ["If you want, I can turn that into either a menu, a shopping list, or a cooking timeline next.", ["menu", "shopping list", "cooking timeline"]],
      // Framing and determiners of every sort come off; what describes the thing stays.
      ["I can make both the menu and the shopping list.", ["menu", "shopping list"]],
      ["I could draft maybe also a tighter shoot schedule.", ["tighter shoot schedule"]],
      ["I can put together a couple of recipes or alternatively a prep plan.", ["recipes", "prep plan"]],
      ["Want me to build your shot list, and at least a call sheet?", ["shot list", "call sheet"]],
      ["I'd suggest perhaps another table instead.", ["table"]],
      ["Great, I’d plan it around five setups, with the product shots first.", []],
    ];
    for (const [text, expected] of cases) {
      const found = offeredThings(text);
      expect(found.map((thing) => text.slice(thing.start, thing.end)), text).toEqual(expected);
      // What a click asks for starts at the thing, never at the framing ("a menu", not "either a menu").
      for (const thing of found) expect(thing.thing, text).not.toMatch(/^(?:either|both|maybe)\b/i);
    }
  });
});
