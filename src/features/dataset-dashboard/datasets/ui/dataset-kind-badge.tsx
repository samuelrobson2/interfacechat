import type { ApiSchemas } from "@/shared/api/schema";
import { cn } from "@/shared/lib/css";
import { Badge } from "@/shared/ui/kit/badge";

const DATASET_KIND_LABEL: Record<ApiSchemas["DatasetKind"], string> = {
  uploaded: "Original",
  combined: "Combined",
};

const DATASET_KIND_BADGE_CLASS: Record<ApiSchemas["DatasetKind"], string> = {
  combined: "bg-gradient-rose border-[0.5px] border-stroke-secondary",
  uploaded: "bg-gradient-blue text-blue-5",
};

const TABLE_KIND_DOT_CLASS: Record<ApiSchemas["DatasetKind"], string> = {
  combined: "bg-rose-2",
  uploaded: "bg-blue-3",
};

// Colored hairline border per Figma — combined is pink, uploaded is blue.
// Note: pharos draws this as a 3-stop gradient border (bg-gradient-pink-border /
// bg-gradient-blue-border), but those utilities (and the pink-30/pink-40/
// blue-30/blue-40 tokens they need) don't exist in this repo's palette. Using
// the existing `hairline` mechanism with a solid per-kind color instead keeps
// the visual intent without introducing new design tokens.
const TABLE_KIND_BORDER_CLASS: Record<ApiSchemas["DatasetKind"], string> = {
  combined: "[--hairline-color:var(--color-rose-2)]",
  uploaded: "[--hairline-color:var(--color-blue-3)]",
};

const TABLE_BADGE_CLASS =
  "h-10 gap-2 bg-background-primary px-3 py-2 [--hairline-radius:56px] rounded-[56px]";

type DatasetKindBadgeVariant = "default" | "table";

export function DatasetKindBadge({
  kind,
  variant = "default",
  className,
}: {
  kind: ApiSchemas["DatasetKind"] | null | undefined;
  variant?: DatasetKindBadgeVariant;
  className?: string;
}) {
  if (!kind) {
    return <span className="text-typography-secondary">-</span>;
  }

  const label = DATASET_KIND_LABEL[kind];

  if (variant === "table") {
    return (
      <Badge
        className={cn(
          TABLE_BADGE_CLASS,
          TABLE_KIND_BORDER_CLASS[kind],
          className,
        )}
      >
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            TABLE_KIND_DOT_CLASS[kind],
          )}
        />
        <span className="text-typography-primary">{label}</span>
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        "border-stroke-secondary py-1.5",
        DATASET_KIND_BADGE_CLASS[kind],
        className,
      )}
    >
      <span className="text-typography-primary">{label}</span>
    </Badge>
  );
}
