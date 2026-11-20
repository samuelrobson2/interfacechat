import { describe, expect, it } from "vitest";
import { mentionedKind, mentionMatches, mentionsIn, withoutMentions } from "../mentions";

describe("asking for an interface by name", () => {
  it("finds each @Name, where it is, in any case", () => {
    const text = "Track my guests in @Table and the jobs in @tracker";
    expect(mentionsIn(text).map((mention) => [mention.kind, text.slice(mention.start, mention.end)])).toEqual([
      ["table", "@Table"],
      ["tracker", "@tracker"],
    ]);
    expect(mentionedKind("Plan the shoot @Schedule")).toBe("schedule");
    // As picking one writes it: a space between the "@" (the icon) and the name.
    expect(mentionsIn("Plan it @ Schedule now")).toEqual([{ kind: "schedule", start: 8, end: 18, nameAt: 10 }]);
  });

  it("ignores an @ that names no interface, and an email address", () => {
    expect(mentionsIn("Email sam@tablet.com about @Tables and @Chat")).toEqual([]);
  });

  it("reads the request without its mentions, and lists the interfaces that start with what's typed", () => {
    expect(withoutMentions("@Table of attendees for Saturday")).toBe("of attendees for Saturday");
    expect(withoutMentions("Track the guests for Saturday in @Table please")).toBe("Track the guests for Saturday please");
    expect(withoutMentions("Write it up as a @Document.")).toBe("Write it up.");
    expect(mentionMatches("ta")).toEqual(["table"]);
    expect(mentionMatches("")).toHaveLength(8);
  });
});
