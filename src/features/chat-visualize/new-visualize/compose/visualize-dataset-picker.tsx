import {
  ChatComposerDropdownItem,
  ChatComposerDropdownList,
} from "@/services/chat";
import { getDomainColorizedIcon } from "@/services/dataset";
import { useInView } from "@/shared/lib/react/use-in-view";
import { Text } from "@/shared/ui/kit/text";
import { useEffect, useRef } from "react";
import {
  useSelectedDataset,
  useSelectedDatasetId,
} from "../model/use-selected-dataset";
import { useVisualizeDatasets } from "../model/use-visualize-datasets";
import { DatasetChipButton } from "../ui/visualize-dataset-badge";
import Lottie from "lottie-react";
import loadingBlackAnimation from "@/shared/assets/lottie/loading-black.json";

/** Attached dataset chip — its name comes from the datasets feed, so it suspends. */
export function VisualizeSelectedDatasetChip({
  onClick,
}: {
  onClick: () => void;
}) {
  const selectedDataset = useSelectedDataset();

  if (!selectedDataset) return null;

  return <DatasetChipButton name={selectedDataset.name} onClick={onClick} />;
}

export function VisualizeDatasetOptions({
  onSelect,
}: {
  onSelect: (datasetId: string) => void;
}) {
  const { datasets, hasMore, isLoadingMore, loadMore } = useVisualizeDatasets();
  const { selectedDatasetId } = useSelectedDatasetId();
  const listRef = useRef<HTMLDivElement>(null);
  const loadedWhileVisibleRef = useRef(false);
  const { ref, isInView } = useInView<HTMLDivElement>({
    enabled: hasMore,
    rootRef: listRef,
    rootMargin: "0px",
  });

  // One page per arrival at the bottom. Scroll anchoring would otherwise keep
  // the sentinel in view after a fetch and immediately pull the next page.
  useEffect(() => {
    if (!isInView) {
      loadedWhileVisibleRef.current = false;
      return;
    }
    if (!hasMore || isLoadingMore) return;

    const list = listRef.current;
    const canScroll = list != null && list.scrollHeight > list.clientHeight;
    if (loadedWhileVisibleRef.current && canScroll) return;

    loadedWhileVisibleRef.current = true;
    loadMore();
  }, [isInView, hasMore, isLoadingMore, loadMore]);

  if (!datasets.length && !hasMore) {
    return (
      <Text variant="label" color="secondary" className="py-2">
        No datasets yet. You can still chart from a prompt, or import one.
      </Text>
    );
  }

  return (
    <ChatComposerDropdownList ref={listRef}>
      {datasets.map((dataset) => (
        <ChatComposerDropdownItem
          key={dataset.id}
          label={dataset.name}
          icon={
            <img
              src={getDomainColorizedIcon(dataset.domain)}
              alt=""
              className="size-6"
            />
          }
          selected={dataset.id === selectedDatasetId}
          onClick={() => onSelect(dataset.id)}
        />
      ))}

      {hasMore && (
        <div ref={ref} className="h-2 shrink-0 flex items-center justify-center" aria-hidden>
          {isLoadingMore && (
            <Lottie
              className="size-10"
              animationData={loadingBlackAnimation}
              loop={true}
            />
          )}
        </div>
      )}
    </ChatComposerDropdownList>
  );
}
