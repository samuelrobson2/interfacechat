import { ROUTES } from "@/shared/model/routes";
import { href } from "react-router-dom";
import type { BuildRunStat } from "./use-build-run-stats";

// DEV-ONLY placeholder run stats for the Build tab, surfaced by useBuildRunStats
// when DEV_AUTH_BYPASS is on and the real (backend-less) query returns nothing.
// Never used in production builds.
export const MOCK_RUN_STATS: BuildRunStat[] = [
  {
    id: "run-web-nav",
    name: "web_navigation_tasks",
    status: "ready",
    winRate: "52%",
    date: "2026-05-14T10:00:00.000Z",
    to: href(ROUTES.DASHBOARD_DATASET, { dataset_id: "run-web-nav" }),
  },
  {
    id: "run-mind2web",
    name: "Mind2Web",
    status: "failed",
    winRate: "—",
    date: "2026-05-14T09:30:00.000Z",
    to: href(ROUTES.DASHBOARD_DATASET, { dataset_id: "run-mind2web" }),
  },
  {
    id: "run-agents-synth",
    name: "agents_for_synthesis.json",
    status: "configuring",
    winRate: "—",
    date: "2026-04-08T14:15:00.000Z",
    to: href(ROUTES.DASHBOARD_DATASET, { dataset_id: "run-agents-synth" }),
  },
];
