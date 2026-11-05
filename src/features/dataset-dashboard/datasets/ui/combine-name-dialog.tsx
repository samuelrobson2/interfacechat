import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Text } from "@/shared/ui/kit/text";
import { COMBINE_NAME_MAX_LENGTH } from "../lib/build-combine-name";

interface CombineNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName: string;
  totalEstimatedRows?: number | null;
  isSubmitting?: boolean;
  onSubmit: (name: string) => void;
}

export function CombineNameDialog({
  open,
  onOpenChange,
  defaultName,
  totalEstimatedRows,
  isSubmitting,
  onSubmit,
}: CombineNameDialogProps) {
  const [value, setValue] = useState(defaultName);
  // Track the last-applied prop so we can reset the field whenever the dialog
  // re-opens with a fresh selection. Matches the React docs "reset state when
  // a prop changes" pattern (storing prev props during render) to avoid the
  // setState-in-effect anti-pattern flagged by react-hooks/set-state-in-effect.
  const [reseedKey, setReseedKey] = useState<{
    open: boolean;
    defaultName: string;
  }>({ open, defaultName });
  if (reseedKey.open !== open || reseedKey.defaultName !== defaultName) {
    setReseedKey({ open, defaultName });
    if (open) setValue(defaultName);
  }
  const inputRef = useRef<HTMLInputElement>(null);


  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0 && !isSubmitting;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(trimmed);
  };

  const rowsHint =
    totalEstimatedRows != null && totalEstimatedRows > 0
      ? `~${totalEstimatedRows.toLocaleString()} rows`
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Name your combined dataset</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Input
              label="Name"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              maxLength={COMBINE_NAME_MAX_LENGTH}
              inputRef={inputRef}
            />
            {rowsHint && (
              <Text variant="label" color="secondary" className="px-4">
                {rowsHint}
              </Text>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={!canSubmit}
            >
              Combine
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
