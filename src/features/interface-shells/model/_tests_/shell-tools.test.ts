import { describe, expect, it } from "vitest";
import { diagramMermaid, diagramOutline } from "../../more/diagram-toolbar";
import { scaleNeed } from "../../more/guide-shell";
import { plainInline } from "../markdown-blocks";
import type { ChartShellData } from "../shell-types";

describe("Guide: scaling a recipe", () => {
  it.each([
    ["200g flour", 1.5, "300g flour"],
    ["2 eggs", 0.5, "1 eggs"],
    ["1/2 tsp salt", 2, "1 tsp salt"],
    ["½ lemon", 3, "1½ lemon"],
    ["1 1/2 cups milk", 2, "3 cups milk"],
    ["3 tbsp olive oil", 1 / 3, "1 tbsp olive oil"],
    ["Salt and pepper", 2, "Salt and pepper"],
    ["12 bread rolls", 1.5, "18 bread rolls"],
  ])("%s × %s is %s", (text, factor, expected) => {
    expect(scaleNeed(text, factor)).toBe(expected);
  });
});

describe("Document: clear formatting", () => {
  it("keeps the words and drops the marks", () => {
    expect(plainInline("A **bold**, *italic*, ~~struck~~ and [linked](https://a.b) `code` line")).toBe(
      "A bold, italic, struck and linked code line",
    );
  });
});

const base: ChartShellData = { title: "Launch", type: "mindmap", branches: [], events: [], nodes: [], edges: [] };

describe("Diagram: exports", () => {
  it("writes a mind map as nested bullets and as Mermaid", () => {
    const data: ChartShellData = {
      ...base,
      branches: [{ id: "a", label: "Press", children: [{ id: "b", label: "Trade titles", children: [] }] }],
    };
    expect(diagramOutline(data)).toBe("# Launch\n\n- Press\n  - Trade titles");
    expect(diagramMermaid(data)).toBe("mindmap\n  root((Launch))\n    Press\n      Trade titles");
  });

  it("writes a timeline in date order", () => {
    const data: ChartShellData = {
      ...base,
      type: "timeline",
      events: [
        { id: "2", date: "2026", title: "Ship" },
        { id: "1", date: "2025", title: "Start", detail: "Kick-off" },
      ],
    };
    expect(diagramOutline(data)).toBe("# Launch\n\n- **2025** Start: Kick-off\n- **2026** Ship");
    expect(diagramMermaid(data)).toBe("timeline\n  title Launch\n  2025 : Start\n  2026 : Ship");
  });

  it("writes a flowchart with its decisions and labelled paths", () => {
    const data: ChartShellData = {
      ...base,
      type: "flowchart",
      nodes: [
        { id: "s", kind: "start", label: "Start" },
        { id: "d", kind: "decision", label: "Free" },
        { id: "e", kind: "end", label: "Book it" },
      ],
      edges: [
        { from: "s", to: "d" },
        { from: "d", to: "e", label: "Yes" },
      ],
    };
    expect(diagramOutline(data)).toBe("# Launch\n\n1. Start → Free\n2. Free? → Yes: Book it\n3. Book it");
    expect(diagramMermaid(data)).toBe('flowchart TD\n  s(["Start"])\n  d{"Free"}\n  e(["Book it"])\n  s --> d\n  d -->|Yes| e');
  });
});
