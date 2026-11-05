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

export function SettingsDeleteDialog({
  trigger,
  onDelete,
  isPending,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  trigger?: React.ReactNode;
  onDelete?: () => void;
  isPending?: boolean;
}) {
  return (
    <Dialog {...props}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>We’re sorry to see you go!</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your account? This action is cannot
            be undone. All your data will be lost forever.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button className="flex-1" onClick={onDelete} isLoading={isPending}>
            Delete anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
