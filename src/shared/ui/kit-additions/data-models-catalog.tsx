import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { Card } from "@/shared/ui/kit/card";
import { Text } from "@/shared/ui/kit/text";

export interface CatalogEntry {
  id?: string;
  name: string;
  description: string;
  icon: string;
  stats: { label: string; value: string }[];
  /** Primary action label (defaults to "Try in Chat"). */
  primaryAction?: string;
  /** Secondary action label (defaults to "Power an Interface"). */
  secondaryAction?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

/** White pill with the brand's iridescent gradient border. Fills on hover. */
export function GradientBorderButton({
  children,
  className,
  compact = false,
  size = "md",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  size?: "sm" | "md";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full rounded-[60px] p-px",
        compact ? "h-7" : size === "sm" ? "h-8" : "h-10",
        "bg-gradient-ai-save-border drop-shadow-[0px_0px_2px_var(--color-rose-2)]",
        "hover:bg-gradient-ai-save-hover",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-full w-full items-center justify-center rounded-[60px] bg-white transition-colors group-hover:bg-transparent",
          compact ? "px-2.5" : size === "sm" ? "px-3" : "px-4",
        )}
      >
        <span
          className={cn(
            "font-light leading-[1.2] text-typography-primary transition-colors group-hover:text-white",
            compact ? "text-[11px]" : size === "sm" ? "text-[12px]" : "text-[14px]",
          )}
        >
          {children}
        </span>
      </span>
    </button>
  );
}

export function CatalogEntryCard({
  entry,
  compact = false,
  actionSize = "md",
}: {
  entry: CatalogEntry;
  compact?: boolean;
  actionSize?: "sm" | "md";
}) {
  return (
    <Card
      id={entry.id ? `catalog-${entry.id}` : undefined}
      shape="rounded"
      spacing="md"
      className={cn("flex-col", compact ? "gap-3" : "gap-4")}
    >
      <div className="flex items-start gap-3">
        <img
          src={entry.icon}
          alt=""
          className={cn(
            "shrink-0 object-contain",
            compact ? "size-9" : "size-11",
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Text variant={compact ? "caption" : "label"} className="truncate">
            {entry.name}
          </Text>
          <Text variant="caption" color="secondary" className="line-clamp-2">
            {entry.description}
          </Text>
        </div>
      </div>

      {entry.stats.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-baseline gap-1 rounded-[10px] bg-gray-6 px-2 py-1"
            >
              <Text variant="small" color="secondary">
                {stat.label}
              </Text>
              <Text variant="caption" className="font-normal">
                {stat.value}
              </Text>
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          "grid gap-2",
          compact ? "grid-cols-[auto_auto] justify-end" : "grid-cols-2",
        )}
      >
        <Button
          type="button"
          variant="secondary"
          size="40"
          radius="rounded"
          className={cn(
            "whitespace-nowrap",
            compact
              ? "h-7 px-2.5 text-[11px]"
              : actionSize === "sm"
                ? "h-8 px-3 text-[12px]"
                : "w-full",
          )}
          onClick={entry.onPrimaryAction}
        >
          {entry.primaryAction ?? "Try in Chat"}
        </Button>
        <GradientBorderButton
          compact={compact}
          size={actionSize}
          className={cn("whitespace-nowrap", compact && "w-auto")}
          onClick={entry.onSecondaryAction}
        >
          {entry.secondaryAction ?? "Power an Interface"}
        </GradientBorderButton>
      </div>
    </Card>
  );
}

export function CatalogSection({
  title,
  description,
  entries,
  columns = 2,
  compact = false,
  nested = false,
}: {
  title: string;
  description?: string;
  entries: CatalogEntry[];
  columns?: 1 | 2;
  compact?: boolean;
  nested?: boolean;
}) {
  return (
    <section>
      <div
        className={cn(
          "pb-3",
          nested ? "border-none" : "border-b border-gray-2/60",
        )}
      >
        <Text
          variant={nested ? "label" : "title"}
          as="h2"
          color={nested ? "secondary" : "primary"}
        >
          {title}
        </Text>
        {description && (
          <Text variant="caption" color="secondary" className="mt-1">
            {description}
          </Text>
        )}
      </div>
      {entries.length === 0 ? (
        <Text variant="caption" color="secondary">
          None yet
        </Text>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1",
            compact ? "gap-3" : "gap-4",
            !nested && "mt-4",
            nested && "mt-2",
            columns === 2 && "lg:grid-cols-2",
          )}
        >
          {entries.map((entry) => (
            <CatalogEntryCard
              key={entry.id ?? entry.name}
              entry={entry}
              compact={compact}
            />
          ))}
        </div>
      )}
    </section>
  );
}
