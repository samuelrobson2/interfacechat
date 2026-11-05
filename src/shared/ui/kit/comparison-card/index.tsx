import * as React from "react";

import { CircleCheckFilledIcon } from "@/shared/assets/icons/general/CircleCheckFilled";
import { CircleCrossFilledIcon } from "@/shared/assets/icons/general/CircleCrossFilled";
import { cn } from "@/shared/lib/css";
import { Skeleton } from "../skeleton";
import { Text } from "../text";

interface ComparisonCardItem extends React.ComponentProps<"img"> {
  title?: string;
  status: "accepted" | "rejected";
  isLoading?: boolean;
}

interface ComparisonCardProps extends React.ComponentProps<"div"> {
  items: ComparisonCardItem[];
}

const STATUS_CONFIG = {
  accepted: {
    Icon: CircleCheckFilledIcon,
    pathClasses: "fill-green-5",
    label: "Accepted",
  },
  rejected: {
    Icon: CircleCrossFilledIcon,
    pathClasses: "fill-red-5",
    label: "Rejected",
  },
} as const;

const ComparisonCard = ({
  items,
  className,
  ...props
}: ComparisonCardProps) => {
  if (items.length === 0) return null;

  return (
    <div className={cn("flex items-start gap-6", className)} {...props}>
      {items.map((item, index) => {
        // Extract non-DOM props so they aren't spread onto the <img> element
        const { title, status, isLoading, ...imgProps } = item;
        const { Icon, pathClasses, label } = STATUS_CONFIG[status];

        return (
          <div key={index} className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex items-center justify-between">
              <Text variant="title" as="span">
                {title}
              </Text>
              <Icon
                className="shrink-0"
                pathClasses={pathClasses}
                aria-label={label}
              />
            </div>
            {isLoading ? (
              <Skeleton
                className={cn(
                  "aspect-square w-full rounded-[4px]",
                  item.className,
                )}
                style={item.style}
              />
            ) : (
              <img
                {...imgProps}
                className={cn(
                  "aspect-square w-full rounded-[4px] object-cover",
                  item.className,
                )}
                draggable={false}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export { ComparisonCard };
export type { ComparisonCardProps, ComparisonCardItem };
