import { describe, expect, it } from "vitest";
import { createDemoThreads } from "../demo-threads";
import { rankHome, type HomeRankingMemory } from "../home-ranking";
import { CHAT_SHELL_KINDS } from "@/features/interface-shells";
import { collectHomeTiles, pastWorkTiles } from "../home-tiles";

const tiles = collectHomeTiles({ sessions: createDemoThreads() });

/** Type a draft one keystroke at a time, carrying memory like the page will. */
function typeOut(draft: string) {
  let previous: HomeRankingMemory | null = null;
  let ranking = rankHome({ tiles, draft: "" });
  for (let end = 1; end <= draft.length; end += 1) {
    ranking = rankHome({ tiles, draft: draft.slice(0, end), previous });
    previous = ranking.memory;
  }
  return ranking;
}

describe("home tiles", () => {
  it("turns a chat with one interface into history, and several into a project", () => {
    const past = pastWorkTiles({ sessions: createDemoThreads() });
    const project = past.find((tile) => tile.id === "project-demo-film-shoot");
    const history = past.find((tile) => tile.id === "history-demo-north-beach");
    expect(project?.type).toBe("project");
    expect(
      project?.type === "project" &&
        project.interfaces.map((item) => item.kind),
    ).toEqual(["search", "table", "document"]);
    expect(history?.type).toBe("history");
    expect(past.some((tile) => tile.id.includes("demo-churn"))).toBe(false);
  });

  it("puts a blank for every interface, and suggestions for the first three, on the field", () => {
    expect(tiles.filter((tile) => tile.type === "blank")).toHaveLength(CHAT_SHELL_KINDS.length);
    expect(tiles.filter((tile) => tile.type === "suggested")).toHaveLength(3);
    // Formats shape replies; they never sit on the field.
    expect(tiles.some((tile) => tile.type === "blank" && tile.kind === ("proscons" as string))).toBe(false);
  });
});

describe("medium, then medium plus", () => {
  it("hints at medium when an interface is recognised but the draft is bare", () => {
    expect(typeOut("Write a paper").leader?.phase).toBe("hinted");
    expect(typeOut("Build a schedule").leader?.phase).toBe("hinted");
  });

  it("grows to medium plus once the draft says what it's about", () => {
    const paper = typeOut("Write a paper on coral reefs");
    expect(paper.leader?.interface.kind).toBe("document");
    expect(paper.leader?.phase).toBe("suggested");
    const schedule = typeOut("Build a schedule for the launch week");
    expect(schedule.leader?.interface.kind).toBe("schedule");
    expect(schedule.leader?.phase).toBe("suggested");
  });

  it("recognises the newer interfaces, and chat", () => {
    expect(typeOut("Make a checklist of what to pack for the recce").leader?.interface.kind).toBe("tracker");
    expect(typeOut("Give me a recipe for fish stew for twelve people").leader?.interface.kind).toBe("guide");
    expect(typeOut("Hi, quick question about lenses").leader?.interface.kind).toBe("chat");
  });
});

describe("rankHome", () => {
  it("rests with no leader and suggestions first on an empty draft", () => {
    const ranking = rankHome({ tiles, draft: "" });
    expect(ranking.leader).toBeNull();
    expect(ranking.order[0]?.tile.type).toBe("suggested");
  });

  it("fills a blank document for a clear writing prompt", () => {
    const { leader } = typeOut("Write a paper on urban heat islands");
    expect(leader?.tileId).toBe("blank-document");
    expect(leader?.phase).toBe("suggested");
  });

  it("only hints on one loose word", () => {
    const { leader } = typeOut("quarterly report");
    expect(leader?.tileId).toBe("blank-document");
    expect(leader?.phase).toBe("hinted");
  });

  it("does nothing on part of a word", () => {
    expect(typeOut("pap").leader).toBeNull();
  });

  it("brings a similar past project's first interface to the middle, with the project beside it", () => {
    const ranking = typeOut("Help me plan for a 3-day marketing film shoot");
    expect(ranking.leader?.tileId).toBe("project-demo-film-shoot");
    expect(ranking.leader?.interface.kind).toBe("search");
    expect(ranking.leader?.sessionId).toBe("demo-film-shoot");
    expect(ranking.order[0]?.tile.id).toBe("project-demo-film-shoot");
  });

  it("brings a similar single past interface to the middle", () => {
    const { leader } = typeOut("coffee roasters around North Beach");
    expect(leader?.tileId).toBe("history-demo-north-beach");
    expect(leader?.sessionId).toBe("demo-north-beach");
  });

  it("keeps a chosen tile in the middle whatever is typed", () => {
    const { leader } = rankHome({
      tiles,
      draft: "Write a paper on urban heat islands",
      chosenTileId: "blank-table",
    });
    expect(leader?.tileId).toBe("blank-table");
    expect(leader?.phase).toBe("chosen");
  });

  it("fills nothing once dismissed, but still ranks the field", () => {
    const ranking = rankHome({
      tiles,
      draft: "Write a paper on urban heat islands",
      dismissed: true,
    });
    expect(ranking.leader).toBeNull();
    expect(ranking.order.length).toBe(tiles.length);
  });

  it("makes a close challenger win twice before it takes over", () => {
    const first = rankHome({ tiles, draft: "a report with columns" });
    expect(first.leader?.tileId).toBe("blank-document");
    const once = rankHome({
      tiles,
      draft: "a report with columns and rows",
      previous: first.memory,
    });
    expect(once.leader?.tileId).toBe("blank-document");
    expect(once.memory.challengerId).toBe("blank-table");
    const twice = rankHome({
      tiles,
      draft: "a report with columns and rows ",
      previous: once.memory,
    });
    expect(twice.leader?.tileId).toBe("blank-table");
  });

  it("never lets a tie take over", () => {
    let previous = rankHome({ tiles, draft: "a report with columns" }).memory;
    for (let i = 0; i < 4; i += 1) {
      previous = rankHome({
        tiles,
        draft: `a report with columns${" ".repeat(i)}`,
        previous,
      }).memory;
    }
    expect(previous.leaderId).toBe("blank-document");
  });

  it("switches at once when a challenger is clearly ahead", () => {
    const first = rankHome({ tiles, draft: "quarterly report" });
    const next = rankHome({
      tiles,
      draft: "quarterly report: search and find papers on sleep and memory",
      previous: first.memory,
    });
    expect(next.leader?.tileId).toBe("blank-search");
  });
});
