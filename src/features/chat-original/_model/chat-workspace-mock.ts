import {
  getChatCategoryColor,
  getChatCategoryIcon,
  type ChatCategory,
} from "@/services/chat";
import { ROUTES } from "@/shared/model/routes";
import { href } from "react-router-dom";
import type { ChatProject, ChatThread } from "./use-chat-workspace-lists";

// DEV-ONLY placeholder content for the new-chat workspace rail, surfaced by
// useChatWorkspaceLists when DEV_AUTH_BYPASS is on and the real (backend-less)
// queries return nothing. Never used in production builds.
const mockProject = (
  id: string,
  title: string,
  count: number,
  category: ChatCategory,
): ChatProject => ({
  id,
  title,
  count,
  to: href(ROUTES.CHAT_FOLDER, { folder_id: id }),
  icon: getChatCategoryIcon(category),
  color: getChatCategoryColor(category),
});

export const MOCK_CHAT_PROJECTS: ChatProject[] = [
  mockProject("proj-q3-launch", "Q3 Marketing Launch", 9, "marketing"),
  mockProject("proj-churn", "Churn Prediction Model", 6, "market-analysis"),
  mockProject("proj-app-redesign", "Mobile App Redesign", 5, "architecture-design"),
  mockProject("proj-onboarding", "Onboarding Revamp", 4, "code"),
];

export const MOCK_CHAT_HISTORY: ChatThread[] = [
  {
    id: "sess-1",
    title: "Summarise the Q2 revenue report",
    date: "2026-06-14T15:12:00.000Z",
    to: href(ROUTES.CHAT, { chat_id: "sess-1" }),
  },
  {
    id: "sess-2",
    title: "Draft onboarding email sequence",
    date: "2026-06-13T09:48:00.000Z",
    to: href(ROUTES.CHAT, { chat_id: "sess-2" }),
  },
  {
    id: "sess-3",
    title: "Compare vector DB options",
    date: "2026-06-11T20:05:00.000Z",
    to: href(ROUTES.CHAT, { chat_id: "sess-3" }),
  },
  {
    id: "sess-4",
    title: "Brainstorm names for the launch",
    date: "2026-06-09T11:30:00.000Z",
    to: href(ROUTES.CHAT, { chat_id: "sess-4" }),
  },
  {
    id: "sess-5",
    title: "Explain the new pricing model",
    date: "2026-06-07T17:22:00.000Z",
    to: href(ROUTES.CHAT, { chat_id: "sess-5" }),
  },
];
