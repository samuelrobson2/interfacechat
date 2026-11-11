import { useLayoutEffect, useRef, useState } from "react";
import { SHELL_KINDS, type ShellKind, type ShellSize } from "@/features/interface-shells";
import type { Rect, Size } from "./workbench-geometry";
import type { WorkbenchInstance } from "./workbench-host";
import type { InstanceId, LayoutEntry, Presentation } from "./workbench-layout";

/** Which shell size draws each presentation. */
const SHELL_SIZE: Record<Exclude<Presentation, "minimized" | "sidebar">, ShellSize> = {
  medium: "large",
  extended: "large",
  large: "large",
};

/** Every interface that can open in a window: all but Chat, which is the page. */
export const OPENABLE_KINDS = SHELL_KINDS.filter((kind) => kind !== "chat");

/** Small dots across the whole page, in the UI kit's blue-2. */
const DOT = "radial-gradient(circle at 1px 1px, var(--color-blue-2) 0.55px, transparent 0.75px)";
export const DOTS: React.CSSProperties = {
  backgroundImage: `${DOT}, ${DOT}`,
  backgroundSize: "14px 14px, 14px 14px",
  backgroundPosition: "0 0, 7px 7px",
};

/** Height kept free under the interfaces for Chat's input while Chat is minimized. */
export const COMPOSER_ROOM = 124;
export const COMPOSER_WIDTH = 660;

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size | null>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

export function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/** A medium that grew past either of these draws its full layout, not the card. */
const LARGE_FROM = { width: 560, height: 520 };

/** The shell size that suits how big it is actually drawn. */
export const shellSizeFor = (entry: LayoutEntry, rect: Rect | undefined): ShellSize => {
  const presentation = entry.presentation === "minimized" ? entry.restore?.presentation : entry.presentation;
  const grown = !!rect && (rect.width >= LARGE_FROM.width || rect.height >= LARGE_FROM.height);
  if (presentation === "medium" && !grown) return "medium-plus";
  return presentation && presentation !== "minimized" && presentation !== "sidebar"
    ? SHELL_SIZE[presentation]
    : "large";
};

/** 1, 2… for interfaces that share a kind with another, in the order they were opened. */
export function ordinalsOf(instances: WorkbenchInstance[]) {
  const byKind = new Map<ShellKind, InstanceId[]>();
  for (const instance of instances) {
    byKind.set(instance.kind, [...(byKind.get(instance.kind) ?? []), instance.id]);
  }
  const ordinals: Record<InstanceId, number | undefined> = {};
  for (const ids of byKind.values()) {
    if (ids.length > 1) ids.forEach((id, index) => (ordinals[id] = index + 1));
  }
  return ordinals;
}
