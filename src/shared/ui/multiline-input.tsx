import { useState } from "react";

import { cn } from "@/shared/lib/css";
import { Button, type ButtonProps } from "@/shared/ui/kit/button";
import { Textarea, type TextareaProps } from "@/shared/ui/kit/textarea";
import { MicrophoneIcon } from "../assets/icons/general/Microphone";
import { StopIcon } from "../assets/icons/general/Stop";
import { ArrowUpIcon } from "../assets/icons/outlined/ArrowUp";

export function SendButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      className={cn("size-12 p-0", className)}
      variant="primary"
      size="icon"
      {...props}
    >
      <ArrowUpIcon />
    </Button>
  );
}

export function StopButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      className={cn(
        "flex items-center justify-center gap-3 rounded-[4px] border-[0.5px] border-stroke-secondary bg-background-primary p-[14px]",
        className,
      )}
      variant="secondary"
      size="icon"
      {...props}
    >
      <StopIcon pathClasses="dark-region stroke-icon-primary" />
    </Button>
  );
}

export function MicrophoneButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "grid place-items-center size-12 cursor-pointer",
        className,
      )}
      {...props}
    >
      <MicrophoneIcon />
    </button>
  );
}

export function MultilineInput({
  className,
  fileUpload,
  badges,
  multiline = false,
  pinActionsToBottom = false,
  sendButton,
  value,
  ...props
}: TextareaProps & {
  fileUpload?: React.ReactNode;
  badges?: React.ReactNode;
  sendButton: React.ReactNode;
  multiline?: boolean;
  pinActionsToBottom?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  // Collapse back to single-line when content is cleared (e.g. after sending)
  if ((typeof value === "string" ? value : "") === "" && expanded) {
    setExpanded(false);
  }

  const handleHeightChange = (height: number, meta: { rowHeight: number }) => {
    const rows = Math.round(height / meta.rowHeight);
    // Only expand — never collapse here to avoid layout oscillation
    if (rows > 1) setExpanded(true);
  };

  const isMultiline = multiline || expanded;

  const leftElement = isMultiline ? null : fileUpload;
  const rightElement = isMultiline ? (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-2",
        pinActionsToBottom ? "mt-auto pt-6" : "mt-6",
      )}
    >
      <div className="flex items-center gap-3">
        {fileUpload}
        {badges}
      </div>

      {sendButton}
    </div>
  ) : (
    <div className="ml-8">{sendButton}</div>
  );

  return (
    <Textarea
      className={cn(
        "p-3 gap-0",
        isMultiline &&
          pinActionsToBottom &&
          "flex h-full flex-col items-stretch",
        className,
      )}
      inputClassName={cn(
        "m-0 placeholder:text-typography-secondary",
        isMultiline && "px-3",
      )}
      leftElement={leftElement}
      rightElement={rightElement}
      onHeightChange={handleHeightChange}
      value={value}
      {...props}
    />
  );
}
