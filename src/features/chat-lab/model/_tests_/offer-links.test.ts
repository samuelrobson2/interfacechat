import { describe, expect, it } from "vitest";
import { interfaceForThing } from "../visual-interfaces";
import { readOfferLink, withOfferLinks } from "../offer-links";

describe("what an offered thing is made as", () => {
  it("names the interface for each everyday thing, and nothing when none fits", () => {
    expect(interfaceForThing("tighter shoot schedule")).toBe("schedule");
    expect(interfaceForThing("shot list")).toBe("table");
    expect(interfaceForThing("menu")).toBe("document");
    expect(interfaceForThing("shopping list")).toBe("tracker");
    expect(interfaceForThing("haiku")).toBeNull();
  });
});

describe("offers as links", () => {
  it("links each thing offered, keeps every other word, and clicks through to making it", () => {
    const reply = "If you want, I can turn this into a tighter shoot schedule or a shot list next.";
    const linked = withOfferLinks(reply);
    expect(linked).toBe("If you want, I can turn this into a [tighter shoot schedule](#make:schedule:a%20tighter%20shoot%20schedule) or a [shot list](#make:table:a%20shot%20list) next.");
    expect(readOfferLink("#make:table:a%20shot%20list")).toEqual({ kind: "table", request: "Make a shot list" });
  });

  it("leaves a reply with no offer, or an offer of something no interface makes, as it is", () => {
    for (const reply of ["The menu is set. Have a lovely dinner!", "I can write you a haiku about it."]) expect(withOfferLinks(reply)).toBe(reply);
    expect(readOfferLink("https://example.com")).toBeNull();
  });
});
