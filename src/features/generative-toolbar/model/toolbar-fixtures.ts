import {
  articleFixture,
  dashboardFixture,
  emptyArticle,
  emptyDashboard,
  SHELL_FIXTURES,
  type ShellKind,
} from "@/features/interface-shells";
import type { ToolbarDataByKind, ToolbarKind } from "./generate-tools";

export type FixtureState = "empty" | "suggestion" | "history";

/** Starting content for any interface on the page. Dashboard and Article have empty and filled only. */
export function toolbarFixture<K extends ToolbarKind>(kind: K, state: FixtureState): ToolbarDataByKind[K] {
  const data =
    kind === "dashboard"
      ? state === "empty"
        ? emptyDashboard
        : dashboardFixture
      : kind === "article"
        ? state === "empty"
          ? emptyArticle
          : articleFixture
        : SHELL_FIXTURES[kind as ShellKind].states[state];
  return structuredClone(data) as ToolbarDataByKind[K];
}
