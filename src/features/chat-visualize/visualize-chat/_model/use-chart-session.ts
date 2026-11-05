import { useParams } from "react-router-dom";

import type { PathParams, ROUTES } from "@/shared/model/routes";
import { useVisualizeStore } from "../_lib/visualize-session-store";

export function useChartSessionId() {
  const { chat_id } =
    useParams<PathParams[typeof ROUTES.CHAT_VISUALIZE_SESSION]>();
  return chat_id!;
}

export function useChartSession() {
  const sessionId = useChartSessionId();
  const session = useVisualizeStore(
    (state) => state.sessions[sessionId]?.session,
  );
  return { data: session, isLoading: !session };
}
