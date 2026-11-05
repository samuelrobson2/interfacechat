import { createContext, useContext } from "react";

import { CheckmarkIcon } from "@/shared/assets/icons/outlined/Checkmark";
import { LoaderIcon } from "@/shared/assets/icons/outlined/Loader";
import { cn } from "@/shared/lib/css";
import type { CustomIconProps } from "@/shared/model/icon";
import {
  GradientBorderButton,
  GradientBorderButtonIcon,
  GradientBorderButtonLabel,
} from "@/shared/ui/gradient-border-button";

export type SaveInterfaceStatus = "idle" | "saving" | "saved";

const DEFAULT_LABELS: Record<SaveInterfaceStatus, string> = {
  idle: "Save Interface",
  saving: "Saving Interface",
  saved: "Interface Saved",
};

const SaveButtonContext = createContext<SaveInterfaceStatus | null>(null);

const useSaveButtonContext = () => {
  const status = useContext(SaveButtonContext);
  if (!status) {
    throw new Error(
      "ChatSaveInterfaceButton.* must be used within <ChatSaveInterfaceButton>",
    );
  }
  return status;
};

export function ChatSaveInterfaceButton({
  status,
  onSave,
  size,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"button">, "onClick" | "color"> & {
  status: SaveInterfaceStatus;
  onSave: () => void;
  size?: "default" | "compact";
}) {
  const isIdle = status === "idle";
  const isSaving = status === "saving";
  const isSaved = status === "saved";

  const handleClick = () => {
    if (isSaving || isSaved) return;
    onSave();
  };

  return (
    <SaveButtonContext.Provider value={status}>
      <GradientBorderButton
        {...props}
        size={size}
        color={isSaved ? "green" : "ai"}
        hoverGradient={isIdle}
        aria-busy={isSaving}
        onClick={handleClick}
        className={cn(isIdle ? "cursor-pointer" : "cursor-default", className)}
      >
        {children}
      </GradientBorderButton>
    </SaveButtonContext.Provider>
  );
}

export function ChatSaveInterfaceButtonIcon({
  idleIcon,
  idleIconPaint = "stroke",
  savingIcon = LoaderIcon,
  savedIcon = CheckmarkIcon,
}: {
  idleIcon: React.ComponentType<CustomIconProps>;
  idleIconPaint?: "stroke" | "fill";
  savingIcon?: React.ComponentType<CustomIconProps>;
  savedIcon?: React.ComponentType<CustomIconProps>;
}) {
  const status = useSaveButtonContext();

  if (status === "saved") {
    return <GradientBorderButtonIcon icon={savedIcon} paint="stroke" />;
  }

  if (status === "saving") {
    return <GradientBorderButtonIcon icon={savingIcon} paint="stroke" spin />;
  }

  return <GradientBorderButtonIcon icon={idleIcon} paint={idleIconPaint} />;
}

export function ChatSaveInterfaceButtonLabel({
  labels,
  collapsible = false,
  expanded = true,
  className,
}: {
  labels?: Partial<Record<SaveInterfaceStatus, string>>;
  collapsible?: boolean;
  expanded?: boolean;
  className?: string;
}) {
  const status = useSaveButtonContext();
  const text = { ...DEFAULT_LABELS, ...labels }[status];

  return (
    <GradientBorderButtonLabel
      collapsible={collapsible}
      expanded={expanded}
      className={className}
    >
      {text}
    </GradientBorderButtonLabel>
  );
}
