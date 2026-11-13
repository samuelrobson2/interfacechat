import { VisualizeSuggestionCard as ChatSuggestionCard } from "@/services/chat";
import { useInputStore } from "../../_model/store/input-store";
import {
  type SuggestionsOrientation,
  suggestionsContainerClass,
} from "./chat-starter-suggestions";

const MOCK_SUGGESTIONS = [
  "Summarise this quarter's revenue report",
  "Draft a launch announcement email for our new feature",
  "Compare vector databases for our RAG pipeline",
];

export function MockStarterSuggestions({
  orientation = "grid",
}: {
  orientation?: SuggestionsOrientation;
}) {
  const setMessage = useInputStore((state) => state.setMessage);
  const isRow = orientation === "row";

  return (
    <div className={suggestionsContainerClass(orientation)}>
      {MOCK_SUGGESTIONS.map((text) => (
        <ChatSuggestionCard
          key={text}
          suggestion={text}
          className={isRow ? "min-h-[84px]! flex-1" : "w-[156px] shrink-0 snap-start md:w-auto"}
          onClick={() => setMessage(text)}
        />
      ))}
    </div>
  );
}
