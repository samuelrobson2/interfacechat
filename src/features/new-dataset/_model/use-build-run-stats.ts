import {
  datasetQueryOptions,
  getDatasetLink,
  type DatasetStatus,
} from "@/services/dataset";
import { DEV_AUTH_BYPASS } from "@/shared/model/dev-auth-bypass";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MOCK_RUN_STATS } from "./build-run-stats-mock";

export interface BuildRunStat {
  id: string;
  name: string;
  status: DatasetStatus;
  /** Finetuned-model win rate, pre-formatted ("52%" or "—"). */
  winRate: string;
  date: string;
  to: string;
}

// A compact recent-runs summary, so keep the page small.
const RUN_STATS_LIMIT = 5;

function formatWinRate(pct: number | null | undefined): string {
  if (pct == null) return "—";
  return `${Math.round(pct)}%`;
}

/**
 * Loads the most recent dataset runs for the Build-tab summary table. Mirrors
 * the History/Chat lists: non-suspense + non-throwing so a missing backend
 * degrades in place, with a DEV_AUTH_BYPASS-only mock fallback.
 */
export function useBuildRunStats() {
  const { data, isLoading } = useQuery({
    ...datasetQueryOptions.datasets({ perPage: RUN_STATS_LIMIT, recent: true }),
    throwOnError: false,
    retry: false,
  });

  const rows = useMemo<BuildRunStat[]>(() => {
    const datasets = data?.datasets ?? [];
    return datasets.map((dataset) => ({
      id: dataset.dataset_id,
      name: dataset.name,
      status: dataset.status as DatasetStatus,
      winRate: formatWinRate(
        dataset.latest_finetune?.win_rates?.finetuned_model_win_rate_pct,
      ),
      date: dataset.created_at,
      to: getDatasetLink(dataset.status as DatasetStatus, dataset.dataset_id),
    }));
  }, [data]);

  if (DEV_AUTH_BYPASS && rows.length === 0) {
    return { rows: MOCK_RUN_STATS, isLoading: false, isMock: true };
  }

  return { rows, isLoading, isMock: false };
}
