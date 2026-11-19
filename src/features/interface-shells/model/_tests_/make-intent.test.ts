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
