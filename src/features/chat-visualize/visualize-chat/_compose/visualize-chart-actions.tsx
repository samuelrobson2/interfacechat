import {
  ChatPillButton,
  ChatSaveInterfaceButton,
  ChatSaveInterfaceButtonIcon,
  ChatSaveInterfaceButtonLabel,
} from "@/services/chat";
import { HighlightIcon } from "@/shared/assets/icons/general/Highlight";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { useSaveChart } from "../_model/use-save-chart";
import { useIsHighlightViewport } from "../highlight/model/use-is-highlight-viewport";
import { useVisualizeHighlightStore } from "../highlight/model/visualize-highlight-store";

const SAVE_CHART_LABELS = {
  idle: "Save Chart",
  saving: "Saving your chart",
  saved: "Chart Saved",
};

/** The action row under a finished chart. */
export function VisualizeChartActions({
  chartId,
  showOnDataset,
  isEditBlocked,
  className,
}: {
  chartId?: string;
  showOnDataset?: boolean;
  isEditBlocked: boolean;
  className?: string;
}) {
  const { status, save, canSave, savedTo } = useSaveChart(
    chartId,
    showOnDataset,
  );
  const isHighlightViewport = useIsHighlightViewport();
  const isHighlighting = useVisualizeHighlightStore(
    (state) => Boolean(chartId) && state.chartId === chartId,
  );
  const toggleChart = useVisualizeHighlightStore((state) => state.toggleChart);

  if (!chartId) return null;
  if (!isHighlightViewport && !canSave) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-4",
        isHighlightViewport ? "justify-between" : "justify-end",
        className,
      )}
    >
      {isHighlightViewport && (
        <ChatPillButton
          shape="pill-text"
          active={isHighlighting}
          disabled={isEditBlocked}
          aria-pressed={isHighlighting}
          className="gap-1.5"
          onClick={() => toggleChart(chartId)}
        >
          <HighlightIcon svgClasses="size-4" />
          <Text variant="label" color="primary">
            Highlight
          </Text>
        </ChatPillButton>
      )}

      {canSave && (
        <ChatSaveInterfaceButton
          status={status}
          onSave={save}
          savedTo={savedTo}
          disabled={status === "saving"}
        >
          <ChatSaveInterfaceButtonIcon idleIcon={PlusSmallIcon} />
          <ChatSaveInterfaceButtonLabel labels={SAVE_CHART_LABELS} />
        </ChatSaveInterfaceButton>
      )}
    </div>
  );
}
