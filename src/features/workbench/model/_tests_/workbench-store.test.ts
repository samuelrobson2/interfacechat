import { beforeEach, describe, expect, it } from "vitest";
import { CHAT_INSTANCE, useWorkbenchStore } from "../workbench-store";

describe("workbench session", () => {
  beforeEach(() => useWorkbenchStore.getState().reset());

  it("deletes an interface from the session: window, icon and history", () => {
    const { remove } = useWorkbenchStore.getState();
    remove("table-1");
    const { instances, layout, nav, artifacts } = useWorkbenchStore.getState();
    expect(instances["table-1"]).toBeUndefined();
    expect(layout.entries["table-1"]).toBeUndefined();
    expect(nav["table-1"]).toBeUndefined();
    // What it showed stays, for any reply that carries it.
    expect(artifacts["table-suggestion"]).toBeDefined();
  });

  it("never deletes Chat", () => {
    useWorkbenchStore.getState().remove(CHAT_INSTANCE);
    expect(useWorkbenchStore.getState().instances[CHAT_INSTANCE]).toBeDefined();
  });
});
