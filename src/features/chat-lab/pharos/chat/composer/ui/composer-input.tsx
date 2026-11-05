import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import {
  PromptInput,
  PromptInputActions,
  PromptInputFooter,
  PromptInputStop,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/shared/compose/prompt-input";
import { cn } from "@/shared/lib/css";

import { useInputStore } from "../../_model/input-store";

export function ChatComposerInput({
  onSubmit,
  onStop,
  onClose,
  isSubmitDisabled = false,
  isSubmitLoading = false,
  isStoppable = false,
  leftActions,
  endActions,
  frameClassName,
  maxRows,
  placeholder = "How can we help you?",
}: {
  onSubmit: (text: string) => void;
  onStop?: () => void;
  onClose?: () => void;
  /** Blocks sending for reasons beyond an empty draft (uploading, generating). */
  isSubmitDisabled?: boolean;
  isSubmitLoading?: boolean;
  /** Swaps the send button for a stop button. */
  isStoppable?: boolean;
  leftActions?: React.ReactNode;
  /** Shown on the right, before the send or stop button. */
  endActions?: React.ReactNode;
  frameClassName?: string;
  maxRows?: number;
  placeholder?: string;
}) {
  const message = useInputStore((state) => state.message);
  const setMessage = useInputStore((state) => state.setMessage);

  const canSubmit = Boolean(message?.trim()) && !isSubmitDisabled;

  const handleSubmit = () => {
    const trimmed = message?.trim();
    if (!trimmed || isSubmitDisabled) return;
    onSubmit(trimmed);
    setMessage("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <PromptInput
      className={cn(
        "min-h-[106px] max-h-[212px] md:min-h-[100px] md:max-h-[200px]",
        frameClassName,
      )}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          title="Close"
          className={cn(
            "grid size-4 place-items-center rounded-full bg-gray-2",
            "absolute top-4 right-4 z-10 cursor-pointer",
            "opacity-0 transition-opacity group-hover:opacity-100",
          )}
        >
          <CrossLargeIcon
            svgClasses="size-3"
            pathClasses="stroke-icon-primary"
          />
        </button>
      )}

      <PromptInputTextarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxRows={maxRows}
      />

      <PromptInputFooter>
        <PromptInputActions>{leftActions}</PromptInputActions>
        <PromptInputActions>
          {endActions}
          {isStoppable ? (
            <PromptInputStop
              onClick={onStop}
              aria-label="Stop generation"
              title="Stop generation"
            />
          ) : (
            <PromptInputSubmit
              active={canSubmit}
              onClick={handleSubmit}
              isLoading={isSubmitLoading}
              disabled={!canSubmit}
            />
          )}
        </PromptInputActions>
      </PromptInputFooter>
    </PromptInput>
  );
}
