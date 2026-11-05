import * as React from "react";

import { cn, resolveColor } from "@/shared/lib/css";
import { Text } from "../text";
import { Card, CardHeader } from "../card";

function ChartCard({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <Card
      data-slot="chart-card"
      className={cn("relative rounded-[24px] [--hairline-radius:24px] py-8 px-6", className)}
      {...props}
    >
      {children}
    </Card>
  );
}

function ChartCardHeader({
  title,
  subtitle,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <CardHeader
      data-slot="chart-card-header"
      className={cn("w-full flex-col items-start gap-1", className)}
      {...props}
    >
      {title && (
        <Text as="p" variant="title">
          {title}
        </Text>
      )}
      {subtitle && (
        <Text as="p" variant="label" color="secondary">
          {subtitle}
        </Text>
      )}
      {children}
    </CardHeader>
  );
}

function ChartCardFooter({
  title,
  subtitle,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <div
      data-slot="chart-card-footer"
      className={cn(
        "flex w-full flex-col items-center gap-1 text-center",
        className,
      )}
      {...props}
    >
      {title && (
        <Text as="p" variant="label">
          {title}
        </Text>
      )}
      {subtitle && (
        <Text as="p" variant="label" color="secondary">
          {subtitle}
        </Text>
      )}
      {children}
    </div>
  );
}

interface ChartLegendItem {
  label: React.ReactNode;
  color: string;
}

function ChartCardLegend({
  items,
  title,
  orientation = "horizontal",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  items: ChartLegendItem[];
  title?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
}) {
  if (items.length === 0) return null;

  return (
    <div
      data-slot="chart-card-legend"
      className={cn(
        "flex",
        orientation === "horizontal"
          ? "w-full flex-col items-center gap-4"
          : "flex-col items-start gap-3",
        className,
      )}
      {...props}
    >
      {title && (
        <Text as="p" variant="label">
          {title}
        </Text>
      )}
      <div
        className={cn(
          "flex flex-wrap items-center gap-4",
          orientation === "horizontal"
            ? "justify-center"
            : "flex-col items-start",
        )}
      >
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Text as="span" variant="label">
              {item.label}
            </Text>
            <span
              aria-hidden
              className="size-4 shrink-0 rounded-[4px]"
              style={{ backgroundColor: resolveColor(item.color) }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export { ChartCard, ChartCardHeader, ChartCardFooter, ChartCardLegend };
export type { ChartLegendItem };
