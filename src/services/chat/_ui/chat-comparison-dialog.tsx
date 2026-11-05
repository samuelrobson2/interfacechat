import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

import { ChevronDownIcon } from "@/shared/assets/icons/outlined/ChevronDown";
import { ChevronRightIcon } from "@/shared/assets/icons/outlined/ChevronRight";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { cn } from "@/shared/lib/css";
import { useIsMobile } from "@/shared/lib/react/use-mobile";
import { Button } from "@/shared/ui/kit/button";
import { DialogOverlay } from "@/shared/ui/kit/dialog";
import { Text } from "@/shared/ui/kit/text";

export function ChatComparisonCard({
  label,
  actionLabel,
  onAction,
  variant,
  hideLabel = false,
  className,
  children,
}: {
  label: string;
  actionLabel: string;
  onAction: () => void;
  variant: "secondary" | "primary";
  hideLabel?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4 rounded-[8px] border border-stroke-secondary bg-background-primary px-4 py-6",
        className,
      )}
    >
      {!hideLabel && (
        <Text
          variant="small"
          weight="regular"
          color={variant === "primary" ? "primary" : "secondary"}
          className="w-full uppercase"
        >
          {label}
        </Text>
      )}
      {children}
      <Button
        variant={variant}
        size="40"
        className="rounded-[40px] [--hairline-radius:40px]"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

function ComparisonCloseButton() {
  return (
    <DialogPrimitive.Close asChild>
      <Button
        aria-label="Close comparison"
        title="Close"
        variant="secondary"
        size="icon-sm"
        radius="rounded"
      >
        <CrossLargeIcon svgClasses="size-4" />
      </Button>
    </DialogPrimitive.Close>
  );
}

function ComparisonDesktopHeader({ title }: { title?: string }) {
  if (!title) {
    return (
      <div className="flex w-full justify-end">
        <ComparisonCloseButton />
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-4">
      <ComparisonCloseButton />
      <Text variant="label" color="inverse" className="truncate" title={title}>
        {title}
      </Text>
    </div>
  );
}

function ComparisonMobileLayout({
  before,
  after,
}: {
  before: ReactNode;
  after: ReactNode;
}) {
  return (
    <>
      {/* Close button pinned to the top-right corner */}
      <div className="flex justify-end pb-2">
        <ComparisonCloseButton />
      </div>

      {/* Stacked panels separated by a chevron */}
      <div className="flex min-h-0 flex-1 flex-col items-center gap-3 overflow-y-auto">
        {before}
        <ChevronDownIcon
          svgClasses="size-6 shrink-0"
          pathClasses="stroke-icon-inverse"
        />
        {after}
      </div>
    </>
  );
}

function ComparisonDesktopLayout({
  title,
  before,
  after,
}: {
  title?: string;
  before: ReactNode;
  after: ReactNode;
}) {
  return (
    <div className="flex w-[min(90dvw,1400px)] flex-col items-center gap-8">
      <ComparisonDesktopHeader title={title} />

      <div className="flex w-full items-center gap-2">
        {before}
        <ChevronRightIcon
          svgClasses="size-6 shrink-0"
          pathClasses="stroke-icon-inverse"
        />
        {after}
      </div>
    </div>
  );
}

export function ChatComparisonDialog({
  open,
  onOpenChange,
  title,
  ariaLabel,
  description,
  before,
  after,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Desktop header text next to the close button. Omit for a close-only header aligned right. */
  title?: string;
  /** Accessible name + description of the dialog. */
  ariaLabel: string;
  description: string;
  before: ReactNode;
  after: ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex outline-none",
            isMobile &&
              "flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-[calc(env(safe-area-inset-top)+12px)]",
            !isMobile && "items-center justify-center px-6 py-16",
          )}
          aria-label={ariaLabel}
        >
          <DialogPrimitive.Title className="sr-only">
            {ariaLabel}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {description}
          </DialogPrimitive.Description>

          {isMobile ? (
            <ComparisonMobileLayout before={before} after={after} />
          ) : (
            <ComparisonDesktopLayout
              title={title}
              before={before}
              after={after}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
