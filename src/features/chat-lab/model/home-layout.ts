import type { ChatShellKind } from "@/features/interface-shells";

/**
 * Where each interface sits on the chat home, in design pixels from the middle.
 * Fixed: nothing rearranges as you type. Six sit around the headline; the rest
 * wait just past the edges, in reach by dragging or when one is recognised and
 * the field pans to it.
 */
export const HOME_POSITIONS: Record<ChatShellKind, { x: number; y: number }> = {
  chat: { x: -380, y: -190 },
  document: { x: 0, y: -220 },
  search: { x: 380, y: -190 },
  table: { x: -380, y: 190 },
  tracker: { x: 0, y: 220 },
  guide: { x: 380, y: 190 },
  schedule: { x: -760, y: 0 },
  calendar: { x: 760, y: 0 },
  reader: { x: -760, y: -380 },
  map: { x: 760, y: -380 },
  moodboard: { x: -760, y: 380 },
  chart: { x: 760, y: 380 },
};

/** How far to pan so a tile sits in the middle; home when nothing is open. */
export function panTo(kind: ChatShellKind | null): { x: number; y: number } {
  if (!kind) return { x: 0, y: 0 };
  const { x, y } = HOME_POSITIONS[kind];
  return { x: -x, y: -y };
}
