import {
  chatQueryOptions,
  getChatCategoryColor,
  getChatCategoryIcon,
  isChatCategory,
  type ChatCategoryColor,
} from "@/services/chat";
import {
  datasetQueryOptions,
  getDatasetLink,
  type DatasetStatus,
} from "@/services/dataset";
import { DEV_AUTH_BYPASS } from "@/shared/model/dev-auth-bypass";
import { ROUTES } from "@/shared/model/routes";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { href } from "react-router-dom";
import { MOCK_CHAT_ITEMS, MOCK_DATASET_ITEMS } from "./history-mock-data";

export type HistoryItemType = "dataset" | "chat";

export interface HistoryItem {
  /** Stable, type-prefixed id so dataset and chat ids can't collide. */
  id: string;
  type: HistoryItemType;
  title: string;
  /** Short secondary line — dataset status or chat count. */
  meta: string;
  /** ISO timestamp when available (datasets only); null sorts last. */
  date: string | null;
  /** Destination route for the row. */
  to: string;
  /** Category art (PNG src) for chat folders, reused from chat-history. */
  iconSrc?: string;
  /** Category color tint for the icon background. */
  color?: ChatCategoryColor;
}

// History is a read-only overview, so we pull a generous single page of each
// source rather than paginating. Bump if the lists routinely exceed this.
const DATASET_PAGE_SIZE = 50;
const CHAT_DIR_LIMIT = 50;

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Loads datasets and chat folders and normalises them into a single
 * {@link HistoryItem} list. Uses non-suspense queries so a failed/absent
 * backend degrades to an empty list in place instead of throwing to the
 * route error boundary and replacing the whole home page.
 */
export function useHistoryItems() {
  // The query client defaults to throwOnError: true (errors bubble to the route
  // error boundary, which renders a 404 page). History must degrade in place
  // instead, so we opt out here and skip retries to settle immediately.
  const datasetsQuery = useQuery({
    ...datasetQueryOptions.datasets({ perPage: DATASET_PAGE_SIZE }),
    throwOnError: false,
    retry: false,
  });
  const chatsQuery = useQuery({
    ...chatQueryOptions.directories({ limit: CHAT_DIR_LIMIT }),
    throwOnError: false,
    retry: false,
  });

  const datasetItems = useMemo<HistoryItem[]>(() => {
    const datasets = datasetsQuery.data?.datasets ?? [];
    return datasets.map((dataset) => ({
      id: `dataset:${dataset.dataset_id}`,
      type: "dataset" as const,
      title: dataset.name,
      meta: formatStatus(dataset.status),
      date: dataset.created_at,
      to: getDatasetLink(dataset.status as DatasetStatus, dataset.dataset_id),
    }));
  }, [datasetsQuery.data]);

  const chatItems = useMemo<HistoryItem[]>(() => {
    const directories = chatsQuery.data?.directories ?? [];
    return directories
      .filter((directory) => directory.session_count > 0)
      .map((directory) => {
        const slug = directory.slug ?? directory.id;
        const category = isChatCategory(slug) ? slug : null;
        return {
          id: `chat:${directory.id}`,
          type: "chat" as const,
          title: directory.title,
          meta: `${directory.session_count} ${
            directory.session_count === 1 ? "chat" : "chats"
          }`,
          date: null,
          to: href(ROUTES.CHAT_FOLDER, { folder_id: slug }),
          iconSrc: category ? getChatCategoryIcon(category) : undefined,
          color: category ? getChatCategoryColor(category) : undefined,
        };
      });
  }, [chatsQuery.data]);

  // Dev fallback: with the auth bypass on there's no backend, so the real
  // queries resolve to nothing. Surface representative mock data instead of a
  // perpetual loading/empty state. Never applies in production builds.
  const useMockFallback =
    DEV_AUTH_BYPASS && datasetItems.length === 0 && chatItems.length === 0;

  if (useMockFallback) {
    return {
      datasetItems: MOCK_DATASET_ITEMS,
      chatItems: MOCK_CHAT_ITEMS,
      isLoading: false,
      isError: false,
      // Mock rows point at fake ids; flag so the view renders them
      // non-navigable instead of routing into a 404 detail page.
      isMock: true,
    };
  }

  return {
    datasetItems,
    chatItems,
    isLoading: datasetsQuery.isLoading || chatsQuery.isLoading,
    // Only a hard empty state when both sources fail with nothing to show.
    isError: datasetsQuery.isError && chatsQuery.isError,
    isMock: false,
  };
}
