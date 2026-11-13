import type { ModelMessage } from "ai";
import { describe, expect, it } from "vitest";
import { compactArtifactHistory } from "../artifact-history";

const fill = (id: string, toolName: string, input: unknown): ModelMessage => ({
  role: "assistant",
  content: [{ type: "tool-call", toolCallId: id, toolName, input }],
});
const writes = { fill_document: "document", fill_table: "table", write_interface: "write" };
const inputs = (messages: ModelMessage[]) =>
  messages
    .flatMap((message): unknown[] => (Array.isArray(message.content) ? message.content : []))
    .map((part) => (part as { input?: unknown }).input);

describe("compactArtifactHistory", () => {
  const history: ModelMessage[] = [
    { role: "user", content: "Write a plan" },
    fill("1", "fill_document", { title: "Plan", body: "v1" }),
    { role: "user", content: "Longer" },
    fill("2", "fill_document", { title: "Plan", body: "v2" }),
    fill("3", "fill_table", { title: "Costs", rows: [["a"]] }),
    fill("4", "update_interface", { operations: [{ op: "replace", path: "/title", value: "Plan B" }] }),
  ];

  it("keeps only the newest version of each interface", () => {
    const out = inputs(compactArtifactHistory(history, { writes, open: null }));
    expect(out[0]).toMatchObject({ title: "Plan", note: expect.stringContaining("Earlier version") });
    expect(out[0]).not.toHaveProperty("body");
    expect(out[1]).toEqual({ title: "Plan", body: "v2" });
    expect(out[2]).toEqual({ title: "Costs", rows: [["a"]] });
    // Small edits stay as they are.
    expect(out[3]).toEqual({ operations: [{ op: "replace", path: "/title", value: "Plan B" }] });
  });

  it("leaves out the open interface's newest version too, since its contents are sent separately", () => {
    const out = inputs(compactArtifactHistory(history, { writes, open: "document" }));
    expect(out[1]).toMatchObject({ note: expect.stringContaining("given at the end") });
    expect(out[2]).toEqual({ title: "Costs", rows: [["a"]] });
  });

  it("writes the same note every turn, so earlier turns stay a cacheable prefix", () => {
    const once = compactArtifactHistory(history, { writes, open: null });
    const later = compactArtifactHistory([...history, { role: "user", content: "Thanks" }], { writes, open: null });
    expect(JSON.stringify(later.slice(0, history.length))).toBe(JSON.stringify(once));
  });
});
