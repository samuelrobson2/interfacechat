import { cn } from "@/shared/lib/css";
import { Badge } from "@/shared/ui/kit/badge";

export type FinetuneJobStatus =
  | "pending"
  | "preparing"
  | "augmenting"
  | "uploading"
  | "running"
  | "evaluating"
  | "succeeded"
  | "completed"
  | "failed"
  | "eval_failed"
  | "cancelled";

const FINETUNE_JOB_STATUS_LABEL: Record<FinetuneJobStatus, string> = {
  pending: "Launched",
  preparing: "Launched",
  augmenting: "Launched",
  uploading: "Launched",
  running: "Running",
  evaluating: "Evaluating",
  succeeded: "Success",
  completed: "Success",
  failed: "Failed",
  eval_failed: "Eval failed",
  cancelled: "Cancelled",
};

const FINETUNE_JOB_STATUS_COLOR: Record<FinetuneJobStatus, string> = {
  pending: "bg-gradient-yellow text-yellow-5",
  preparing: "bg-gradient-yellow text-yellow-5",
  augmenting: "bg-gradient-yellow text-yellow-5",
  uploading: "bg-gradient-yellow text-yellow-5",
  running: "bg-gradient-blue text-blue-5",
  evaluating: "bg-gradient-blue text-blue-5",
  succeeded: "bg-gradient-green text-green-5",
  completed: "bg-gradient-green text-green-5",
  failed: "bg-gradient-red text-red-5",
  eval_failed: "bg-gradient-red text-red-5",
  cancelled: "bg-gradient-red text-red-5",
};

// Colored hairline border + dot for the table variant, per Figma. Pharos
// draws this border as a 3-stop gradient (bg-gradient-status-*-border), but
// those utilities don't exist in this repo's palette. Using the existing
// `hairline` mechanism with a solid per-status color instead keeps the
// visual intent without introducing new design tokens.
const FINETUNE_JOB_STATUS_TABLE_BORDER_CLASS: Record<
  FinetuneJobStatus,
  string
> = {
  pending: "[--hairline-color:var(--color-yellow-5)]",
  preparing: "[--hairline-color:var(--color-yellow-5)]",
  augmenting: "[--hairline-color:var(--color-yellow-5)]",
  uploading: "[--hairline-color:var(--color-yellow-5)]",
  running: "[--hairline-color:var(--color-blue-4)]",
  evaluating: "[--hairline-color:var(--color-blue-4)]",
  succeeded: "[--hairline-color:var(--color-green-5)]",
  completed: "[--hairline-color:var(--color-green-5)]",
  failed: "[--hairline-color:var(--color-red-5)]",
  eval_failed: "[--hairline-color:var(--color-red-5)]",
  cancelled: "[--hairline-color:var(--color-red-5)]",
};

const FINETUNE_JOB_STATUS_TABLE_DOT_COLOR: Record<FinetuneJobStatus, string> =
  {
    pending: "bg-yellow-5",
    preparing: "bg-yellow-5",
    augmenting: "bg-yellow-5",
    uploading: "bg-yellow-5",
    running: "bg-blue-4",
    evaluating: "bg-blue-4",
    succeeded: "bg-green-5",
    completed: "bg-green-5",
    failed: "bg-red-5",
    eval_failed: "bg-red-5",
    cancelled: "bg-red-5",
  };

const TABLE_BADGE_CLASS =
  "h-10 gap-2 bg-background-primary px-3 py-2 [--hairline-radius:56px] rounded-[56px]";

export type FinetuneStatusIndicatorBadgeVariant = "default" | "table";

export function FinetuneStatusIndicatorBadge({
  status,
  variant = "default",
  className,
}: {
  status: FinetuneJobStatus;
  variant?: FinetuneStatusIndicatorBadgeVariant;
  className?: string;
}) {
  if (variant === "table") {
    return (
      <Badge
        className={cn(
          TABLE_BADGE_CLASS,
          FINETUNE_JOB_STATUS_TABLE_BORDER_CLASS[status],
          className,
        )}
      >
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            FINETUNE_JOB_STATUS_TABLE_DOT_COLOR[status],
          )}
        />
        <span className="text-typography-primary">
          {FINETUNE_JOB_STATUS_LABEL[status]}
        </span>
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(FINETUNE_JOB_STATUS_COLOR[status], "py-1.5", className)}
    >
      <span className="size-1.5 rounded-full shrink-0 bg-current" />
      <span className="text-typography-primary">
        {FINETUNE_JOB_STATUS_LABEL[status]}
      </span>
    </Badge>
  );
}
