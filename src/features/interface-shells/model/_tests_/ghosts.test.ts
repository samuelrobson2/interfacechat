import { describe, expect, it } from "vitest";
import { ghostsAfter } from "../../ui/shell-accents";

describe("suggestions fill an empty list's placeholders", () => {
  it("leaves only the placeholders not yet suggested, numbered on", () => {
    expect(ghostsAfter("Step", 0)).toEqual(["Step 1", "Step 2", "Step 3"]);
    expect(ghostsAfter("Step", 2)).toEqual(["Step 3"]);
    expect(ghostsAfter("Step", 5)).toEqual([]);
  });
});
