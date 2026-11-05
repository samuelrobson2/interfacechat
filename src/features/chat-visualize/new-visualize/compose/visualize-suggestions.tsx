import { VisualizeSuggestionCard, DatasetSourceBadge } from "@/services/chat";
import { cn } from "@/shared/lib/css";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { useVisualizeSuggestions } from "../model/use-visualize-suggestions";

const VISUALIZE_SUGGESTIONS_COUNT = 3;

const suggestionsGridClassName = cn(
  "flex w-full gap-1 overflow-x-auto snap-x snap-mandatory max-md:pb-2",
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  "md:grid md:grid-cols-3 md:gap-6 md:overflow-visible",
);

const suggestionItemClassName = "w-[156px] shrink-0 snap-start md:w-auto";

export function VisualizeSuggestionsSkeleton() {
  return (
    <div className={suggestionsGridClassName}>
      {Array.from({ length: VISUALIZE_SUGGESTIONS_COUNT }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn("h-25 rounded-[16px]", suggestionItemClassName)}
        />
      ))}
    </div>
  );
}

export function VisualizeSuggestions() {
  const { suggestions, applySuggestion, showDatasetBadge, isPending, isError } =
    useVisualizeSuggestions();

  if (isPending) return <VisualizeSuggestionsSkeleton />;
  if (isError || !suggestions.length) return null;

  return (
    <div className={suggestionsGridClassName}>
      {suggestions.map((suggestion) => (
        <VisualizeSuggestionCard
          key={suggestion.id}
          suggestion={suggestion.text}
          footer={
            showDatasetBadge && (
              <DatasetSourceBadge name={suggestion.dataset_title} />
            )
          }
          onClick={() => applySuggestion(suggestion)}
          className={suggestionItemClassName}
        />
      ))}
    </div>
  );
}
