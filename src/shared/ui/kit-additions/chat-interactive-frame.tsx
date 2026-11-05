import { CloseIcon } from "@/shared/assets/icons/outlined/Close";
import { MaximizeIcon } from "@/shared/assets/icons/outlined/Maximize";
import { MinimizeIcon } from "@/shared/assets/icons/outlined/Minimize";
import { cn } from "@/shared/lib/css";

import type { SaveInterfaceStatus } from "./chat-save-interface-button";

export function ChatInteractiveFrame({
  status,
  fill = false,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  status: SaveInterfaceStatus;
  fill?: boolean;
}) {
  const isSaving = status === "saving";

  return (
    <div
      data-slot="interactive-frame"
      data-status={status}
      className={cn(
        "relative rounded-[16px]",
        fill && "flex min-h-0 flex-col",
        !isSaving &&
          "hairline [--hairline-color:var(--color-gray-2)] [--hairline-radius:16px] [--hairline-scale:0.5]",
        isSaving && "shadow-[0px_0px_4px_var(--color-rose-2)]",
        status === "saved" &&
          "shadow-[0px_2px_4px_color-mix(in_srgb,var(--color-gray-5)_25%,transparent)]",
        className,
      )}
      {...props}
    >
      {isSaving && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-20 h-[200%] w-[200%] origin-top-left scale-50 rounded-[32px] bg-gradient-ai-frame gradient-text-shimmer gradient-ring p-[4px]"
        />
      )}
      <div
        className={cn(
          "relative isolate flex flex-col overflow-hidden rounded-[16px] bg-background-primary",
          fill && "min-h-0 flex-1",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ChatInteractiveFrameHeader({
  border = false,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  border?: boolean;
}) {
  return (
    <div
      data-slot="interactive-frame-header"
      className={cn(
        "flex h-12 shrink-0 items-center px-6",
        border && "hairline-b [--hairline-color:var(--color-gray-2)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ChatInteractiveFrameDots({
  interactive = false,
  isFullscreen = false,
  onClose,
  onToggleFullscreen,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  isFullscreen?: boolean;
  onClose?: () => void;
  onToggleFullscreen?: () => void;
}) {
  // Static, non-clickable dots (regular chat + loading skeletons).
  if (!interactive) {
    return (
      <div
        data-slot="interactive-frame-dots"
        className={cn("flex items-center gap-1.5", className)}
        {...props}
      >
        <span className="size-3.5 rounded-full bg-gray-2" />
        <span className="size-3.5 rounded-full bg-gray-2" />
        <span className="size-3.5 rounded-full bg-gray-2" />
      </div>
    );
  }

  return (
    <div
      data-slot="interactive-frame-dots"
      className={cn("group flex items-center gap-1.5", className)}
      {...props}
    >
      <InteractiveFrameDot aria-label="Close" onClick={onClose}>
        <CloseIcon />
      </InteractiveFrameDot>

      <InteractiveFrameDot aria-label="Minimize" disabled>
        <MinimizeIcon />
      </InteractiveFrameDot>

      <InteractiveFrameDot
        aria-label={isFullscreen ? "Exit Full Screen" : "Full Screen"}
        aria-pressed={isFullscreen}
        onClick={onToggleFullscreen}
      >
        <MaximizeIcon />
      </InteractiveFrameDot>
    </div>
  );
}

// A single traffic-light dot: a plain gray circle that only reveals its glyph
// while the dot cluster is hovered (macOS window-chrome behaviour).
function InteractiveFrameDot({
  disabled,
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex size-3.5 items-center justify-center rounded-full bg-[#D9D9D9] *:opacity-0 *:transition-opacity group-hover:*:opacity-100",
        disabled ? "cursor-default" : "cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
