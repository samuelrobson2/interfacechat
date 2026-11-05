import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ChatComposerSendButton,
  ChatInlineComposer,
  ChatPillButton,
  ChatSaveInterfaceButton,
  ChatSaveInterfaceButtonIcon,
  ChatSaveInterfaceButtonLabel,
} from "@/services/chat";
import { VegaChart, targetKey } from "@/services/plot";
import { HighlightIcon } from "@/shared/assets/icons/general/Highlight";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { DownloadIconThin } from "@/shared/assets/icons/outlined/DownloadThin";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { useChartDownload } from "@/shared/ui/kit/chart-download/chart-download";
import { DialogOverlay } from "@/shared/ui/kit/dialog";
import { Text } from "@/shared/ui/kit/text";
import { toChartFileName } from "../../_lib/chart-file-name";
import type { ChartBlock } from "../../_lib/chart-turn";
import { useSaveChart } from "../../_model/use-save-chart";
import { useSendMessage } from "../../_model/use-send-message";
import { toFullscreenSpec } from "../lib/fullscreen-spec";
import { highlightSuggestions } from "../lib/highlight-suggestions";
import { useIsHighlightViewport } from "../model/use-is-highlight-viewport";
import { useVisualizeHighlightStore } from "../model/visualize-highlight-store";
import { VisualizeHighlightSuggestions } from "../ui/visualize-highlight-suggestions";

const SAVE_CHART_LABELS = {
  idle: "Save Chart",
  saving: "Saving your chart",
  saved: "Chart Saved",
};

const FLASH_MS = 700;

export function VisualizeChartFullscreen({
  open,
  onOpenChange,
  block,
  isEditBlocked,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: ChartBlock;
  isEditBlocked: boolean;
}) {
  const plotRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);
  const flashTimeoutRef = useRef<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isInputFlashing, setIsInputFlashing] = useState(false);

  const chartId = block.chartId;
  const isHighlightViewport = useIsHighlightViewport();
  const isHighlighting = useVisualizeHighlightStore(
    (state) => Boolean(chartId) && state.chartId === chartId,
  );
  const isHighlightMode = isHighlightViewport && isHighlighting;
  const target = useVisualizeHighlightStore((state) => state.target);
  const suggestionsSide = useVisualizeHighlightStore(
    (state) => state.suggestionsSide,
  );
  const toggleChart = useVisualizeHighlightStore((state) => state.toggleChart);
  const selectTarget = useVisualizeHighlightStore(
    (state) => state.selectTarget,
  );
  const resetHighlight = useVisualizeHighlightStore((state) => state.reset);

  const { sendChartEdit, sendChartTurn } = useSendMessage();
  const { status, save, canSave, savedTo } = useSaveChart(
    chartId,
    block.showOnDataset,
  );
  const { ref, handleDownloadImage, isDownloading } = useChartDownload(
    toChartFileName(block.title),
  );

  const suggestions = useMemo(
    () => (target ? highlightSuggestions(target) : []),
    [target],
  );
  const fullscreenSpec = useMemo(
    () => toFullscreenSpec(block.spec),
    [block.spec],
  );

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current !== null) {
        window.clearTimeout(flashTimeoutRef.current);
      }
    };
  }, []);

  // The highlight store is shared with the thread card, so leaving the overlay
  // has to drop the selection or the thread would keep the same chrome.
  const handleOpenChange = (next: boolean) => {
    if (!next) resetHighlight();
    onOpenChange(next);
  };

  const close = () => handleOpenChange(false);

  const handleAskSomethingElse = () => {
    requestAnimationFrame(() => {
      promptInputRef.current?.focus();
    });
    setIsInputFlashing(true);
    if (flashTimeoutRef.current !== null) {
      window.clearTimeout(flashTimeoutRef.current);
    }
    flashTimeoutRef.current = window.setTimeout(() => {
      setIsInputFlashing(false);
      flashTimeoutRef.current = null;
    }, FLASH_MS);
  };

  const handleSubmit = (instruction: string) => {
    const trimmed = instruction.trim();
    if (!trimmed || isEditBlocked) return;

    if (target && chartId) {
      // The selection belongs to the request that is now in flight.
      resetHighlight();
      void sendChartEdit({ chartId, target, instruction: trimmed });
    } else {
      void sendChartTurn({ instruction: trimmed, text: trimmed });
      resetHighlight();
    }

    setPrompt("");
    close();
  };

  const canSubmit = Boolean(prompt.trim()) && !isEditBlocked;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 outline-none"
          aria-label="Chart fullscreen"
        >
          <DialogPrimitive.Title className="sr-only">
            {block.title || "Chart"}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            View and edit the chart in fullscreen
          </DialogPrimitive.Description>

          <DialogPrimitive.Close
            className="absolute inset-0 cursor-default bg-transparent"
            aria-label="Close fullscreen"
          />

          <div className="pointer-events-none absolute inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-6 py-10">
              <div
                className={cn(
                  "pointer-events-auto flex h-fit min-w-0 flex-col gap-8",
                  isHighlightViewport
                    ? "w-[min(1200px,calc(100%-456px))]"
                    : "w-[min(1200px,100%)]",
                )}
              >
              <div className="flex shrink-0 items-center justify-between gap-4">
                <Button
                  type="button"
                  onClick={close}
                  aria-label="Close fullscreen"
                  title="Close"
                  variant="secondary"
                  size="icon-sm"
                  radius="rounded"
                >
                  <CrossLargeIcon svgClasses="size-4" />
                </Button>

                <div className="flex shrink-0 items-center gap-3">
                  {canSave && (
                    <ChatSaveInterfaceButton
                      status={status}
                      onSave={save}
                      savedTo={savedTo}
                      disabled={status === "saving"}
                    >
                      <ChatSaveInterfaceButtonIcon idleIcon={PlusSmallIcon} />
                      <ChatSaveInterfaceButtonLabel
                        labels={SAVE_CHART_LABELS}
                      />
                    </ChatSaveInterfaceButton>
                  )}

                  {chartId && isHighlightViewport && (
                    <ChatPillButton
                      shape="pill-text"
                      active={isHighlightMode}
                      disabled={isEditBlocked}
                      aria-pressed={isHighlightMode}
                      className="gap-1.5"
                      onClick={() => toggleChart(chartId)}
                    >
                      <HighlightIcon svgClasses="size-4" />
                      <Text variant="label" color="primary">
                        Highlight
                      </Text>
                    </ChatPillButton>
                  )}

                  <ChatPillButton
                    shape="icon-sm"
                    onClick={() => handleDownloadImage()}
                    disabled={isDownloading}
                    aria-label="Download chart as image"
                    title="Download"
                  >
                    <DownloadIconThin svgClasses="size-4" />
                  </ChatPillButton>
                </div>
              </div>

              <div className="relative shrink-0">
                <figure
                  className={cn(
                    "flex h-fit w-full min-w-0 flex-col gap-6 rounded-[16px] bg-gray-0 p-6 hairline",
                    "[--hairline-color:var(--color-gray-2)] [--hairline-radius:16px]",
                  )}
                >
                  <div ref={ref} className="flex min-w-0 flex-col gap-6">
                    {(block.title || block.subtitle) && (
                      <div className="flex min-w-0 flex-col gap-0.5">
                        {block.title && (
                          <Text variant="title" className="wrap-anywhere">
                            {block.title}
                          </Text>
                        )}
                        {block.subtitle && (
                          <Text
                            variant="caption"
                            color="secondary"
                            className="wrap-anywhere"
                          >
                            {block.subtitle}
                          </Text>
                        )}
                      </div>
                    )}
                    <div
                      ref={plotRef}
                      className="relative h-fit w-full min-w-0 leading-none [&_svg]:block"
                    >
                      <VegaChart
                        className="h-fit"
                        spec={fullscreenSpec}
                        datasets={block.datasets}
                        onSelect={
                          isHighlightMode && !isEditBlocked
                            ? (next) =>
                                selectTarget(next, plotRef.current?.clientWidth)
                            : undefined
                        }
                        selection={isHighlightMode ? target : undefined}
                      />
                    </div>
                  </div>
                </figure>

                {isHighlightMode && target && (
                  <VisualizeHighlightSuggestions
                    key={targetKey(target)}
                    side={suggestionsSide}
                    offsetY={target.bbox.y}
                    suggestions={suggestions}
                    onSubmit={handleSubmit}
                    onAskSomethingElse={handleAskSomethingElse}
                  />
                )}
              </div>

              <div className="flex shrink-0 justify-center">
                <ChatInlineComposer
                  ref={promptInputRef}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmit(prompt);
                    }
                  }}
                  placeholder="Describe edits"
                  disabled={isEditBlocked}
                  highlighted={isInputFlashing}
                  rightActions={
                    <ChatComposerSendButton
                      active={canSubmit}
                      disabled={!canSubmit}
                      onClick={() => handleSubmit(prompt)}
                      aria-label="Send edit request"
                    />
                  }
                />
              </div>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
