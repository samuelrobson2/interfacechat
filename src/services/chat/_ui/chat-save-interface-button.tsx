import { createContext, useContext } from "react";
import { Link } from "react-router-dom";

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
  saving: "Saving your interface",
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
  savedTo,
  size,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"button">, "onClick" | "color"> & {
  status: SaveInterfaceStatus;
  onSave?: () => void;
  savedTo?: string;
  size?: "default" | "compact";
}) {
  const isIdle = status === "idle";
  const isSaving = status === "saving";
  const isSaved = status === "saved";
  const savedHref = isSaved ? savedTo : undefined;
  const isClickable =
    (isIdle && Boolean(onSave)) || (isSaved && Boolean(savedTo));

  const handleClick = () => {
    if (!isIdle) return;
    onSave?.();
  };

  return (
    <SaveButtonContext.Provider value={status}>
      <GradientBorderButton
        {...props}
        size={size}
        color={isSaved ? "green" : "ai"}
        hoverGradient={isIdle}
        aria-busy={isSaving}
        asChild={Boolean(savedHref)}
        onClick={savedHref ? undefined : handleClick}
        className={cn(
          isClickable ? "cursor-pointer" : "cursor-default",
          className,
        )}
      >
        {savedHref ? <Link to={savedHref}>{children}</Link> : children}
      </GradientBorderButton>
    </SaveButtonContext.Provider>
  );
}

export function ChatSaveInterfaceButtonIcon({
  idleIcon,
  idleIconPaint = "stroke",
  savingIcon = LoaderIcon,
  savedIcon = CheckmarkIcon,
  savedIconPaint = "stroke",
}: {
  idleIcon: React.ComponentType<CustomIconProps>;
  idleIconPaint?: "stroke" | "fill";
  savingIcon?: React.ComponentType<CustomIconProps>;
  savedIcon?: React.ComponentType<CustomIconProps>;
  savedIconPaint?: "stroke" | "fill" | "none";
}) {
  const status = useSaveButtonContext();

  if (status === "saved") {
    return (
      <GradientBorderButtonIcon
        icon={savedIcon}
        paint={savedIconPaint === "none" ? undefined : savedIconPaint}
      />
    );
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
