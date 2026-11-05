import { useMemo, useRef, useState } from "react";

import { targetKey, type PlotTarget } from "@/services/plot";
import type { ChartBlock } from "../../_lib/chart-turn";
import { useSendMessage } from "../../_model/use-send-message";
import { highlightSuggestions } from "../lib/highlight-suggestions";
import { useIsHighlightViewport } from "../model/use-is-highlight-viewport";
import { useVisualizeHighlightStore } from "../model/visualize-highlight-store";
import { VisualizeHighlightSuggestions } from "../ui/visualize-highlight-suggestions";
import { VisualizeChartFullscreen } from "./visualize-chart-fullscreen";

export function VisualizeChartHighlight({
  block,
  isEditBlocked,
  renderChart,
}: {
  block: ChartBlock;
  isEditBlocked: boolean;
  renderChart: (bind: {
    onOpenFullscreen: () => void;
    onSelect?: (target: PlotTarget | null) => void;
    selection?: PlotTarget | null;
    plotRef: React.RefObject<HTMLDivElement | null>;
    children?: React.ReactNode;
  }) => React.ReactNode;
}) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartId = block.chartId;
  const isHighlightViewport = useIsHighlightViewport();
  const isHighlighting = useVisualizeHighlightStore(
    (state) => Boolean(chartId) && state.chartId === chartId,
  );
  const isArmed = isHighlightViewport && isHighlighting;
  const target = useVisualizeHighlightStore((state) => state.target);
  const suggestionsSide = useVisualizeHighlightStore(
    (state) => state.suggestionsSide,
  );
  const selectTarget = useVisualizeHighlightStore(
    (state) => state.selectTarget,
  );
  const resetHighlight = useVisualizeHighlightStore((state) => state.reset);
  const { sendChartEdit } = useSendMessage();

  const suggestions = useMemo(
    () => (target ? highlightSuggestions(target) : []),
    [target],
  );

  const handleSubmitEdit = (instruction: string) => {
    if (!chartId || !target) return;
    // The selection belongs to the request that is now in flight.
    resetHighlight();
    void sendChartEdit({ chartId, target, instruction });
  };

  return (
    <>
      {renderChart({
        onOpenFullscreen: () => setIsFullscreen(true),
        onSelect:
          isArmed && !isEditBlocked
            ? (next) => selectTarget(next, plotRef.current?.clientWidth)
            : undefined,
        selection: isArmed ? target : undefined,
        plotRef,
        children:
          isArmed && target ? (
            <VisualizeHighlightSuggestions
              key={targetKey(target)}
              side={suggestionsSide}
              offsetY={target.bbox.y}
              suggestions={suggestions}
              onSubmit={handleSubmitEdit}
            />
          ) : undefined,
      })}

      <VisualizeChartFullscreen
        open={isFullscreen}
        onOpenChange={setIsFullscreen}
        block={block}
        isEditBlocked={isEditBlocked}
      />
    </>
  );
}
