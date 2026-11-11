import { describe, expect, it } from "vitest";
import {
  canGoBack,
  canGoForward,
  createNavStack,
  currentEntry,
  navBack,
  navForward,
  navGo,
  navPush,
  navSaveView,
} from "../workbench-navigation";

const entry = (artifactId: string) => ({ artifactId, title: artifactId });

describe("navigation stack", () => {
  it("disables back at the first entry and forward at the latest", () => {
    const stack = navPush(createNavStack(entry("a")), entry("b"));
    expect(canGoBack(stack)).toBe(true);
    expect(canGoForward(stack)).toBe(false);
    const back = navBack(stack);
    expect(currentEntry(back)?.artifactId).toBe("a");
    expect(canGoBack(back)).toBe(false);
    expect(canGoForward(back)).toBe(true);
    expect(navBack(back)).toBe(back);
  });

  it("drops the forward branch when going somewhere new", () => {
    let stack = navPush(navPush(createNavStack(entry("a")), entry("b")), entry("c"));
    stack = navPush(navBack(navBack(stack)), entry("d"));
    expect(stack.entries.map((item) => item.artifactId)).toEqual(["a", "d"]);
    expect(canGoForward(stack)).toBe(false);
  });

  it("skips a repeat of the current entry", () => {
    const stack = navPush(createNavStack(entry("a")), entry("a"));
    expect(stack.entries).toHaveLength(1);
  });

  it("jumps from history and keeps the stack", () => {
    const stack = navGo(navPush(navPush(createNavStack(entry("a")), entry("b")), entry("c")), 0);
    expect(currentEntry(stack)?.artifactId).toBe("a");
    expect(navForward(stack).index).toBe(1);
    expect(stack.entries).toHaveLength(3);
  });

  it("remembers the view on the entry it leaves", () => {
    const stack = navPush(navSaveView(createNavStack(entry("a")), { scrollTop: 240 }), entry("b"));
    expect(navBack(stack).entries[0]?.view?.scrollTop).toBe(240);
  });
});
