import { CopyIcon } from "@/shared/assets/icons/general/Copy";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/shared/ui/kit/dialog";
import { Button } from "@/shared/ui/kit/button";

export const AutoscientistConfigDialog = ({
  isConfigDialogOpen,
  setIsConfigDialogOpen,
  autoScientistConfigText,
  canCopyConfig,
  handleCopyConfig,
}: {
  isConfigDialogOpen: boolean;
  setIsConfigDialogOpen: (open: boolean) => void;
  autoScientistConfigText: string;
  canCopyConfig: boolean;
  handleCopyConfig: () => void;
}) => {
  return (
    <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
      <DialogContent showCloseButton className="max-w-[980px]">
        <DialogHeader>
          <DialogTitle>AutoScientist Config</DialogTitle>
        </DialogHeader>
        <div className="w-full min-w-0 min-h-0 rounded-[8px] border-[0.5px] border-stroke-secondary p-6 flex flex-col bg-background-primary">
          <div className="min-h-0 min-w-0 flex-1">
            <pre className="h-full min-h-[320px] max-h-[60vh] overflow-auto no-scrollbar rounded-[8px] bg-background-secondary p-4 font-mono text-sm leading-7 whitespace-pre-wrap break-words">
              {autoScientistConfigText}
            </pre>
          </div>
        </div>
        <DialogFooter
          showCancelButton={false}
          className="grid grid-cols-2 gap-2"
        >
          <DialogClose asChild>
            <Button variant="secondary" className="w-full">
              Close
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="w-full"
            onClick={handleCopyConfig}
            disabled={!canCopyConfig}
          >
            <CopyIcon pathClasses="stroke-current" />
            Copy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
