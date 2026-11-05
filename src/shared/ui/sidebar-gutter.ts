import { cn } from "@/shared/lib/css";

/**
 * The left gutter a page reserves for the global rail (`AppSidebar`).
 *
 * The rail is `fixed`, so it overlays rather than pushing — pages reserve the
 * space themselves. `push` opts a page into following the rail as it expands:
 * left-anchored content (dashboards, tables, the Flow canvas) wants this,
 * because the expanded rail's right edge lands at 220px and would otherwise sit
 * on top of a 165px gutter. Centred-measure pages (the chat dashboard, which
 * pads both sides equally) should stay static — pushing only knocks them
 * off-centre, so those use `var(--sidebar-gutter)` directly instead.
 *
 * Requires a `SidebarProvider` above the page; without one the gutter just
 * stays at its collapsed value. Mobile is deliberately excluded throughout —
 * the rail is a horizontal bar there and reserves no left space.
 */
export function sidebarGutter({ push = false }: { push?: boolean } = {}) {
  return cn(
    "md:pl-[var(--sidebar-gutter)]",
    push && [
      "md:group-data-[sidebar-expanded=true]/app:pl-[var(--sidebar-gutter-expanded)]",
      // Matches SidebarCard's own width transition so the rail and the content
      // read as one movement. Custom properties can't animate; padding can.
      "md:transition-[padding] md:duration-200 md:ease-out motion-reduce:transition-none",
    ],
  );
}
