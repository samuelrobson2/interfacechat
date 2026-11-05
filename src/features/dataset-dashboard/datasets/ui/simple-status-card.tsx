import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { Progress } from "@/shared/ui/kit/progress";
import { Text } from "@/shared/ui/kit/text";
import { SquareArrowOutUpRight } from "lucide-react";

export type SimpleStatusKind = "none" | "uploading" | "completed" | "failed";

const STATUS_DOT_COLOR: Record<SimpleStatusKind, string> = {
  none: "bg-gray-3",
  uploading: "bg-yellow-5",
  completed: "bg-green-5",
  failed: "bg-red-5",
};

// Progress's own color prop only covers default/gradient/blue, so the
// per-status fill is applied straight to the Radix indicator child instead.
const STATUS_PROGRESS_COLOR: Record<SimpleStatusKind, string> = {
  none: "",
  uploading: "[&>[data-slot=progress-indicator]]:bg-yellow-5",
  completed: "[&>[data-slot=progress-indicator]]:bg-green-5",
  failed: "[&>[data-slot=progress-indicator]]:bg-red-5",
};

export type SimpleStatusAction = {
  label: string;
  onClick?: () => void;
  // Navigational actions (Configure/View/Retry) read as blue links with an
  // outbound icon; in-place actions (Cancel) read as plain dark text.
  withIcon?: boolean;
};

export function SimpleStatusCard({
  title,
  status,
  label,
  value,
  progress,
  action,
}: {
  title: string;
  status: SimpleStatusKind;
  label: string;
  value?: string;
  progress?: number;
  action: SimpleStatusAction;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[8px] border-[0.5px] border-background-primary bg-background-primary p-4">
      <Text
        variant="caption"
        color="secondary"
        className="border-b border-gray-1 pb-3 uppercase tracking-wide"
      >
        {title}
      </Text>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-2 shrink-0 rounded-full",
              STATUS_DOT_COLOR[status],
            )}
          />
          <Text>{label}</Text>
        </div>
        {value && <Text color="secondary">{value}</Text>}
      </div>

      {progress != null && (
        <Progress
          value={progress}
          className={cn("h-1", STATUS_PROGRESS_COLOR[status])}
        />
      )}

      <Button
        variant="link"
        onClick={action.onClick}
        className={cn(!action.withIcon && "text-typography-primary")}
      >
        <span className={cn(action.withIcon && "text-blue-5")}>
          {action.label}
        </span>
        {action.withIcon && (
          <SquareArrowOutUpRight className="size-3.5 text-blue-5" />
        )}
      </Button>
    </div>
  );
}
