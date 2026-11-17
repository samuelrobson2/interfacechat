import { describe, expect, it } from "vitest";
import { guideFacts, parsePrompt } from "../prompt-fields";

describe("a guide's facts come from the request", () => {
  it("reads the time, how many it's for, and what kind it is", () => {
    expect(guideFacts("Give me a quick vegetarian curry for 4 people in 30 minutes")).toEqual([
      { label: "Time", value: "30 min" },
      { label: "Serves", value: "4" },
      { label: "Diet", value: "Vegetarian" },
      { label: "Style", value: "Quick" },
    ]);
    expect(guideFacts("A fish stew for six that takes an hour")).toEqual([
      { label: "Time", value: "1 hour" },
      { label: "Serves", value: "6" },
    ]);
    expect(guideFacts("Bread in half an hour")).toEqual([{ label: "Time", value: "30 min" }]);
  });

  it("doesn't read a time as a number of people, and says nothing it wasn't told", () => {
    expect(guideFacts("Roast chicken for 90 minutes")).toEqual([{ label: "Time", value: "90 min" }]);
    expect(guideFacts("How to change a tyre")).toEqual([]);
  });

  it("puts them on the guide's card", () => {
    const data = parsePrompt("guide", "Give me a recipe for a spicy fish stew for 6 in 45 minutes").data as { facts: { label: string; value: string }[] };
    expect(data.facts).toEqual(expect.arrayContaining([{ label: "Time", value: "45 min" }, { label: "Serves", value: "6" }, { label: "Style", value: "Spicy" }]));
  });
});
