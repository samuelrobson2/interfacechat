import {
  ChatComposerAttachButton,
  ChatComposerDropdown,
  ChatComposerDropdownAction,
  ChatComposerSendButton,
  ChatTextareaComposer,
} from "@/services/chat/_ui/chat-input-composer";
import { UploadIcon } from "@/shared/assets/icons/outlined/Upload";
import {
  NEW_DATASET_RETURN_TO,
  newDatasetAdaptPath,
} from "@/shared/model/routes";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { PLACEHOLDER_VISUALIZE_PROMPTS } from "../model/sample-visualize";
import { useCreateVisualization } from "../model/use-create-visualization";
import { useSelectedDatasetId } from "../model/use-selected-dataset";

export function VisualizeComposer({
  message,
  onMessageChange,
  renderDatasetChip,
  renderDatasetOptions,
}: {
  message: string;
  onMessageChange: (message: string) => void;
  renderDatasetChip: (args: { onClick: () => void }) => ReactNode;
  renderDatasetOptions: (args: {
    onSelect: (datasetId: string) => void;
  }) => ReactNode;
}) {
  const navigate = useNavigate();
  const { selectedDatasetId, selectDataset } = useSelectedDatasetId();
  const { createVisualization, isPending: isCreating } =
    useCreateVisualization();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPlaceholderIndex(
        (current) => (current + 1) % PLACEHOLDER_VISUALIZE_PROMPTS.length,
      );
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  const canSubmit = Boolean(message.trim()) && !isCreating;

  const handleSubmit = () => {
    if (!canSubmit) return;

    createVisualization({
      prompt: message.trim(),
      datasetId: selectedDatasetId,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectDataset = (datasetId: string) => {
    selectDataset(datasetId);
    setIsPickerOpen(false);
  };

  const handleTogglePicker = () => setIsPickerOpen(!isPickerOpen);

  const handleImportDataset = () =>
    navigate(newDatasetAdaptPath(NEW_DATASET_RETURN_TO.VISUALIZE));

  return (
    <div className="relative isolate flex w-full flex-col">
      <ChatTextareaComposer
        value={message}
        onChange={(event) => onMessageChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={PLACEHOLDER_VISUALIZE_PROMPTS[placeholderIndex]}
        attached={isPickerOpen}
        frameClassName="relative z-2"
        leftActions={
          <>
            <ChatComposerAttachButton
              aria-label="Select dataset"
              title="Select dataset"
              aria-expanded={isPickerOpen}
              onClick={handleTogglePicker}
            />
            {selectedDatasetId &&
              renderDatasetChip({ onClick: handleTogglePicker })}
          </>
        }
        rightActions={
          <ChatComposerSendButton
            active={canSubmit}
            disabled={!canSubmit}
            onClick={handleSubmit}
          />
        }
      />

      {isPickerOpen && (
        <ChatComposerDropdown
          className="relative z-1"
          title={selectedDatasetId ? "Switch dataset" : "Select dataset"}
        >
          {renderDatasetOptions({ onSelect: handleSelectDataset })}

          <ChatComposerDropdownAction
            label="Import Dataset"
            icon={<UploadIcon svgClasses="size-5" />}
            onClick={handleImportDataset}
          />
        </ChatComposerDropdown>
      )}
    </div>
  );
}
