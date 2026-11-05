import { cn } from "@/shared/lib/css";
import { Separator } from "@/shared/ui/kit/separator";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";
import type { DatasetTabs } from "../model/use-dataset-tabs";
import {
  DatasetConfigLayout,
  DatasetConfigSection,
} from "./dataset-config-layout";

function DatasetTabSkeleton() {
  return (
    <div className="flex gap-8">
      <Skeleton className="w-full h-[62px]" />
      <Skeleton className="w-full h-[62px]" />

      <Skeleton className="w-full h-[62px] hidden md:block" />
      <Skeleton className="w-full h-[62px] hidden md:block" />
      <Skeleton className="w-full h-[62px] hidden md:block" />
    </div>
  );
}

export function DatasetMeasureSkeleton() {
  const renderCard = (colsCount: number, itemsWrapperClassName?: string) => (
    <div className="flex-1 flex flex-col gap-8 items-center justify-center">
      <Skeleton className="size-[180px]" />

      <div className="flex flex-col gap-4 items-center w-full">
        <Skeleton className="h-7 w-[193px]" />

        <div
          className={cn(
            "flex items-start justify-between w-full",
            itemsWrapperClassName,
          )}
        >
          {Array.from({ length: colsCount }).map((_, index) => (
            <div className="flex flex-col gap-1.5 items-center" key={index}>
              <Skeleton className="h-5 w-[40px]" />
              <Skeleton className="h-12 w-[80px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-15">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8 w-full">
        <div className="flex flex-col gap-1 md:flex-1/3">
          <Skeleton className="h-5 w-[88px]" />
          <Skeleton className="h-6 w-[176px]" />
        </div>
        <div className="flex flex-col gap-1 md:flex-2/3">
          <Skeleton className="h-5 w-[88px]" />
          <Skeleton className="h-6 w-full max-w-[506px]" />
        </div>
      </div>

      <Separator color="secondary" />

      <div className="flex flex-col gap-8 xl:flex-row xl:items-stretch">
        <div className="flex flex-1 flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between w-full">
            <Skeleton className="h-7 w-[64px]" />
            <Skeleton className="h-9 w-[210px] rounded-[44px]" />
          </div>

          <div className="flex gap-6">
            <Skeleton className="h-5 w-[120px]" />
            <Skeleton className="h-5 w-[120px]" />
          </div>

          <Skeleton className="h-[280px] w-full" />
        </div>

        {/* Horizontal while stacked (< xl), vertical once on one row. */}
        <div className="h-px w-full shrink-0 self-stretch bg-stroke-secondary xl:h-auto xl:w-px" />

        <div className="flex flex-col gap-8 md:flex-row md:items-stretch xl:contents">
          {renderCard(2, "gap-19 justify-center")}

          {/* Horizontal while Grade/Percentile stack (< md), vertical side by side. */}
          <div className="h-px w-full shrink-0 self-stretch bg-stroke-secondary md:h-auto md:w-px" />

          {renderCard(3)}
        </div>
      </div>
    </div>
  );
}

/** Mirrors the "Add custom chart" button — the empty state is the common one. */
export function DatasetCustomChartsSkeleton() {
  return (
    <div className="flex w-full justify-center">
      <Skeleton className="h-[38px] w-[172px] rounded-[40px]" />
    </div>
  );
}

function DatasetMeasureMetricsCardSkeleton() {
  return <Skeleton className="h-[168px] w-full rounded-[16px]" />;
}

export function DatasetMeasureFinetuneMetricsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <DatasetMeasureMetricsCardSkeleton key={`metrics-row-1-${index}`} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <DatasetMeasureMetricsCardSkeleton key={`metrics-row-2-${index}`} />
        ))}
      </div>
    </div>
  );
}

// Skeleton for table header row
function DatasetViewTableHeaderSkeleton() {
  return (
    <TableRow>
      {Array.from({ length: 4 }).map((_, index) => (
        <TableHead key={index} className="flex-1 min-w-0">
          <Skeleton className="h-[24px] w-[110px]" />
        </TableHead>
      ))}
    </TableRow>
  );
}

// Skeleton for table data row
function DatasetViewTableRowSkeleton() {
  return (
    <TableRow>
      {Array.from({ length: 4 }).map((_, index) => (
        <TableCell key={index} className="flex-1 min-w-0">
          <div className="flex flex-col gap-1 justify-center flex-1 min-w-0">
            <Skeleton className="h-[22px] w-full" />
            <Skeleton className="h-[22px] w-[160px]" />
          </div>
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DatasetApiSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full rounded-[16px]">
      <div className="rounded-[16px] border border-stroke-secondary p-6 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-[8px]" />
          <Skeleton className="h-10 w-[90px] rounded-[8px]" />
        </div>
        <Skeleton className="h-[380px] w-full rounded-[8px]" />
      </div>
    </div>
  );
}

export function DatasetViewSkeleton() {
  return (
    <div className="flex flex-col rounded-[16px] w-full">
      <Table>
        <TableHeader>
          <DatasetViewTableHeaderSkeleton />
        </TableHeader>

        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <DatasetViewTableRowSkeleton key={index} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Mirrors `DatasetConfigCard`: on mobile the icon and button share the top
// row and the title/description sit below; on desktop it's a single row.
function DatasetInfoItemSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-start md:gap-0",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 md:contents">
        <Skeleton className="size-15 shrink-0 rounded-xl" />
        <Skeleton className="h-12 w-[120px] shrink-0 md:order-last md:ml-6" />
      </div>

      <div className="flex flex-1 flex-col gap-1 md:ml-4">
        <Skeleton className="h-7 w-[120px]" />

        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-[160px]" />
        </div>
      </div>
    </div>
  );
}

export function DatasetShareSkeleton() {
  return (
    <DatasetConfigLayout>
      <DatasetConfigSection>
        {Array.from({ length: 4 }).map((_, index) => (
          // Only the first two integrations are shown on mobile.
          <DatasetInfoItemSkeleton
            key={index}
            className={index >= 2 ? "hidden md:flex" : undefined}
          />
        ))}
      </DatasetConfigSection>

      <Separator
        color="secondary"
        orientation="vertical"
        className="hidden md:block"
      />

      <DatasetConfigSection>
        {Array.from({ length: 3 }).map((_, index) => (
          // Only the first integration is shown on mobile.
          <DatasetInfoItemSkeleton
            key={index}
            className={index >= 1 ? "hidden md:flex" : undefined}
          />
        ))}
      </DatasetConfigSection>
    </DatasetConfigLayout>
  );
}

export function DatasetFinetuneSkeleton() {
  return (
    <DatasetConfigLayout>
      <DatasetConfigSection>
        <div className="flex w-full max-w-md flex-col gap-6">
          <Skeleton className="h-[62px] w-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-[140px]" />
            <Skeleton className="h-6 w-[200px]" />
          </div>
          <Skeleton className="h-7 w-[160px]" />
          <Skeleton className="h-7 w-[180px]" />
        </div>
      </DatasetConfigSection>

      <Separator
        color="secondary"
        orientation="vertical"
        className="hidden md:block"
      />

      <DatasetConfigSection>
        <DatasetInfoItemSkeleton />
      </DatasetConfigSection>
    </DatasetConfigLayout>
  );
}

export function DatasetSkeleton({ tab }: { tab: DatasetTabs }) {
  const renderContent = () => {
    switch (tab) {
      case "measure":
        return <DatasetMeasureSkeleton />;
      case "view":
        return <DatasetViewSkeleton />;
      case "share":
        return <DatasetShareSkeleton />;
      case "finetune":
        return <DatasetFinetuneSkeleton />;
      case "api":
        return <DatasetApiSkeleton />;
      default:
        return <DatasetMeasureSkeleton />;
    }
  };

  return (
    <div className="flex flex-col gap-15">
      <DatasetTabSkeleton />
      {renderContent()}
    </div>
  );
}
