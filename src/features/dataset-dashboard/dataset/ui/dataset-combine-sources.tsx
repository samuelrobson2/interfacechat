import { useState } from "react";
import { Link, href } from "react-router-dom";
import type { ApiSchemas } from "@/shared/api/schema";
import { Button } from "@/shared/ui/kit/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/kit/collapsible";
import { Text } from "@/shared/ui/kit/text";
import { ChevronRightIcon } from "@/shared/assets/icons/outlined/ChevronRight";
import { cn } from "@/shared/lib/css";
import { ROUTES } from "@/shared/model/routes";

type DatasetSource = ApiSchemas["DatasetSourceDto"];

interface DatasetCombineSourcesProps {
  sources: ReadonlyArray<DatasetSource>;
  className?: string;
}

/**
 * Renders the source-lineage block on the composite dataset detail page.
 *
 * Collapsed (default): a single "Original datasets" trigger row with a chevron.
 * Expanded: each source as a `{name} ›` link to the source's detail page.
 * Deleted sources (those with a null `dataset_id`) render muted with no links.
 */
export function DatasetCombineSources({
  sources,
  className,
}: DatasetCombineSourcesProps) {
  const [open, setOpen] = useState(false);

  const ordered = [...sources].sort(
    (a, b) => a.order_index - b.order_index,
  );

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn("flex flex-col gap-3", className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="link"
          className="justify-start gap-2"
          aria-label={
            open ? "Hide original datasets" : "Show original datasets"
          }
        >
          Original datasets
          <ChevronRightIcon
            pathClasses="stroke-current"
            svgClasses={cn(
              "transition-transform duration-150",
              open && "rotate-90",
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="flex flex-col gap-3 pl-4">
          {ordered.map((source, index) => (
            <li
              key={`${source.dataset_id ?? "deleted"}-${source.order_index}-${index}`}
              className="flex flex-col gap-1"
            >
              {source.dataset_id && source.name ? (
                <Button
                  variant="link"
                  className="justify-start gap-1.5 p-0 h-auto"
                  asChild
                >
                  <Link
                    to={href(ROUTES.DASHBOARD_DATASET, {
                      dataset_id: source.dataset_id,
                    })}
                  >
                    {source.name}
                    <ChevronRightIcon pathClasses="stroke-current" />
                  </Link>
                </Button>
              ) : (
                <Text variant="body" color="secondary">
                  Deleted dataset
                </Text>
              )}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
