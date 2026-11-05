import { useMemo, useState } from "react";

import { loadSavedInterfaces } from "@/shared/model/saved-interfaces";

// A saved generated interface, as shown on the dashboard's "Interfaces" tab.
// Mirrors the fields pharos's SavedInterfaceRowDto exposes that this page needs.
export type SavedInterfaceItem = {
  message_id: string;
  session_id: string;
  title: string;
  category: string;
  // Locally-saved interfaces (e.g. a created Slack app) carry their own route to
  // reopen; mock/session interfaces omit it and fall back to the chat route.
  to?: string;
};

const INITIAL_LIMIT = 7;
const LOAD_MORE_LIMIT = 8;
// Delay so the "Load more" spinner is briefly visible, like a real fetch.
const LOAD_MORE_DELAY_MS = 400;

// Local mock stand-in for pharos's saved-interfaces API — this fork's backend
// doesn't expose that endpoint (see chat-dashboard.page.tsx). Filtered and
// paginated client-side so this hook matches the real one's shape and the tab
// behaves the same (search, category filter, load-more).
const MOCK_SAVED_INTERFACES: SavedInterfaceItem[] = [
  { message_id: "m-1", session_id: "s-1", title: "Conservation research assistant", category: "science" },
  { message_id: "m-2", session_id: "s-2", title: "Nutrient deficiency explorer", category: "medical" },
  { message_id: "m-3", session_id: "s-3", title: "Weekly growth dashboard", category: "marketing" },
  { message_id: "m-4", session_id: "s-4", title: "Training plan builder", category: "fitness-sports" },
  { message_id: "m-5", session_id: "s-5", title: "Release notes summarizer", category: "code" },
  { message_id: "m-6", session_id: "s-6", title: "Contract clause reviewer", category: "legal" },
  { message_id: "m-7", session_id: "s-7", title: "Market news digest", category: "news" },
  { message_id: "m-8", session_id: "s-8", title: "API latency monitor", category: "technology" },
  { message_id: "m-9", session_id: "s-9", title: "Study flashcard maker", category: "science" },
  { message_id: "m-10", session_id: "s-10", title: "Recipe macro planner", category: "medical" },
  { message_id: "m-11", session_id: "s-11", title: "Campaign brief generator", category: "marketing" },
  { message_id: "m-12", session_id: "s-12", title: "Onboarding flow audit", category: "technology" },
];

export type UseChatSavedInterfacesOptions = {
  q?: string;
  domainGroup?: string;
  // Accepted for parity with the real hook; the mock has no dates to filter on.
  createdAfter?: string;
  initialLimit?: number;
};

export type UseChatSavedInterfacesResult = {
  interfaces: SavedInterfaceItem[];
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
};

export function useChatSavedInterfaces({
  q,
  domainGroup,
  initialLimit = INITIAL_LIMIT,
}: UseChatSavedInterfacesOptions = {}): UseChatSavedInterfacesResult {
  const [visible, setVisible] = useState(initialLimit);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Locally-saved interfaces (created Slack apps, etc.), newest first.
  const [saved] = useState<SavedInterfaceItem[]>(() =>
    loadSavedInterfaces().map((s) => ({
      message_id: s.id,
      session_id: s.id,
      title: s.title,
      category: s.category,
      to: s.to,
    })),
  );

  const search = q?.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      [...saved, ...MOCK_SAVED_INTERFACES].filter((item) => {
        if (search && !item.title.toLowerCase().includes(search)) return false;
        if (domainGroup && item.category !== domainGroup) return false;
        return true;
      }),
    [saved, search, domainGroup],
  );

  const interfaces = filtered.slice(0, visible);
  const hasMore = filtered.length > interfaces.length;

  const loadMore = () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    window.setTimeout(() => {
      setVisible((v) => v + LOAD_MORE_LIMIT);
      setIsLoadingMore(false);
    }, LOAD_MORE_DELAY_MS);
  };

  return { interfaces, hasMore, isLoadingMore, loadMore };
}
