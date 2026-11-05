import { Text } from "@/shared/ui/kit/text";
import { useInputStore } from "../../_model/store/input-store";
import {
  ChatSuggestionCard,
  ChatSuggestionsSection,
} from "../ui/chat-suggestion-card";
import marketingIcon from "@/shared/assets/images/3d/brand-safety.png";
import legalModelIcon from "@/shared/assets/images/3d/finetune-instruction.png";
import spreadsheetIcon from "@/shared/assets/images/3d/data-processing.png";

// DEV-ONLY placeholder starter suggestions, tailored to Studio's apps /
// models / data workflows. The real ones come from a suspense query
// (POST /chat/suggestions) that throws without a backend; these fill the chat
// box on click so the empty-state still feels alive locally. Not used in prod.
const MOCK_SUGGESTIONS = [
  {
    text: "Create an app to help me improve my marketing copy in my voice",
    icon: marketingIcon,
  },
  {
    text: "Create a model specifically for legal notetaking and research",
    icon: legalModelIcon,
  },
  { text: "Help me adapt my data for my finance tracker", icon: spreadsheetIcon },
];

const gridContainerClassName =
  "flex w-full max-w-[1024px] gap-1 overflow-x-auto snap-x snap-mandatory max-md:pb-2 " +
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
  "md:grid md:grid-cols-3 md:gap-6 md:overflow-visible";

const gridItemClassName = "w-[156px] shrink-0 snap-start md:w-auto";

export function MockStarterSuggestions({
  layout = "grid",
}: {
  layout?: "grid" | "list";
}) {
  const setMessage = useInputStore((state) => state.setMessage);

  if (layout === "list") {
    // Prominent vertical tiles (icon on top, text below) — plain at rest; on
    // hover they lift and pick up the glassy neumorphic background.
    return (
      <div className="grid w-full max-w-[660px] grid-cols-1 gap-6 sm:grid-cols-3 md:mt-6">
        {MOCK_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.text}
            type="button"
            onClick={() => setMessage(suggestion.text)}
            title={suggestion.text}
            className="group/sugg flex min-h-[112px] flex-col gap-2 rounded-[14px] p-3 text-left transition-all hover:-translate-y-0.5 hover:bg-background-primary hover:shadow-inset-default"
          >
            <img
              src={suggestion.icon}
              alt=""
              className="size-8 shrink-0 object-contain"
            />
            <Text variant="label" className="line-clamp-3">
              {suggestion.text}
            </Text>
          </button>
        ))}
      </div>
    );
  }

  return (
    <ChatSuggestionsSection className="md:mt-6">
      <div className={gridContainerClassName}>
        {MOCK_SUGGESTIONS.map((suggestion) => (
          <ChatSuggestionCard
            key={suggestion.text}
            suggestion={suggestion.text}
            className={gridItemClassName}
            onClick={() => setMessage(suggestion.text)}
          />
        ))}
      </div>
    </ChatSuggestionsSection>
  );
}
