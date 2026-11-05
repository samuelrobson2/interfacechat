import { Skeleton } from "@/shared/ui/kit/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";
import { Text } from "@/shared/ui/kit/text";

function DatasetsHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full md:flex-row md:items-center md:justify-between">
      <Skeleton className="h-[36px] w-[140px]" />
      <div className="flex gap-4">
        <Skeleton className="h-[64px] flex-1 md:w-[250px] md:flex-none" />
        <Skeleton className="h-[64px] flex-1 md:w-[250px] md:flex-none" />
      </div>
    </div>
  );
}

// Mobile card skeleton, mirrors `DatasetCard`.
function DatasetsCardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4 rounded-[8px] border-[0.5px] border-background-primary bg-background-primary p-4">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-6 w-[140px]" />
        <Skeleton className="h-5 w-[50px] shrink-0" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-[22px] w-full" />
        <Skeleton className="h-[22px] w-[200px]" />
      </div>

      <div className="mt-auto flex gap-4">
        <Skeleton className="h-[36px] flex-1 rounded-[44px]" />
      </div>
    </div>
  );
}

function DatasetsTableHeaderSkeleton() {
  return (
    <TableRow>
      <TableHead className="w-[220px]">
        <Skeleton className="h-[24px] w-[100px]" />
      </TableHead>
      <TableHead className="w-[100px]">
        <Skeleton className="h-[24px] w-[50px]" />
      </TableHead>
      <TableHead className="flex-1 min-w-0">
        <Skeleton className="h-[24px] w-[100px]" />
      </TableHead>
      <TableHead className="w-[120px]">
        <Skeleton className="h-[24px] w-[60px]" />
      </TableHead>
      <TableHead className="w-[190px]">
        <Skeleton className="h-[24px] w-[60px]" />
      </TableHead>
      <TableHead className="w-[116px]">
        <Skeleton className="h-[24px] w-[60px]" />
      </TableHead>
      <TableHead className="w-[80px]">
        <Skeleton className="h-[24px] w-[60px]" />
      </TableHead>
      <TableHead className="w-[120px]">
        <Skeleton className="h-[24px] w-[60px]" />
      </TableHead>
    </TableRow>
  );
}

function DatasetsTableRowSkeleton() {
  return (
    <TableRow className="h-[72px]">
      {/* NAME column */}
      <TableCell className="w-[220px]">
        <Skeleton className="h-[24px] w-[170px]" />
      </TableCell>

      {/* TYPE column */}
      <TableCell className="w-[100px]">
        <Skeleton className="h-[36px] w-[88px] rounded-[44px]" />
      </TableCell>

      {/* DESCRIPTION column - two lines */}
      <TableCell className="flex-1 min-w-0">
        <div className="flex flex-col gap-[5px] justify-center">
          <Skeleton className="h-[22px] w-full" />
          <Skeleton className="h-[22px] w-[280px]" />
        </div>
      </TableCell>

      {/* DATE column */}
      <TableCell className="w-[120px]">
        <Skeleton className="h-[24px] w-[50px]" />
      </TableCell>

      {/* STATUS column - rounded badge */}
      <TableCell className="w-[190px]">
        <Skeleton className="h-[36px] w-[140px] rounded-[44px]" />
      </TableCell>

      {/* FINETUNE column */}
      <TableCell className="w-[116px]">
        <div className="flex items-center justify-center">
          <Skeleton className="size-[20px]" />
        </div>
      </TableCell>

      {/* WIN RATE column */}
      <TableCell className="w-[80px]">
        <Skeleton className="h-[24px] w-[40px]" />
      </TableCell>

      {/* ACTION column */}
      <TableCell className="w-[120px]">
        <Skeleton className="h-[24px] w-full" />
      </TableCell>
    </TableRow>
  );
}

function DatasetsPaginationSkeleton() {
  return (
    <div className="flex items-center justify-between py-[24px] w-full">
      <div className="flex gap-[16px] items-center">
        <Skeleton className="h-[36px] w-[62px]" />
        <Skeleton className="h-[24px] w-[64px]" />
      </div>

      <div className="flex gap-[8px] items-center">
        <Skeleton className="h-[24px] w-[64px]" />
        <Skeleton className="h-[36px] w-[62px]" />
        <Skeleton className="h-[24px] w-[40px]" />
        <div className="flex gap-[4px] items-center">
          <Skeleton className="size-[36px]" />
          <Skeleton className="size-[36px]" />
        </div>
      </div>
    </div>
  );
}

function AutoscientistPaginationSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between py-6 w-full">
        <div className="flex gap-4 items-center">
          <Skeleton className="h-[36px] w-[62px]" />
          <Skeleton className="h-[24px] w-[64px]" />
        </div>
        <div className="flex gap-2 items-center">
          <Skeleton className="h-[24px] w-[64px]" />
          <Skeleton className="h-[36px] w-[62px]" />
          <Skeleton className="h-[24px] w-[40px]" />
          <div className="flex gap-1 items-center">
            <Skeleton className="size-[36px]" />
            <Skeleton className="size-[36px]" />
          </div>
        </div>
      </div>
      <div className="flex justify-end pb-6">
        <Skeleton className="h-[36px] w-[120px] rounded-[44px]" />
      </div>
    </>
  );
}

export function DatasetsSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full h-full overflow-hidden">
      <DatasetsHeaderSkeleton />

      {/* Cards on mobile, table on desktop — mirrors DatasetsTable. */}
      <div className="mt-6 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-2 md:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <DatasetsCardSkeleton key={index} />
        ))}
      </div>

      <div className="hidden flex-col w-full overflow-hidden md:flex">
        <Table>
          <TableHeader>
            <DatasetsTableHeaderSkeleton />
          </TableHeader>

          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <DatasetsTableRowSkeleton key={index} />
            ))}
          </TableBody>
        </Table>

        <DatasetsPaginationSkeleton />
      </div>
    </div>
  );
}

export function AutoScientistDatasetsSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <Text variant="h1" className="text-center">
        What dataset do you want to apply AutoScientist to?
      </Text>

      <div className="mt-6 flex h-full w-full min-h-0 flex-col overflow-hidden">
        <Table className="w-full">
          <TableHeader>
            <DatasetsTableHeaderSkeleton />
          </TableHeader>

          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <DatasetsTableRowSkeleton key={index} />
            ))}
          </TableBody>
        </Table>

        <AutoscientistPaginationSkeleton />
      </div>
    </div>
  );
}
