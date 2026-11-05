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

// Decorative window dots (regular chat + loading skeletons).
export function ChatInteractiveFrameDots({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
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
