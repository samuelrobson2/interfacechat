import * as DialogPrimitive from "@radix-ui/react-dialog";

import { ChevronRightIcon } from "@/shared/assets/icons/outlined/ChevronRight";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { Button } from "@/shared/ui/kit/button";
import { DialogOverlay } from "@/shared/ui/kit/dialog";
import { Text } from "@/shared/ui/kit/text";

function ImageEditComparisonCard({
  label,
  src,
  alt,
  actionLabel,
  onAction,
  variant,
}: {
  label: string;
  src: string;
  alt?: string;
  actionLabel: string;
  onAction: () => void;
  variant: "secondary" | "primary";
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-[8px] border border-stroke-secondary bg-background-primary px-4 py-6">
      <Text
        variant="small"
        weight="regular"
        color={variant === "primary" ? "primary" : "secondary"}
        className="w-full uppercase"
      >
        {label}
      </Text>
      <img
        src={src}
        alt={alt || label}
        loading="lazy"
        draggable={false}
        className="max-h-[55dvh] w-full object-contain"
      />
      <Button
        variant={variant}
        size="40"
        className="rounded-[40px]"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

export function ImageEditComparison({
  open,
  onOpenChange,
  title,
  originalSrc,
  originalAlt,
  editedSrc,
  editedAlt,
  onKeepOriginal,
  onUseEdited,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  originalSrc: string;
  originalAlt?: string;
  editedSrc: string;
  editedAlt?: string;
  onKeepOriginal: () => void;
  onUseEdited: () => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex items-center justify-center px-6 py-16 outline-none"
          aria-label="Compare original and edited image"
        >
          <DialogPrimitive.Title className="sr-only">
            Compare original and edited image
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Keep the original image or use the edited one
          </DialogPrimitive.Description>

          <div className="flex w-[min(90dvw,1400px)] flex-col items-center gap-8">
            <div className="flex w-full items-center gap-4">
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
              <Text
                variant="label"
                color="inverse"
                className="truncate"
                title={title}
              >
                {title}
              </Text>
            </div>

            <div className="flex w-full items-center gap-2">
              <ImageEditComparisonCard
                label="Original image"
                src={originalSrc}
                alt={originalAlt}
                actionLabel="Keep Original"
                onAction={onKeepOriginal}
                variant="secondary"
              />
              <ChevronRightIcon
                svgClasses="size-6 shrink-0"
                pathClasses="stroke-icon-inverse"
              />
              <ImageEditComparisonCard
                label="Edited"
                src={editedSrc}
                alt={editedAlt}
                actionLabel="Use This"
                onAction={onUseEdited}
                variant="primary"
              />
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
