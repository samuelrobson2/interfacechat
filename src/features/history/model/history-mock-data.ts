import { getChatCategoryColor, getChatCategoryIcon } from "@/services/chat";
import { ROUTES } from "@/shared/model/routes";
import { href } from "react-router-dom";
import type { HistoryItem } from "./use-history-items";

// DEV-ONLY placeholder history. Surfaced by useHistoryItems when DEV_AUTH_BYPASS
// is on and the real (backend-less) queries return nothing, so the History tab
// shows representative content instead of a perpetual loading/empty state.
// Never used in production builds — see DEV_AUTH_BYPASS.
// Dates are interleaved across datasets and chats so the merged, date-sorted
// list alternates between the two types rather than grouping them.
export const MOCK_HISTORY_ITEMS: HistoryItem[] = [
  {
    id: "dataset:mock-1",
    type: "dataset",
    title: "Customer support transcripts",
    meta: "Ready",
    date: "2026-06-13T09:24:00.000Z",
    to: href(ROUTES.DASHBOARD_DATASET, { dataset_id: "mock-1" }),
  },
  {
    id: "chat:mock-research",
    type: "chat",
    title: "Research",
    meta: "12 chats",
    date: "2026-06-12T14:30:00.000Z",
    to: href(ROUTES.CHAT_FOLDER, { folder_id: "research" }),
    iconSrc: getChatCategoryIcon("science"),
    color: getChatCategoryColor("science"),
  },
  {
    id: "dataset:mock-2",
    type: "dataset",
    title: "Product reviews — Q2",
    meta: "Processing",
    date: "2026-06-10T16:02:00.000Z",
    to: href(ROUTES.DASHBOARD_DATASET, { dataset_id: "mock-2" }),
  },
  {
    id: "chat:mock-engineering",
    type: "chat",
    title: "Engineering",
    meta: "8 chats",
    date: "2026-06-08T10:11:00.000Z",
    to: href(ROUTES.CHAT_FOLDER, { folder_id: "engineering" }),
    iconSrc: getChatCategoryIcon("code"),
    color: getChatCategoryColor("code"),
  },
  {
    id: "dataset:mock-3",
    type: "dataset",
    title: "Clinical notes (de-identified)",
    meta: "Ready",
    date: "2026-06-05T11:47:00.000Z",
    to: href(ROUTES.DASHBOARD_DATASET, { dataset_id: "mock-3" }),
  },
  {
    id: "chat:mock-favorites",
    type: "chat",
    title: "Favorites",
    meta: "3 chats",
    date: "2026-06-02T18:20:00.000Z",
    to: href(ROUTES.CHAT_FOLDER, { folder_id: "favorites" }),
    iconSrc: getChatCategoryIcon("favorites"),
    color: getChatCategoryColor("favorites"),
  },
  {
    id: "dataset:mock-4",
    type: "dataset",
    title: "Synthetic finance Q&A",
    meta: "Failed",
    date: "2026-05-28T08:15:00.000Z",
    to: href(ROUTES.DASHBOARD_DATASET, { dataset_id: "mock-4" }),
  },
];

export const MOCK_DATASET_ITEMS = MOCK_HISTORY_ITEMS.filter(
  (item) => item.type === "dataset",
);
export const MOCK_CHAT_ITEMS = MOCK_HISTORY_ITEMS.filter(
  (item) => item.type === "chat",
);
