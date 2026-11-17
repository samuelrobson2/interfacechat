import type { ModelMessage } from "ai";
import { describe, expect, it } from "vitest";
import { compactArtifactHistory, LEFT_OUT } from "../artifact-history";

const fill = (id: string, toolName: string, input: unknown): ModelMessage => ({
  role: "assistant",
  content: [{ type: "tool-call", toolCallId: id, toolName, input }],
});
const writes = ["fill_document", "fill_table", "write_interface", "update_interface"];
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
    fill("3", "fill_table", { id: "t1", title: "Costs", rows: [["a"]] }),
    fill("4", "update_interface", { id: "t1", operations: [{ op: "replace", path: "/title", value: "Plan B" }] }),
    fill("5", "notes_add", { lines: ["When: Saturday"] }),
  ];

  it("keeps no version of any interface in the history: only the call, its title and id", () => {
    const out = inputs(compactArtifactHistory(history, { writes }));
    expect(out[0]).toEqual({ title: "Plan", note: LEFT_OUT });
    expect(out[1]).toEqual({ title: "Plan", note: LEFT_OUT });
    expect(out[2]).toEqual({ id: "t1", title: "Costs", note: LEFT_OUT });
    expect(out[3]).toEqual({ id: "t1", note: LEFT_OUT });
    // Not a write to an interface's contents: left as it is.
    expect(out[4]).toEqual({ lines: ["When: Saturday"] });
  });

  it("writes the same note every turn, so earlier turns stay a cacheable prefix", () => {
    const once = compactArtifactHistory(history, { writes });
    const later = compactArtifactHistory([...history, fill("6", "fill_document", { title: "Plan", body: "v3" })], { writes });
    expect(JSON.stringify(later.slice(0, history.length))).toBe(JSON.stringify(once));
  });
});
