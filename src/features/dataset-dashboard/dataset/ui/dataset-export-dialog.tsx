import { PlansListDialog } from "@/services/plans";
import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/kit/dialog";
import { useState } from "react";
import { Badge } from "@/shared/ui/kit/badge";
import { LockIcon } from "@/shared/assets/icons/general/Lock";
import { Text } from "@/shared/ui/kit/text";
import { cn } from "@/shared/lib/css";
import { AiStarIcon } from "@/shared/assets/icons/outlined/AiStar";

export function DatasetExportDialog({
  trigger,
  onExport,
  onClose,
  provider,
  defaultOpen,
  isFreePlan,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  trigger?: React.ReactNode;
  onExport: (isPrivate: boolean) => void;
  onClose?: () => void;
  provider: string;
  defaultOpen?: boolean;
  isFreePlan: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [isPrivate, setIsPrivate] = useState(false);

  const handleExport = () => {
    onExport(isPrivate);
    setOpen(false);
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) onClose?.();
      }}
      {...props}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Dataset</DialogTitle>
          <DialogDescription>
            Choose the visibility settings for your dataset. Public datasets are
            visible to everyone on {provider}, while private datasets are only
            accessible to you and your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 items-center justify-center">
          <Badge
            className={cn(
              "cursor-pointer w-[110px] h-[44px]",
              !isPrivate &&
                "shadow-highlight-blue bg-blue-100 [--hairline-color:var(--color-blue-5)]",
            )}
            onClick={() => setIsPrivate(false)}
          >
            Public
          </Badge>
          <Badge
            className={cn(
              "relative cursor-pointer w-[110px] h-[44px]",
              isPrivate &&
                "shadow-highlight-blue bg-blue-100 [--hairline-color:var(--color-blue-5)]",
            )}
            onClick={() => {
              if (!isFreePlan) setIsPrivate(true);
            }}
          >
            {isFreePlan ? (
              <Text
                className="flex items-center gap-1.5 break-all"
                color="secondary"
              >
                <LockIcon className="size-5" />
                <PlansListDialog
                  trigger={
                    <button
                      type="button"
                      className="flex items-center gap-1.5 break-all"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Text>Private</Text>
                      <AiStarIcon pathClasses="bg-gradient-black-blue" />
                    </button>
                  }
                />
              </Text>
            ) : (
              <Text className="flex items-center gap-0.5 break-all">
                <Text>Private</Text>
                <AiStarIcon pathClasses="bg-gradient-black-blue" />
              </Text>
            )}
          </Badge>
        </div>

        <DialogFooter>
          <Button className="flex-1" onClick={handleExport}>
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
